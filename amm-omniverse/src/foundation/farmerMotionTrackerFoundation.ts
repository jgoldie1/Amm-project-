export type FarmerMotionSource='PHONE_IMU'|'WEARABLE_IMU'|'CAMERA_POSE'|'GNSS'|'UWB'|'BLE_EQUIPMENT_BEACON'|'MANUAL'
export type FarmerMotionActivity='UNKNOWN'|'STATIONARY'|'WALKING'|'CROUCHING'|'LIFTING'|'REPETITIVE_TASK'|'RIDING_IN_CAB'
export type FarmerMotionAlertKind='SUDDEN_MOTION_CANDIDATE'|'EQUIPMENT_PROXIMITY'|'FIELD_ZONE_EXIT'|'SENSOR_STALE'|'CALIBRATION_REQUIRED'
export type FarmerMotionSeverity='INFO'|'CAUTION'|'URGENT'

export interface FarmerMotionConsent {
  consentGranted:boolean
  locationSharing:boolean
  cameraPoseAllowed:boolean
  trustedContactAlerts:boolean
  rawSensorUpload:boolean
  retentionHours:number
}

export interface FarmerMotionSession {
  sessionId:string
  workerToken:string
  farmId:string
  startedAt:string
  consent:FarmerMotionConsent
  allowedZoneIds:string[]
  autonomousMachineControl:false
}

export interface FarmerMotionSample {
  sessionId:string
  capturedAt:string
  source:FarmerMotionSource
  activity?:FarmerMotionActivity
  accelerationMps2?:{x:number;y:number;z:number}
  angularVelocityRps?:{x:number;y:number;z:number}
  position?:{lat:number;lon:number;accuracyM:number}
  zoneId?:string
  equipmentDistanceM?:number
  calibrationOk?:boolean
}

export interface FarmerMotionAlert {
  kind:FarmerMotionAlertKind
  severity:FarmerMotionSeverity
  sessionId:string
  capturedAt:string
  reason:string
  requiresHumanConfirmation:boolean
  mayControlMachinery:false
}

export const FARMER_MOTION_TRACKER_CAPABILITIES={
  sensorFusion:['phone IMU','wearable IMU','camera/depth pose adapter','GNSS','UWB','BLE equipment beacons'],
  fieldFeatures:['worker path replay','field-zone awareness','task-motion timeline','equipment proximity awareness','offline buffering','Twin Earth/StreetVerse projection'],
  accessibility:['voice cues','large-button alert acknowledgement','optional haptic cues','low-bandwidth sync'],
  privacy:['explicit session consent','opaque worker token','local-first raw sensor processing','configurable retention','location/camera sharing separately gated'],
  safetyBoundary:'tracking and alerts only; never autonomous steering, throttle, braking, PTO, implement actuation, or machine motion',
} as const

const MAX_RETENTION_HOURS=168
const MAX_SAMPLE_AGE_MS=10_000
const MAX_FUTURE_SKEW_MS=5_000
const SUDDEN_MOTION_ACCELERATION_MPS2=25
const EQUIPMENT_CAUTION_DISTANCE_M=3

const vectorMagnitude=(v:{x:number;y:number;z:number})=>Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)

export function validateFarmerMotionSession(session:FarmerMotionSession){
  const reasons:string[]=[]
  if(!session.sessionId.trim())reasons.push('missing-session-id')
  if(!session.workerToken.trim())reasons.push('missing-worker-token')
  if(!session.farmId.trim())reasons.push('missing-farm-id')
  if(!session.consent.consentGranted)reasons.push('consent-required')
  if(!Number.isFinite(session.consent.retentionHours)||session.consent.retentionHours<0||session.consent.retentionHours>MAX_RETENTION_HOURS)reasons.push('invalid-retention-window')
  if(session.autonomousMachineControl!==false)reasons.push('autonomous-machine-control-prohibited')
  return{allowed:reasons.length===0,reasons}
}

export function validateFarmerMotionSample(session:FarmerMotionSession,sample:FarmerMotionSample,nowMs=Date.now()){
  const reasons:string[]=[]
  if(!validateFarmerMotionSession(session).allowed)reasons.push('invalid-session')
  if(sample.sessionId!==session.sessionId)reasons.push('session-mismatch')
  const capturedAtMs=Date.parse(sample.capturedAt)
  if(!Number.isFinite(capturedAtMs))reasons.push('invalid-capture-time')
  else{
    const ageMs=nowMs-capturedAtMs
    if(ageMs>MAX_SAMPLE_AGE_MS)reasons.push('sensor-sample-stale')
    if(ageMs<-MAX_FUTURE_SKEW_MS)reasons.push('sensor-sample-from-future')
  }
  if(sample.source==='CAMERA_POSE'&&!session.consent.cameraPoseAllowed)reasons.push('camera-pose-not-consented')
  if(sample.position&&!session.consent.locationSharing)reasons.push('location-sharing-not-consented')
  if(sample.equipmentDistanceM!==undefined&&(!Number.isFinite(sample.equipmentDistanceM)||sample.equipmentDistanceM<0))reasons.push('invalid-equipment-distance')
  return{accepted:reasons.length===0,reasons}
}

export function assessFarmerMotionSample(session:FarmerMotionSession,sample:FarmerMotionSample,nowMs=Date.now()):FarmerMotionAlert[]{
  const validation=validateFarmerMotionSample(session,sample,nowMs)
  const alerts:FarmerMotionAlert[]=[]
  const push=(kind:FarmerMotionAlertKind,severity:FarmerMotionSeverity,reason:string,requiresHumanConfirmation=true)=>alerts.push({kind,severity,sessionId:session.sessionId,capturedAt:sample.capturedAt,reason,requiresHumanConfirmation,mayControlMachinery:false})

  if(validation.reasons.includes('sensor-sample-stale'))push('SENSOR_STALE','CAUTION','Motion sample is too old to use for current field awareness.',false)
  if(sample.calibrationOk===false)push('CALIBRATION_REQUIRED','CAUTION','Sensor calibration must be restored before relying on motion estimates.',false)
  if(sample.zoneId&&session.allowedZoneIds.length>0&&!session.allowedZoneIds.includes(sample.zoneId))push('FIELD_ZONE_EXIT','CAUTION','Worker token moved outside the configured field-work zone.')
  if(sample.equipmentDistanceM!==undefined&&sample.equipmentDistanceM<EQUIPMENT_CAUTION_DISTANCE_M)push('EQUIPMENT_PROXIMITY','URGENT','Tracked worker is within the configured caution radius of tagged equipment.')
  if(sample.accelerationMps2&&vectorMagnitude(sample.accelerationMps2)>=SUDDEN_MOTION_ACCELERATION_MPS2)push('SUDDEN_MOTION_CANDIDATE','URGENT','A high-acceleration event was detected; confirm worker status. This is not a medical diagnosis.')

  return alerts
}

export function mayUploadFarmerMotionRawData(session:FarmerMotionSession){
  return validateFarmerMotionSession(session).allowed&&session.consent.rawSensorUpload===true
}

export function mayNotifyTrustedContact(session:FarmerMotionSession,alert:FarmerMotionAlert){
  return validateFarmerMotionSession(session).allowed&&session.consent.trustedContactAlerts===true&&alert.severity==='URGENT'
}

export function mayFarmerMotionTrackerControlMachinery(){return false as const}
