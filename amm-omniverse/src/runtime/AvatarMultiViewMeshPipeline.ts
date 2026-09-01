import { canProcessAvatarBiometrics, type BiometricAvatarConsent, type AvatarCaptureView } from './BiometricAvatarPrivacyRuntime'

export type AvatarMeshInput={
  view:AvatarCaptureView
  objectUrl:string
  width:number
  height:number
}

export type AvatarMeshJob={
  id:string
  consent:BiometricAvatarConsent
  captures:AvatarMeshInput[]
  targetAssetId:'player-hero-v1'|'npc-resident-premium-a'|'npc-resident-premium-b'|'npc-resident-premium-c'|'benny-holographic-host-v1'
  output:{mesh:'glb';rig:'humanoid';textures:'pbr';lods:4}
  localOnly:boolean
  deleteRawAfterFit:boolean
}

export const AVATAR_MULTI_VIEW_PIPELINE=[
  'CONSENT GATE',
  'FRONT / SIDE / BACK CAPTURE',
  'LOCAL LANDMARK ESTIMATE',
  'HEAD + BODY PROPORTION ESTIMATE',
  'NEUTRAL BASE MESH',
  'NON-IDENTITY GEOMETRY FIT',
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

export function validateAvatarMeshJob(job:AvatarMeshJob){
  const privacy=canProcessAvatarBiometrics(job.consent)
  if(!privacy.ok)return privacy
  if(!job.localOnly)return {ok:false,reason:'Avatar fitting defaults to local-only processing; remote processing needs a separate reviewed consent path.'} as const
  if(!job.deleteRawAfterFit&&job.consent.rawPhotoRetention!=='user-save-explicit')return {ok:false,reason:'Raw captures must be deleted after fitting unless the user explicitly chooses to save them.'} as const
  const views=new Set(job.captures.map(c=>c.view))
  if(!views.has('front-photo')&&!views.has('camera-live'))return {ok:false,reason:'A front-facing capture is required.'} as const
  if(job.captures.length>5)return {ok:false,reason:'Limit avatar fitting to five user-supplied views per session.'} as const
  return {ok:true,reason:'Multi-view avatar mesh job meets privacy and capture requirements.'} as const
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
  }
}
