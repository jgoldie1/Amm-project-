import {REALITY_TARGETS,EXTREME_REALITY_PIPELINE,type RealityTier} from './ExtremeRealityRenderingEngine'
import {STREAM_BUDGETS,type DeviceTier} from './AssetLodStreamingEngine'

export interface RealityRuntimeConfig{
 tier:RealityTier;device:DeviceTier;targetFps:number;useSplats:boolean;useNeuralEnhancement:boolean;
 dynamicShadows:boolean;weatherSurfaces:boolean;spatialAudio:boolean;pipeline:readonly string[];
}

export function resolveRealityRuntime(device:DeviceTier,webgpu:boolean):RealityRuntimeConfig{
 if(device==='low-mobile')return{tier:'mobile-realism',device,targetFps:REALITY_TARGETS.lowMobile.fps,useSplats:false,
  useNeuralEnhancement:false,dynamicShadows:false,weatherSurfaces:true,spatialAudio:true,pipeline:EXTREME_REALITY_PIPELINE}
 if(device==='mobile')return{tier:'high-realism',device,targetFps:REALITY_TARGETS.mobile.fps,useSplats:webgpu,
  useNeuralEnhancement:false,dynamicShadows:false,weatherSurfaces:true,spatialAudio:true,pipeline:EXTREME_REALITY_PIPELINE}
 if(device==='desktop')return{tier:'extreme-realism',device,targetFps:REALITY_TARGETS.desktop.fps,useSplats:webgpu,
  useNeuralEnhancement:webgpu,dynamicShadows:true,weatherSurfaces:true,spatialAudio:true,pipeline:EXTREME_REALITY_PIPELINE}
 return{tier:'cinematic',device,targetFps:REALITY_TARGETS.cinematic.fps,useSplats:true,useNeuralEnhancement:true,
  dynamicShadows:true,weatherSurfaces:true,spatialAudio:true,pipeline:EXTREME_REALITY_PIPELINE}
}

export function realityRuntimeBudget(config:RealityRuntimeConfig){
 return{...STREAM_BUDGETS[config.device],targetFps:config.targetFps,
  frameMs:Number((1000/config.targetFps).toFixed(2)),splats:config.useSplats,neural:config.useNeuralEnhancement}
}

export const REALITY_PRODUCTION_GATES=[
 'source-and-rights-evidence','certified-asset-passport','stable-gameplay-geometry','lod-fallback',
 'temporal-stability','frame-budget','memory-budget','accessibility','mobile-fallback','visual-regression',
] as const

export function canPublishExtremeReality(evidence:Partial<Record<(typeof REALITY_PRODUCTION_GATES)[number],string>>){
 const missing=REALITY_PRODUCTION_GATES.filter(g=>!evidence[g])
 return{certified:missing.length===0,missing}
}
