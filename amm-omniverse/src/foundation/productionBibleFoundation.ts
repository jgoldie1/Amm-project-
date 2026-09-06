export const PRODUCTION_FORMATS = ['reel','episode','feature-30','feature-60','feature-90','feature-120'] as const
export type ProductionFormat = (typeof PRODUCTION_FORMATS)[number]

export const CONTENT_LANES = ['general','g','pg','pg-13','r','after-dark'] as const
export type ContentLane = (typeof CONTENT_LANES)[number]

export const PLACEMENT_TYPES = [
  'physical-prop',
  'background',
  'virtual-3d',
  'streetverse-interactive',
  'holographic-overlay',
  'dynamic-zone',
] as const
export type PlacementType = (typeof PLACEMENT_TYPES)[number]

export interface CharacterBibleEntry {
  id: string
  displayName: string
  age: number
  appearance: string[]
  voiceProfileId?: string
  wardrobe: string[]
  relationships: string[]
  allowedTransformations: string[]
}

export interface ContinuityState {
  sceneId: string
  shotId: string
  characterIds: string[]
  wardrobeByCharacter: Record<string,string[]>
  props: string[]
  vehicles: string[]
  locationId: string
  weather?: string
  timeOfDay?: string
  priorSceneConsequences: string[]
}

export interface RightsGrant {
  id: string
  subjectType: 'likeness'|'voice'|'music'|'brand'|'product'|'3d-asset'|'location'
  subjectId: string
  territories: string[]
  startsAt: string
  expiresAt?: string
  evidenceRef: string
  approved: boolean
}

export interface ProductPlacement {
  id: string
  type: PlacementType
  brandId: string
  productId: string
  assetIds: string[]
  sceneId: string
  shotId: string
  coordinates?: [number,number,number]
  durationMs: number
  prominence: 'background'|'supporting'|'featured'
  rightsGrantIds: string[]
  campaignStartsAt?: string
  campaignEndsAt?: string
  territories: string[]
  disclosureRequired: boolean
  creatorApproved: boolean
  replaceable: boolean
}

export interface AccessibilityBible {
  captionsRequired: boolean
  transcriptRequired: boolean
  audioDescriptionTarget: boolean
  readableUiRequired: boolean
  accessibleControlsRequired: boolean
}

export interface RatingSafetyBible {
  lane: ContentLane
  descriptors: string[]
  verifiedAdultAccessRequired: boolean
  hideFromMinorDiscovery: boolean
  explicitSexualGenerationEnabled: false
  sexualContentInvolvingMinorsAllowed: false
}

export interface ProductionBible {
  id: string
  version: number
  title: string
  format: ProductionFormat
  story: { logline: string; worldRules: string[]; chronology: string[] }
  characters: CharacterBibleEntry[]
  visual: { cinematography: string[]; lighting: string[]; locations: string[]; vfxRules: string[] }
  audio: { dialogueRules: string[]; soundtrackRefs: string[]; ambience: string[]; sfx: string[] }
  continuity: ContinuityState[]
  rights: RightsGrant[]
  placements: ProductPlacement[]
  accessibility: AccessibilityBible
  ratingSafety: RatingSafetyBible
  approvedShotIds: string[]
  cleanArchivalMasterRequired: true
}

export interface ShotGenerationContext {
  productionId: string
  bibleVersion: number
  sceneId: string
  shotId: string
  characterIds: string[]
  rightsGrantIds: string[]
  continuity: ContinuityState
  placementIds: string[]
}

export interface PlacementEligibilityInput {
  placement: ProductPlacement
  rights: RightsGrant[]
  territory: string
  nowIso: string
}

const isWithinWindow=(startsAt:string|undefined,endsAt:string|undefined,nowMs:number)=>{
  if(startsAt && Date.parse(startsAt)>nowMs)return false
  if(endsAt && Date.parse(endsAt)<nowMs)return false
  return true
}

export const canRenderPlacement=({placement,rights,territory,nowIso}:PlacementEligibilityInput):boolean=>{
  if(!placement.creatorApproved)return false
  if(!placement.territories.includes(territory))return false
  if(!isWithinWindow(placement.campaignStartsAt,placement.campaignEndsAt,Date.parse(nowIso)))return false
  return placement.rightsGrantIds.every((grantId)=>{
    const grant=rights.find((candidate)=>candidate.id===grantId)
    if(!grant?.approved || !grant.territories.includes(territory))return false
    return isWithinWindow(grant.startsAt,grant.expiresAt,Date.parse(nowIso))
  })
}

export const canExposeToMinorDiscovery=(rating:RatingSafetyBible):boolean=>
  !rating.verifiedAdultAccessRequired && !rating.hideFromMinorDiscovery && rating.lane!=='after-dark' && rating.lane!=='r'

export const createShotGenerationContext=(bible:ProductionBible,sceneId:string,shotId:string):ShotGenerationContext=>{
  const continuity=bible.continuity.find((state)=>state.sceneId===sceneId && state.shotId===shotId)
  if(!continuity)throw new Error(`Missing continuity state for ${sceneId}/${shotId}`)
  const placementIds=bible.placements.filter((placement)=>placement.sceneId===sceneId && placement.shotId===shotId).map(({id})=>id)
  const rightsGrantIds=[...new Set(bible.placements.filter((placement)=>placementIds.includes(placement.id)).flatMap((placement)=>placement.rightsGrantIds))]
  return { productionId:bible.id,bibleVersion:bible.version,sceneId,shotId,characterIds:continuity.characterIds,rightsGrantIds,continuity,placementIds }
}

export const COMMERCE_AUTHORITY_RULES = [
  'Creative clients may visualize products but never become authoritative for payment verification',
  'Checkout, refunds, settlement, seller payable balance, campaign budget and revenue allocation remain server-authoritative',
  'Dynamic holographic placement may render only inside designated placement zones with rights and creator approval',
  'A clean archival master is preserved before dynamic product placement',
] as const
