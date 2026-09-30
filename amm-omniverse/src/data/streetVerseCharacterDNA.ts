export type StreetVerseCharacterEraId='current'|'younger'|'older'|string
export type StreetVerseHairPreset='pulled-back-locs'|'short-locs'|'close-crop'|'waves'|'braids'|'bald'|'custom'
export type StreetVerseFacialHairPreset='full-beard'|'goatee'|'mustache'|'stubble'|'clean'|'custom'

export type StreetVerseCharacterDNA=Readonly<{
 id:string
 displayName:string
 role:string
 identityContinuityKey:string
 body:Readonly<{
  heightScale:number
  shoulderScale:number
  torsoScale:number
  legScale:number
  headScale:readonly [number,number,number]
 }>
 face:Readonly<{
  jawWidth:number
  chinWidth:number
  cheekWidth:number
  eyeSpacing:number
  eyeScale:number
  noseWidth:number
  noseLength:number
  browHeight:number
  mouthWidth:number
 }>
 appearance:Readonly<{
  skinHex:number
  hairHex:number
  eyeHex:number
  hairPreset:StreetVerseHairPreset
  facialHairPreset:StreetVerseFacialHairPreset
  grayHairAmount:number
 }>
 wardrobe:Readonly<{
  primary:string
  secondary:string
  accent:string
  signatureItems:readonly string[]
 }>
 animation:Readonly<{
  idleStyle:'grounded'|'relaxed'|'energetic'|'guarded'
  walkStyle:'grounded'|'athletic'|'casual'|'formal'
  talkStyle:'calm'|'animated'|'reserved'
  facial:['blink','eye-saccade','jaw-talk','brow-focus','subtle-smile']
 }>
 eras:readonly Readonly<{id:StreetVerseCharacterEraId;label:string;assetId?:string}>[]
 progression:Readonly<{
  skillTracks:readonly string[]
  outfitUnlocks:boolean
  eraUnlocks:boolean
  relationshipProgression:boolean
 }>
}>

export const STREETVERSE_CHARACTER_RIG_CONTRACT={
 root:'character-rig-hero',
 pelvis:'rig-pelvis',
 spine:'rig-spine',
 head:'rig-head',
 leftArm:'rig-left-arm',
 rightArm:'rig-right-arm',
 leftLeg:'rig-left-leg',
 rightLeg:'rig-right-leg',
 face:{
  leftEyelid:'eyelid-left',
  rightEyelid:'eyelid-right',
  leftIris:'iris-left',
  rightIris:'iris-right',
  leftPupil:'pupil-left',
  rightPupil:'pupil-right',
  leftBrow:'brow-left',
  rightBrow:'brow-right',
  jaw:'jaw',
 },
} as const

export const STREETVERSE_CHARACTER_ANIMATION_SLOTS=[
 'idle','walk','jog','turn','talk','listen','point','wave','phone','inspect',
 'enter-vehicle','exit-vehicle','sit','celebrate','react','swim','sports'
] as const

export function createStreetVerseCharacterDNA(input:StreetVerseCharacterDNA){
 return input
}

export function cloneStreetVerseCharacterDNA(
 base:StreetVerseCharacterDNA,
 patch:{
  id:string
  displayName:string
  role:string
  body?:Partial<StreetVerseCharacterDNA['body']>
  face?:Partial<StreetVerseCharacterDNA['face']>
  appearance?:Partial<StreetVerseCharacterDNA['appearance']>
  wardrobe?:Partial<StreetVerseCharacterDNA['wardrobe']>
  animation?:Partial<StreetVerseCharacterDNA['animation']>
  eras?:StreetVerseCharacterDNA['eras']
  progression?:Partial<StreetVerseCharacterDNA['progression']>
 }
):StreetVerseCharacterDNA{
 return{
  ...base,
  id:patch.id,
  displayName:patch.displayName,
  role:patch.role,
  identityContinuityKey:patch.id,
  body:{...base.body,...patch.body},
  face:{...base.face,...patch.face},
  appearance:{...base.appearance,...patch.appearance},
  wardrobe:{...base.wardrobe,...patch.wardrobe},
  animation:{...base.animation,...patch.animation},
  eras:patch.eras||base.eras.map(era=>({...era,assetId:undefined})),
  progression:{...base.progression,...patch.progression},
 }
}

export const STREETVERSE_CHARACTER_FACTORY_VERSION='character-dna-v1'
