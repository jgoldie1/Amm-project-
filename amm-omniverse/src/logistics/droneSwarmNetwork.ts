export type DroneMissionKind='package-delivery'|'medical-delivery'|'inventory-scan'|'mapping'|'inspection'|'media'|'emergency-support'
export type DroneMissionState='draft'|'eligible'|'provider-review'|'approved'|'assigned'|'airborne'|'delivered'|'returned'|'exception'|'cancelled'
export type DroneUnit={
 id:string;providerId:string;label:string;payloadKg:number;rangeKm:number;batteryPercent:number;
 status:'available'|'assigned'|'charging'|'maintenance'|'grounded';
 providerApproved:boolean;airspaceApproved:boolean;remoteIdReady:boolean
}
export type DroneMission={
 id:string;kind:DroneMissionKind;state:DroneMissionState;pickup:string;dropoff:string;
 packageWeightKg:number;distanceKm:number;weatherSafe:boolean;providerApproved:boolean;airspaceApproved:boolean;
 requiresHumanOversight:boolean;assignedDroneId?:string;proofRequired:boolean
}

export function droneMissionEligibility(mission:DroneMission,drone:DroneUnit){
 const blockers:string[]=[]
 if(!drone.providerApproved||!mission.providerApproved)blockers.push('approved_provider_required')
 if(!drone.airspaceApproved||!mission.airspaceApproved)blockers.push('airspace_approval_required')
 if(!drone.remoteIdReady)blockers.push('remote_id_or_provider_equivalent_required')
 if(!mission.weatherSafe)blockers.push('weather_not_safe')
 if(mission.packageWeightKg>drone.payloadKg)blockers.push('payload_exceeds_drone_limit')
 if(mission.distanceKm>drone.rangeKm)blockers.push('range_exceeded')
 if(drone.status!=='available')blockers.push('drone_not_available')
 return{eligible:blockers.length===0,blockers,externalDispatchRequired:true}
}

export type DroneSwarmPlan={
 id:string;missionIds:string[];droneIds:string[];mode:'coordinated-delivery'|'warehouse-scan'|'mapping'|'inspection'|'emergency-support';
 state:'draft'|'provider-review'|'approved'|'active'|'completed'|'aborted';
 maxSimultaneous:number;humanSupervisorRequired:boolean;providerConfirmed:boolean
}

export function swarmCanLaunch(plan:DroneSwarmPlan){
 const blockers:string[]=[]
 if(!plan.providerConfirmed)blockers.push('provider_confirmation_required')
 if(plan.maxSimultaneous<1)blockers.push('invalid_swarm_size')
 if(!plan.humanSupervisorRequired)blockers.push('human_supervision_required')
 return{eligible:blockers.length===0,blockers,simulationMayProceed:true,realFlightRequiresProvider:true}
}

export const DRONE_SWARM_FLOW=[
 'ORDER / TASK','ELIGIBILITY','PACKAGE / PAYLOAD','WEATHER','AIRSPACE / PROVIDER','DRONE MATCH',
 'SWARM DECONFLICTION','HUMAN SUPERVISOR','EXTERNAL DISPATCH CONFIRMATION','FLIGHT TRACKING',
 'DELIVERY / SCAN / INSPECTION','PROOF','RETURN / CHARGE','MAINTENANCE','PERFORMANCE LEARNING'
] as const