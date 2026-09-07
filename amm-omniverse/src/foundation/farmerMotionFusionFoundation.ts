import { validateFarmerMotionSample } from './farmerMotionTrackerFoundation'
import type { FarmerMotionActivity, FarmerMotionSample, FarmerMotionSession, FarmerMotionSource } from './farmerMotionTrackerFoundation'

export type FarmerMotionFusionQuality='GOOD'|'DEGRADED'|'UNRELIABLE'

export interface FarmerMotionFusionEstimate{
  sessionId:string
  generatedAt:string
  activity:FarmerMotionActivity
  activityConfidence:number
  quality:FarmerMotionFusionQuality
  acceptedSources:FarmerMotionSource[]
  rejectedSampleCount:number
  position?:{lat:number;lon:number;accuracyM:number}
  equipmentDistanceM?:number
  reasons:string[]
  mayControlMachinery:false
}

export const FARMER_MOTION_ADAPTER_PLAN={
  browser:['MediaPipe Pose Landmarker adapter'],
  xr:['XR_EXT_hand_tracking','XR_ANDROID_body_tracking','XR_ANDROID_depth_texture'],
  field:['GNSS','UWB','BLE equipment beacon'],
  wearable:['phone IMU','wearable IMU'],
  fallback:['manual check-in','offline buffered samples'],
} as const

export const FARMER_MOTION_GOVERNANCE={
  allowedUses:['field safety awareness','worker-requested path replay','task-motion timeline','equipment proximity warnings','accessibility cues','training feedback'],
  prohibitedUses:['autonomous machinery control','medical diagnosis','covert worker surveillance','disciplinary scoring from motion alone'],
  rawCameraUploadDefault:false,
  machineAuthority:'NONE',
} as const

const MAX_FUSION_SAMPLE_AGE_MS=5_000
const SOURCE_WEIGHT:Record<FarmerMotionSource,number>={
  UWB:.95,
  CAMERA_POSE:.9,
  WEARABLE_IMU:.86,
  PHONE_IMU:.78,
  GNSS:.72,
  BLE_EQUIPMENT_BEACON:.68,
  MANUAL:.45,
}

const clamp01=(value:number)=>Math.max(0,Math.min(1,value))

function sampleWeight(sample:FarmerMotionSample,nowMs:number){
  const capturedAtMs=Date.parse(sample.capturedAt)
  if(!Number.isFinite(capturedAtMs))return 0
  const ageMs=nowMs-capturedAtMs
  if(ageMs<0||ageMs>MAX_FUSION_SAMPLE_AGE_MS)return 0
  if(sample.calibrationOk===false)return 0
  const freshness=1-ageMs/MAX_FUSION_SAMPLE_AGE_MS
  const accuracyFactor=sample.position?clamp01(1-(sample.position.accuracyM/100)) : 1
  return SOURCE_WEIGHT[sample.source]*freshness*(.7+.3*accuracyFactor)
}

function chooseActivity(weighted:{sample:FarmerMotionSample;weight:number}[]){
  const scores=new Map<FarmerMotionActivity,number>()
  for(const {sample,weight} of weighted){
    const activity=sample.activity??'UNKNOWN'
    scores.set(activity,(scores.get(activity)??0)+weight)
  }
  let activity:FarmerMotionActivity='UNKNOWN'
  let best=0
  let total=0
  for(const [candidate,score] of scores){
    total+=score
    if(score>best){activity=candidate;best=score}
  }
  return{activity,confidence:total>0?clamp01(best/total):0,distinctActivities:scores.size}
}

function fusePosition(weighted:{sample:FarmerMotionSample;weight:number}[]){
  const located=weighted.filter(({sample})=>sample.position)
  if(located.length===0)return undefined
  let total=0
  let lat=0
  let lon=0
  let bestAccuracy=Number.POSITIVE_INFINITY
  for(const {sample,weight} of located){
    const position=sample.position!
    const accuracy=Math.max(1,position.accuracyM)
    const positionWeight=weight/accuracy
    total+=positionWeight
    lat+=position.lat*positionWeight
    lon+=position.lon*positionWeight
    bestAccuracy=Math.min(bestAccuracy,position.accuracyM)
  }
  if(total<=0)return undefined
  return{lat:lat/total,lon:lon/total,accuracyM:bestAccuracy}
}

export function fuseFarmerMotionSamples(session:FarmerMotionSession,samples:FarmerMotionSample[],nowMs=Date.now()):FarmerMotionFusionEstimate{
  const rejected:string[]=[]
  const weighted:{sample:FarmerMotionSample;weight:number}[]=[]
  for(const sample of samples){
    const validation=validateFarmerMotionSample(session,sample,nowMs)
    if(!validation.accepted){rejected.push(...validation.reasons);continue}
    const weight=sampleWeight(sample,nowMs)
    if(weight<=0){rejected.push(sample.calibrationOk===false?'calibration-required':'fusion-sample-stale');continue}
    weighted.push({sample,weight})
  }

  const activityResult=chooseActivity(weighted)
  const acceptedSources=[...new Set(weighted.map(({sample})=>sample.source))]
  const averageWeight=weighted.length?weighted.reduce((sum,item)=>sum+item.weight,0)/weighted.length:0
  const diversityBonus=acceptedSources.length>=3?.12:acceptedSources.length>=2?.08:0
  const confidence=clamp01(averageWeight+diversityBonus)
  const reasons=[...new Set(rejected)]
  if(acceptedSources.length===0)reasons.push('no-usable-motion-sources')
  else if(acceptedSources.length===1)reasons.push('single-source-only')
  if(activityResult.distinctActivities>1&&activityResult.confidence<.7)reasons.push('activity-source-disagreement')
  if(confidence<.5)reasons.push('low-fusion-confidence')

  const quality:FarmerMotionFusionQuality=confidence>=.75?'GOOD':confidence>=.5?'DEGRADED':'UNRELIABLE'
  const equipmentDistances=weighted.map(({sample})=>sample.equipmentDistanceM).filter((value):value is number=>value!==undefined&&Number.isFinite(value)&&value>=0)

  return{
    sessionId:session.sessionId,
    generatedAt:new Date(nowMs).toISOString(),
    activity:activityResult.activity,
    activityConfidence:activityResult.confidence,
    quality,
    acceptedSources,
    rejectedSampleCount:samples.length-weighted.length,
    position:fusePosition(weighted),
    equipmentDistanceM:equipmentDistances.length?Math.min(...equipmentDistances):undefined,
    reasons:[...new Set(reasons)],
    mayControlMachinery:false,
  }
}

export function mayUseFarmerMotionForLiveAwareness(estimate:FarmerMotionFusionEstimate){
  return estimate.quality!=='UNRELIABLE'&&estimate.acceptedSources.length>0
}

export function mayFarmerMotionFusionControlMachinery(){return false as const}
