export type BiometricInput='face-landmarks'|'face-geometry'|'fingerprint'|'voiceprint'|'hand-geometry'
export type AvatarCapturePurpose='avatar-mesh-fit'|'avatar-texture-wrap'|'accessibility-avatar'
export type AvatarCaptureView='camera-live'|'front-photo'|'left-photo'|'right-photo'|'back-photo'

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
  purpose:'Create a user-controlled 3D avatar by fitting a mesh/texture to voluntarily supplied camera frames or photos.',
  prohibitedPurposes:[
    'identify a person',
    'search for a person',
    'match a face against a database',
    'fingerprint identification',
    'emotion inference',
    'race/ethnicity/religion/health/political/sexual-orientation inference',
    'surveillance',
    'law-enforcement identification',
    'advertising profiling from biometric traits',
    'sale or trade of biometric data',
    'training general-purpose models on user biometric captures',
  ] as const,
  defaultProcessing:'on-device/local-browser',
  defaultRawCaptureRetention:'session-only',
  deletion:'User can discard captures immediately; saved avatar derivatives must remain user-deletable.',
  disclosure:'Do not disclose biometric identifiers/information except with a legally sufficient authorization or as required by law.',
  security:'Encrypt any explicitly saved upload in transit and at rest; separate it from public profile data and use least-privilege access.',
  noFingerprintCapture:true,
  noIdentityRecognition:true,
  noCrossUserMatching:true,
} as const

function emit(name:string,detail:unknown){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}

export function createBiometricAvatarConsent(input:{purpose:AvatarCapturePurpose;views:AvatarCaptureView[];adultOrGuardianAuthorized:boolean;saveRawPhotos?:boolean}):BiometricAvatarConsent{
  return {
    version:'2026-09-01',
    granted:true,
    adultOrGuardianAuthorized:input.adultOrGuardianAuthorized,
    purpose:input.purpose,
    inputs:['face-landmarks','face-geometry'],
    views:input.views,
    localProcessingPreferred:true,
    identityRecognition:false,
    identityMatching:false,
    emotionInference:false,
    protectedAttributeInference:false,
    fingerprintCollection:false,
    sellOrTradeBiometrics:false,
    advertisingUse:false,
    modelTrainingUse:false,
    rawPhotoRetention:input.saveRawPhotos?'user-save-explicit':'session-only',
    derivedMeshRetention:'until-user-deletes',
    createdAt:new Date().toISOString(),
  }
}

export function canProcessAvatarBiometrics(consent:BiometricAvatarConsent|undefined){
  if(!consent?.granted)return {ok:false,reason:'Explicit biometric/avatar consent is required before camera, landmark, or face-geometry processing.'} as const
  if(!consent.adultOrGuardianAuthorized)return {ok:false,reason:'Adult or legally authorized guardian approval is required.'} as const
  if(consent.identityRecognition||consent.identityMatching||consent.fingerprintCollection||consent.emotionInference||consent.protectedAttributeInference)return {ok:false,reason:'Requested processing exceeds the avatar-only privacy boundary.'} as const
  return {ok:true,reason:'Avatar-only local processing permitted by this consent record.'} as const
}

export function requestPrivacySafeAvatarCapture(detail:{purpose:AvatarCapturePurpose;views:AvatarCaptureView[];consent:BiometricAvatarConsent}){
  const gate=canProcessAvatarBiometrics(detail.consent)
  if(!gate.ok){emit('tryamm:avatar-capture-blocked',{...gate,createdAt:new Date().toISOString()});return gate}
  emit('tryamm:avatar-capture-authorized',{purpose:detail.purpose,views:detail.views,localOnly:true,noRecognition:true,noFingerprint:true,createdAt:new Date().toISOString()})
  return gate
}

export function requestAvatarBiometricDeletion(scope:'raw-captures'|'derived-avatar'|'all'='all'){
  emit('tryamm:avatar-biometric-delete-request',{scope,permanent:true,createdAt:new Date().toISOString()})
}

export function installBiometricAvatarPrivacyRuntime(){
  if(typeof window==='undefined')return
  emit('tryamm:avatar-biometric-privacy-ready',{
    policy:BIOMETRIC_AVATAR_PRIVACY_POLICY,
    allowedCaptureViews:['camera-live','front-photo','left-photo','right-photo','back-photo'],
    pipeline:['explicit-consent','local-landmarks','multi-view-fit','mesh-wrap','rig-retarget','user-preview','user-save-or-delete'],
    noRecognition:true,
    noFingerprint:true,
  })
}
