import {credentialForVehicleClass,STREETVERSE_SPECIAL_VEHICLE_ASSIGNMENTS,STREETVERSE_VEHICLE_ACCESS_POLICY} from '../data/StreetVerseVehicleAccessProgression'

export type MobilityProfile={
  level:number
  completedMissions:string[]
  activeRoles:string[]
  credentials:string[]
  developerTestMode?:boolean
}

export type VehicleAccessDecision={
  allowed:boolean
  reason:string
  credentialId:string|null
  missingMissions:string[]
  levelRequired:number
  roleRequired:boolean
}

export function canUseStreetVerseVehicle(vehicleClass:string,profile:MobilityProfile):VehicleAccessDecision{
  if(profile.developerTestMode&&STREETVERSE_VEHICLE_ACCESS_POLICY.developerFounderTestAccessIsNonProductionOnly){
    return{allowed:true,reason:'NON_PRODUCTION_TEST_ACCESS',credentialId:'developer-test',missingMissions:[],levelRequired:0,roleRequired:false}
  }
  const credential=credentialForVehicleClass(vehicleClass)
  if(!credential){
    return{allowed:false,reason:'VEHICLE_CLASS_NOT_REGISTERED',credentialId:null,missingMissions:[],levelRequired:0,roleRequired:false}
  }
  const missing=credential.requiredMissions.filter(id=>!profile.completedMissions.includes(id)&&!profile.credentials.includes(id))
  const levelOk=profile.level>=credential.unlockLevel
  const specialAssignment=(STREETVERSE_SPECIAL_VEHICLE_ASSIGNMENTS as Record<string,{allowedRoles:readonly string[];credential:string}>)[vehicleClass]
  const roleRequired=credential.tier==='emergency-role'||Boolean(specialAssignment)
  const emergencyRoleOk=credential.tier!=='emergency-role'||profile.activeRoles.some(role=>['police','sheriff','ems','fire','rescue','security-training'].includes(role))
  const specialRoleOk=!specialAssignment||profile.activeRoles.some(role=>specialAssignment.allowedRoles.includes(role))
  const roleOk=emergencyRoleOk&&specialRoleOk
  const credentialOk=profile.credentials.includes(credential.id)||missing.length===0

  if(!levelOk)return{allowed:false,reason:'LEVEL_REQUIRED',credentialId:credential.id,missingMissions:missing,levelRequired:credential.unlockLevel,roleRequired}
  if(!roleOk)return{allowed:false,reason:'ACTIVE_ROLE_REQUIRED',credentialId:credential.id,missingMissions:missing,levelRequired:credential.unlockLevel,roleRequired}
  if(!credentialOk)return{allowed:false,reason:'CERTIFICATION_MISSIONS_REQUIRED',credentialId:credential.id,missingMissions:missing,levelRequired:credential.unlockLevel,roleRequired}
  return{allowed:true,reason:'ACCESS_GRANTED',credentialId:credential.id,missingMissions:[],levelRequired:credential.unlockLevel,roleRequired}
}

export function passengerAccess(){
  return{allowed:true,reason:'PASSENGER_ACCESS',controlAuthority:false}
}

export const STREETVERSE_AIR_CORRIDOR_POLICY={
  helicopters:{spawn:['heliport','hospital-roof','news-pad','business-pad'],streetLanding:false},
  fixedWing:{spawn:['airport','airfield'],streetLanding:false},
  futureAir:{spawn:['future-air-port','approved-rooftop-pad'],streetLanding:false,rareTraffic:true},
  ordinaryPlayersMayRideAsPassenger:true,
  controlRequiresCertification:true,
  simulatedGameRulesNotRealAviationAuthorization:true,
} as const