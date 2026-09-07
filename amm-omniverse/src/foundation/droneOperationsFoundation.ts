export type DroneMissionType='FARM_SCOUT'|'CROP_IMAGING'|'DELIVERY_LAST_MILE'|'WAREHOUSE_YARD_SCAN'|'MINING_SURVEY'|'INFRASTRUCTURE_INSPECTION'|'CREATOR_CAMERA'|'AG_INPUT_APPLICATION'
export type DroneOperationMode='SIMULATION'|'VLOS_SUPERVISED'|'PROVIDER_MANAGED'|'BVLOS_APPROVED'
export type DroneReadinessBlockReason='HUMAN_APPROVAL_MISSING'|'TELEMETRY_STALE'|'REGISTRATION_EVIDENCE_MISSING'|'REMOTE_ID_NOT_READY'|'PILOT_CREDENTIAL_MISSING'|'AIRSPACE_APPROVAL_MISSING'|'OPERATION_APPROVAL_MISSING'|'BVLOS_APPROVAL_MISSING'|'VISUAL_OBSERVER_MISSING'|'GEOFENCE_VIOLATION'|'NAVIGATION_UNHEALTHY'|'OBSTACLE_AVOIDANCE_UNHEALTHY'|'RETURN_TO_HOME_UNAVAILABLE'|'WEATHER_OUT_OF_ENVELOPE'|'PAYLOAD_NOT_SECURE'|'AG_APPLICATION_AUTHORITY_MISSING'|'FLIGHT_CONTROLLER_UNAVAILABLE'

export interface DroneMission{
  missionId:string
  droneId:string
  missionType:DroneMissionType
  mode:DroneOperationMode
  approvedZoneIds:string[]
  humanApproved:boolean
  approvedBy?:string
  requiresRegistration:boolean
  requiresRemoteId:boolean
  requiresPilotCredential:boolean
  requiresAirspaceApproval:boolean
  requiresOperationApproval:boolean
  requiresVisualObserver:boolean
  registrationEvidenceId?:string
  pilotCredentialEvidenceId?:string
  airspaceApprovalEvidenceId?:string
  operationApprovalEvidenceId?:string
  bvlosApprovalEvidenceId?:string
  agriculturalApplicationAuthorityEvidenceId?:string
  payloadEvidenceId?:string
}

export interface DroneTelemetry{
  capturedAt:string
  currentZoneId?:string
  flightControllerConnected:boolean
  remoteIdBroadcasting:boolean
  navigationHealthy:boolean
  obstacleAvoidanceHealthy:boolean
  returnToHomeReady:boolean
  weatherWithinApprovedEnvelope:boolean
  payloadSecure:boolean
  visualObserverConfirmed:boolean
  batteryPercent?:number
  linkQuality?:number
  position?:{lat:number;lon:number;altitudeM:number;accuracyM:number}
}

export interface DroneMissionReadiness{
  ready:boolean
  reasons:DroneReadinessBlockReason[]
  dispatchAuthority:'SIMULATION_ONLY'|'APPROVED_FLIGHT_CONTROLLER_OR_PROVIDER'
}

export const TRYAMM_DRONE_SYSTEM={
  brandName:'TRYAMM Holo Drone & Air Operations',
  appSurfaces:['drone command center','Twin Earth air mission map','farm scan planner','warehouse/yard scan','delivery mission view','mining survey view','creator aerial camera','inspection workflow','maintenance and battery dashboard','mission replay','proof-of-delivery evidence','EPIC drone training pathway'],
  missionTypes:['farm scouting','crop imaging','last-mile delivery','warehouse/yard scanning','mining survey','infrastructure inspection','creator camera','regulated agricultural input application'],
  candidateAdapters:['MAVLink/PX4 adapter','ArduPilot adapter','MAVSDK adapter','ROS 2 bridge','Remote ID receiver/provider adapter','UTM/airspace provider adapter'],
  dataConnections:['Farmer Motion Tracker','farm robotics','warehouse digital twin','Golden Order logistics','global supply chain control tower','MapLibre/Twin Earth','EPIC Training & Certification Hub','creator streaming/replay'],
  regulatoryBoundary:'Use current FAA/other-jurisdiction operating authority as evidence. Part 107-style operations, Remote ID, airspace approvals, BVLOS permissions, package delivery and agricultural dispensing are never inferred from app state.',
  aiBoundary:'AI may plan routes, inspect imagery, classify crops, flag maintenance, draft missions and analyze delivery/survey data; it may not self-authorize a real flight or bypass aviation, payload, geofence, Remote ID, pilot, airspace or safety-controller requirements.',
  safetyBoundary:'No weaponization, no covert surveillance, no autonomous targeting, and no browser/client bypass of an approved flight controller or provider safety system.',
} as const

