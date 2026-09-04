import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const sourcePath=path.join(process.cwd(),'src/foundation/farmerMotionTrackerFoundation.ts')
if(!fs.existsSync(sourcePath))throw new Error('Farmer Motion Tracker foundation is missing')
const source=fs.readFileSync(sourcePath,'utf8')

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
  "mayControlMachinery:false",
  'autonomous-machine-control-prohibited',
  'mayFarmerMotionTrackerControlMachinery(){return false as const}',
  'This is not a medical diagnosis.',
]){
  if(!source.includes(token))throw new Error(`Farmer Motion Tracker contract missing: ${token}`)
}

if(!source.includes("session.consent.trustedContactAlerts===true&&alert.severity==='URGENT'"))throw new Error('Trusted-contact alert gate must require explicit consent and urgent severity')
if(!source.includes("sample.source==='CAMERA_POSE'&&!session.consent.cameraPoseAllowed"))throw new Error('Camera-pose ingestion must remain separately consent-gated')
if(!source.includes("sample.position&&!session.consent.locationSharing"))throw new Error('Location ingestion must remain separately consent-gated')

console.log('Farmer Motion Tracker foundation contract: PASS')
