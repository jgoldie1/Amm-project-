export type DeviceTier='low-mobile'|'mobile'|'desktop'|'cinematic'
export type LodLevel=0|1|2|3

export interface LodVariant{level:LodLevel;maxDistance:number;triangleRatio:number;textureScale:number;animated:boolean}
export interface StreamBudget{device:DeviceTier;maxVisibleTriangles:number;maxTextureMB:number;maxAnimatedCharacters:number;prefetchRadius:number}

export const LOD_PROFILE:LodVariant[]=[
 {level:0,maxDistance:20,triangleRatio:1,textureScale:1,animated:true},
 {level:1,maxDistance:60,triangleRatio:.55,textureScale:.75,animated:true},
 {level:2,maxDistance:150,triangleRatio:.25,textureScale:.5,animated:false},
 {level:3,maxDistance:Infinity,triangleRatio:.08,textureScale:.25,animated:false},
]

export const STREAM_BUDGETS:Record<DeviceTier,StreamBudget>={
 'low-mobile':{device:'low-mobile',maxVisibleTriangles:350000,maxTextureMB:96,maxAnimatedCharacters:8,prefetchRadius:45},
 mobile:{device:'mobile',maxVisibleTriangles:650000,maxTextureMB:160,maxAnimatedCharacters:16,prefetchRadius:70},
 desktop:{device:'desktop',maxVisibleTriangles:1800000,maxTextureMB:512,maxAnimatedCharacters:40,prefetchRadius:130},
 cinematic:{device:'cinematic',maxVisibleTriangles:6000000,maxTextureMB:2048,maxAnimatedCharacters:100,prefetchRadius:250},
}

export function chooseLod(distance:number):LodVariant{
 return LOD_PROFILE.find(x=>distance<=x.maxDistance)??LOD_PROFILE[LOD_PROFILE.length-1]
}

export interface AssetVariationSeed{assetId:string;cityId:string;districtId:string;instance:number}
export function stableVariationKey(s:AssetVariationSeed){
 return `${s.cityId}:${s.districtId}:${s.assetId}:${s.instance}`
}

export const VARIATION_POLICY={
 deterministicSeeds:true,
 geometryVariants:true,
 materialVariants:true,
 wardrobeVariants:true,
 trafficVariants:true,
 vegetationVariants:true,
 neverAlterProtectedBrandMarks:true,
 neverCreateRealPersonLikenessWithoutApproval:true,
 preserveRigCompatibility:true,
 preserveCollisionEnvelope:true,
} as const

export const WORLD_STREAMING_POLICY={
 streamByDistrict:true,
 prefetchAdjacentDistricts:true,
 unloadBehindPlayer:true,
 prioritizePlayerPath:true,
 prioritizeInteractiveAssets:true,
 reduceNpcAnimationBeforeGeometry:true,
 reduceTextureResolutionBeforeRemovingGameplayObjects:true,
 lowMobileShadows:false,
 failGracefullyOnSlowNetwork:true,
 cacheCertifiedAssets:true,
} as const
