import { canProcessAvatarBiometrics, type BiometricAvatarConsent, type AvatarCaptureView } from './BiometricAvatarPrivacyRuntime'

export type AvatarMeshInput={
  view:AvatarCaptureView
  objectUrl:string
  width:number
  height:number
}

export type RearSynthesisMode='captured'|'neutral-hairstyle-template'|'side-view-assisted'

export type AvatarMeshJob={
  id:string
  consent:BiometricAvatarConsent
  captures:AvatarMeshInput[]
  targetAssetId:'player-hero-v1'|'npc-resident-premium-a'|'npc-resident-premium-b'|'npc-resident-premium-c'|'benny-holographic-host-v1'
  output:{mesh:'glb';rig:'humanoid';textures:'pbr';lods:4}
  localOnly:boolean
  deleteRawAfterFit:boolean
  rearSynthesisMode:RearSynthesisMode
}

export const AVATAR_CAPTURE_GUIDANCE={
  required:['front-photo OR camera-live'],
  recommended:['left-photo OR right-photo'],
  optional:['back-photo'],
  note:'A rear-head photo is never required. When absent, the rear head/hair region is completed from a neutral base mesh and the user-selected hairstyle, optionally assisted by side-view geometry. No identity inference or database matching is used.',
} as const

export const AVATAR_MULTI_VIEW_PIPELINE=[
  'CONSENT GATE',
  'FRONT CAPTURE REQUIRED; SIDE VIEWS RECOMMENDED; BACK OPTIONAL',
  'LOCAL LANDMARK ESTIMATE',
  'HEAD + BODY PROPORTION ESTIMATE',
  'NEUTRAL BASE MESH',
  'NON-IDENTITY GEOMETRY FIT',
  'OPTIONAL REAR-HEAD SYNTHESIS FROM BASE MESH + HAIRSTYLE',
  'UV + TEXTURE WRAP',
  'SKIN / HAIR MATERIAL PASS',
  'HUMANOID AUTO-RIG',
  'WEIGHT PAINT VALIDATION',
  'FACIAL BLENDSHAPE FIT',
  'LOCOMOTION RETARGET',
  'LOD GENERATION',
  'USER PREVIEW',
  'DELETE RAW CAPTURES OR EXPLICIT SAVE',
  'RELEASE TO STREETVERSE',
] as const

function chooseRearSynthesisMode(captures:AvatarMeshInput[]):RearSynthesisMode{
  const views=new Set(captures.map(c=>c.view))
  if(views.has('back-photo'))return 'captured'
  if(views.has('left-photo')||views.has('right-photo'))return 'side-view-assisted'
  return 'neutral-hairstyle-template'
}

export function validateAvatarMeshJob(job:AvatarMeshJob){
  const privacy=canProcessAvatarBiometrics(job.consent)
  if(!privacy.ok)return privacy
  if(!job.localOnly)return {ok:false,reason:'Avatar fitting defaults to local-only processing; remote processing needs a separate reviewed consent path.'} as const
  if(!job.deleteRawAfterFit&&job.consent.rawPhotoRetention!=='user-save-explicit')return {ok:false,reason:'Raw captures must be deleted after fitting unless the user explicitly chooses to save them.'} as const
  const views=new Set(job.captures.map(c=>c.view))
  if(!views.has('front-photo')&&!views.has('camera-live'))return {ok:false,reason:'A front-facing capture is required.'} as const
  if(job.captures.length>5)return {ok:false,reason:'Limit avatar fitting to five user-supplied views per session.'} as const
  return {ok:true,reason:`Avatar mesh job accepted. Back-of-head capture is optional; rear completion mode: ${job.rearSynthesisMode}.`} as const
}

export function createAvatarMeshJob(input:{consent:BiometricAvatarConsent;captures:AvatarMeshInput[];targetAssetId:AvatarMeshJob['targetAssetId']}):AvatarMeshJob{
  return {
    id:`avatar-mesh-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    consent:input.consent,
    captures:input.captures,
    targetAssetId:input.targetAssetId,
    output:{mesh:'glb',rig:'humanoid',textures:'pbr',lods:4},
    localOnly:true,
    deleteRawAfterFit:input.consent.rawPhotoRetention==='session-only',
    rearSynthesisMode:chooseRearSynthesisMode(input.captures),
  }
}
