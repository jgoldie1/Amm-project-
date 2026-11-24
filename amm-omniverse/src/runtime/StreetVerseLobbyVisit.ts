import * as THREE from 'three'
import {compileBuildingReconstruction,type BuildingPlan} from '../game/runtime/StreetVerseBuildingReconstructionCompiler'
import {CIRCLE_PARK_RESIDENT_ENTRANCE} from '../data/CircleParkResidentEntrance'
import type {NativePlacement} from '../data/TryammNativeRuntimeAssetCatalog'

export const entrances={
 chicago:{name:'Circle Park',x:-38,z:52,front:1},
 greenville:{name:'Greenville Student Union',x:18,z:2.8,front:-1},
} as const
type Site=keyof typeof entrances
export function entranceProps(site:Site):NativePlacement[]{
 const anchor=CIRCLE_PARK_RESIDENT_ENTRANCE.anchors.publicApproach.position
 const {x,z,front}=site==='chicago'?{x:anchor[0],z:anchor[2],front:1}:entrances.greenville
 return [
  {asset:'tree',position:[x-9,0,z-2*front],scale:1.25,label:site+'-approach-tree'},
  {asset:'tree',position:[x+10,0,z+4*front],scale:1.08,label:site+'-lawn-tree'},
  {asset:'bench',position:[x-4,0,z+front],rotationY:front===1?Math.PI:0,label:site+'-entrance-bench'},
  {asset:'streetLamp',position:[x+4,0,z+front],label:site+'-entrance-lamp'},
  {asset:'holoWayfinder',position:[x+3,0,z+front*2],label:site+'-lobby-wayfinder'},
 ]
}
export function lobbyPlan(site:Site):BuildingPlan{
 return {id:site+'-practice-lobby',cityId:site,district:entrances[site].name,label:'Public lobby walkthrough',
  source:[{id:'tryamm-original-game-layout',kind:'owner-model',rights:'tryamm-created'}],
  shell:{widthM:10,depthM:10,levels:[{id:'lobby',label:'Lobby',elevationM:0,heightM:3.2,rooms:[]},{id:'upper',label:'Upper landing',elevationM:3.2,heightM:3.2,rooms:[]}]},
  connections:[{id:'lift',kind:'elevator',from:'lobby',to:'upper',accessible:true},{id:'stair',kind:'stairs',from:'upper',to:'lobby',accessible:false}],
  publicEntryLevelId:'lobby',layers:{electrical:true,plumbing:false,hvac:false},assetStore:{namespace:'spaceverse',version:'v1',assetIds:['bench','street-lamp','holo-wayfinder']},interiorAccess:'public-simulation'}
}
const steps=[
 {label:'Enter lobby',status:'On the street',point:[0,1.55,4.3]},
 {label:'Call elevator',status:'Lobby · exit behind you',point:[0,1.55,3]},
 {label:'Ride to floor 2',status:'Elevator ready',point:[-2.7,1.55,-2.9]},
 {label:'Go to stairs',status:'Floor 2 · elevator arrived',point:[-2.7,4.75,-2.9]},
 {label:'Descend stairs',status:'Upper stair landing',point:[2.7,4.75,-3]},
 {label:'Exit to street',status:'Lobby · illuminated exit ahead',point:[2.7,1.55,2.4]},
] as const

