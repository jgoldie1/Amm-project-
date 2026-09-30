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
