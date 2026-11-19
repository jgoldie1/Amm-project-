// Shared StreetVerse vehicle dynamics for air and water transports.
// This deterministic gameplay layer is intentionally lightweight for Chromebook/mobile.
// Full 3D collision, rotor/wing aerodynamics, hull contacts and buoyancy volumes still
// belong in the THREE/Rapier integration layer.

const PROFILES=Object.freeze({
 helicopter:Object.freeze({medium:'air',mass:3200,maxSpeed:78,maxVertical:16,accel:9,verticalAccel:7,drag:.22,yawRate:1.45,pitchRate:.8,rollRate:1.05,liftAtZeroSpeed:true}),
 airplane:Object.freeze({medium:'air',mass:62000,maxSpeed:255,maxVertical:28,accel:11,verticalAccel:5,drag:.08,yawRate:.34,pitchRate:.42,rollRate:.62,minLiftSpeed:42,liftAtZeroSpeed:false}),
 jet:Object.freeze({medium:'air',mass:18000,maxSpeed:420,maxVertical:55,accel:22,verticalAccel:9,drag:.055,yawRate:.42,pitchRate:.58,rollRate:.9,minLiftSpeed:55,liftAtZeroSpeed:false}),
 flyingCar:Object.freeze({medium:'hybrid',mass:1850,maxSpeed:92,maxVertical:12,accel:7.4,verticalAccel:5.8,drag:.18,yawRate:1.05,pitchRate:.7,rollRate:.85,liftAtZeroSpeed:true,groundMaxSpeed:46,groundAccel:5.6,transitionSeconds:1.8}),
 boat:Object.freeze({medium:'water',mass:2600,maxSpeed:24,accel:4.2,drag:.34,yawRate:.88,waveResponse:.26}),
 yacht:Object.freeze({medium:'water',mass:18000,maxSpeed:18,accel:2.2,drag:.28,yawRate:.42,waveResponse:.18}),
 ship:Object.freeze({medium:'water',mass:52000000,maxSpeed:13,accel:.42,drag:.12,yawRate:.08,waveResponse:.05})
})

const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0))
const norm=a=>Math.atan2(Math.sin(a),Math.cos(a))

function createMultiMediumVehicleState(kind='helicopter'){
 const p=PROFILES[kind]
 if(!p)throw Error('MULTI_MEDIUM_KIND_UNSUPPORTED')
 return {kind,medium:p.medium,x:0,y:p.medium==='water'?0:p.medium==='hybrid'?0:2,z:0,heading:0,pitch:0,roll:0,speed:0,verticalSpeed:0,throttle:0,distance:0,airborne:p.medium==='air',afloat:p.medium==='water',flightMode:p.medium==='hybrid'?'ground':undefined,transition:0}
}

