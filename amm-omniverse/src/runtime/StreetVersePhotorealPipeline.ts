export type StreetVerseAssetTier='hero'|'premium'|'crowd'|'mobile'
export type StreetVerseAssetClass='character'|'vehicle'|'building'|'interior'|'prop'|'animal'|'road'|'fx'

export type StreetVerseQualityBudget={
  maxTriangles:number
  maxTextureSize:number
  maxMaterials:number
  lods:number
  targetFps:number
  maxDrawCalls:number
  requireRig:boolean
  requireFacial:boolean
  requirePBR:boolean
  requireCollision:boolean
  requireProvenance:boolean
}

export const STREETVERSE_PHOTOREAL_STAGES=[
  'reference-brief',
  'rights-provenance',
  'high-poly-source',
  'retopology',
  'uv-unwrap',
  'pbr-material-authoring',
  'texture-bake',
  'rig-skin',
  'facial-blendshapes',
  'animation-retarget',
  'collision-navigation',
  'lod-hlod',
  'texture-compression',
  'light-response-check',
  'mobile-budget-check',
  'visual-qa',
  'spawn-validation',
  'release-register',
] as const

const BUDGETS:Record<StreetVerseAssetTier,StreetVerseQualityBudget>={
  hero:{maxTriangles:120000,maxTextureSize:4096,maxMaterials:6,lods:4,targetFps:60,maxDrawCalls:8,requireRig:true,requireFacial:true,requirePBR:true,requireCollision:true,requireProvenance:true},
  premium:{maxTriangles:65000,maxTextureSize:2048,maxMaterials:4,lods:4,targetFps:60,maxDrawCalls:6,requireRig:true,requireFacial:false,requirePBR:true,requireCollision:true,requireProvenance:true},
  crowd:{maxTriangles:22000,maxTextureSize:1024,maxMaterials:2,lods:3,targetFps:60,maxDrawCalls:3,requireRig:true,requireFacial:false,requirePBR:true,requireCollision:true,requireProvenance:true},
  mobile:{maxTriangles:12000,maxTextureSize:1024,maxMaterials:2,lods:3,targetFps:45,maxDrawCalls:2,requireRig:false,requireFacial:false,requirePBR:true,requireCollision:true,requireProvenance:true},
}

export function getStreetVerseQualityBudget(tier:StreetVerseAssetTier){return {...BUDGETS[tier]}}

export function createStreetVerseAssetRequirements(assetClass:StreetVerseAssetClass,tier:StreetVerseAssetTier='premium'){
  const budget=getStreetVerseQualityBudget(tier)
  const character=assetClass==='character'
  const animated=character||assetClass==='animal'||assetClass==='vehicle'
  return {
    pipeline:'streetverse-photoreal-v1',
    assetClass,
    tier,
    stages:[...STREETVERSE_PHOTOREAL_STAGES],
    formats:{source:['blend','fbx','usd'],runtime:['glb','gltf'],textures:['ktx2','webp']},
    material:{workflow:'metallic-roughness',maps:['baseColor','normal','roughness','metallic','ao'],toneMapping:'ACES'},
    geometry:{maxTriangles:budget.maxTriangles,lods:budget.lods,requireRetopology:true,requireCleanNormals:true},
    textures:{maxTextureSize:budget.maxTextureSize,requireMipmaps:true,requireCompression:true},
    animation:{required:animated,rigRequired:character||assetClass==='animal',facialRequired:character&&budget.requireFacial,retargetReady:animated},
    runtime:{targetFps:budget.targetFps,maxDrawCalls:budget.maxDrawCalls,collision:budget.requireCollision,navigation:['character','animal','vehicle','building','road'].includes(assetClass)},
    qa:{pbr:budget.requirePBR,provenance:budget.requireProvenance,scale:true,pivots:true,noMissingTextures:true,noNaNTransforms:true,phoneSmoke:true},
  }
}

export function photorealReleaseGate(input:{triangles:number;textureSize:number;materials:number;drawCalls:number;hasPBR:boolean;hasCollision:boolean;hasProvenance:boolean;tier:StreetVerseAssetTier}){
  const b=getStreetVerseQualityBudget(input.tier)
  const failures:string[]=[]
  if(input.triangles>b.maxTriangles)failures.push('triangle-budget')
  if(input.textureSize>b.maxTextureSize)failures.push('texture-budget')
  if(input.materials>b.maxMaterials)failures.push('material-budget')
  if(input.drawCalls>b.maxDrawCalls)failures.push('draw-call-budget')
  if(b.requirePBR&&!input.hasPBR)failures.push('pbr-missing')
  if(b.requireCollision&&!input.hasCollision)failures.push('collision-missing')
  if(b.requireProvenance&&!input.hasProvenance)failures.push('provenance-missing')
  return {green:failures.length===0,failures,budget:b}
}
