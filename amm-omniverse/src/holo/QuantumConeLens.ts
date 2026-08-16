export type ConeLensMode='portal'|'volumetric-focus'|'ar-depth'|'cinematic-transition'|'projection-assist'|'spectator-holo'

export interface QuantumConeLensConfig{
  id:string
  mode:ConeLensMode
  coneAngleDeg:number
  focalDistanceM:number
  nearClipM:number
  farClipM:number
  feather:number
  distortion:number
  chromaticShift:number
  depthBoost:number
  bloomGain:number
  scanlineGain:number
  safeBrightnessNits?:number
  reducedMotion:boolean
}

export interface ConeLensFrame{
  origin:[number,number,number]
  direction:[number,number,number]
  targetWorldId?:string
  targetPoint?:[number,number,number]
  occlusionDepth?:number
  confidence?:number
}

const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n))

export function normalizeConeLensConfig(c:QuantumConeLensConfig):QuantumConeLensConfig{
  return {
    ...c,
    coneAngleDeg:Math.max(5,Math.min(140,c.coneAngleDeg)),
    focalDistanceM:Math.max(.1,c.focalDistanceM),
    nearClipM:Math.max(.01,c.nearClipM),
    farClipM:Math.max(c.nearClipM+.1,c.farClipM),
    feather:clamp(c.feather),
    distortion:clamp(c.distortion),
    chromaticShift:clamp(c.chromaticShift),
    depthBoost:clamp(c.depthBoost),
    bloomGain:clamp(c.bloomGain),
    scanlineGain:clamp(c.scanlineGain)
  }
}

export function coneLensRenderPass(c:QuantumConeLensConfig){
  const n=normalizeConeLensConfig(c)
  return {
    mask:{shape:'cone',angleDeg:n.coneAngleDeg,feather:n.feather,near:n.nearClipM,far:n.farClipM},
    optics:{focalDistanceM:n.focalDistanceM,distortion:n.distortion,chromaticShift:n.chromaticShift},
    depth:{boost:n.depthBoost,occlusionAware:true},
    holo:{bloom:n.bloomGain,scanlines:n.scanlineGain},
    accessibility:{reducedMotion:n.reducedMotion,safeBrightnessNits:n.safeBrightnessNits??220}
  }
}

export const defaultQuantumConeLens:QuantumConeLensConfig={
  id:'qcl-main',
  mode:'portal',
  coneAngleDeg:48,
  focalDistanceM:2.5,
  nearClipM:.15,
  farClipM:35,
  feather:.32,
  distortion:.18,
  chromaticShift:.08,
  depthBoost:.45,
  bloomGain:.35,
  scanlineGain:.16,
  safeBrightnessNits:220,
  reducedMotion:false
}

export const quantumConeLensUses={
  portal:['focus destination preview','shape portal volume','blend old/new world','hide streaming seams'],
  volumetricFocus:['guide particles/light into focal cone','increase perceived depth','reduce visual clutter outside focal region'],
  arDepth:['depth-aware occlusion','anchor holograms to surfaces','improve foreground/background separation'],
  projectionAssist:['keystone/falloff compensation model','brightness falloff mask','content framing'],
  cinematicTransition:['tunnel transition','speed-line convergence','controlled chromatic split','world reconstruction effect'],
  spectatorHolo:['focus a player/ball/vehicle','broadcast highlight cone','holographic replay emphasis']
}

// Grounding rule: "Quantum Cone Lens" is a TryAMM product/rendering name.
// Software effects can be implemented now. Any physical lens/projector claims require optical prototyping and measurement.
export const quantumConeLensGrounding={
  softwareReady:true,
  physicalHardwareStatus:'prototype-required' as const,
  doesNotProvide:['literal teleportation','free energy','superluminal travel','true hard-light matter']
}
