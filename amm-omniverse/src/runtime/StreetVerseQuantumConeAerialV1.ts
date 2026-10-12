import * as THREE from 'three'
import {STREETVERSE_FILLMORE_TAYLOR_ARRIGO_STOPS} from './StreetVerseFillmoreTaylorArrigoCorridorV1'
import type {QuantumLensMode} from './QuantumHoloLensRuntime'

/** Lens positions are in the playable fictionalized game grid, not real GPS or security layouts. */
export const CONE_AERIAL_STOPS=[
 {id:'circle-park',label:'Circle Park apartments',x:-38,z:42,landable:true},
 {id:'guard-gate',label:'Taylor/Laflin gate',x:-38,z:31,landable:true},
 {id:'roosevelt',label:'Roosevelt Road',x:-8,z:18,landable:true},
 ...STREETVERSE_FILLMORE_TAYLOR_ARRIGO_STOPS.map(p=>({id:p.id,label:p.label,x:p.x,z:p.z,landable:true})),
 {id:'pilsen',label:'Pilsen / 18th',x:-8,z:-36,landable:true},
] as const
export const findStreetVerseConeStop=(id:string)=>CONE_AERIAL_STOPS.find(p=>p.id===id)||null
export type ConeAerialStop=(typeof CONE_AERIAL_STOPS)[number]
export type ConeZoom='city'|'district'|'block'
const HEIGHT:Record<ConeZoom,number>={city:232,district:132,block:75}
const SCALE:Record<ConeZoom,number>={city:110,district:23,block:7}
const SMOOTH=(n:number)=>{const t=Math.max(0,Math.min(1,Number.isFinite(n)?n:0));return t*t*(3-2*t)}
export const coneGridPercent=(x:number,z:number)=>({left:Math.max(0,Math.min(100,(x+82)/164*100)),top:Math.max(0,Math.min(100,(82-z)/164*100))})
export class StreetVerseQuantumConeAerialV1{
 private phase:'off'|'overview'|'flight'|'preview'='off'
 private zoomLevel:ConeZoom='city'
 private center=new THREE.Vector3()
 private origin=new THREE.Vector3()
 private target:ConeAerialStop|null=null
 private landing:{x:number;z:number}|null=null
 private start=0
 get active(){return this.phase!=='off'}
 get zoom(){return this.zoomLevel}
 open(){this.phase='overview';this.zoomLevel='city';this.center.set(0,0,0);this.target=null;this.landing=null;this.emitLensState('city')}
 close(){this.phase='off';this.target=null;this.landing=null;this.emitLensState('building')}
 setZoom(zoom:ConeZoom){if(!this.active)return;this.zoomLevel=zoom;this.phase='overview';this.emitLensState(zoom)}
 fly(id:string,camera:THREE.PerspectiveCamera,now:number,landing:{x:number;z:number}|null){
  const target=CONE_AERIAL_STOPS.find(p=>p.id===id)
  if(!this.active||!target||!landing)return false
  this.target=target;this.landing=landing;this.origin.copy(camera.position);this.start=now;this.phase='flight'
  this.emitLensState('block')
  return true
 }
 tick(camera:THREE.PerspectiveCamera,now:number){
  if(!this.active)return{active:false,arrival:null as string|null,land:null as {x:number;z:number}|null}
  if(this.phase==='overview'){
   const h=HEIGHT[this.zoomLevel]
   camera.position.lerp(new THREE.Vector3(this.center.x,h,this.center.z),.09)
   camera.lookAt(this.center.x,0,this.center.z)
   return{active:true,arrival:null as string|null,land:null as {x:number;z:number}|null}
  }
  const destination=this.target
  if(!destination){this.close();return{active:false,arrival:null as string|null,land:null as {x:number;z:number}|null}}
  if(this.phase==='preview'){
   camera.position.lerp(new THREE.Vector3(destination.x,78,destination.z+14),.10)
   camera.lookAt(destination.x,0,destination.z)
   return{active:true,arrival:null as string|null,land:null as {x:number;z:number}|null}
  }
  const t=SMOOTH((now-this.start)/2700)
  camera.position.copy(this.origin).lerp(new THREE.Vector3(destination.x,16,destination.z+13),t)
  camera.lookAt(destination.x,1.2,destination.z)
  if(t>=1){const land=this.landing;this.close();return{active:true,arrival:destination.id,land}}
  return{active:true,arrival:null as string|null,land:null as {x:number;z:number}|null}
 }
 private emitLensState(zoom:ConeZoom|'building'){
  // Passive camera budget signal only: no external map tiles, OmniFabric jobs, API credits, or hardware claims.
  if(typeof window==='undefined')return
  const mode:QuantumLensMode=zoom==='city'?'city':zoom==='district'?'district':zoom==='block'?'block':'building'
  const scale=zoom==='building'?2:SCALE[zoom]
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-quantum-cone-state',{detail:{mode,scale,lens:'quantum-cone',source:'streetverse-aerial',passive:true}}))
  window.dispatchEvent(new CustomEvent('tryamm:performance-budget-request',{detail:{source:'streetverse-quantum-cone',quantumMode:mode,scale,request:{lod:mode==='city'?'far':mode==='building'?'near':'mid',streamHighDetail:false,streamWideArea:mode==='city'},noExternalJobs:true}}))
 }
}
