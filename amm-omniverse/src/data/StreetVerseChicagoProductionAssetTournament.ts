import {createProductionTransformationManifest,type AssetTransformationRequest} from './GenieBottleAssetTransformationEngine'

export const CIRCLE_PARK_PLACEHOLDER_TRANSFORMATION_REQUEST:AssetTransformationRequest={
  id:'streetverse-chicago-circle-park-hero-v1',
  sourceAssetId:'circle-park-current-placeholder-set',
  kind:'environment',
  cityId:'chicago',
  neighborhoodId:'Circle Park / Roosevelt-Taylor-Pilsen benchmark',
  target:'web',
  defects:[
    'placeholder/blockout geometry',
    'insufficient PBR surface detail',
    'insufficient Chicago-specific environmental density',
    'weak contact grounding/reflection depth',
    'limited production animation/traffic/crowd polish',
    'holographic presentation not yet fused with physical-world realism',
  ],
  requestedLook:'high-end original open-world Chicago realism with StreetVerse holographic identity',
  holographicLevel:'integrated',
  referenceIds:[],
  oracleApprovedReferenceIds:[],
}

export const CIRCLE_PARK_GENIE_TOURNAMENT=createProductionTransformationManifest(
  CIRCLE_PARK_PLACEHOLDER_TRANSFORMATION_REQUEST,
)

export const CIRCLE_PARK_PRODUCTION_RECIPE=CIRCLE_PARK_GENIE_TOURNAMENT.recipeWinner

export const CIRCLE_PARK_PRODUCTION_ASSET_WAVE=[
  'hero-player-character',
  'circle-park-ground-and-landscape',
  'roosevelt-road-street-kit',
  'taylor-street-pilsen-building-kit',
  'street-furniture-and-signage',
  'vegetation-and-wind-kit',
  'parked-and-drivable-vehicle-set',
  'pedestrian-crowd-set',
  'garage-repair-interaction-set',
  'storefront-and-apartment-interior-kit',
  'night-lighting-and-wet-surface-kit',
  'holographic-interaction-and-ar-anchor-kit',
] as const

export const TOMORROW_PRODUCTION_EFFECT={
  immediate:[
    'one reviewed visual direction instead of four competing art styles',
    'four-sample comparison is repeatable for every weak or placeholder asset',
    'mobile/web/cinematic variants derive from one certified master direction',
    'holographic identity is layered onto believable physical assets instead of replacing them',
    'bad candidates can be rejected before expensive integration work',
  ],
  stillRequiresRealEvidence:[
    'actual generated or artist-authored asset files',
    'PBR textures/materials and production LODs',
    'runtime screenshots/video',
    'frame-time evidence on target devices',
    'Asset Passport provenance/rights evidence',
    'human visual approval',
  ],
} as const
