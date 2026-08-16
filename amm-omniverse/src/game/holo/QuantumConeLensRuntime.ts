export type ConeLensMode='portal'|'ar-depth'|'mr-anchor'|'sports-focus'|'cinematic'|'broadcast'|'accessibility'
export type DeviceTier='low'|'mid'|'high'|'xr'|'holo-hardware'

export interface ConeLensCapabilities {
  depth:boolean
  occlusion:boolean
  volumetrics:boolean
  eyeTracking:boolean
  handTracking:boolean
  spatialAudio:boolean
  physicalOptics:boolean
}

export interface ConeLensProfile {
  mode:ConeLensMode
  enabled:boolean
  coneAngleDeg:number
  focalDistanceM:number
  falloff:number
  particleDensity:number
  depthStrength:number
  motionIntensity:number
  performanceScale:number
}

export interface AccessibilityLensPrefs {
  reducedMotion:boolean
  photosensitiveSafe:boolean
  highContrast:boolean
  audioDescription:boolean
}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function detectConeLensCapabilities(tier:DeviceTier):ConeLensCapabilities{
  return {
    depth:tier!=='low',
    occlusion:['high','xr','holo-hardware'].includes(tier),
    volumetrics:['high','xr','holo-hardware'].includes(tier),
    eyeTracking:['xr','holo-hardware'].includes(tier),
    handTracking:['xr','holo-hardware'].includes(tier),
    spatialAudio:tier!=='low',
    physicalOptics:tier==='holo-hardware'
  }
}

export function buildConeLensProfile(mode:ConeLensMode,tier:DeviceTier,prefs:AccessibilityLensPrefs):ConeLensProfile{
  const caps=detectConeLensCapabilities(tier)
  const perf=tier==='low'?0.35:tier==='mid'?0.6:tier==='high'?0.85:1
  const base:ConeLensProfile={mode,enabled:true,coneAngleDeg:42,focalDistanceM:2.2,falloff:0.72,particleDensity:caps.volumetrics?0.8:0.15,depthStrength:caps.depth?0.75:0.2,motionIntensity:1,performanceScale:perf}
  if(mode==='portal') Object.assign(base,{coneAngleDeg:58,focalDistanceM:3.5,particleDensity:caps.volumetrics?1:0.2,depthStrength:0.9})
  if(mode==='sports-focus') Object.assign(base,{coneAngleDeg:28,focalDistanceM:8,falloff:0.86,particleDensity:0.08})
  if(mode==='ar-depth'||mode==='mr-anchor') Object.assign(base,{coneAngleDeg:36,focalDistanceM:1.8,depthStrength:caps.occlusion?1:0.55,particleDensity:0.04})
  if(mode==='broadcast') Object.assign(base,{coneAngleDeg:32,focalDistanceM:6,falloff:0.9,particleDensity:0.12})
  if(prefs.reducedMotion) base.motionIntensity=0.2
  if(prefs.photosensitiveSafe){ base.particleDensity=Math.min(base.particleDensity,0.2); base.motionIntensity=Math.min(base.motionIntensity,0.35) }
  if(prefs.highContrast) base.depthStrength=clamp(base.depthStrength+0.1,0,1)
  return base
}

export interface FocusTarget { id:string; x:number; y:number; z:number; priority:number; visible:boolean }
export function chooseFocusTarget(targets:FocusTarget[]){
  return [...targets].filter(t=>t.visible).sort((a,b)=>b.priority-a.priority)[0]??null
}

export function computeAdaptiveFocalDistance(current:number,target:number,dtSeconds:number){
  const speed=4.5
  const alpha=1-Math.exp(-speed*Math.max(0,dtSeconds))
  return current+(target-current)*alpha
}

export type PortalPhase='idle'|'focus'|'preview'|'stream'|'reconstruct'|'complete'
export interface PortalLensState { phase:PortalPhase; progress:number; destinationId?:string }
export function advancePortalLens(state:PortalLensState,streamReady:boolean,dt:number):PortalLensState{
  let progress=clamp(state.progress+dt*0.65,0,1)
  let phase=state.phase
  if(phase==='idle') phase='focus'
  else if(phase==='focus'&&progress>=0.2) phase='preview'
  else if(phase==='preview'&&progress>=0.4) phase='stream'
  else if(phase==='stream'&&streamReady&&progress>=0.7) phase='reconstruct'
  else if(phase==='reconstruct'&&progress>=1) phase='complete'
  if(phase==='stream'&&!streamReady) progress=Math.min(progress,0.69)
  return {...state,phase,progress}
}

// Physical optics are optional. The same gameplay contract always has a software fallback.
export function renderPath(tier:DeviceTier){
  const caps=detectConeLensCapabilities(tier)
  if(caps.physicalOptics) return 'physical-optics+realtime-rendering'
  if(tier==='xr') return 'xr-depth+occlusion+volumetrics'
  if(tier==='high') return 'realtime-volumetric-software-lens'
  if(tier==='mid') return 'depth-shader-software-lens'
  return 'lightweight-2d/3d-focal-fallback'
}

export const QUANTUM_CONE_LENS_RUNTIME={
  requiredForGameplay:false,
  physicalHardwareRequired:false,
  engines:['unreal','unity','godot','webxr'],
  uses:['living-earth-portals','streetverse','sports-replays','volcano-racers','omniplayer','hologpt','ar-vr-mr','broadcast'],
  rule:'Never block gameplay because holographic hardware, depth sensors, eye tracking, or volumetric rendering are unavailable.'
} as const
