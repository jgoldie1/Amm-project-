/**
 * StreetVerse inventory adapter for local single-player preview ONLY.
 * This is not a server-authoritative wallet, marketplace, multiplayer or reward ledger.
 * The caller must not use this for redeemable goods or transferable weapons.
 */
type Item={id:string;name:string;category:'gear'|'weapon'|'consumable'|'quest'|'vehicle'|'collectible';quantity:number;equipped?:boolean;description?:string}
const KEY='tryamm:streetverse:preview-inventory:v1'
const categories=new Set(['gear','weapon','consumable','quest','vehicle','collectible'])
const clean=(value:unknown):Item[]=>{
 if(!Array.isArray(value))return []
 const used=new Set<string>()
 return value.flatMap(raw=>{
  if(!raw||typeof raw!=='object')return []
  const v=raw as Record<string,unknown>
  if(typeof v.id!=='string'||!/^[-a-z0-9:_]{1,80}$/i.test(v.id)||used.has(v.id)||!categories.has(String(v.category))||typeof v.name!=='string')return []
  const quantity=Math.min(9999,Math.max(0,Math.floor(Number(v.quantity)||0)))
  if(quantity===0)return []
  used.add(v.id)
  return [{id:v.id,name:v.name.slice(0,90),category:v.category as Item['category'],quantity,equipped:v.equipped===true,description:typeof v.description==='string'?v.description.slice(0,240):undefined}]
 }).slice(0,200)
}
export function installStreetVersePreviewInventoryRuntime(){
 let items:Item[]=[]
 try{items=clean(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{}
 const emit=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-inventory-state',{detail:{items:items.map(i=>({...i})),source:'local-preview',verified:false}}))
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch{}emit()}
 const onRequest=()=>emit()
 const onEquip=(event:Event)=>{
  const id=(event as CustomEvent<{itemId?:string}>).detail?.itemId
  const item=items.find(i=>i.id===id&&['gear','weapon'].includes(i.category))
  if(!item){window.dispatchEvent(new CustomEvent('tryamm:streetverse-inventory-error',{detail:{message:'Item is not owned in local preview inventory.'}}));return}
  // Single equipped item per category in preview; no server or combat effects.
  items=items.map(i=>i.category===item.category?{...i,equipped:i.id===id}:i)
  save()
 }
 const onPreviewGrant=(event:Event)=>{
  // Explicitly gated to a developer-only preview URL. Never award real-world value.
  if(new URLSearchParams(window.location.search).get('inventoryPreview')!=='1')return
  const value=(event as CustomEvent<{item?:Item}>).detail?.item
  const valid=clean(value?[value]:[])
  if(valid.length!==1)return
  const item=valid[0]
  const old=items.find(i=>i.id===item.id)
  items=old?items.map(i=>i.id===item.id?{...i,quantity:Math.min(9999,i.quantity+item.quantity)}:i):[...items,item]
  save()
 }
 const onVerifiedMission=(event:Event)=>{
  // Cosmetic local preview trophy only, never a currency, real reward or transferable item.
  if(new URLSearchParams(window.location.search).get('inventoryPreview')!=='1')return
  const detail=(event as CustomEvent<{status?:string;missionRunId?:string;programId?:string;serverDetermined?:boolean}>).detail
  if(!detail?.serverDetermined||detail.status!=='VERIFIED'||detail.programId!=='streetverse_first_drop'||!detail.missionRunId)return
  const claimKey='tryamm:streetverse:preview-claim:'+detail.missionRunId
  try{if(localStorage.getItem(claimKey)==='1')return}catch{return}
  if(items.some(i=>i.id==='circle-park-first-drop-badge')){try{localStorage.setItem(claimKey,'1')}catch{}return}
  items=[...items,{id:'circle-park-first-drop-badge',name:'Circle Park First Drop Badge',category:'collectible',quantity:1,description:'Cosmetic single-player preview collectible. No transferable value.'}]
  try{localStorage.setItem(claimKey,'1')}catch{}
  save()
 }
 window.addEventListener('tryamm:streetverse-authoritative-reward',onVerifiedMission)
 window.addEventListener('tryamm:streetverse-inventory-request',onRequest)
 window.addEventListener('tryamm:streetverse-inventory-equip-request',onEquip)
 window.addEventListener('tryamm:streetverse-preview-item-grant',onPreviewGrant)
 queueMicrotask(emit)
 return ()=>{window.removeEventListener('tryamm:streetverse-authoritative-reward',onVerifiedMission);window.removeEventListener('tryamm:streetverse-inventory-request',onRequest);window.removeEventListener('tryamm:streetverse-inventory-equip-request',onEquip);window.removeEventListener('tryamm:streetverse-preview-item-grant',onPreviewGrant)}
}
