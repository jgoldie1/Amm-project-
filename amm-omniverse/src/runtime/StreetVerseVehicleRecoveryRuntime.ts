export type VehicleRecoveryReason='stolen'|'overdue-rental'|'abandoned'|'fraud-hold'|'owner-recall'
export type VehicleRecoveryState='reported'|'locating'|'located'|'recovery-authorized'|'tow-assigned'|'impounded'|'returned'|'cancelled'

export type VehicleRecoveryCase={
  id:string
  vehicleId:string
  vehicleLabel:string
  ownerUserId:string
  reason:VehicleRecoveryReason
  state:VehicleRecoveryState
  lastKnown:[number,number,number]|null
  recoveryAgentId:string|null
  rewardXP:number
  recoveryCredits:number
  createdAt:number
}

export const VEHICLE_RECOVERY_POLICY={
  product:'StreetVerse Vehicle Recovery / Repo',
  nonviolentOnly:true,
  noVigilantePursuit:true,
  noWeaponRequirement:true,
  ownerOrServerAuthorizationRequired:true,
  identityAndVehicleMatchRequired:true,
  recoveryBeaconIsGameOnly:true,
  remoteImmobilizerGameOnly:true,
  towOrImpoundPreferred:true,
  stolenVehicleCanBeRecovered:true,
  overdueRentalCanBeRecovered:true,
  falseReportsPenalized:true,
} as const

export function createRecoveryCase(input:{vehicleId:string;vehicleLabel:string;ownerUserId:string;reason:VehicleRecoveryReason;lastKnown?:[number,number,number]|null}):VehicleRecoveryCase{
  return{
    id:'recovery-'+input.vehicleId+'-'+Date.now(),
    vehicleId:input.vehicleId,
    vehicleLabel:input.vehicleLabel,
    ownerUserId:input.ownerUserId,
    reason:input.reason,
    state:'reported',
    lastKnown:input.lastKnown??null,
    recoveryAgentId:null,
    rewardXP:input.reason==='stolen'?350:220,
    recoveryCredits:input.reason==='stolen'?650:400,
    createdAt:Date.now(),
  }
}

export function advanceRecoveryCase(item:VehicleRecoveryCase,next:VehicleRecoveryState):VehicleRecoveryCase{
  const allowed:Record<VehicleRecoveryState,VehicleRecoveryState[]>={
    reported:['locating','cancelled'],
    locating:['located','cancelled'],
    located:['recovery-authorized','cancelled'],
    'recovery-authorized':['tow-assigned','impounded','cancelled'],
    'tow-assigned':['impounded','cancelled'],
    impounded:['returned'],
    returned:[],
    cancelled:[],
  }
  if(!allowed[item.state].includes(next))return item
  return{...item,state:next}
}

export function recoveryMissionText(item:VehicleRecoveryCase){
  const copy:Record<VehicleRecoveryState,string>={
    reported:'VEHICLE REPORTED • WAIT FOR LOCATION PING',
    locating:'LOCATE VEHICLE • FOLLOW RECOVERY BEACON',
    located:'VERIFY VEHICLE ID • REQUEST RECOVERY AUTHORIZATION',
    'recovery-authorized':'RECOVERY AUTHORIZED • CALL TOW OR MOVE TO IMPOUND',
    'tow-assigned':'TOW ASSIGNED • ESCORT VEHICLE TO IMPOUND',
    impounded:'VEHICLE SECURED • RETURN TO OWNER/FLEET',
    returned:'RECOVERY COMPLETE',
    cancelled:'RECOVERY CANCELLED',
  }
  return copy[item.state]
}