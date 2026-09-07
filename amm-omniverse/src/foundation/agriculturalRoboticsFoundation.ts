export type FarmRobotKind='SCOUT_ROVER'|'CROP_MONITOR'|'MECHANICAL_WEEDER'|'HARVEST_ASSIST'|'FIELD_TRANSPORT'|'IRRIGATION_INSPECTOR'
export type FarmRobotMode='SIMULATION'|'SUPERVISED'|'AUTONOMOUS_TEST'|'AUTONOMOUS_FIELD'
export type FarmRobotMissionTask='SCOUT'|'CROP_SCAN'|'MECHANICAL_WEED'|'HARVEST_ASSIST'|'TRANSPORT'|'IRRIGATION_INSPECT'
export type FarmRobotBlockReason='ESTOP_NOT_CLEAR'|'HEARTBEAT_STALE'|'OUTSIDE_OPERATING_ZONE'|'OBSTACLE_SYSTEM_UNHEALTHY'|'LOCALIZATION_LOW_CONFIDENCE'|'HUMAN_TOO_CLOSE'|'MANUAL_TAKEOVER_UNAVAILABLE'|'SPEED_LIMIT_EXCEEDED'|'MISSION_NOT_APPROVED'|'SAFETY_VALIDATION_REQUIRED'

export interface FarmRobotMission {
  missionId:string
  robotId:string
  robotKind:FarmRobotKind
  mode:FarmRobotMode
  task:FarmRobotMissionTask
  approvedZoneIds:string[]
  maxSpeedMps:number
  humanApprovalRequired:true
  approvedBy?:string
  validationEvidenceId?:string
}

export interface FarmRobotTelemetry {
  capturedAt:string
  estopClear:boolean
  heartbeatOk:boolean
  currentZoneId?:string
  obstacleProtectionHealthy:boolean
  localizationConfidence:number
  nearestHumanDistanceM?:number
  manualTakeoverAvailable:boolean
  speedMps:number
  batteryPercent?:number
}

export interface FarmRobotReadiness {
  ready:boolean
  reasons:FarmRobotBlockReason[]
  operatingEnvelope:{maxPrototypeSpeedMps:number;minimumHumanSeparationM:number;telemetryMaxAgeMs:number}
}

export const FARM_ROBOTICS_ARCHITECTURE={
  standardsAlignment:['ISO 18497-1 machine design principles','ISO 18497-2 obstacle protection','ISO 18497-3 autonomous operating zones','ISO 18497-4 verification and validation'],
  navigationAdapters:['ROS 2/Nav2 adapter candidate','GNSS/RTK adapter','UWB/field beacon adapter','camera/depth/SLAM adapter'],
  perceptionAdapters:['stereo/depth camera','lidar candidate','ultrasonic proximity','Farmer Motion Tracker worker-presence feed'],
  appSurfaces:['farmer mission planner','robot fleet status','field map/Twin Earth','maintenance dashboard','task replay','manual takeover alert'],
  allowedRobotWork:['crop scouting','crop imaging','mechanical weeding','harvest assistance','field transport','irrigation inspection'],
  aiBoundary:'AI may recommend routes, tasks, maintenance and anomaly review; actuation requires the robot safety controller and mission gates.',
  safetyBoundary:'No weapon functions, no covert worker tracking, and no bypass of E-stop, obstacle protection, geofence, manual takeover or verification gates.',
} as const

const TELEMETRY_MAX_AGE_MS=1500
const PROTOTYPE_MAX_SPEED_MPS=1.5
const MINIMUM_HUMAN_SEPARATION_M=6
const MIN_LOCALIZATION_CONFIDENCE=0.8

export function evaluateFarmRobotReadiness(mission:FarmRobotMission,telemetry:FarmRobotTelemetry,nowMs=Date.now()):FarmRobotReadiness{
  const reasons:FarmRobotBlockReason[]=[]
  const capturedAtMs=Date.parse(telemetry.capturedAt)
  if(!telemetry.estopClear)reasons.push('ESTOP_NOT_CLEAR')
  if(!telemetry.heartbeatOk||!Number.isFinite(capturedAtMs)||nowMs-capturedAtMs>TELEMETRY_MAX_AGE_MS||nowMs-capturedAtMs<0)reasons.push('HEARTBEAT_STALE')
  if(!telemetry.currentZoneId||!mission.approvedZoneIds.includes(telemetry.currentZoneId))reasons.push('OUTSIDE_OPERATING_ZONE')
  if(!telemetry.obstacleProtectionHealthy)reasons.push('OBSTACLE_SYSTEM_UNHEALTHY')
  if(!Number.isFinite(telemetry.localizationConfidence)||telemetry.localizationConfidence<MIN_LOCALIZATION_CONFIDENCE)reasons.push('LOCALIZATION_LOW_CONFIDENCE')
  if(telemetry.nearestHumanDistanceM!==undefined&&telemetry.nearestHumanDistanceM<MINIMUM_HUMAN_SEPARATION_M)reasons.push('HUMAN_TOO_CLOSE')
  if(!telemetry.manualTakeoverAvailable)reasons.push('MANUAL_TAKEOVER_UNAVAILABLE')
  const effectiveSpeedLimit=Math.min(PROTOTYPE_MAX_SPEED_MPS,mission.maxSpeedMps)
  if(!Number.isFinite(telemetry.speedMps)||telemetry.speedMps<0||telemetry.speedMps>effectiveSpeedLimit)reasons.push('SPEED_LIMIT_EXCEEDED')
  if(mission.humanApprovalRequired!==true||!mission.approvedBy?.trim())reasons.push('MISSION_NOT_APPROVED')
  if((mission.mode==='AUTONOMOUS_TEST'||mission.mode==='AUTONOMOUS_FIELD')&&!mission.validationEvidenceId?.trim())reasons.push('SAFETY_VALIDATION_REQUIRED')
  return{ready:reasons.length===0,reasons,operatingEnvelope:{maxPrototypeSpeedMps:PROTOTYPE_MAX_SPEED_MPS,minimumHumanSeparationM:MINIMUM_HUMAN_SEPARATION_M,telemetryMaxAgeMs:TELEMETRY_MAX_AGE_MS}}
}

export function buildFarmRobotDispatchRequest(mission:FarmRobotMission,telemetry:FarmRobotTelemetry,nowMs=Date.now()){
  const readiness=evaluateFarmRobotReadiness(mission,telemetry,nowMs)
  return readiness.ready
    ?{dispatchAllowed:true as const,missionId:mission.missionId,robotId:mission.robotId,task:mission.task,mode:mission.mode,safetyControllerRequired:true,humanOverrideRequired:true,readiness}
    :{dispatchAllowed:false as const,missionId:mission.missionId,robotId:mission.robotId,reasons:readiness.reasons,readiness}
}

export function mayAIBypassFarmRobotSafetyController(){return false as const}
export function mayFarmRobotOperateOutsideApprovedZone(){return false as const}
export function mayFarmRobotDisableEmergencyStop(){return false as const}
