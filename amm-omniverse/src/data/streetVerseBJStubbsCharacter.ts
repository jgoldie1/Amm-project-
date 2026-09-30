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
  hair:'long dark pulled-back locs/braids extending behind the shoulders; preserve the mature current-era silhouette across scenes',
  facialHair:'full salt-and-pepper beard with strong gray concentration through chin and lower sides',
  expression:'serious / stoic by default; warm range available in dialogue',
  body:'lean mature adult male; slim-athletic torso and arms; grounded realistic proportions; not superhero exaggerated',
  wardrobe:['fitted black ONLY YAHAVAH CAN JUDGE ME tee','small gold chain / round pendant','dark pants','black footwear','optional black/gold tactical outer layer'],
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

export const BJ_STUBBS_CURRENT_REFERENCE_LOCK={
 source:'user-authorized current-era walking video',
 era:'current',
 silhouette:'lean mature Black man with long pulled-back locs and salt-and-pepper beard',
 faceNotes:['leaner jaw','mature cheek definition','natural eye spacing','full gray-forward beard','no glasses by default'],
 hairNotes:['long pulled-back locs/braids','rear length visible past shoulders','dark hair with subtle age variation'],
 bodyNotes:['slim-athletic torso','natural shoulders','lean arms','realistic street posture'],
 defaultOutfit:['black ONLY YAHAVAH CAN JUDGE ME tee','dark pants','small gold round pendant'],
 excludedFromDefault:['beanie','eyeglasses','bulky tactical backpack','oversized tactical jacket'],
 useForCurrentEraConsistency:true,
 photoMatchedHeadStillRequiredForCertifiedLikeness:true,
 currentProceduralVersion:'bj-realism-v4',
 mobileFallbackVersion:'bj-v4-mobile',
 conversationRealism:true,
 outfitIdentitySeparated:true,
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
  heightScale:1.01,
  shoulderScale:1.015,
  torsoScale:.965,
  legScale:1.00,
  headScale:[.93,1.07,.90],
 },
 face:{
  jawWidth:1.00,
  chinWidth:.98,
  cheekWidth:.97,
  eyeSpacing:.99,
  eyeScale:.98,
  noseWidth:.99,
  noseLength:1.04,
  browHeight:1.01,
  mouthWidth:1.00,
 },
 appearance:{
  skinHex:0x70462f,
  hairHex:0x17110f,
  eyeHex:0x2b1b14,
  hairPreset:'pulled-back-locs',
  facialHairPreset:'full-beard',
  grayHairAmount:.48,
 },
 wardrobe:{
  primary:'fitted black ONLY YAHAVAH CAN JUDGE ME tee',
  secondary:'dark casual streetwear',
  accent:'small gold pendant',
  signatureItems:['small round gold pendant','long pulled-back locs','salt-and-pepper beard','ONLY YAHAVAH CAN JUDGE ME tee','optional black/gold tactical jacket'],
 },
 animation:{
  idleStyle:'relaxed',
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
