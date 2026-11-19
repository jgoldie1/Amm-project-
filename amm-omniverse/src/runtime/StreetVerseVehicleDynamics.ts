/**
 * Original lightweight vehicle dynamics for StreetVerse's WebGL/Chromebook runtime.
 * Deterministic arcade bicycle model, not a full rigid-body simulator.
 * Units: meters, seconds, radians; fixed timestep support.
 */
export type VehicleKind='car'|'motorcycle'
export type RoadSurface='dry'|'wet'|'gravel'
export type VehicleInput={throttle:number;brake:number;steer:number;handbrake?:boolean;reverse?:boolean}
export type VehicleState={x:number;z:number;yaw:number;speed:number;steeringAngle:number;lean:number;wheelAngle:number;slip:number;damage:number;kind:VehicleKind}
export type VehicleConfig={wheelbase:number;maxForward:number;maxReverse:number;acceleration:number;braking:number;drag:number;rollingResistance:number;steerMax:number;steerResponse:number;massKg:number;maxLean:number}
export const VEHICLE_CONFIG:Record<VehicleKind,VehicleConfig>={
 car:{wheelbase:2.65,maxForward:19,maxReverse:6.5,acceleration:6.1,braking:11.5,drag:.012,rollingResistance:.45,steerMax:.56,steerResponse:4.5,massKg:1470,maxLean:.035},
 motorcycle:{wheelbase:1.43,maxForward:24,maxReverse:0,acceleration:7.3,braking:9,drag:.009,rollingResistance:.36,steerMax:.37,steerResponse:6.5,massKg:260,maxLean:.57}
}
const grip:Record<RoadSurface,number>={dry:1,wet:.63,gravel:.46}
const finite=(x:number,otherwise=0)=>Number.isFinite(x)?x:otherwise
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,finite(x)))
export function newVehicle(kind:VehicleKind,x=0,z=0,yaw=0):VehicleState{
 return {kind,x:finite(x),z:finite(z),yaw:finite(yaw),speed:0,steeringAngle:0,lean:0,wheelAngle:0,slip:0,damage:0}
}
export function stepVehicle(vehicle:VehicleState,input:VehicleInput,seconds:number,surface:RoadSurface='dry',oneHand=false):VehicleState{
 const cfg=VEHICLE_CONFIG[vehicle.kind]||VEHICLE_CONFIG.car
 const dt=clamp(seconds,0,1/30)
 if(dt<=0)return {...vehicle}
 const traction=grip[surface]??grip.dry
 const throttle=clamp(input.throttle,-1,1),brake=clamp(input.brake,0,1),turn=clamp(input.steer,-1,1)
 const limit=cfg.maxForward*(oneHand?.66:1)
 const maxReverse=vehicle.kind==='motorcycle'?0:cfg.maxReverse*(oneHand?.7:1)
 const reverse=vehicle.kind==='car'&&(input.reverse||throttle<0)
 const desiredDrive=reverse?-Math.abs(throttle):Math.max(0,throttle)
 // Motorcycle does not automatically reverse when the user taps backwards.
 const accelerating=desiredDrive!==0
 let speed=vehicle.speed
 if(accelerating){
  const force=cfg.acceleration*traction*dt*Math.abs(desiredDrive)
  if(desiredDrive>0)speed=Math.min(limit,speed+force)
  else speed=Math.max(-maxReverse,speed-force)
 }
 const brakeForce=(input.handbrake?1:brake)*cfg.braking*traction*dt
 if(brakeForce>0)speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-brakeForce)
 if(!accelerating||brakeForce>0){
  const passive=(cfg.rollingResistance+cfg.drag*speed*speed)*dt
  speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-passive)
 }
 if(Math.abs(speed)<.015)speed=0
 speed=clamp(speed,-maxReverse,limit)
 const desiredAngle=turn*cfg.steerMax*(oneHand?.68:1)
 const easing=1-Math.exp(-cfg.steerResponse*dt)
 const steeringAngle=vehicle.steeringAngle+(desiredAngle-vehicle.steeringAngle)*easing
 const angular=speed*Math.tan(steeringAngle)/cfg.wheelbase
 // Lateral grip limits severe turns on wet/gravel roads; speed does not teleport.
 const yawRate=clamp(angular,-(1.5*traction+.2),(1.5*traction+.2))
 const yaw=vehicle.yaw+yawRate*dt
 const x=vehicle.x+Math.cos(yaw)*speed*dt
 const z=vehicle.z-Math.sin(yaw)*speed*dt
 const lateral=Math.abs(speed*yawRate)
 const leanTarget=vehicle.kind==='motorcycle'?clamp(Math.atan2(speed*yawRate,9.81),-cfg.maxLean,cfg.maxLean):clamp(speed*yawRate*.003,-cfg.maxLean,cfg.maxLean)
 const lean=vehicle.lean+(leanTarget-vehicle.lean)*(1-Math.exp(-7*dt))
 const slip=clamp(Math.max(0,lateral-8*traction)/Math.max(3,8*traction),0,1)
 return {...vehicle,x,z,yaw,speed,steeringAngle,lean,slip,wheelAngle:vehicle.wheelAngle+speed*dt/.34}
}
export function fixedStepVehicle(state:VehicleState,input:VehicleInput,elapsed:number,surface:RoadSurface='dry',oneHand=false){
 let remaining=clamp(elapsed,0,.25),next=state
 while(remaining>1e-8){const dt=Math.min(1/60,remaining);next=stepVehicle(next,input,dt,surface,oneHand);remaining-=dt}
 return next
}
export function collisionStop(state:VehicleState,normalX=0,normalZ=0):VehicleState{
 const impact=Math.abs(state.speed)*VEHICLE_CONFIG[state.kind].massKg*.5
 return {...state,speed:0,slip:0,damage:clamp(state.damage+impact/100000,0,1),lean:state.lean*.55,x:state.x+finite(normalX)*.01,z:state.z+finite(normalZ)*.01}
}