function stepMultiMediumVehicle(original,input={},dt=1/60){
 const p=PROFILES[original?.kind]
 if(!p)throw Error('MULTI_MEDIUM_KIND_UNSUPPORTED')
 if(!Number.isFinite(dt)||dt<=0||dt>.25)throw Error('INVALID_FIXED_TIMESTEP')
 const throttle=clamp(input.throttle,0,1)
 const brake=clamp(input.brake,0,1)
 const yaw=clamp(input.yaw,-1,1)
 const pitchInput=clamp(input.pitch,-1,1)
 const rollInput=clamp(input.roll,-1,1)

 let speed=original.speed+(throttle*p.accel-original.speed*p.drag-brake*p.accel*1.4)*dt
 speed=clamp(speed,0,p.maxSpeed)
 let heading=norm(original.heading+yaw*p.yawRate*dt)
 let pitch=original.pitch
 let roll=original.roll
 let y=original.y
 let verticalSpeed=original.verticalSpeed||0

 if(p.medium==='hybrid'){
   const wantsFlight=input.flightMode==='flight'||input.takeoff===true
   const wantsGround=input.flightMode==='ground'||input.land===true
   let flightMode=original.flightMode||'ground'
   let transition=Number.isFinite(original.transition)?original.transition:0
   if(wantsFlight&&flightMode==='ground')flightMode='transition-up'
   if(wantsGround&&(flightMode==='flight'||flightMode==='transition-up'))flightMode='transition-down'
   const transitionRate=dt/Math.max(.25,p.transitionSeconds||1.8)
   if(flightMode==='transition-up'){transition=Math.min(1,transition+transitionRate);if(transition>=1)flightMode='flight'}
   else if(flightMode==='transition-down'){transition=Math.max(0,transition-transitionRate);if(transition<=0)flightMode='ground'}
   else transition=flightMode==='flight'?1:0
   if(flightMode==='ground'){
     verticalSpeed=0;y=0;pitch+=(0-pitch)*Math.min(1,dt*4);roll+=(0-roll)*Math.min(1,dt*4)
     speed=clamp(speed,0,p.groundMaxSpeed)
   }else{
     const vertical=clamp(input.vertical,-1,1)
     verticalSpeed+=(vertical*p.verticalAccel-verticalSpeed*.34)*dt
     verticalSpeed=clamp(verticalSpeed,-p.maxVertical,p.maxVertical)
     y=Math.max(0,y+verticalSpeed*dt)
     if(y===0&&verticalSpeed<0)verticalSpeed=0
     pitch+=((pitchInput*.36)-pitch)*Math.min(1,p.pitchRate*dt*3)
     roll+=((rollInput*.52)-roll)*Math.min(1,p.rollRate*dt*3)
   }
   const forward=Math.cos(pitch)*speed
   const x=original.x+Math.sin(heading)*forward*dt
   const z=original.z+Math.cos(heading)*forward*dt
   return {...original,flightMode,transition,throttle,speed,verticalSpeed,heading,pitch,roll,x,y,z,distance:original.distance+Math.abs(speed*dt),airborne:y>.25,afloat:false}
 }else if(p.medium==='air'){
   const liftReady=p.liftAtZeroSpeed||speed>=(p.minLiftSpeed||0)
   const vertical=clamp(input.vertical,-1,1)
   const commandedVertical=liftReady?vertical*p.verticalAccel:Math.min(0,vertical*p.verticalAccel)
   verticalSpeed+=commandedVertical*dt
   verticalSpeed-=verticalSpeed*.34*dt
   verticalSpeed=clamp(verticalSpeed,-p.maxVertical,p.maxVertical)
   y=Math.max(0,y+verticalSpeed*dt)
   if(y===0&&verticalSpeed<0)verticalSpeed=0
   pitch+=((pitchInput*.42)-pitch)*Math.min(1,p.pitchRate*dt*3)
   roll+=((rollInput*.65)-roll)*Math.min(1,p.rollRate*dt*3)
 }else{
   verticalSpeed=0
   y=0
   pitch+=((pitchInput*(p.waveResponse||0))-pitch)*Math.min(1,dt*2)
   roll+=((rollInput*(p.waveResponse||0)*1.35)-roll)*Math.min(1,dt*2)
 }

 const forward=Math.cos(pitch)*speed
 const x=original.x+Math.sin(heading)*forward*dt
 const z=original.z+Math.cos(heading)*forward*dt
 return {...original,throttle,speed,verticalSpeed,heading,pitch,roll,x,y,z,distance:original.distance+Math.abs(speed*dt),airborne:p.medium==='air'&&y>.25,afloat:p.medium==='water'}
}

function safeMultiMediumTelemetry(state){
 return {
  kind:state.kind,medium:state.medium,speedKmh:Math.round(state.speed*3.6),
  altitudeMeters:Math.round(state.y),verticalSpeedMps:Number((state.verticalSpeed||0).toFixed(1)),
  headingRadians:state.heading,pitchRadians:state.pitch,rollRadians:state.roll,
  distanceMeters:Math.round(state.distance),airborne:Boolean(state.airborne),afloat:Boolean(state.afloat),flightMode:state.flightMode||null,transition:Number((state.transition||0).toFixed(2)),
  simplifiedGameplayPhysics:true,rapierCollisionIntegrated:false,fullAerodynamicsVerified:false,fullBuoyancyVerified:false
 }
}

export {PROFILES,createMultiMediumVehicleState,stepMultiMediumVehicle,safeMultiMediumTelemetry}
