export type RealityTier='mobile-realism'|'high-realism'|'extreme-realism'|'cinematic'
export interface RealityFeature{name:string;mobile:boolean;webgpu:boolean;fallback:string}

export const NEXT_GEN_REALITY_FEATURES:RealityFeature[]=[
 {name:'physically-based materials',mobile:true,webgpu:false,fallback:'PBR-lite'},
 {name:'image-based lighting and reflection probes',mobile:true,webgpu:false,fallback:'baked probes'},
 {name:'streamed Gaussian splat districts',mobile:true,webgpu:true,fallback:'certified mesh LOD'},
 {name:'hybrid mesh+splat landmarks',mobile:true,webgpu:true,fallback:'mesh landmark'},
 {name:'neural appearance enhancement',mobile:false,webgpu:true,fallback:'tone mapping'},
 {name:'dynamic weather surface response',mobile:true,webgpu:false,fallback:'material variants'},
 {name:'volumetric atmosphere and fog',mobile:true,webgpu:true,fallback:'layered fog'},
 {name:'realistic skin/hair/cloth tiers',mobile:true,webgpu:true,fallback:'optimized shaders'},
 {name:'motion matching and foot placement',mobile:true,webgpu:false,fallback:'retargeted animation'},
 {name:'audio occlusion and spatial ambience',mobile:true,webgpu:false,fallback:'stereo ambience'},
]

export const EXTREME_REALITY_PIPELINE=[
 'certified-source-assets','physically-based-materials','hybrid-mesh-splat-scene',
 'streaming-and-virtualized-lod','lighting-and-reflections','weather-and-atmosphere',
 'character-skin-hair-cloth','motion-and-physics','spatial-audio','neural-enhancement-when-supported',
 'temporal-stability-check','mobile-frame-budget-check','accessibility-check','certify',
] as const

export const REALITY_TARGETS={
 lowMobile:{fps:30,frameMs:33.3,shadows:'off',neural:false,splats:'selective'},
 mobile:{fps:30,frameMs:33.3,shadows:'selective',neural:false,splats:'streamed'},
 desktop:{fps:60,frameMs:16.7,shadows:'dynamic',neural:true,splats:'hybrid'},
 cinematic:{fps:60,frameMs:16.7,shadows:'maximum',neural:true,splats:'maximum'},
} as const

export const REALITY_SAFEGUARDS={
 authoredSceneRemainsGroundTruth:true,
 noFakeGeographicAccuracy:true,
 sourceBackedLandmarks:true,
 realPersonLikenessRequiresApproval:true,
 neuralOutputMustPreserveGameplayGeometry:true,
 temporalStabilityRequired:true,
 mobileFallbackRequired:true,
 webgpuProgressiveEnhancement:true,
 noPreciseUserLocationRequired:true,
} as const
