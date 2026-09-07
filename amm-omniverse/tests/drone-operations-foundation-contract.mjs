import fs from 'node:fs'
import path from 'node:path'

const sourcePath=path.join(process.cwd(),'src/foundation/droneOperationsFoundation.ts')
if(!fs.existsSync(sourcePath))throw new Error('Drone operations foundation is missing')
const source=fs.readFileSync(sourcePath,'utf8')

for(const token of[
  'TRYAMM Holo Drone & Air Operations',
  "'FARM_SCOUT'",
  "'CROP_IMAGING'",
  "'DELIVERY_LAST_MILE'",
  "'WAREHOUSE_YARD_SCAN'",
  "'MINING_SURVEY'",
  "'INFRASTRUCTURE_INSPECTION'",
  "'CREATOR_CAMERA'",
  "'AG_INPUT_APPLICATION'",
  "'SIMULATION'",
  "'VLOS_SUPERVISED'",
  "'PROVIDER_MANAGED'",
  "'BVLOS_APPROVED'",
  'Remote ID receiver/provider adapter',
  'UTM/airspace provider adapter',
  'Farmer Motion Tracker',
  'Golden Order logistics',
  'EPIC Training & Certification Hub',
  'evaluateDroneMissionReadiness',
  'buildDroneDispatchRequest',
  'providerOrFlightControllerActionRequired:true',
  'directBrowserMotorControl:false',
  'mayDroneAIBypassFlightSafetyController(){return false as const}',
  'mayDroneAIWeaponizeMission(){return false as const}',
  'mayDroneAIInventBVLOSApproval(){return false as const}',
  'mayDroneBrowserDirectlyControlMotors(){return false as const}',
]){
  if(!source.includes(token))throw new Error(`Drone operations contract missing: ${token}`)
}

for(const gate of[
  'HUMAN_APPROVAL_MISSING',
  'TELEMETRY_STALE',
  'REGISTRATION_EVIDENCE_MISSING',
  'REMOTE_ID_NOT_READY',
  'PILOT_CREDENTIAL_MISSING',
  'AIRSPACE_APPROVAL_MISSING',
  'OPERATION_APPROVAL_MISSING',
  'BVLOS_APPROVAL_MISSING',
  'VISUAL_OBSERVER_MISSING',
  'GEOFENCE_VIOLATION',
  'NAVIGATION_UNHEALTHY',
  'OBSTACLE_AVOIDANCE_UNHEALTHY',
  'RETURN_TO_HOME_UNAVAILABLE',
  'WEATHER_OUT_OF_ENVELOPE',
  'PAYLOAD_NOT_SECURE',
  'AG_APPLICATION_AUTHORITY_MISSING',
  'FLIGHT_CONTROLLER_UNAVAILABLE',
]){
  if(!source.includes(gate))throw new Error(`Drone readiness gate missing: ${gate}`)
}

if(!source.includes("mission.mode==='BVLOS_APPROVED'&&!mission.bvlosApprovalEvidenceId?.trim()"))throw new Error('BVLOS missions must remain evidence-gated')
if(!source.includes("mission.missionType==='AG_INPUT_APPLICATION'&&!mission.agriculturalApplicationAuthorityEvidenceId?.trim()"))throw new Error('Agricultural input application must remain authority-gated')
if(!source.includes("mission.requiresRemoteId&&!telemetry.remoteIdBroadcasting"))throw new Error('Remote ID readiness must remain enforced when required')

console.log('Drone operations foundation contract: PASS')
