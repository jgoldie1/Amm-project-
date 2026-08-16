export type ConeLensQuality='off'|'low'|'medium'|'high'|'ultra'
export type ConeLensUse='portal'|'globe-focus'|'sports-replay'|'racing-focus'|'combat-replay'|'ar-anchor'|'mr-depth'|'holo-stage'|'cinematic'
export interface ConeLensCapabilities { gpuTier:0|1|2|3; xr:boolean; depthOcclusion:boolean; volumetrics:boolean; eyeTracking?:boolean; reducedMotion:boolean }
export interface ConeLensProfile { enabled:boolean; quality:ConeLensQuality; use:ConeLensUse; coneAngleDeg:number; focalDepthM:number; feather:number; particles:boolean; volumetricLight:boolean; depthOcclusion:boolean; temporalSmoothing:boolean; foveatedFocus:boolean; transitionMs:number }

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n))
export function chooseConeLensProfile(use:ConeLensUse,c: ConeLensCapabilities):ConeLensProfile{
  if(c.gpuTier===0) return {enabled:false,quality:'off',use,coneAngleDeg:32,focalDepthM:2,feather:.3,particles:false,volumetricLight:false,depthOcclusion:false,temporalSmoothing:false,foveatedFocus:false,transitionMs:0}
  const quality:ConeLensQuality=c.gpuTier===1?'low':c.gpuTier===2?'medium':'high'
  const portal=use==='portal'||use==='cinematic'
  const xr=use==='ar-anchor'||use==='mr-depth'||use==='holo-stage'
  return {
    enabled:true,quality,use,
    coneAngleDeg:portal?38:xr?28:22,
    focalDepthM:xr?1.6:portal?4:8,
    feather:c.reducedMotion?.55:.28,
    particles:portal&&c.gpuTier>=2&&!c.reducedMotion,
    volumetricLight:c.volumetrics&&c.gpuTier>=2,
    depthOcclusion:c.depthOcclusion&&xr,
    temporalSmoothing:true,
    foveatedFocus:Boolean(c.eyeTracking&&c.xr),
    transitionMs:c.reducedMotion?250:portal?1100:600
  }
}

export interface ConeTarget { id:string; x:number; y:number; z:number; radius:number; priority:number }
export function selectFocusTarget(targets:ConeTarget[],camera:{x:number;y:number;z:number}){
  return [...targets].sort((a,b)=>{
    const da=Math.hypot(a.x-camera.x,a.y-camera.y,a.z-camera.z)
    const db=Math.hypot(b.x-camera.x,b.y-camera.y,b.z-camera.z)
    return (b.priority-db*.01)-(a.priority-da*.01)
  })[0]??null
}

export function smoothFocus(current:number,target:number,dtMs:number){
  const alpha=1-Math.exp(-clamp(dtMs,0,100)/90)
  return current+(target-current)*alpha
}

export const QUANTUM_CONE_LENS_PIPELINE={
  version:'1.0.0',
  physicalHardwareRequired:false,
  engines:['unreal','unity','godot','webgl','webgpu','webxr'],
  fallbacks:['depth-of-field','radial-mask','bloom','particle-ring','spatial-audio-focus'],
  accessibility:{reducedMotion:true,photosensitivityGuard:true,intensityControl:true,disableParticles:true},
  performance:{adaptiveQuality:true,dynamicResolution:true,foveatedXR:true,frameBudgetAware:true},
  notes:'Software rendering feature. Any future physical optical implementation requires independent optical engineering, photometric testing and eye-safety validation.'
} as const
