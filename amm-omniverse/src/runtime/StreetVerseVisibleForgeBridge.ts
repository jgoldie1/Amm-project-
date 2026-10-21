import * as THREE from 'three'
import type {TryammNativeRuntimeAssetKey} from '../data/TryammNativeRuntimeAssetCatalog'

const KEY='tryamm.streetverse.forge-placements.v1'
export const FORGE_PLACEMENT_LIMIT=24
export type ForgePreset='street'|'park'|'storefront'
type ForgeRecord={id:string;asset:TryammNativeRuntimeAssetKey;x:number;z:number;rotation:number}
type ForgeRequest={preset?:ForgePreset;source?:string}
const presets:Record<ForgePreset,readonly {asset:TryammNativeRuntimeAssetKey;dx:number;dz:number;rotation?:number}[]>={
 street:[
  {asset:'streetLamp',dx:-12,dz:-17},{asset:'streetLamp',dx:12,dz:-17},
  {asset:'bench',dx:-14,dz:-12,rotation:Math.PI},{asset:'holoWayfinder',dx:14,dz:-12},
 ],
 park:[
  {asset:'tree',dx:-13,dz:-15},{asset:'tree',dx:13,dz:-15},
  {asset:'bench',dx:-11,dz:-9},{asset:'trashCan',dx:11,dz:-9},
 ],
 storefront:[
  {asset:'building',dx:-30,dz:-18,rotation:Math.PI/2},{asset:'building',dx:30,dz:-18,rotation:-Math.PI/2},
  {asset:'streetLamp',dx:-14,dz:-14},{asset:'holoWayfinder',dx:14,dz:-14},
 ],
}
const allowed=new Set<TryammNativeRuntimeAssetKey>(Object.values(presets).flatMap(items=>items.map(item=>item.asset)))
const validNumber=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<=94
const parseSaved=():ForgeRecord[]=>{
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||'[]')
  if(!Array.isArray(data))return []
  return data.slice(0,FORGE_PLACEMENT_LIMIT).filter((x):x is ForgeRecord=>Boolean(
   x&&typeof x.id==='string'&&x.id.length<80&&allowed.has(x.asset)&&validNumber(x.x)&&validNumber(x.z)&&
   typeof x.rotation==='number'&&Number.isFinite(x.rotation)))
 }catch{return[]}
}
function broadcast(detail:Record<string,unknown>){
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-forge-placement-result',{detail:{...detail,source:'main-mobile-3d-renderer',visualOnly:true,serverVerified:false}}))
}
export function installStreetVerseVisibleForgeBridge(opts:{
 getNativeLayer:()=>THREE.Group|null
 getPlayerPosition:()=>THREE.Vector3
}){
 let records:ForgeRecord[]=[]
 let active=true
 const instances=new Map<string,THREE.Object3D>()
 function sourceObject(key:TryammNativeRuntimeAssetKey){
  const layer=opts.getNativeLayer()
  return layer?.children.find(child=>child.userData.tryammNativeAsset===key)||null
 }
 function place(record:ForgeRecord){
  const layer=opts.getNativeLayer(),source=sourceObject(record.asset)
  if(!layer||!source||instances.has(record.id))return false
  // Clone preloaded TRYAMM-owned geometry and material; never re-download and
  // never use paid Meshy generation from this user action.
  const clone=source.clone(true)
  clone.name='world-builder-forged-'+record.id
  clone.position.set(record.x,0,record.z)
  clone.rotation.set(0,record.rotation,0)
  clone.scale.setScalar(record.asset==='building'?1.12:1)
  clone.visible=true
  clone.userData={...clone.userData,originalTryammNativeAsset:record.asset,worldBuilderPlaced:true,visualOnly:true,collisionAuthority:'existing-mobile-world'}
  layer.add(clone);instances.set(record.id,clone)
  return true
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify(records))}catch{broadcast({status:'storage-unavailable',placed:0,missing:[],count:records.length})}}
 function hydrate(){
  if(!active)return
  records=parseSaved()
  let restored=0
  for(const record of records)if(place(record))restored++
  broadcast({status:restored===records.length?'restored':'partially-restored',placed:restored,requested:records.length,count:instances.size,missing:records.filter(r=>!instances.has(r.id)).map(r=>r.asset)})
 }
 function forge(event:Event){
  if(!active)return
  const d=(event as CustomEvent<ForgeRequest>).detail||{}
  if(d.source!=='west-side-world-builder'||!d.preset||!(d.preset in presets))return
  if(!opts.getNativeLayer()){broadcast({preset:d.preset,status:'native-layer-loading',placed:0,requested:presets[d.preset].length,count:instances.size,missing:['native-layer-not-ready']});return}
  const player=opts.getPlayerPosition()
  const recipe=presets[d.preset]
  const available=Math.max(0,FORGE_PLACEMENT_LIMIT-records.length)
  let placed=0
  const missing:string[]=[]
  for(const [index,prefab] of recipe.slice(0,available).entries()){
   const x=THREE.MathUtils.clamp(player.x+prefab.dx,-88,88),z=THREE.MathUtils.clamp(player.z+prefab.dz,-88,88)
   const record:ForgeRecord={id:Date.now().toString(36)+'-'+index+'-'+records.length,asset:prefab.asset,x,z,rotation:prefab.rotation??0}
   if(!place(record)){missing.push(prefab.asset);continue}
   records.push(record);placed++
  }
  if(placed)save()
  const status=placed===recipe.length?'placed':placed?'partially-placed':available===0?'limit-reached':'missing-models'
  broadcast({preset:d.preset,status,placed,requested:recipe.length,count:instances.size,missing})
 }
 function undo(){
  if(!active)return
  const last=records.pop()
  if(!last){broadcast({status:'nothing-to-undo',placed:0,count:instances.size,missing:[]});return}
  const object=instances.get(last.id)
  object?.removeFromParent();instances.delete(last.id)
  save()
  broadcast({status:'undone',placed:0,removed:last.asset,count:instances.size,missing:[]})
 }
 const report=()=>{
  const layer=opts.getNativeLayer()
  broadcast({status:layer?(layer.children.some(child=>allowed.has(child.userData.tryammNativeAsset))?'ready':'native-models-unavailable'):'native-layer-loading',requested:0,placed:0,count:instances.size,missing:[]})
 }
 window.addEventListener('tryamm:streetverse-forge-request-state',report)
 window.addEventListener('tryamm:streetverse-forge-placement-request',forge)
 window.addEventListener('tryamm:streetverse-forge-placement-undo',undo)
 return{
  hydrate,
  dispose:()=>{
   active=false
   window.removeEventListener('tryamm:streetverse-forge-request-state',report)
   window.removeEventListener('tryamm:streetverse-forge-placement-request',forge)
   window.removeEventListener('tryamm:streetverse-forge-placement-undo',undo)
   for(const object of instances.values())object.removeFromParent()
   instances.clear()
  },
 }
}
