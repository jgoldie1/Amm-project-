export type EdgeGridPreferences={
  version:1
  paidGridOptIn:boolean
  chargingOnlyForPaidWork:boolean
  wifiOnlyForPaidWork:boolean
  batteryFloor:number
  maxParallelPaidJobs:number
  maxCacheMB:number
  allowedPaidWork:string[]
}

const KEY='tryamm_edge_grid_preferences_v1'
const DEFAULTS:EdgeGridPreferences={
  version:1,
  paidGridOptIn:false,
  chargingOnlyForPaidWork:true,
  wifiOnlyForPaidWork:true,
  batteryFloor:.30,
  maxParallelPaidJobs:1,
  maxCacheMB:512,
  allowedPaidWork:['cache-sync','media-thumbnail','light-ai'],
}

export function readEdgeGridPreferences():EdgeGridPreferences{
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)||'null')
    return{
      ...DEFAULTS,
      ...(parsed&&typeof parsed==='object'?parsed:{}),
      version:1,
      paidGridOptIn:Boolean(parsed?.paidGridOptIn),
      chargingOnlyForPaidWork:parsed?.chargingOnlyForPaidWork!==false,
      wifiOnlyForPaidWork:parsed?.wifiOnlyForPaidWork!==false,
      batteryFloor:Math.max(.15,Math.min(.8,Number(parsed?.batteryFloor??DEFAULTS.batteryFloor))),
      maxParallelPaidJobs:Math.max(1,Math.min(4,Number(parsed?.maxParallelPaidJobs??1))),
      maxCacheMB:Math.max(64,Math.min(4096,Number(parsed?.maxCacheMB??512))),
      allowedPaidWork:Array.isArray(parsed?.allowedPaidWork)?parsed.allowedPaidWork.map(String).slice(0,10):DEFAULTS.allowedPaidWork,
    }
  }catch{return{...DEFAULTS}}
}

export function writeEdgeGridPreferences(next:Partial<EdgeGridPreferences>){
  const merged={...readEdgeGridPreferences(),...next,version:1} as EdgeGridPreferences
  localStorage.setItem(KEY,JSON.stringify(merged))
  window.dispatchEvent(new CustomEvent('tryamm:edge-grid-preferences',{detail:merged}))
  return merged
}

export function paidGridNetworkState(){
  const connection=(navigator as Navigator&{connection?:{type?:string;effectiveType?:string;saveData?:boolean}}).connection
  if(!connection)return{known:false,wifi:false,saveData:false}
  return{
    known:true,
    wifi:String(connection.type||'').toLowerCase()==='wifi',
    saveData:Boolean(connection.saveData),
    effectiveType:String(connection.effectiveType||''),
  }
}

export function paidGridEligibility(input:{batteryLevel:number|null;charging:boolean|null;jobClass:string}){
  const prefs=readEdgeGridPreferences()
  const network=paidGridNetworkState()
  const blockers:string[]=[]
  if(!prefs.paidGridOptIn)blockers.push('paid-grid-opt-in-required')
  if(!prefs.allowedPaidWork.includes(input.jobClass))blockers.push('job-class-not-enabled')
  if(input.batteryLevel!==null&&!input.charging&&input.batteryLevel<prefs.batteryFloor)blockers.push('battery-floor')
  if(prefs.chargingOnlyForPaidWork&&input.charging!==true)blockers.push('charging-required')
  if(prefs.wifiOnlyForPaidWork){
    if(!network.known)blockers.push('wifi-state-unavailable')
    else if(!network.wifi)blockers.push('wifi-required')
  }
  if(network.saveData)blockers.push('data-saver-enabled')
  return{allowed:blockers.length===0,blockers,prefs,network}
}

export const EDGE_GRID_PREFERENCE_POLICY={
  paidGridDefaultOff:true,
  chargingOnlyDefault:true,
  wifiOnlyDefault:true,
  separateFromPersonalEdge:true,
  privateDataSharing:false,
  idleInstallPayment:false,
} as const
