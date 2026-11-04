import {boardTransport,createTransportManifest,passengerCount,type TransportKind,type TransportManifest} from './StreetVersePassengerTransportRuntime'
import {checkSixSeatCabinFit,DEFAULT_SEATED_AVATAR,type CabinAvatarSize} from './StreetVerseCabinFitRuntime'

export type CabinCameraMode='exterior'|'driver'|'passenger'|'rear-seat'|'aisle'|'cinematic'
export type CabinPose={x:number;y:number;z:number;yaw:number}
export type CabinParticipant={actorId:string;displayName:string;seatId:string;pose:CabinPose;speaking:boolean;playerControlled:boolean;size:CabinAvatarSize;fittedScale:number}
export type CabinCameraShot={mode:CabinCameraMode;camera:CabinPose;lookAt:CabinPose;inside:boolean}
export type CabinDirectorState={manifest:TransportManifest;participants:CabinParticipant[];camera:CabinCameraMode;speakerId:string|null;privateRoom:true;prototype:true}
export const CABIN_PROFILES:Record<'six-seat-suv'|'cta-bus'|'el-train'|'airliner', {kind:TransportKind;seats:number;standing:number;positions:readonly CabinPose[]}>={
 'six-seat-suv':{kind:'suv',seats:6,standing:0,positions:[
  {x:-.43,y:.77,z:.48,yaw:0},{x:-.43,y:.77,z:-.48,yaw:0},
  {x:-1.30,y:.79,z:.47,yaw:0},{x:-1.30,y:.79,z:0,yaw:0},
  {x:-1.30,y:.79,z:-.47,yaw:0},{x:-2.12,y:.81,z:0,yaw:0}]},
 'cta-bus':{kind:'bus',seats:40,standing:20,positions:[]},
 'el-train':{kind:'train',seats:120,standing:80,positions:[]},
 'airliner':{kind:'plane',seats:180,standing:0,positions:[]}
}
const clean=(s:string,max=48)=>s.replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)
const fallbackPose=(index:number):CabinPose=>({x:-.8-Math.floor(index/4)*.9,y:.8,z:(index%4-1.5)*.45,yaw:0})
export function createStreetVerseCabinDirector(id:string,profile:keyof typeof CABIN_PROFILES='six-seat-suv'){
 const spec=CABIN_PROFILES[profile]
 // SUV uses its own physical six-seat layout rather than a generic operator+passenger layout.
 const manifest=createTransportManifest(id,spec.kind,profile==='six-seat-suv'?5:spec.seats-1,spec.standing)
 const state:CabinDirectorState={manifest,participants:[],camera:'exterior',speakerId:null,privateRoom:true,prototype:true}
 const refresh=()=>{state.participants.forEach(p=>p.speaking=p.actorId===state.speakerId)}
 const board=(actorId:string,displayName:string,playerControlled=false,body:CabinAvatarSize=DEFAULT_SEATED_AVATAR)=>{
  const id=clean(actorId,80);if(!id)return null
  const existing=state.participants.find(p=>p.actorId===id)
  if(existing)return {...existing,pose:{...existing.pose},size:{...existing.size}}
  const preferred=playerControlled?'operator':undefined
  const candidate=manifest.seats.find(seat=>seat.id===preferred&&!manifest.occupants[seat.id])||manifest.seats.find(seat=>seat.role==='passenger'&&!manifest.occupants[seat.id])
  if(!candidate)return null
  const index=manifest.seats.findIndex(seat=>seat.id===candidate.id)
  const pose=spec.positions[index]||fallbackPose(index)
  const fit=profile==='six-seat-suv'?checkSixSeatCabinFit(pose,body,state.participants.map(p=>({anchor:p.pose,size:p.size}))):{fits:true,scale:1,size:body}
  if(!fit.fits)return null // do not commit a seat that clips its neighbor or the cabin
  const seatId=boardTransport(manifest,id,candidate.id)
  if(!seatId)return null
  const person:CabinParticipant={actorId:id,displayName:clean(displayName),seatId,pose,speaking:false,playerControlled,size:fit.size,fittedScale:fit.scale}
  state.participants.push(person)
  return {...person,pose:{...person.pose}}
 }
 const speak=(actorId:string|null)=>{
  if(actorId!==null&&!state.participants.some(p=>p.actorId===actorId))return false
  state.speakerId=actorId;refresh();return true
 }
 const camera=(mode:CabinCameraMode):CabinCameraShot=>{
  state.camera=mode
  const shot:Record<CabinCameraMode,[CabinPose,CabinPose,boolean]>={
   exterior:[{x:-5,y:2.8,z:5,yaw:0},{x:-1,y:.8,z:0,yaw:0},false],
   driver:[{x:-.43,y:1.36,z:.48,yaw:0},{x:4,y:1.15,z:0,yaw:0},true],
   passenger:[{x:-.43,y:1.34,z:-.48,yaw:0},{x:3,y:1,z:0,yaw:0},true],
   'rear-seat':[{x:-1.8,y:1.33,z:.15,yaw:0},{x:-.5,y:1.1,z:.1,yaw:0},true],
   aisle:[{x:-2.5,y:1.5,z:0,yaw:0},{x:0,y:1,z:0,yaw:0},true],
   cinematic:[{x:-3.5,y:1.8,z:2,yaw:0},{x:-.8,y:1,z:0,yaw:0},false]
  }
  const [eye,lookAt,inside]=shot[mode]
  return {mode,camera:{...eye},lookAt:{...lookAt},inside}
 }
 return {state,board,speak,camera,occupancy:()=>passengerCount(manifest),snapshot:()=>({...state,participants:state.participants.map(p=>({...p,pose:{...p.pose}}))})}
}
