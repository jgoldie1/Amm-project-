export const GAME_ASSET_CATEGORIES = [
  'character','npc','clothing','animation','vehicle','transit','building','interior',
  'furniture','appliance','door-window','road','sidewalk','bridge','street-furniture',
  'tree','plant','terrain','water','weather','animal','bird','fish','reptile','amphibian',
  'insect','arachnid','livestock','prop','mission','sport','business','product','signage',
  'vfx','lighting','audio','music','ui-hologram','space','historical'
] as const

export type GameAssetCategory = typeof GAME_ASSET_CATEGORIES[number]
export type AssetReadiness = 'missing'|'discovered'|'quarantined'|'processing'|'qa'|'certified'|'rejected'
export type AssetWorld = 'streetverse'|'propertyverse'|'timemachine'|'spaceverse'|'middleverse'|'starverse'|'faithverse'|'holoverse'

export interface SemanticAssetPassport {
  id: string
  category: GameAssetCategory
  label: string
  sourcePath: string
  sourceSha256?: string
  format: 'glb'|'gltf'|'fbx'|'obj'|'blend'|'png'|'jpg'|'webp'|'ktx2'|'mp3'|'wav'|'ogg'|'other'
  readiness: AssetReadiness
  provenance: {
    source?: string
    license?: string
    authorized: boolean
    attributionRequired?: boolean
  }
  worlds: AssetWorld[]
  dimensionsMeters?: [number,number,number]
  capabilities: {
    pbr: boolean
    collision: boolean
    animated: boolean
    audio: boolean
    interactive: boolean
    accessible: boolean
  }
  mobile: {
    lods: number
    triangleBudget?: number
    textureBudgetMB?: number
    streamingPriority: 'critical'|'near'|'normal'|'background'
  }
  behaviorTags: string[]
  duplicateOf?: string
  notes: string[]
}

export const REQUIRED_GAME_ASSET_COVERAGE: Record<string, GameAssetCategory[]> = {
  people: ['character','npc','clothing','animation'],
  mobility: ['vehicle','transit'],
  city: ['building','interior','road','sidewalk','bridge','street-furniture'],
  interiors: ['furniture','appliance','door-window'],
  ecology: ['tree','plant','terrain','water','weather','animal','bird','fish','reptile','amphibian','insect','arachnid','livestock'],
  gameplay: ['prop','mission','sport'],
  commerce: ['business','product','signage'],
  presentation: ['vfx','lighting','audio','music','ui-hologram'],
  extendedWorlds: ['space','historical'],
}

export const ASSET_INGEST_STAGES = [
  'DISCOVER','FINGERPRINT','DEDUPLICATE','VERIFY_PROVENANCE','QUARANTINE_UNAUTHORIZED',
  'CLASSIFY','CONVERT_MASTER','VALIDATE_GEOMETRY','VALIDATE_PBR','GENERATE_COLLISION',
  'GENERATE_LODS','OPTIMIZE_TEXTURES','ATTACH_ANIMATION','ATTACH_AUDIO','ATTACH_BEHAVIOR',
  'ACCESSIBILITY_QA','MOBILE_BUDGET_QA','GUARDIAN_QA','REGISTER_WORLD_KIT'
] as const

export function canCertifyAsset(asset: SemanticAssetPassport): boolean {
  return asset.provenance.authorized &&
    !asset.duplicateOf &&
    asset.mobile.lods > 0 &&
    asset.capabilities.collision &&
    asset.readiness === 'qa'
}

export function missingCoverage(assets: SemanticAssetPassport[]): GameAssetCategory[] {
  const certified = new Set(assets.filter(a => a.readiness === 'certified').map(a => a.category))
  return GAME_ASSET_CATEGORIES.filter(category => !certified.has(category))
}
