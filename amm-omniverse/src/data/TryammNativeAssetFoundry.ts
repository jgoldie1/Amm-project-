import type {AssetKind} from './TryammAssetForge'

export type NativeFoundryAssetClass='street-kit'|'building-kit'|'prop-kit'|'vegetation-kit'|'vehicle-blockout'|'holographic-interaction-kit'
export type NativeFoundryQualityTier='mobile'|'web'|'cinematic'

export interface NativeFoundryRequest{
  id:string
  assetClass:NativeFoundryAssetClass
  kind:AssetKind
  cityStyle:string
  neighborhoodStyle?:string
  qualityTier:NativeFoundryQualityTier
  holographicLevel:'off'|'subtle'|'integrated'|'hero'
}

export const TRYAMM_NATIVE_ASSET_FOUNDRY={
  id:'tryamm-native',
  ownership:'TRYAMM-authored procedural generation, recipes, QA rules, optimization and output manifests.',
  externalApiRequired:false,
  creditsRequired:false,
  outputs:['glb','json-manifest','collision-metadata','semantic-tags','lod-plan','asset-passport-seed'] as const,
  capabilities:[
    'parametric streets/sidewalks/curbs',
    'modular building massing and facade kits',
    'street furniture and prop kits',
    'procedural vegetation blockouts',
    'vehicle blockout geometry',
    'PBR material parameter recipes',
    'holographic interaction anchors and emissive layers',
    'semantic gameplay anchors',
    'collision metadata',
    'mobile/web/cinematic LOD plans',
    'deterministic four-sample generation',
    'provider-neutral comparison against optional external generators',
    'Mind Over Matter clean-room fallback packs for blocked/uncleared external references',
  ] as const,
  limitations:[
    'The native procedural foundry is a production baseline, not a proprietary generative-AI foundation model.',
    'Photoreal scanned surfaces, hero faces, complex hair/cloth and specialized animation still need authored/captured/generated source assets.',
    'Generated geometry must still pass runtime, visual, rights/provenance and human review before release.',
  ] as const,
  providerPriority:['tryamm-native','licensed-external-provider','manual-artist'] as const,
} as const

export const NATIVE_FOUNDRY_RESOURCE_STACK={
  geometry:'owned deterministic procedural geometry and modular-kit recipes',
  materials:'owned PBR parameter recipes with replaceable texture slots',
  motion:'Mind Over Matter original motion blueprints + owned/cleared animation retargeting',
  originality:'Mind Over Matter clean-room replacement specs + procedural fallback pack when rights/source gates block an external reference',
  references:'Quantum Crawler metadata-only discovery + Oracle source/rights review',
  optimization:'Quantum Speed Engine batching + content-addressable cache + LOD/compression',
  holographics:'StreetVerse Holographic Engine material/interaction layer',
  certification:'Asset Passport + performance + accessibility + human visual approval',
} as const

export function nativeFoundryCanAttempt(request:NativeFoundryRequest){
  return ['street-kit','building-kit','prop-kit','vegetation-kit','vehicle-blockout','holographic-interaction-kit'].includes(request.assetClass)
}