export function installLobbyVisit(site:Site,mount:HTMLElement,renderer:THREE.WebGLRenderer,returnToStreet:()=>void){
 const entrance=entrances[site],plan=lobbyPlan(site)
 const blueprint=compileBuildingReconstruction(plan)
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(67,1,.08,40)
 scene.background=new THREE.Color(0x283542)
 const cab=new THREE.Group();scene.add(cab)
 const material=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.68})
 const stone=material(0xc9bda7),rail=material(0x556b75),wall=material(0xb7c3c4),dark=material(0x314752)
 const glow=new THREE.MeshBasicMaterial({color:0xb9ffd0})
 const geometry=new THREE.BoxGeometry()
 function box(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,parent:THREE.Object3D=scene){
  const mesh=new THREE.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh
 }
 const rise=plan.shell.levels[1].elevationM
 box(0,-.1,0,blueprint.surface.widthM,.2,blueprint.surface.depthM,stone)
 box(0,3,-4.8,10,6,.2,wall)
 for(const x of [-4.9,4.9])box(x,3,0,.2,6,10,wall)
 box(0,rise-.1,-3.65,9,.2,2.2,stone)
 for(let i=0;i<16;i++){
  const height=(i+1)*rise/16
  box(2.7,height/2,2.4-(i+.5)*5.4/16,1.8,height,5.4/16,stone)
 }
 for(const x of [1.7,3.7]){
  const handrail=box(x,2.55,-.3,.08,.08,Math.hypot(5.4,rise),rail)
  handrail.rotation.x=Math.atan2(rise,5.4)
 }
 box(-2.7,0,-2.9,2.4,.1,2.5,rail,cab)
 box(-2.7,1.15,-4,2.4,2.3,.12,dark,cab)
 box(-3.85,1.15,-2.9,.12,2.3,2.4,rail,cab)
 box(-2.7,2.3,-2.9,2.4,.08,2.5,glow,cab)
 for(const x of [-1.1,1.1])box(x,1.2,4.7,.15,2.4,.18,dark)
 box(0,2.5,4.7,2.4,.3,.2,glow)
 scene.add(new THREE.HemisphereLight(0xfff6df,0x77889b,2.2))
 const light=new THREE.PointLight(0xffe2aa,70);light.position.set(0,4,1);scene.add(light)
 const panel=document.createElement('section'),status=document.createElement('div'),action=document.createElement('button'),leave=document.createElement('button')
 panel.setAttribute('aria-label',entrance.name+' guided lobby');status.setAttribute('role','status')
 panel.style.cssText='position:absolute;top:max(12px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:65000;background:#14212a;color:white;padding:8px;border-radius:10px;max-width:92vw;text-align:center;font:600 15px system-ui'
 for(const button of [action,leave]){button.type='button';button.style.cssText='min-height:48px;padding:8px 14px;margin:3px;font:inherit';panel.append(button)}
 const dialog=document.createElement('dialog')
 dialog.setAttribute('aria-label',entrance.name+' lobby walkthrough')
 dialog.style.cssText='position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;border:0;margin:0;padding:0;overflow:hidden;background:#283542'
 dialog.onkeydown=e=>e.stopPropagation()
 mount.append(dialog)
 const restoreCanvas=()=>{if(dialog.open){dialog.close();mount.append(renderer.domElement,panel)}}
 const reference=document.createElement('a')
 reference.href=site==='chicago'?'https://www.circleparkchicago.com/gallery/':'https://www.greenville.edu/campusmap'
 reference.textContent=site==='chicago'?'Exterior photos':'University campus map'
 reference.target='_blank';reference.rel='noopener noreferrer';reference.style.cssText='color:white;padding:12px;display:inline-block'
 panel.append(reference);panel.prepend(status);leave.textContent='Return to street';mount.append(panel)
 let stage=0,started=0,duration=0,near=false,atGate=false
 const approach=CIRCLE_PARK_RESIDENT_ENTRANCE.anchors.publicApproach.position
 panel.hidden=true
 const pos=new THREE.Vector3(),target=new THREE.Vector3()
 const refresh=()=>{panel.hidden=!stage&&!near;leave.hidden=!stage;status.textContent=stage?entrance.name+' · '+(duration?['','Entering lobby','Approaching elevator','Elevator rising','Approaching stairs','Descending stairs'][stage]:steps[stage].status):atGate?'1111 S Laflin · visitor entrance':entrance.name+' · original game lobby';action.textContent=!stage&&atGate?'Visitor check-in':steps[stage].label;action.disabled=duration>0}
 const reset=()=>{returnToStreet();restoreCanvas();stage=0;duration=0;cab.position.y=0;refresh();if(near)action.focus()}
 dialog.oncancel=e=>{e.preventDefault();reset()}
 leave.onclick=reset
 const cue=(key:string)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-sound-preview',{detail:{key}}))
 action.onclick=()=>{
  if(duration||(!stage&&!near))return
  if(!stage&&atGate){window.dispatchEvent(new CustomEvent('tryamm:circle-park-entry',{detail:{method:'guard-sign-in'}}));return}
  if(stage===5){cue('door_open');reset();return}
  if(!stage){dialog.append(renderer.domElement,panel);dialog.showModal();action.focus()}
  stage++;started=performance.now()
  duration=matchMedia('(prefers-reduced-motion: reduce)').matches?1:stage===3||stage===5?1800:550
  cue(stage===1?'door_open':stage===5?'footstep':'button_click');refresh()
 }
 refresh()
 return {frame(now:number,x:number,z:number,onFoot:boolean){
  if(!stage){const gate=onFoot&&site==='chicago'&&Math.hypot(x-approach[0],z-approach[2])<6;const next=gate||(onFoot&&Math.hypot(x-entrance.x,z-entrance.z)<9);if(next!==near||gate!==atGate){near=next;atGate=gate;refresh()}return false}
  const t=duration?Math.min(1,Math.max(0,(now-started)/duration)):1
  const prev=steps[stage-1].point,next=steps[stage].point
  pos.fromArray(prev);target.fromArray(next);camera.position.lerpVectors(pos,target,t)
  if(stage===3)cab.position.y=rise*t
  const look=stage===5?[0,1.6,4.7]:stage===4?[2.7,1.4,2.4]:stage===3?[2.7,4.7,-2.7]:[-2.7,1.4,-4.2]
  camera.lookAt(look[0],look[1],look[2]);camera.aspect=mount.clientWidth/Math.max(1,mount.clientHeight);camera.updateProjectionMatrix()
  renderer.render(scene,camera)
  if(duration&&t===1){duration=0;refresh();if(stage===3)cue('notification')}
  return true
 },dispose(){restoreCanvas();dialog.remove();panel.remove();geometry.dispose();for(const m of [stone,rail,wall,dark,glow])m.dispose();scene.clear()}}
}
