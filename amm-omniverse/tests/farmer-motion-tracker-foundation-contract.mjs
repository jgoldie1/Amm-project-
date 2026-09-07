import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const sourcePath=path.join(process.cwd(),'src/foundation/farmerMotionTrackerFoundation.ts')
const fusionPath=path.join(process.cwd(),'src/foundation/farmerMotionFusionFoundation.ts')
for(const file of [sourcePath,fusionPath])if(!fs.existsSync(file))throw new Error(`Farmer Motion Tracker foundation is missing: ${file}`)
const source=fs.readFileSync(sourcePath,'utf8')
const fusion=fs.readFileSync(fusionPath,'utf8')

for(const token of[
  'FARMER_MOTION_TRACKER_CAPABILITIES',
  "'PHONE_IMU'",
  "'WEARABLE_IMU'",
  "'CAMERA_POSE'",
  "'GNSS'",
  "'UWB'",
  "'BLE_EQUIPMENT_BEACON'",
  'consentGranted',
  'locationSharing',
  'cameraPoseAllowed',
  'rawSensorUpload',
  'MAX_SAMPLE_AGE_MS',
  'SUDDEN_MOTION_ACCELERATION_MPS2',
  'EQUIPMENT_CAUTION_DISTANCE_M',
  'mayControlMachinery:false',
  'autonomous-machine-control-prohibited',
  'mayFarmerMotionTrackerControlMachinery(){return false as const}',
  'This is not a medical diagnosis.',
]){
  if(!source.includes(token))throw new Error(`Farmer Motion Tracker contract missing: ${token}`)
}

if(!source.includes("session.consent.trustedContactAlerts===true&&alert.severity==='URGENT'"))throw new Error('Trusted-contact alert gate must require explicit consent and urgent severity')
if(!source.includes("sample.source==='CAMERA_POSE'&&!session.consent.cameraPoseAllowed"))throw new Error('Camera-pose ingestion must remain separately consent-gated')
if(!source.includes("sample.position&&!session.consent.locationSharing"))throw new Error('Location ingestion must remain separately consent-gated')

for(const token of[
  'fuseFarmerMotionSamples',
  'validateFarmerMotionSample',
  'MAX_FUSION_SAMPLE_AGE_MS',
  'SOURCE_WEIGHT',
  "'XR_EXT_hand_tracking'",
  "'XR_ANDROID_body_tracking'",
  "'XR_ANDROID_depth_texture'",
  'MediaPipe Pose Landmarker adapter',
  "'covert worker surveillance'",
  "'disciplinary scoring from motion alone'",
  'rawCameraUploadDefault:false',
  "machineAuthority:'NONE'",
  'mayControlMachinery:false',
  'mayFarmerMotionFusionControlMachinery(){return false as const}',
]){
  if(!fusion.includes(token))throw new Error(`Farmer Motion Fusion contract missing: ${token}`)
}

if(!fusion.includes("estimate.quality!=='UNRELIABLE'"))throw new Error('Farmer Motion live awareness must reject unreliable fusion estimates')

console.log('Farmer Motion Tracker foundation contract: PASS')
