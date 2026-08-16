export type TelescopeMode='sky'|'planetary'|'satellite'|'earth-observation'|'education'|'mission-scan'|'broadcast'
export type TelescopeSource='simulated-sky'|'public-astronomy-data'|'user-camera'|'future-hardware'

export interface TelescopeTarget { id:string; label:string; kind:'star'|'planet'|'moon'|'satellite'|'city'|'landmark'|'mission-object'; raDeg?:number; decDeg?:number; lat?:number; lon?:number; distanceKm?:number; priority:number }
export interface TelescopeProfile { mode:TelescopeMode; fovDeg:number; zoom:number; exposure:number; stabilization:number; tracking:boolean; labels:boolean; nightVision:boolean; source:TelescopeSource }
export interface TelescopeSafetyPrefs { reducedMotion:boolean; photosensitiveSafe:boolean; privacySafe:boolean }

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function buildTelescopeProfile(mode:TelescopeMode,prefs:TelescopeSafetyPrefs):TelescopeProfile{
  const base:TelescopeProfile={mode,fovDeg:30,zoom:1,exposure:0.7,stabilization:0.8,tracking:true,labels:true,nightVision:false,source:'simulated-sky'}
  if(mode==='sky') Object.assign(base,{fovDeg:45,zoom:1.5,exposure:0.9})
  if(mode==='planetary') Object.assign(base,{fovDeg:8,zoom:8,exposure:0.65})
  if(mode==='satellite') Object.assign(base,{fovDeg:12,zoom:6,tracking:true,source:'public-astronomy-data' as TelescopeSource})
  if(mode==='earth-observation') Object.assign(base,{fovDeg:20,zoom:4,source:'public-astronomy-data' as TelescopeSource})
  if(mode==='mission-scan') Object.assign(base,{fovDeg:18,zoom:3.5,tracking:true})
  if(mode==='broadcast') Object.assign(base,{fovDeg:25,zoom:2.5,stabilization:1})
  if(prefs.reducedMotion) base.stabilization=1
  if(prefs.photosensitiveSafe) base.exposure=Math.min(base.exposure,0.6)
  return base
}

export function chooseTelescopeTarget(targets:TelescopeTarget[]){
  return [...targets].sort((a,b)=>b.priority-a.priority)[0]??null
}

export function stepZoom(current:number,target:number,dt:number){
  const maxRate=6
  const delta=clamp(target-current,-maxRate*dt,maxRate*dt)
  return clamp(current+delta,1,100)
}

export function canUseEarthObservation(target:TelescopeTarget,prefs:TelescopeSafetyPrefs){
  if(!prefs.privacySafe) return false
  if(target.kind==='city'||target.kind==='landmark') return true
  return target.kind!=='mission-object'
}

export const QUANTUM_TELESCOPE_RUNTIME={
  requiredForGameplay:false,
  physicalHardwareRequired:false,
  aliases:['Quantum Telescope','HoloScope'],
  engines:['unreal','unity','godot','webxr'],
  integrations:['living-earth','hologpt','quantum-cone-lens','omniplayer','education','astronomy-missions','satellite-overlays','broadcast'],
  rules:[
    'Use public or simulated astronomy/geospatial data unless explicit user-authorized hardware input is available.',
    'Do not expose private real-time views of people, homes, or restricted locations.',
    'Physical telescope hardware is an optional future accessory; software mode must remain fully usable without it.'
  ]
} as const
