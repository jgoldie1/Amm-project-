export type OmniFabricLane='render'|'physics'|'ai'|'world-sim'|'media'|'commerce'|'accessibility'
export type OmniFabricBackend='local-webgpu'|'local-cpu'|'remote-gpu'|'remote-omnifabric'|'unavailable'

export type OmniFabricJob={
  id:string
  lane:OmniFabricLane
  kind:string
  priority?:'interactive'|'normal'|'batch'
  estimatedBytes?:number
  requiresGpu?:boolean
  payload?:Record<string,unknown>
}

export type OmniFabricRoute={
  backend:OmniFabricBackend
  lane:OmniFabricLane
  endpoint?:string
  reason:string[]
  authoritativeMoney:false
}

declare global{
  interface Window{
    __TRYAMM_OMNIFABRIC__?:{
      version:string
      route:(job:OmniFabricJob)=>OmniFabricRoute
      submit:(job:OmniFabricJob)=>Promise<{accepted:boolean;route:OmniFabricRoute;jobId:string}>
    }
  }
}

const endpoint=()=>String((import.meta as any).env?.VITE_OMNIFABRIC_API_URL||'').trim()

function localWebGpuAvailable(){
  const nav=navigator as Navigator & {gpu?:unknown}
  return Boolean(nav.gpu)
}

export function routeOmniFabricJob(job:OmniFabricJob):OmniFabricRoute{
  const reasons:string[]=[]
  const remote=endpoint()
  const gpu=localWebGpuAvailable()
  const batch=job.priority==='batch'
  const heavy=Boolean(job.requiresGpu)||Number(job.estimatedBytes||0)>64*1024*1024

  if(remote&&(batch||heavy||job.lane==='ai'||job.lane==='media'||job.lane==='world-sim')){
    reasons.push('Heavy or batch workload routed away from the player device')
    return{backend:'remote-omnifabric',lane:job.lane,endpoint:remote,reason:reasons,authoritativeMoney:false}
  }

  if(gpu&&(job.lane==='render'||job.lane==='physics'||job.lane==='world-sim')){
    reasons.push('Interactive GPU-capable workload kept local for low latency')
    return{backend:'local-webgpu',lane:job.lane,reason:reasons,authoritativeMoney:false}
  }

  if(!heavy){
    reasons.push('Lightweight fallback can run on local CPU')
    return{backend:'local-cpu',lane:job.lane,reason:reasons,authoritativeMoney:false}
  }

  reasons.push('No configured remote accelerator and workload is too heavy for local fallback')
  return{backend:'unavailable',lane:job.lane,reason:reasons,authoritativeMoney:false}
}

export function installOmniFabricComputeRouter(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_OMNIFABRIC__)return()=>{}

  const submit=async(job:OmniFabricJob)=>{
    const route=routeOmniFabricJob(job)
    window.dispatchEvent(new CustomEvent('tryamm:omnifabric-job-routed',{detail:{jobId:job.id,lane:job.lane,backend:route.backend}}))

    if(route.backend==='remote-omnifabric'&&route.endpoint){
      const response=await fetch(route.endpoint.replace(/\/$/,'')+'/jobs',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          schema:'tryamm.omnifabric.job.v1',
          job:{...job,payload:job.payload||{}},
          authority:{money:'server-ledger',clientMayMintSpendableValue:false},
        })
      })
      if(!response.ok)throw new Error('OmniFabric job submission failed: '+response.status)
      return{accepted:true,route,jobId:job.id}
    }

    return{accepted:route.backend!=='unavailable',route,jobId:job.id}
  }

  window.__TRYAMM_OMNIFABRIC__={version:'1.0.0',route:routeOmniFabricJob,submit}
  window.dispatchEvent(new CustomEvent('tryamm:omnifabric-ready',{detail:{
    version:'1.0.0',
    lanes:['render','physics','ai','world-sim','media','commerce','accessibility'],
    hardwareStatus:'software-routing-layer',
    physicalSiliconRequired:false,
    supportsRemoteAccelerators:true,
  }}))

  return()=>{delete window.__TRYAMM_OMNIFABRIC__}
}
