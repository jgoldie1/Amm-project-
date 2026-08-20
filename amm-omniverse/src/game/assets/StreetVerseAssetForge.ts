export type AssetKind = 'environment' | 'building' | 'interior' | 'character' | 'vehicle' | 'prop' | 'hologram' | 'vfx' | 'audio' | 'animation'
export type AssetStatus = 'requested' | 'generated' | 'review' | 'optimized' | 'approved' | 'blocked-rights'
export type QualityTier = 'cinematic' | 'gameplay' | 'mobile' | 'xr'

export type AssetForgeRequest = {
  id: string
  packId: string
  kind: AssetKind
  name: string
  scene: string
  quality: QualityTier[]
  realism: 'photoreal' | 'stylized-memory' | 'holographic-photoreal'
  materials: string[]
  lighting: string[]
  lods: number[]
  collision: boolean
  navmesh: boolean
  spatialAudio?: boolean
  reducedMotionAlternative?: string
  rights: 'original' | 'public-reference' | 'licensed-required'
  status: AssetStatus
}

export const STREETVERSE_RENDER_PROFILE = {
  physicallyBasedMaterials: true,
  hdrLighting: true,
  timeOfDay: true,
  weather: true,
  volumetricAtmosphere: true,
  screenSpaceReflectionsFallback: true,
  bakedLightingFallback: true,
  dynamicCrowdLod: true,
  textureStreaming: true,
  occlusionCulling: true,
  mobileAdaptiveQuality: true,
  xrComfortMode: true,
  holographicDepthLayers: 4,
  holographicEffects: ['parallax', 'scanlines', 'volumetric glow', 'particle dust', 'depth fade', 'chromatic edge restraint'],
} as const

export const ASSET_FORGE_PACKS: AssetForgeRequest[] = [
  {
    id: 'origin-near-west-memory', packId: 'meet-the-stubbs', kind: 'environment',
    name: 'Near West Side Origin Memory District',
    scene: 'Privacy-safe fictionalized Chicago neighborhood inspired by Madden Park, Circle Park and ABLA/Village surroundings. Realistic brick, concrete, parks, courts, streets, buses, traffic, storefronts and lived-in environmental storytelling without exposing a private apartment/unit.',
    quality: ['cinematic','gameplay','mobile','xr'], realism: 'holographic-photoreal',
    materials: ['aged brick PBR','wet/dry asphalt PBR','concrete wear','glass storefront','park grass','metal fencing'],
    lighting: ['Chicago gold hour','overcast','summer noon','sodium/LED night mix'], lods: [0,1,2,3], collision: true, navmesh: true,
    spatialAudio: true, reducedMotionAlternative: 'Disable memory-echo motion and use static depth cards.', rights: 'original', status: 'requested',
  },
  {
    id: 'stubbs-ai-hologram', packId: 'meet-the-stubbs', kind: 'hologram',
    name: 'Stubbs AI Holographic Guide', scene: 'Original non-photographic holographic guide rendered as layered volumetric light with accessible captions and directional audio.',
    quality: ['cinematic','gameplay','mobile','xr'], realism: 'holographic-photoreal',
    materials: ['emissive hologram shader','depth mask','soft particle glow'], lighting: ['self emissive','environment response'], lods: [0,1,2], collision: false, navmesh: false,
    spatialAudio: true, reducedMotionAlternative: 'Static high-contrast portrait glyph plus captions.', rights: 'original', status: 'requested',
  },
  {
    id: 'lakefront-summer-signature', packId: 'chicago-summer', kind: 'environment',
    name: 'Lakefront Summer Signature District', scene: 'Chicago-inspired lakefront roadway, beaches, marina, event lawns, crowds, food vendors, bike/pedestrian traffic, boats, skyline reflections and summer storm variants.',
    quality: ['cinematic','gameplay','mobile','xr'], realism: 'photoreal',
    materials: ['water caustics','sand','asphalt','glass skyline','metal marina','fabric tents'], lighting: ['sunrise','bright summer','gold hour','fireworks night','storm'], lods: [0,1,2,3,4], collision: true, navmesh: true,
    spatialAudio: true, reducedMotionAlternative: 'Calm water shader, reduced crowd density and no rapid camera effects.', rights: 'original', status: 'requested',
  },
  {
    id: 'world-memory-echo', packId: 'world-memory', kind: 'vfx',
    name: 'World Memory Echo', scene: 'Shows past player decisions as transparent time-layer silhouettes, object-state comparisons and environmental echoes without reproducing real private people.',
    quality: ['cinematic','gameplay','mobile','xr'], realism: 'stylized-memory',
    materials: ['transparent depth shader','holographic edge','temporal dissolve'], lighting: ['local emissive'], lods: [0,1,2], collision: false, navmesh: false,
    reducedMotionAlternative: 'Static before/after cards and text narration.', rights: 'original', status: 'requested',
  },
]

export function validateAssetForgeRequest(asset: AssetForgeRequest) {
  const problems: string[] = []
  if (!asset.name.trim() || !asset.scene.trim()) problems.push('missing-description')
  if (!asset.quality.length) problems.push('missing-quality-tier')
  if (asset.lods.length < 2 && asset.kind === 'environment') problems.push('environment-needs-lods')
  if (asset.rights === 'licensed-required' && asset.status === 'approved') problems.push('licensed-asset-needs-external-rights-proof')
  return { ok: problems.length === 0, problems }
}

export const ASSET_APPROVAL_PIPELINE = [
  'CONCEPT + RIGHTS CHECK',
  'GENERATE / MODEL / CAPTURE',
  'PBR MATERIAL + LIGHTING PASS',
  'COLLISION + NAVMESH + ANIMATION',
  'LOD + TEXTURE STREAMING',
  'MOBILE + XR ALTERNATIVES',
  'ACCESSIBILITY / REDUCED MOTION',
  'PERFORMANCE BENCHMARK',
  'VISUAL QA',
  'APPROVED FOR BUILD',
] as const
