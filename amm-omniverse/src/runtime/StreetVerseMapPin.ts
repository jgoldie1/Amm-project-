import * as THREE from 'three'
import {chicagoMapReference} from '../config/streetverseChicagoMapReferences'
import {streetVerseCommunitySpawn} from '../config/streetverseCommunitySlices'
import {placePublishedWorldAssets} from '../game/runtime/PublishedWorldPlacement'
import {disposeNativeAssetLayer,loadTryammNativeCircleParkLayer} from './TryammNativeAssetRuntime'

export const PIN_REQUEST='tryamm:streetverse-map-pin'
export const PIN_RESULT='tryamm:streetverse-map-pin-result'
const storageKey='tryamm.chicago.active-building-pin.v1'
export type BuildingPin={area:string;lat:number;lon:number;yaw:number;scale:number;assetId:string}
export function pinOrigin(area:string){
 if(area==='')return {lat:41.868056760836,lon:-87.66397505708,x:-38,z:31}
 const [lat,lon]=chicagoMapReference(area,'').point
 return {lat,lon,...streetVerseCommunitySpawn(area)}
}
export function pinTransform(pin:BuildingPin){
 const origin=pinOrigin(pin.area)
 if(![pin.lat,pin.lon,pin.yaw,pin.scale].every(Number.isFinite)||pin.scale<=0||pin.scale>50||typeof pin.assetId!=='string'||pin.assetId.length>160)throw Error('Check the coordinates, model ID, rotation and scale.')
 const east=(pin.lon-origin.lon)*111320*Math.cos(origin.lat*Math.PI/180)
 const north=(pin.lat-origin.lat)*111320
 if(Math.hypot(east,north)>90)throw Error('Choose a pin within 90 metres of this neighborhood reference.')
 return {position:[origin.x+east,0,origin.z-north] as [number,number,number],rotationY:-pin.yaw*Math.PI/180,scale:pin.scale}
}
export function installStreetVerseMapPin(parent:THREE.Group){
 let revision=0
 let release:(()=>void)|undefined
 async function apply(pin:BuildingPin,save:boolean){
  const version=++revision
  const staging=new THREE.Group()
  try{
   const transform=pinTransform(pin)
   let dispose:()=>void
   if(pin.assetId){
    const result=await placePublishedWorldAssets(staging,'chicago',[{id:'mapped-building',assetId:pin.assetId,...transform}])
    dispose=result.dispose
   }else{
    const result=await loadTryammNativeCircleParkLayer({placements:[{asset:'building',label:'mapped-brick-module',...transform}]})
    if(!result.loaded){disposeNativeAssetLayer(result.group);throw Error('The recovered brick module could not load.')}
    staging.add(result.group)
    dispose=()=>disposeNativeAssetLayer(result.group)
   }
   if(version!==revision){dispose();return}
   release?.()
   parent.add(staging)
   release=()=>{staging.removeFromParent();dispose()}
   let message='Building placed at the selected pin.'
   if(save)try{localStorage.setItem(storageKey,JSON.stringify(pin))}catch{message+=' This device could not save the pin.'}
   report(message)
  }catch(error){if(version===revision)report(String((error as Error).message))}
 }
 function report(message:string){window.dispatchEvent(new CustomEvent(PIN_RESULT,{detail:message}))}
 const onPin=(event:Event)=>{if(!parent.visible)return;const request=event as CustomEvent<BuildingPin>;request.preventDefault();void apply(request.detail,true)}
 window.addEventListener(PIN_REQUEST,onPin)
 try{const saved=localStorage.getItem(storageKey);if(saved)void apply(JSON.parse(saved),false)}catch{}
 return ()=>{revision++;release?.();window.removeEventListener(PIN_REQUEST,onPin)}
}
