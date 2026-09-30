export const STREETVERSE_FACE_CHANNELS=[
 'blinkLeft','blinkRight','lookLeft','lookRight','lookUp','lookDown',
 'jawOpen','mouthSmile','mouthFrown','mouthWide','mouthNarrow',
 'browInnerUp','browDownLeft','browDownRight','cheekRaise',
] as const

export type StreetVerseFaceChannel=typeof STREETVERSE_FACE_CHANNELS[number]
export type StreetVerseFacePose=Partial<Record<StreetVerseFaceChannel,number>>

export const STREETVERSE_HEAD_SLOT_CONTRACT={
 rootName:'character-head-slot',
 preserveParentRig:'rig-head',
 preserveBodyRig:true,
 preserveInventory:true,
 preserveProgression:true,
 preserveMissions:true,
 preserveEraIdentity:true,
 maxHeadScaleDelta:.12,
} as const

export const BJ_STUBBS_HEAD_ASSETS={
 currentProcedural:'streetverse-hero-player',
 currentPhotoMatched:'streetverse-bj-stubbs-head-current-v5',
 youngerPhotoMatched:'streetverse-bj-stubbs-head-younger-v5',
} as const

export const BJ_STUBBS_V5_HEAD_PROFILE={
 characterId:'bj-stubbs',
 version:'bj-v5-photo-match-ready',
 currentEra:{
  headAssetId:BJ_STUBBS_HEAD_ASSETS.currentPhotoMatched,
  referenceState:'awaiting-new-authorized-photo',
  bodyAssetId:'streetverse-hero-player',
  preserveLongLocs:true,
  preserveSaltPepperBeard:true,
 },
 youngerEra:{
  headAssetId:BJ_STUBBS_HEAD_ASSETS.youngerPhotoMatched,
  referenceState:'hardball+melrose-reference-lock',
  preserveEraHair:true,
  preserveEraFacialHair:true,
 },
 requiredFaceChannels:STREETVERSE_FACE_CHANNELS,
 materialTargets:{
  skin:'PBR skin base + roughness variation',
  eyes:'separate sclera / iris / pupil / corneal highlight',
  beard:'separate beard material or alpha-capable facial-hair layer',
  lips:'separate natural lip material',
 },
 photoMatch:{
  authorizedReferenceRequired:true,
  preferredViews:['front-neutral','slight-left-neutral','slight-right-neutral'],
  optionalViews:['front-smile','profile-left','profile-right'],
  doNotResetGameplayIdentity:true,
 },
} as const
