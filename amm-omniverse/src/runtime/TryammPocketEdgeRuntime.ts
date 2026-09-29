export type EdgeCapabilitySnapshot={
  nodeClass:'pocket'|'tablet'|'workstation'
  online:boolean
  hardwareConcurrency:number
  deviceMemoryGB:number|null
  webGPU:boolean
  webCodecs:boolean
  storageQuotaBytes:number|null
  storageUsageBytes:number|null
  batteryLevel:number|null
  charging:boolean|null
  thermalState:'unknown'
  safeWork:string[]
  maxParallel:number
}

function nodeClass():EdgeCapabilitySnapshot['nodeClass']{
  const ua=typeof navigator==='undefined'?'':navigator.userAgent
  if(/iPad|Tablet|Android(?!.*Mobile)/i.test(ua))return'tablet'
  if(/iPhone|Android.*Mobile|Mobile/i.test(ua))return'pocket'
  return'workstation'
}

async function battery(){
  try{
    const nav=navigator as Navigator&{getBattery?:()=>Promise<{level:number;charging:boolean}>}
    if(!nav.getBattery)return{batteryLevel:null,charging:null}
    const b=await nav.getBattery()
    return{batteryLevel:Number.isFinite(b.level)?b.level:null,charging:Boolean(b.charging)}
  }catch{return{batteryLevel:null,charging:null}}
}

async function storage(){
  try{
    const e=await navigator.storage?.estimate?.()
    return{
      storageQuotaBytes:Number.isFinite(e?.quota)?Number(e.quota):null,
      storageUsageBytes:Number.isFinite(e?.usage)?Number(e.usage):null,
    }
  }catch{return{storageQuotaBytes:null,storageUsageBytes:null}}
}

export async function detectTryammEdgeCapabilities():Promise<EdgeCapabilitySnapshot>{
  const cls=nodeClass()
  const [bat,store]=await Promise.all([battery(),storage()])
  const hardware=Math.max(1,Number(navigator.hardwareConcurrency||2))
  const deviceMemory=Number((navigator as Navigator&{deviceMemory?:number}).deviceMemory||0)||null
  const webGPU=Boolean((navigator as Navigator&{gpu?:unknown}).gpu)
  const webCodecs=typeof (globalThis as any).VideoEncoder!=='undefined'||typeof (globalThis as any).ImageDecoder!=='undefined'
  const batteryConstrained=bat.batteryLevel!==null&&!bat.charging&&bat.batteryLevel<.25
  const safeWork=['cache-sync','world-state-sync','offline-reconcile','telemetry-aggregate']
  if(webGPU&&!batteryConstrained)safeWork.push('light-ai')
  if(webCodecs&&!batteryConstrained)safeWork.push('media-thumbnail')
  if(cls==='workstation'&&hardware>=8&&!batteryConstrained)safeWork.push('asset-optimize')
  const maxParallel=batteryConstrained?1:cls==='pocket'?Math.min(2,Math.max(1,Math.floor(hardware/4))):Math.min(6,Math.max(2,Math.floor(hardware/3)))
  return{
    nodeClass:cls,
    online:navigator.onLine,
    hardwareConcurrency:hardware,
    deviceMemoryGB:deviceMemory,
    webGPU,
    webCodecs,
    ...store,
    ...bat,
    thermalState:'unknown',
    safeWork:[...new Set(safeWork)],
    maxParallel,
  }
}

const KEY='tryamm_pocket_edge_state_v1'
export type EdgeLocalState={version:1;nodeId?:string;lastSyncAt?:number;pending:number;mode:'online'|'offline'|'battery-save'|'degraded'}

export function readEdgeLocalState():EdgeLocalState{
  try{return JSON.parse(localStorage.getItem(KEY)||'null')||{version:1,pending:0,mode:navigator.onLine?'online':'offline'}}
  catch{return{version:1,pending:0,mode:navigator.onLine?'online':'offline'}}
}
export function writeEdgeLocalState(state:EdgeLocalState){
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:edge-node-state',{detail:state}))
}

export async function refreshTryammPocketEdgeState(){
  const cap=await detectTryammEdgeCapabilities()
  const previous=readEdgeLocalState()
  const batterySave=cap.batteryLevel!==null&&!cap.charging&&cap.batteryLevel<.25
  const next:EdgeLocalState={
    ...previous,
    mode:!cap.online?'offline':batterySave?'battery-save':'online',
    lastSyncAt:Date.now(),
  }
  writeEdgeLocalState(next)
  return{state:next,capabilities:cap}
}

export const POCKET_EDGE_RUNTIME_POLICY={
  noBackgroundMining:true,
  noWorkWithoutUserOrManagedNodePolicy:true,
  neverStoreRawSecrets:true,
  sameOwnerLeasingV1:true,
  batteryFloor:.25,
  thermalSignal:'unknown unless platform supplies a reliable signal',
  heavyWorkCloudFallback:true,
} as const
