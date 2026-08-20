export type VisualTier = 'lite'|'standard'|'high'|'ultra'|'xr'|'holo_multiview'

export interface DeviceBudget {
  tier: VisualTier
  targetFps: number
  maxFrameMs: number
  maxVisibleCrowd: number
  maxDynamicLights: number
  maxShadowCasters: number
  particleBudget: number
  textureScale: number
  maxGlbLod: 0|1|2|3
  volumetrics: boolean
  reflections: 'off'|'screen'|'hybrid'
  hairClothQuality: 'static'|'simple'|'advanced'
  facialRigQuality: 'basic'|'standard'|'microexpression'
}

export const DEVICE_BUDGETS: Record<VisualTier, DeviceBudget> = {
  lite:{tier:'lite',targetFps:30,maxFrameMs:33.3,maxVisibleCrowd:20,maxDynamicLights:4,maxShadowCasters:2,particleBudget:250,textureScale:.5,maxGlbLod:3,volumetrics:false,reflections:'off',hairClothQuality:'static',facialRigQuality:'basic'},
  standard:{tier:'standard',targetFps:45,maxFrameMs:22.2,maxVisibleCrowd:50,maxDynamicLights:8,maxShadowCasters:4,particleBudget:700,textureScale:.75,maxGlbLod:2,volumetrics:false,reflections:'screen',hairClothQuality:'simple',facialRigQuality:'standard'},
  high:{tier:'high',targetFps:60,maxFrameMs:16.7,maxVisibleCrowd:100,maxDynamicLights:14,maxShadowCasters:8,particleBudget:1800,textureScale:1,maxGlbLod:1,volumetrics:true,reflections:'screen',hairClothQuality:'advanced',facialRigQuality:'microexpression'},
  ultra:{tier:'ultra',targetFps:60,maxFrameMs:16.7,maxVisibleCrowd:180,maxDynamicLights:22,maxShadowCasters:12,particleBudget:3500,textureScale:1,maxGlbLod:0,volumetrics:true,reflections:'hybrid',hairClothQuality:'advanced',facialRigQuality:'microexpression'},
  xr:{tier:'xr',targetFps:72,maxFrameMs:13.9,maxVisibleCrowd:80,maxDynamicLights:10,maxShadowCasters:6,particleBudget:1300,textureScale:.85,maxGlbLod:1,volumetrics:false,reflections:'screen',hairClothQuality:'simple',facialRigQuality:'standard'},
  holo_multiview:{tier:'holo_multiview',targetFps:90,maxFrameMs:11.1,maxVisibleCrowd:60,maxDynamicLights:8,maxShadowCasters:4,particleBudget:900,textureScale:.75,maxGlbLod:1,volumetrics:false,reflections:'screen',hairClothQuality:'simple',facialRigQuality:'standard'},
}

export interface RuntimeTelemetry {
  fps: number
  frameMs: number
  gpuMemoryPressure: number // 0..1
  droppedFrameRatio: number
  networkQuality: number // 0..1
  thermalPressure: number // 0..1
}

const ORDER: VisualTier[]=['lite','standard','high','ultra','xr','holo_multiview']

export function recommendQuality(current: VisualTier, t: RuntimeTelemetry): VisualTier {
  const stressed = t.frameMs > DEVICE_BUDGETS[current].maxFrameMs * 1.15 || t.gpuMemoryPressure > .85 || t.droppedFrameRatio > .08 || t.thermalPressure > .8
  if (!stressed) return current
  if (current==='xr'||current==='holo_multiview') return 'standard'
  const i=ORDER.indexOf(current)
  return ORDER[Math.max(0,i-1)]
}

export interface AssetQualityMetadata {
  id:string
  triangles:number
  materials:number
  textureMegabytes:number
  lods:number
  collisionMesh:boolean
  skeletalBones?:number
  facialBlendshapes?:number
}

export function validateRuntimeAsset(asset:AssetQualityMetadata,tier:VisualTier){
  const budget=DEVICE_BUDGETS[tier]
  const maxTriangles=tier==='lite'?40_000:tier==='standard'?90_000:tier==='high'?180_000:350_000
  const errors:string[]=[]
  if(asset.triangles>maxTriangles) errors.push(`triangle_budget_exceeded:${asset.triangles}/${maxTriangles}`)
  if(asset.materials>(tier==='lite'?3:8)) errors.push('material_budget_exceeded')
  if(asset.textureMegabytes>(tier==='lite'?16:tier==='standard'?40:96)) errors.push('texture_memory_budget_exceeded')
  if(asset.lods<2) errors.push('missing_lod_chain')
  if(!asset.collisionMesh) errors.push('missing_collision_mesh')
  if((asset.skeletalBones??0)>180) errors.push('skeleton_bone_budget_exceeded')
  return {approved:errors.length===0,errors,recommendedLod:budget.maxGlbLod}
}

export const LIVING_WORLD_RENDER_PRIORITIES = [
  'responsive_controls_before_visual_extras',
  'stable_frame_rate_before_more_npcs',
  'character_faces_and_motion_before_map_size',
  'lighting_materials_and_weather_consistency',
  'believable_crowd_navigation',
  'wildlife_background_continuity',
  'audio_spatialization_and_dynamic_mix',
  'sensory_cues_with_accessible_equivalents',
  'automatic_lod_and_asset_streaming',
  'no_feature_requires_high_end_hardware',
] as const

export const REPLAYABILITY_LAYERS = [
  'world_pulse_events','dynamic_missions','player_reputation','creator_events','business_economy','weather','social_crew','rare_discoveries','daily_world_changes','branching_choices'
] as const
