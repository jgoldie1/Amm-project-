import {createStreetVerseCharacterDNA} from './streetVerseCharacterDNA'

export type StreetVerseCharacterEra='current'|'younger'
export type StreetVerseCharacterStatus='PREVIEW'|'REFERENCE_LOCKED'|'LIKELINESS_PASS'|'CERTIFIED'

export const BJ_STUBBS_CHARACTER={
 id:'bj-stubbs',
 displayName:'BJ Stubbs',
 family:'Stubbs',
 role:'Security & Operations',
 affiliation:'Stubbs Family / StreetVerse Security',
 status:'REFERENCE_LOCKED' as StreetVerseCharacterStatus,
 firstPlayableCharacter:true,
 currentEra:'current' as StreetVerseCharacterEra,
 visualLock:{
  agePresentation:'mature middle-aged',
  skinTone:'medium-dark brown',
  face:'strong mature face; consistent jaw, nose, eye spacing and cheek structure',
  hair:'dark pulled-back locs / short twists; preserve silhouette across scenes',
  facialHair:'full dark beard with subtle gray flecks',
  expression:'serious / stoic by default; warm range available in dialogue',
  body:'adult male; grounded realistic proportions; not superhero exaggerated',
  wardrobe:['black layered streetwear','black tactical outer layer','gold accents','gold chain / pendant','dark pants','black footwear'],
  signatureText:'ONLY YAHAVAH CAN JUDGE ME',
  continuityRule:'Do not change face, age, hairline, loc pattern, beard silhouette, skin tone or core wardrobe between scenes unless an explicit era/outfit variant is selected.',
 },
 gameplay:{
  specialties:['Protection','Undercover','Intelligence','Logistics'],
  starterLocation:'Circle Park / Chicago',
  missionLane:'Meet the Stubbs • Security & Operations',
  cameraPriority:'recognizable face at conversational distance',
 },
 animation:{
  locomotion:['idle','walk','jog','turn','enter-vehicle','exit-vehicle'],
  interaction:['talk','listen','point','wave','phone','inspect'],
  face:['blink','eye-saccade','jaw-talk','brow-focus','subtle-smile'],
  future:['full-body mocap','facial blendshapes','photo-matched head mesh'],
 },
 likenessPipeline:{
  authorizedReference:true,
  useReferenceForConsistency:true,
  photoMatchedHeadRequiredForCertifiedLikeness:true,
  proceduralV1IsNotCertifiedLikeness:true,
  rawReferenceRetention:'follow biometric avatar privacy runtime',
 },
} as const

export const BJ_STUBBS_ASSET_IDS={
 current:'streetverse-hero-player',
 futurePhotoMatched:'streetverse-bj-stubbs-photomatched',
} as const


export const BJ_STUBBS_DNA=createStreetVerseCharacterDNA({
 id:'bj-stubbs',
 displayName:'BJ Stubbs',
 role:'Security & Operations',
 identityContinuityKey:'bj-stubbs',
 body:{
  heightScale:1.02,
  shoulderScale:1.08,
  torsoScale:1.03,
  legScale:1.00,
  headScale:[.94,1.09,.91],
 },
 face:{
  jawWidth:1.08,
  chinWidth:1.04,
  cheekWidth:1.02,
  eyeSpacing:1.00,
  eyeScale:.98,
  noseWidth:1.03,
  noseLength:1.05,
  browHeight:1.00,
  mouthWidth:1.02,
 },
 appearance:{
  skinHex:0x70462f,
  hairHex:0x17110f,
  eyeHex:0x2b1b14,
  hairPreset:'pulled-back-locs',
  facialHairPreset:'full-beard',
  grayHairAmount:.12,
 },
 wardrobe:{
  primary:'black layered streetwear',
  secondary:'charcoal tactical layer',
  accent:'gold',
  signatureItems:['gold chain / pendant','black tactical backpack','ONLY YAHAVAH CAN JUDGE ME tee'],
 },
 animation:{
  idleStyle:'guarded',
  walkStyle:'grounded',
  talkStyle:'calm',
  facial:['blink','eye-saccade','jaw-talk','brow-focus','subtle-smile'],
 },
 eras:[
  {id:'current',label:'Current BJ',assetId:'streetverse-hero-player'},
  {id:'younger',label:'Younger BJ'},
 ],
 progression:{
  skillTracks:['Protection','Undercover','Intelligence','Logistics','Leadership','Mentoring'],
  outfitUnlocks:true,
  eraUnlocks:true,
  relationshipProgression:true,
 },
})
