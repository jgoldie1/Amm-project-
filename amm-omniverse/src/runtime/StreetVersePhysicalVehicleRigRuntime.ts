import * as THREE from 'three'

export type StreetVerseVehicleRig={
 vehicle:THREE.Object3D
 avatar:THREE.Object3D
 camera?:THREE.Camera
 driverSeat?:THREE.Object3D
 steeringWheel?:THREE.Object3D
 brakeLights?:THREE.Object3D[]
 reverseLights?:THREE.Object3D[]
 doors?:THREE.Object3D[]
 pedals?:{brake?:THREE.Object3D;throttle?:THREE.Object3D}
}

type DriveState={speed:number;throttle:number;brake:number;steer:number;gear:'P'|'R'|'N'|'D';parkingBrake:boolean}
const state:DriveState={speed:0,throttle:0,brake:0,steer:0,gear:'P',parkingBrake:false}
let active:StreetVerseVehicleRig|null=null
let installed=false

function find(root:THREE.Object3D,names:string[]){let hit:THREE.Object3D|undefined;root.traverse(o=>{if(hit)return;const n=o.name.toLowerCase();if(names.some(x=>n.includes(x)))hit=o});return hit}
function findAll(root:THREE.Object3D,names:string[]){const hits:THREE.Object3D[]=[];root.traverse(o=>{const n=o.name.toLowerCase();if(names.some(x=>n.includes(x)))hits.push(o)});return hits}
function setEmissive(objects:THREE.Object3D[],on:boolean,color:number){for(const o of objects){const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial|undefined;if(m&&'emissive' in m){m.emissive.setHex(color);m.emissiveIntensity=on?2.5:.12}}}

export function bindStreetVerseVehicleRig(rig:StreetVerseVehicleRig){
 active=rig
 rig.driverSeat??=find(rig.vehicle,['driverseat','driver_seat','seat_driver'])
 rig.steeringWheel??=find(rig.vehicle,['steering','wheel_driver'])
 rig.brakeLights??=findAll(rig.vehicle,['brakelight','brake_light','tail'])
 rig.reverseLights??=findAll(rig.vehicle,['reverselight','reverse_light'])
 rig.doors??=findAll(rig.vehicle,['door'])
 rig.pedals??={brake:find(rig.vehicle,['brake_pedal']),throttle:find(rig.vehicle,['gas_pedal','throttle_pedal'])}
 dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-rig-ready',{detail:{seat:Boolean(rig.driverSeat),steering:Boolean(rig.steeringWheel),doors:rig.doors.length,brakeLights:rig.brakeLights.length,reverseLights:rig.reverseLights.length}}))
 return rig
}

function applySeat(detail:any){
 if(!active)return
 const seat=active.driverSeat
 const world=new THREE.Vector3()
 if(seat){seat.getWorldPosition(world);active.vehicle.worldToLocal(world);active.avatar.position.copy(world)}
 active.avatar.position.y+=Number(detail.hipOffsetY||0)
 active.avatar.rotation.set(0,Math.PI,THREE.MathUtils.degToRad(Number(detail.recline||0)))
 if(active.camera)active.camera.position.y+=Number(detail.cameraOffsetY||0)
}
function drive(detail:any){
 if(!active)return
 state.throttle=THREE.MathUtils.clamp(Number(detail.throttle||0),0,1);state.brake=THREE.MathUtils.clamp(Number(detail.brake||0),0,1);state.steer=THREE.MathUtils.clamp(Number(detail.steer||0),-1,1)
 if(active.steeringWheel)active.steeringWheel.rotation.x=-state.steer*.7
 if(active.pedals?.throttle)active.pedals.throttle.rotation.z=-state.throttle*.18
 if(active.pedals?.brake)active.pedals.brake.rotation.z=-state.brake*.18
 setEmissive(active.brakeLights||[],state.brake>.05||state.parkingBrake,0xff1010)
 setEmissive(active.reverseLights||[],state.gear==='R',0xffffff)
}
function gear(detail:any){
 const g=String(detail.gear||'').toUpperCase();if(['P','R','N','D'].includes(g))state.gear=g as DriveState['gear']
 if(typeof detail.parkingBrake==='boolean')state.parkingBrake=detail.parkingBrake
 drive(state)
 dispatchEvent(new CustomEvent('tryamm:streetverse-dashboard-state',{detail:{gear:state.gear,parkingBrake:state.parkingBrake}}))
}
function door(detail:any){
 if(!active)return
 const index=Math.max(0,Number(detail.index||0)),d=active.doors?.[index];if(!d)return
 d.rotation.y=detail.open?THREE.MathUtils.degToRad(index%2?58:-58):0
}
function exitSeat(){
 if(!active)return
 active.avatar.rotation.set(0,0,0)
 dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-rig-exit',{detail:{restoreAvatar:true,restoreCamera:true}}))
}

export function installStreetVersePhysicalVehicleRigRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 addEventListener('tryamm:streetverse-vehicle-seat-fit',(e:Event)=>applySeat((e as CustomEvent<any>).detail||{}))
 addEventListener('tryamm:streetverse-vehicle-input',(e:Event)=>drive((e as CustomEvent<any>).detail||{}))
 addEventListener('tryamm:streetverse-transmission',(e:Event)=>gear((e as CustomEvent<any>).detail||{}))
 addEventListener('tryamm:streetverse-vehicle-door',(e:Event)=>door((e as CustomEvent<any>).detail||{}))
 addEventListener('tryamm:streetverse-vehicle-controlled',(e:Event)=>{if(!(e as CustomEvent<any>).detail?.entered)exitSeat()})
}