const TELEMETRY_MAX_AGE_MS=2_000

export function evaluateDroneMissionReadiness(mission:DroneMission,telemetry:DroneTelemetry,nowMs=Date.now()):DroneMissionReadiness{
  if(mission.mode==='SIMULATION')return{ready:true,reasons:[],dispatchAuthority:'SIMULATION_ONLY'}

  const reasons:DroneReadinessBlockReason[]=[]
  const capturedAtMs=Date.parse(telemetry.capturedAt)
  if(!mission.humanApproved||!mission.approvedBy?.trim())reasons.push('HUMAN_APPROVAL_MISSING')
  if(!Number.isFinite(capturedAtMs)||nowMs-capturedAtMs<0||nowMs-capturedAtMs>TELEMETRY_MAX_AGE_MS)reasons.push('TELEMETRY_STALE')
  if(!telemetry.flightControllerConnected)reasons.push('FLIGHT_CONTROLLER_UNAVAILABLE')
  if(!telemetry.currentZoneId||!mission.approvedZoneIds.includes(telemetry.currentZoneId))reasons.push('GEOFENCE_VIOLATION')
  if(!telemetry.navigationHealthy)reasons.push('NAVIGATION_UNHEALTHY')
  if(!telemetry.obstacleAvoidanceHealthy)reasons.push('OBSTACLE_AVOIDANCE_UNHEALTHY')
  if(!telemetry.returnToHomeReady)reasons.push('RETURN_TO_HOME_UNAVAILABLE')
  if(!telemetry.weatherWithinApprovedEnvelope)reasons.push('WEATHER_OUT_OF_ENVELOPE')
  if(!telemetry.payloadSecure)reasons.push('PAYLOAD_NOT_SECURE')
  if(mission.requiresRegistration&&!mission.registrationEvidenceId?.trim())reasons.push('REGISTRATION_EVIDENCE_MISSING')
  if(mission.requiresRemoteId&&!telemetry.remoteIdBroadcasting)reasons.push('REMOTE_ID_NOT_READY')
  if(mission.requiresPilotCredential&&!mission.pilotCredentialEvidenceId?.trim())reasons.push('PILOT_CREDENTIAL_MISSING')
  if(mission.requiresAirspaceApproval&&!mission.airspaceApprovalEvidenceId?.trim())reasons.push('AIRSPACE_APPROVAL_MISSING')
  if(mission.requiresOperationApproval&&!mission.operationApprovalEvidenceId?.trim())reasons.push('OPERATION_APPROVAL_MISSING')
  if(mission.requiresVisualObserver&&!telemetry.visualObserverConfirmed)reasons.push('VISUAL_OBSERVER_MISSING')
  if(mission.mode==='BVLOS_APPROVED'&&!mission.bvlosApprovalEvidenceId?.trim())reasons.push('BVLOS_APPROVAL_MISSING')
  if(mission.missionType==='AG_INPUT_APPLICATION'&&!mission.agriculturalApplicationAuthorityEvidenceId?.trim())reasons.push('AG_APPLICATION_AUTHORITY_MISSING')

  return{ready:reasons.length===0,reasons,dispatchAuthority:'APPROVED_FLIGHT_CONTROLLER_OR_PROVIDER'}
}

export function buildDroneDispatchRequest(mission:DroneMission,telemetry:DroneTelemetry,nowMs=Date.now()){
  const readiness=evaluateDroneMissionReadiness(mission,telemetry,nowMs)
  if(!readiness.ready)return{dispatchAllowed:false as const,missionId:mission.missionId,droneId:mission.droneId,reasons:readiness.reasons,readiness}
  if(mission.mode==='SIMULATION')return{dispatchAllowed:true as const,simulation:true as const,missionId:mission.missionId,droneId:mission.droneId,missionType:mission.missionType,readiness}
  return{dispatchAllowed:true as const,simulation:false as const,providerOrFlightControllerActionRequired:true as const,directBrowserMotorControl:false as const,missionId:mission.missionId,droneId:mission.droneId,missionType:mission.missionType,mode:mission.mode,readiness}
}

export function mayDroneAIBypassFlightSafetyController(){return false as const}
export function mayDroneAIWeaponizeMission(){return false as const}
export function mayDroneAIInventBVLOSApproval(){return false as const}
export function mayDroneBrowserDirectlyControlMotors(){return false as const}
