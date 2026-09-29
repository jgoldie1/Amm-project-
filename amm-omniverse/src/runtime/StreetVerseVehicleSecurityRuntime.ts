export type StreetVerseVehicleAccessSource='owner'|'founder-gift'|'active-rental'|'business-fleet'|'role-fleet'|'none'

export type StreetVerseVehicleSecurityState={
  vehicleId:string
  locked:boolean
  immobilized:boolean
  unauthorizedAttempts:number
  lastUnauthorizedAt:number|null
  recoveryRequested:boolean
}

export const STREETVERSE_VEHICLE_SECURITY_POLICY={
  product:'StreetVerse Vehicle Shield',
  digitalGameOnly:true,
  realVehicleRemoteImmobilization:false,
  ownerOrActiveRentalRequiredForControl:true,
  unauthorizedAttemptThreshold:3,
  ownerAlertOnUnauthorizedAttempt:true,
  autoRecoveryCaseAfterThreshold:true,
  gameBeaconAfterTheft:true,
  antiTheftLockoutSeconds:30,
  noPhysicalConfrontationRequired:true,
} as const

export function defaultVehicleSecurityState(vehicleId:string):StreetVerseVehicleSecurityState{
  return{vehicleId,locked:true,immobilized:false,unauthorizedAttempts:0,lastUnauthorizedAt:null,recoveryRequested:false}
}

export function canControlDigitalVehicle(source:StreetVerseVehicleAccessSource){
  return source!=='none'
}

export function recordUnauthorizedVehicleAttempt(state:StreetVerseVehicleSecurityState,now=Date.now()){
  const attempts=state.unauthorizedAttempts+1
  const threshold=STREETVERSE_VEHICLE_SECURITY_POLICY.unauthorizedAttemptThreshold
  return{
    ...state,
    locked:true,
    immobilized:attempts>=threshold,
    unauthorizedAttempts:attempts,
    lastUnauthorizedAt:now,
    recoveryRequested:attempts>=threshold,
  }
}

export function unlockAuthorizedVehicle(state:StreetVerseVehicleSecurityState,source:StreetVerseVehicleAccessSource){
  if(!canControlDigitalVehicle(source))return state
  return{...state,locked:false,immobilized:false,unauthorizedAttempts:0,lastUnauthorizedAt:null}
}

export function vehicleSecurityEvent(state:StreetVerseVehicleSecurityState){
  return{
    vehicleId:state.vehicleId,
    locked:state.locked,
    immobilized:state.immobilized,
    unauthorizedAttempts:state.unauthorizedAttempts,
    recoveryRequested:state.recoveryRequested,
    gameOnly:true,
  }
}