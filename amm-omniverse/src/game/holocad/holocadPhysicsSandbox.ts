/**
 * HoloCAD Physics & Engineering Sandbox
 *
 * Classical textbook approximations for education and game prototyping only.
 * NO calibrated control output, flight qualification, medical advice, aerospace
 * navigation, robotics motor commands, or structural/safety certification.
 * All units are SI unless explicitly labelled.
 */
import type {HoloCADSubject} from './livingSystemsPresets'

export const STANDARD_GRAVITY=9.80665
export const EARTH_GRAVITATIONAL_PARAMETER=3.986004418e14 // m^3/s^2
export const EARTH_REFERENCE_RADIUS=6_371_000 // m, rounded global mean radius

export type HoloCADPhysicsExperiment='joint-torque'|'static-balance'|'circular-orbit'|'energy-budget'

function finiteRange(name:string,value:number,min:number,max:number){
 if(!Number.isFinite(value)||value<min||value>max)throw Error(name+'_out_of_range')
 return value
}

export function simulateHoloCADJointTorque(input:{
 loadMassKg:number
 leverArmMeters:number
 jointAngleDegrees:number
 angularSpeedDegreesPerSecond:number
}){
 const mass=finiteRange('load_mass_kg',input.loadMassKg,0,200)
 const arm=finiteRange('lever_arm_m',input.leverArmMeters,0,5)
 const angle=finiteRange('joint_angle_deg',input.jointAngleDegrees,-180,180)
 const speed=finiteRange('angular_speed_deg_per_s',input.angularSpeedDegreesPerSecond,0,360)
 const armAngleRad=angle*Math.PI/180
 const torqueNm=mass*STANDARD_GRAVITY*arm*Math.abs(Math.sin(armAngleRad))
 const angularSpeedRadPerSecond=speed*Math.PI/180
 const idealMechanicalPowerWatts=torqueNm*angularSpeedRadPerSecond
 return{
  model:'static-gravity-lever-only' as const,
  torqueNm:Number(torqueNm.toFixed(5)),
  angularSpeedRadPerSecond:Number(angularSpeedRadPerSecond.toFixed(6)),
  idealMechanicalPowerWatts:Number(idealMechanicalPowerWatts.toFixed(5)),
  validForRealMotorSelection:false as const,
  note:'Static gravitational lever approximation. It ignores inertia, acceleration, joints, friction, gear ratios, motor losses and safety factors.'
 }
}

export function simulateHoloCADStaticBalance(input:{
 chassisMassKg:number
 payloadMassKg:number
 payloadOffsetMeters:number
 centerOfMassHeightMeters:number
 supportHalfWidthMeters:number
 leanDegrees:number
}){
 const chassisMass=finiteRange('chassis_mass_kg',input.chassisMassKg,1,2000)
 const payloadMass=finiteRange('payload_mass_kg',input.payloadMassKg,0,1000)
 const offset=finiteRange('payload_offset_m',input.payloadOffsetMeters,-2,2)
 const height=finiteRange('center_of_mass_height_m',input.centerOfMassHeightMeters,.1,3)
 const halfWidth=finiteRange('support_half_width_m',input.supportHalfWidthMeters,.05,3)
 const lean=finiteRange('lean_deg',input.leanDegrees,-40,40)
 const centerOfMassOffset=payloadMass*offset/(chassisMass+payloadMass)
 const projectedCenterMeters=centerOfMassOffset+height*Math.tan(lean*Math.PI/180)
 const signedMarginMeters=halfWidth-Math.abs(projectedCenterMeters)
 return{
  model:'static-one-dimensional-support-polygon' as const,
  centerOfMassOffsetMeters:Number(centerOfMassOffset.toFixed(6)),
  projectedCenterMeters:Number(projectedCenterMeters.toFixed(6)),
  signedMarginMeters:Number(signedMarginMeters.toFixed(6)),
  projectionWithinSupport:signedMarginMeters>=-1e-9,
  verifiedRealWorldStability:false as const,
  note:'One-axis static support-footprint approximation. It is not gait, terrain, dynamic motion, wind or real rollover analysis.'
 }
}

export function simulateHoloCADCircularOrbit(input:{altitudeKm:number}){
 const altitude=finiteRange('altitude_km',input.altitudeKm,100,3000)
 const radius=EARTH_REFERENCE_RADIUS+altitude*1000
 const speed=Math.sqrt(EARTH_GRAVITATIONAL_PARAMETER/radius)
 const periodSeconds=2*Math.PI*Math.sqrt(radius**3/EARTH_GRAVITATIONAL_PARAMETER)
 return{
  model:'two-body-earth-circular-orbit' as const,
  altitudeKm:altitude,
  radiusKm:Number((radius/1000).toFixed(3)),
  circularSpeedKmPerSecond:Number((speed/1000).toFixed(6)),
  orbitalPeriodMinutes:Number((periodSeconds/60).toFixed(4)),
  operationalNavigation:false as const,
  note:'Ideal two-body circular orbit about spherical Earth. Neglects drag, J2, propulsion, thermal effects and all trajectory constraints.'
 }
}

export function simulateHoloCADEnergyBudget(input:{
 batteryWattHours:number
 steadyLoadWatts:number
 solarInputWatts:number
 conversionEfficiency:number
}){
 const battery=finiteRange('battery_wh',input.batteryWattHours,1,100000)
 const load=finiteRange('load_w',input.steadyLoadWatts,1,100000)
 const solar=finiteRange('solar_w',input.solarInputWatts,0,100000)
 const efficiency=finiteRange('conversion_efficiency',input.conversionEfficiency,0,1)
 const usableSolarW=solar*efficiency
 const netDrawW=load-usableSolarW
 const runtime=netDrawW>0?battery/netDrawW:null
 return{
  model:'constant-load-ideal-energy-budget' as const,
  usableSolarWatts:Number(usableSolarW.toFixed(4)),
  netBatteryDrawWatts:Number(Math.max(0,netDrawW).toFixed(4)),
  idealRuntimeHours:runtime===null?null:Number(runtime.toFixed(4)),
  solarMeetsSteadyLoad:netDrawW<=0,
  perpetualEnergyClaim:false as const,
  note:'Steady-state classroom budget only; assumes chosen solar input and ideal battery availability. No night, weather, degradation, charge limits or energy creation.'
 }
}

export function suggestedHoloCADPhysicsExperiment(subject:HoloCADSubject):HoloCADPhysicsExperiment{
 if(['robotic-arm','humanoid-robot','exoskeleton'].includes(subject))return 'joint-torque'
 if(['spacecraft','satellite'].includes(subject))return 'circular-orbit'
 if(['building','aircraft','drone'].includes(subject))return 'energy-budget'
 return 'static-balance'
}

export const HOLOCAD_PHYSICS_LESSONS:ReadonlyArray<{
 id:HoloCADPhysicsExperiment
 label:string
 description:string
}>= [
 {id:'joint-torque',label:'ROBOT JOINT • TORQUE',description:'Understand ideal static torque from a mass at a lever angle.'},
 {id:'static-balance',label:'BODY / VEHICLE • BALANCE',description:'Calculate a one-dimensional center-of-mass support margin.'},
 {id:'circular-orbit',label:'SPACECRAFT • CIRCULAR ORBIT',description:'Study ideal circular orbit speed and period around Earth.'},
 {id:'energy-budget',label:'SATELLITE / ROBOT • ENERGY',description:'Estimate an ideal steady energy budget without assuming limitless power.'}
]
