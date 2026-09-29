import {completePocketEdgeJob,heartbeatPocketEdgeNode,leasePocketEdgeJobs,registerPocketEdgeNode} from '../services/edgeNode'
import {readEdgeLocalState,refreshTryammPocketEdgeState,writeEdgeLocalState,type EdgeCapabilitySnapshot} from './TryammPocketEdgeRuntime'
import {paidGridEligibility,readEdgeGridPreferences} from './TryammEdgeGridPreferences'

const ENABLE_KEY='tryamm_pocket_edge_enabled_v1'
const NODE_KEY='tryamm_pocket_edge_node_id_v1'

export type EdgeLeasedJob={
  id:string
  job_class:string
  required_capability:string
  payload_ref:string|null
  payload_hash:string|null
  work_order_id?:string|null
}

export function pocketEdgeEnabled(){
  try{return localStorage.getItem(ENABLE_KEY)==='true'}catch{return false}
}
export function setPocketEdgeEnabled(enabled:boolean){
  try{localStorage.setItem(ENABLE_KEY,String(enabled))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:pocket-edge-enabled',{detail:{enabled}}))
}
function nodeId(){try{return localStorage.getItem(NODE_KEY)||''}catch{return''}}
function saveNodeId(id:string){try{localStorage.setItem(NODE_KEY,id)}catch{}}

async function cacheSameOrigin(ref:string){
  const path=ref.replace(/^cache:/i,'')
  if(!path.startsWith('/'))throw new Error('EDGE_CACHE_PATH_MUST_BE_SAME_ORIGIN')
  const url=new URL(path,location.origin)
  if(url.origin!==location.origin)throw new Error('EDGE_CACHE_CROSS_ORIGIN_BLOCKED')
  const response=await fetch(url.toString(),{credentials:'same-origin'})
  if(!response.ok)throw new Error(`EDGE_CACHE_FETCH_${response.status}`)
  const cache=await caches.open('tryamm-pocket-edge-v1')
  await cache.put(url.toString(),response.clone())
  return`cache:${url.pathname}`
}

async function dispatchAppJob(job:EdgeLeasedJob){
  return new Promise<string>((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('EDGE_APP_HANDLER_TIMEOUT')),5000)
    const detail={
      job,
      complete:(resultRef:string)=>{clearTimeout(timeout);resolve(resultRef)},
      fail:(reason?:string)=>{clearTimeout(timeout);reject(new Error(reason||'EDGE_APP_HANDLER_FAILED'))},
    }
    window.dispatchEvent(new CustomEvent('tryamm:edge-job',{detail}))
  })
}

export async function executePocketEdgeJob(job:EdgeLeasedJob,capabilities:EdgeCapabilitySnapshot){
  if(!capabilities.safeWork.includes(job.required_capability))throw new Error('EDGE_CAPABILITY_NOT_ALLOWED')
  if(job.job_class==='cache-sync'){
    if(!job.payload_ref?.startsWith('cache:'))throw new Error('EDGE_CACHE_REF_REQUIRED')
    return cacheSameOrigin(job.payload_ref)
  }
  if(['world-state-sync','offline-reconcile','telemetry-aggregate','media-thumbnail','asset-optimize','light-ai'].includes(job.job_class)){
    return dispatchAppJob(job)
  }
  throw new Error('EDGE_JOB_CLASS_NOT_ALLOWED')
}

export async function runPocketEdgeCycle(){
  if(!pocketEdgeEnabled())return{state:'disabled',jobs:0}
  if(document.visibilityState==='hidden')return{state:'paused-hidden',jobs:0}

  const refreshed=await refreshTryammPocketEdgeState()
  const {capabilities}=refreshed
  if(!capabilities.online)return{state:'offline',jobs:0}
  if(capabilities.batteryLevel!==null&&!capabilities.charging&&capabilities.batteryLevel<.25)return{state:'battery-save',jobs:0}

  let id=nodeId()
  if(!id){
    const registered:any=await registerPocketEdgeNode(capabilities)
    id=String(registered?.node?.id||'')
    if(!id)throw new Error('EDGE_NODE_REGISTRATION_MISSING_ID')
    saveNodeId(id)
  }else{
    await heartbeatPocketEdgeNode(id,capabilities)
  }

  const paidPrefs=readEdgeGridPreferences()
  const leased:any=await leasePocketEdgeJobs(id,capabilities,{paidGridOptIn:paidPrefs.paidGridOptIn,allowedPaidWork:paidPrefs.allowedPaidWork,maxParallelPaidJobs:paidPrefs.maxParallelPaidJobs})
  const jobs:Array<EdgeLeasedJob>=Array.isArray(leased?.jobs)?leased.jobs:[]
  let completed=0
  for(const job of jobs){
    try{
      if(job.work_order_id){
        const eligibility=paidGridEligibility({batteryLevel:capabilities.batteryLevel,charging:capabilities.charging,jobClass:job.job_class})
        if(!eligibility.allowed){
          window.dispatchEvent(new CustomEvent('tryamm:edge-paid-job-skipped',{detail:{jobId:job.id,blockers:eligibility.blockers}}))
          continue
        }
      }
      const resultRef=await executePocketEdgeJob(job,capabilities)
      await completePocketEdgeJob(id,job.id,resultRef)
      completed+=1
    }catch(error){
      window.dispatchEvent(new CustomEvent('tryamm:edge-job-error',{detail:{jobId:job.id,error:String((error as Error)?.message||error)}}))
    }
  }

  const local=readEdgeLocalState()
  writeEdgeLocalState({...local,nodeId:id,lastSyncAt:Date.now(),pending:Math.max(0,jobs.length-completed),mode:'online'})
  return{state:'online',jobs:jobs.length,completed,nodeId:id}
}

let timer:number|undefined
export function installPocketEdgeWorker(){
  if(typeof window==='undefined'||timer)return()=>{}
  const tick=()=>{if(pocketEdgeEnabled())void runPocketEdgeCycle().catch(error=>window.dispatchEvent(new CustomEvent('tryamm:edge-cycle-error',{detail:{error:String(error?.message||error)}})))}
  timer=window.setInterval(tick,60_000)
  window.addEventListener('online',tick)
  document.addEventListener('visibilitychange',tick)
  tick()
  return()=>{
    if(timer)window.clearInterval(timer)
    timer=undefined
    window.removeEventListener('online',tick)
    document.removeEventListener('visibilitychange',tick)
  }
}

export const POCKET_EDGE_WORKER_POLICY={
  optInDefault:false,
  hiddenPageExecution:false,
  lowBatteryPause:true,
  sameOriginCacheOnly:true,
  allowedBuiltIn:['cache-sync'] as const,
  appHandled:['world-state-sync','offline-reconcile','telemetry-aggregate','media-thumbnail','asset-optimize','light-ai'] as const,
  unknownJobsRejected:true,
  secretJobsAllowed:false,
  backgroundMining:false,
  paidWorkRequiresSecondOptIn:true,
  paidWorkRechecksUserResourcePolicy:true,
} as const