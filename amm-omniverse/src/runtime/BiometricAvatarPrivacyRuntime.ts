export type BiometricInput='face-landmarks'|'face-geometry'|'fingerprint'|'voiceprint'|'hand-geometry'
export type AvatarCapturePurpose='avatar-mesh-fit'|'avatar-texture-wrap'|'accessibility-avatar'
export type AvatarCaptureView='camera-live'|'video-clip'|'front-photo'|'left-photo'|'right-photo'|'back-photo'

export type BiometricAvatarConsent={
  version:'2026-09-01'
  granted:boolean
  adultOrGuardianAuthorized:boolean
  purpose:AvatarCapturePurpose
  inputs:BiometricInput[]
  views:AvatarCaptureView[]
  localProcessingPreferred:true
  identityRecognition:false
  identityMatching:false
  emotionInference:false
  protectedAttributeInference:false
  fingerprintCollection:false
  sellOrTradeBiometrics:false
  advertisingUse:false
  modelTrainingUse:false
  rawPhotoRetention:'session-only'|'user-save-explicit'
  derivedMeshRetention:'until-user-deletes'|'session-only'
  createdAt:string
}

export const BIOMETRIC_AVATAR_PRIVACY_POLICY={
  productName:'TRYAMM StreetVerse Avatar Creator',
  purpose:'Create a user-controlled 3D avatar by fitting a mesh/texture to voluntarily supplied live camera frames, short video clips, or photos.',
  prohibitedPurposes:[
    'identify a person','search for a person','match a face against a database','fingerprint identification','emotion inference',
    'race/ethnicity/religion/health/political/sexual-orientation inference','surveillance','law-enforcement identification',
    'advertising profiling from biometric traits','sale or trade of biometric data','training general-purpose models on user biometric captures',
  ] as const,
  defaultProcessing:'on-device/local-browser',
  defaultRawCaptureRetention:'session-only',
  cameraVideoRetention:'none-after-processing',
  uploadedVideoRetention:'none-after-processing',
  cameraRecording:false,
  cameraServerUpload:false,
  uploadedVideoServerUpload:false,
  cameraFrameArchive:false,
  videoFrameArchive:false,
  deletion:'Live camera/video frames and uploaded video clips are ephemeral and must be discarded immediately after avatar fitting. Uploaded still photos are session-only by default and user-deletable; saving a still photo requires a separate explicit choice.',
  disclosure:'Do not disclose biometric identifiers/information except with a legally sufficient authorization or as required by law.',
  security:'Encrypt any explicitly saved still-photo upload in transit and at rest; separate it from public profile data and use least-privilege access.',
  noFingerprintCapture:true,
  noIdentityRecognition:true,
  noCrossUserMatching:true,
} as const

function emit(name:string,detail:unknown){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}

export function createBiometricAvatarConsent(input:{purpose:AvatarCapturePurpose;views:AvatarCaptureView[];adultOrGuardianAuthorized:boolean;saveRawPhotos?:boolean}):BiometricAvatarConsent{
  const hasEphemeralVideo=input.views.includes('camera-live')||input.views.includes('video-clip')
  return {
    version:'2026-09-01',granted:true,adultOrGuardianAuthorized:input.adultOrGuardianAuthorized,purpose:input.purpose,
    inputs:['face-landmarks','face-geometry'],views:input.views,localProcessingPreferred:true,
    identityRecognition:false,identityMatching:false,emotionInference:false,protectedAttributeInference:false,fingerprintCollection:false,
    sellOrTradeBiometrics:false,advertisingUse:false,modelTrainingUse:false,
    rawPhotoRetention:hasEphemeralVideo?'session-only':input.saveRawPhotos?'user-save-explicit':'session-only',
    derivedMeshRetention:'until-user-deletes',createdAt:new Date().toISOString(),
  }
}

export function canProcessAvatarBiometrics(consent:BiometricAvatarConsent|undefined){
  if(!consent?.granted)return {ok:false,reason:'Explicit biometric/avatar consent is required before camera, video, landmark, or face-geometry processing.'} as const
  if(!consent.adultOrGuardianAuthorized)return {ok:false,reason:'Adult or legally authorized guardian approval is required.'} as const
  if(consent.identityRecognition||consent.identityMatching||consent.fingerprintCollection||consent.emotionInference||consent.protectedAttributeInference)return {ok:false,reason:'Requested processing exceeds the avatar-only privacy boundary.'} as const
  if((consent.views.includes('camera-live')||consent.views.includes('video-clip'))&&consent.rawPhotoRetention==='user-save-explicit')return {ok:false,reason:'Camera/video input cannot be retained as raw media. It must be deleted after avatar fitting.'} as const
  return {ok:true,reason:'Avatar-only local processing permitted by this consent record.'} as const
}

export function requestPrivacySafeAvatarCapture(detail:{purpose:AvatarCapturePurpose;views:AvatarCaptureView[];consent:BiometricAvatarConsent}){
  const gate=canProcessAvatarBiometrics(detail.consent)
  if(!gate.ok){emit('tryamm:avatar-capture-blocked',{...gate,createdAt:new Date().toISOString()});return gate}
  const ephemeralVideo=detail.views.includes('camera-live')||detail.views.includes('video-clip')
  emit('tryamm:avatar-capture-authorized',{purpose:detail.purpose,views:detail.views,localOnly:true,noRecognition:true,noFingerprint:true,noRecording:ephemeralVideo,noServerUpload:ephemeralVideo,deleteRawImmediatelyAfterFit:ephemeralVideo,createdAt:new Date().toISOString()})
  return gate
}

export function requestAvatarBiometricDeletion(scope:'raw-captures'|'derived-avatar'|'all'='all'){
  emit('tryamm:avatar-biometric-delete-request',{scope,permanent:true,createdAt:new Date().toISOString()})
}

export function completeEphemeralAvatarVideoProcessing(source:'camera-live'|'video-clip'='camera-live'){
  requestAvatarBiometricDeletion('raw-captures')
  emit('tryamm:avatar-video-ephemeral-complete',{source,rawFrameRetained:false,recordingRetained:false,serverCopyRetained:false,createdAt:new Date().toISOString()})
}

export function installBiometricAvatarPrivacyRuntime(){
  if(typeof window==='undefined')return
  emit('tryamm:avatar-biometric-privacy-ready',{
    policy:BIOMETRIC_AVATAR_PRIVACY_POLICY,
    allowedCaptureViews:['camera-live','video-clip','front-photo','left-photo','right-photo','back-photo'],
    pipeline:['explicit-consent','local-landmarks','multi-view-fit','mesh-wrap','rig-retarget','user-preview','user-save-or-delete'],
    videoPrivacy:['no-recording','no-server-upload','ephemeral-frames','delete-after-fit'],
    noRecognition:true,noFingerprint:true,
  })
}
