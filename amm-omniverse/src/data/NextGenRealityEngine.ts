export type RealismTier='mobile-performance'|'mobile-ultra'|'desktop-ultra'|'cinematic'
export interface RealismProfile{
 tier:RealismTier;targetFps:number;dynamicResolution:boolean;maxPixelRatio:number;
 shadows:'off'|'selective'|'dynamic';reflections:'probe'|'hybrid'|'high';
 volumetrics:boolean;contactShadows:boolean;screenSpaceEffects:boolean;
 crowdFidelity:'budget'|'high'|'hero';textureStreaming:boolean;
}

export const NEXT_GEN_REALISM:Record<RealismTier,RealismProfile>={
 'mobile-performance':{tier:'mobile-performance',targetFps:30,dynamicResolution:true,maxPixelRatio:1,shadows:'off',reflections:'probe',volumetrics:false,contactShadows:false,screenSpaceEffects:false,crowdFidelity:'budget',textureStreaming:true},
 'mobile-ultra':{tier:'mobile-ultra',targetFps:30,dynamicResolution:true,maxPixelRatio:1.5,shadows:'selective',reflections:'hybrid',volumetrics:false,contactShadows:true,screenSpaceEffects:true,crowdFidelity:'high',textureStreaming:true},
 'desktop-ultra':{tier:'desktop-ultra',targetFps:60,dynamicResolution:true,maxPixelRatio:2,shadows:'dynamic',reflections:'high',volumetrics:true,contactShadows:true,screenSpaceEffects:true,crowdFidelity:'high',textureStreaming:true},
 cinematic:{tier:'cinematic',targetFps:30,dynamicResolution:false,maxPixelRatio:2,shadows:'dynamic',reflections:'high',volumetrics:true,contactShadows:true,screenSpaceEffects:true,crowdFidelity:'hero',textureStreaming:true},
}

export const EXTREME_REALITY_SYSTEMS=[
 'physically-based materials','image-based lighting','time-of-day sun and sky',
 'wet-surface and rain response','reflection probes','contact grounding',
 'distance fog and atmospheric perspective','wind-reactive vegetation',
 'traffic suspension and wheel motion','pedestrian gaze and idle variation',
 'animation blending and foot grounding','facial expression hooks',
 'cloth and hair secondary-motion hooks','surface decals and wear variation',
 'interior/exterior exposure adaptation','audio occlusion and district ambience',
 'camera motion stabilization','depth and focus hooks','adaptive LOD and texture streaming',
] as const

export const REALISM_QUALITY_GATES={
 preserveGameplayReadability:true,preserveAccessibility:true,noForcedMotionBlur:true,
 reducedMotionSupported:true,lowMobileShadowsOff:true,dynamicQualityFallback:true,
 neverTradeStableControlsForGraphics:true,certifiedAssetsOnly:true,
 sourceBackedLandmarks:true,noFakeDigitalTwinAccuracyClaims:true,
}

export function selectRealismTier(device:'low-mobile'|'mobile'|'desktop',thermalPressure=false):RealismProfile{
 if(device==='low-mobile'||thermalPressure)return NEXT_GEN_REALISM['mobile-performance']
 if(device==='mobile')return NEXT_GEN_REALISM['mobile-ultra']
 return NEXT_GEN_REALISM['desktop-ultra']
}

export const REALISM_BUILD_ORDER=[
 'lighting-and-material-calibration','grounding-contact-and-reflections','weather-surface-response',
 'vegetation-wind','vehicle-motion','character-animation-grounding','crowd-behavior',
 'atmosphere-and-distance','audio-presence','camera-and-post-effects','performance-certification',
] as const
