// Original StreetVerse and CrossVerse accessible vehicle dynamics core.
// Deterministic 2.5D bicycle model; geometry, wheel colliders and road contacts
// must still be linked to the existing Rapier/THREE vehicle rigs for full 3D physics.
const PRESETS=Object.freeze({
 car:Object.freeze({mass:1550,wheelbase:2.7,maxForward:38,maxReverse:9,maxAcceleration:5.3,brakeDeceleration:11,engineDrag:.32,rollingDrag:.04,steeringAngle:.58,steeringRate:2.5,grip:1.0,yawResponse:4.3,leanLimit:.08}),
 motorcycle:Object.freeze({mass:240,wheelbase:1.43,maxForward:48,maxReverse:3,maxAcceleration:7.2,brakeDeceleration:10,engineDrag:.28,rollingDrag:.05,steeringAngle:.46,steeringRate:3.2,grip:.86,yawResponse:5.4,leanLimit:.58})
})
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const finite=(v,fallback=0)=>Number.isFinite(v)?v:fallback
const norm=(a)=>Math.atan2(Math.sin(a),Math.cos(a))
function createVehicleState(kind='car'){
 if(!PRESETS[kind])throw Error('VEHICLE_KIND_UNSUPPORTED')
 return {kind,x:0,z:0,heading:0,speed:0,steering:0,lean:0,gear:'P',parkingBrake:false,surface:'dry',distance:0}
}
function stepVehicle(original,rawInput={},dt=1/60){
 if(!original||!PRESETS[original.kind])throw Error('VEHICLE_KIND_UNSUPPORTED')
 if(!Number.isFinite(dt)||dt<=0||dt>0.25)throw Error('INVALID_FIXED_TIMESTEP')
 const p=PRESETS[original.kind]
 const surface=['dry','wet','gravel'].includes(rawInput.surface)?rawInput.surface:original.surface
 const friction=surface==='wet'?.68:surface==='gravel'?.54:1
 const throttle=clamp(finite(rawInput.throttle),0,1),brake=clamp(finite(rawInput.brake),0,1)
 const desiredSteer=clamp(finite(rawInput.steer),-1,1),delta=clamp(desiredSteer-original.steering,-p.steeringRate*dt,p.steeringRate*dt)
 const steer=clamp(original.steering+delta,-1,1)
 const requestedGear=['P','R','N','D'].includes(rawInput.gear)?rawInput.gear:original.gear
 // Road transmission safety: do not switch directly between forward/reverse while moving.
 const gear=original.gear!==requestedGear&&Math.abs(original.speed)>.5&&(requestedGear==='R'||requestedGear==='P'||original.gear==='R'&&requestedGear==='D')?original.gear:requestedGear
 const parkingBrake=typeof rawInput.parkingBrake==='boolean'?rawInput.parkingBrake:original.parkingBrake
 const direction=gear==='D'?1:gear==='R'?-1:0
 const motor=direction*throttle*p.maxAcceleration*(1-.28*Math.min(1,Math.abs(original.speed)/p.maxForward))
 const sign=Math.sign(original.speed),drag=original.speed*p.engineDrag*.035+sign*p.rollingDrag
 const brakeForce=sign*brake*p.brakeDeceleration*friction
 let speed=original.speed+(motor-drag-brakeForce)*dt
 if(parkingBrake||gear==='P'){const parkingStep=dt*p.brakeDeceleration*2;speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-parkingStep)}
 if(gear==='N'&&Math.abs(speed)<.08)speed=0
 if(gear==='D')speed=clamp(speed,-1,p.maxForward*friction)
 if(gear==='R')speed=clamp(speed,-p.maxReverse,.5)
 if(gear==='P'&&Math.abs(speed)<.06)speed=0
 if(brake>0&&Math.sign(speed)!==sign&&sign!==0)speed=0
 if(throttle===0&&Math.abs(speed)<.035)speed=0
 // Ackermann-like bicycle kinematics. At rest, steering does not rotate the car.
 const yawRate=(speed/p.wheelbase)*Math.tan(steer*p.steeringAngle)*p.grip*friction
 const heading=norm(original.heading+yawRate*dt)
 const x=original.x+Math.sin(heading)*speed*dt,z=original.z+Math.cos(heading)*speed*dt
 const leanTarget=original.kind==='motorcycle'?-clamp(yawRate*speed/17,-p.leanLimit,p.leanLimit):0
 const lean=original.lean+(leanTarget-original.lean)*Math.min(1,dt*p.yawResponse)
 return {...original,surface,gear,parkingBrake,steering:steer,speed,x,z,heading,lean,distance:original.distance+Math.abs(speed*dt)}
}
function simulateVehicle(state,input,delta,substep=1/60){
 if(!Number.isFinite(delta)||delta<=0||delta>1)throw Error('INVALID_FRAME_TIME')
 const slices=Math.ceil(delta/substep);if(slices>120)throw Error('TOO_MANY_PHYSICS_STEPS')
 let result=state
 for(let i=0;i<slices;i++)result=stepVehicle(result,input,delta/slices)
 return result
}
function safeVehicleTelemetry(state){
 return {kind:state.kind,speedKmh:Math.round(Math.abs(state.speed)*3.6),gear:state.gear,leanRadians:state.lean,headingRadians:state.heading,distanceMeters:Math.round(state.distance),surface:state.surface,parkingBrake:state.parkingBrake,realWorldVehicleControl:false,networkSynced:false,rapierCollisionIntegrated:false}
}
export {PRESETS,createVehicleState,stepVehicle,simulateVehicle,safeVehicleTelemetry}
