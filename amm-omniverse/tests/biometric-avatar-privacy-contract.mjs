import fs from 'node:fs'

const privacy=fs.readFileSync(new URL('../src/runtime/BiometricAvatarPrivacyRuntime.ts',import.meta.url),'utf8')
const mesh=fs.readFileSync(new URL('../src/runtime/AvatarMultiViewMeshPipeline.ts',import.meta.url),'utf8')
const avatar=fs.readFileSync(new URL('../src/game/avatar/AvatarSystem.ts',import.meta.url),'utf8')
const creator=fs.readFileSync(new URL('../src/components/AvatarCreator.tsx',import.meta.url),'utf8')

for(const token of ['identityRecognition:false','identityMatching:false','fingerprintCollection:false','emotionInference:false','protectedAttributeInference:false','sellOrTradeBiometrics:false','modelTrainingUse:false','session-only','requestAvatarBiometricDeletion','cameraVideoRetention:\'none-after-processing\'','uploadedVideoRetention:\'none-after-processing\'','cameraRecording:false','cameraServerUpload:false','uploadedVideoServerUpload:false','cameraFrameArchive:false','videoFrameArchive:false','completeEphemeralAvatarVideoProcessing','rawFrameRetained:false','recordingRetained:false','serverCopyRetained:false','video-clip']){
  if(!privacy.includes(token))throw new Error(`Biometric avatar privacy contract missing ${token}`)
}
for(const token of ['CONSENT GATE','FRONT CAPTURE REQUIRED; SIDE VIEWS RECOMMENDED; BACK OPTIONAL','NON-IDENTITY GEOMETRY FIT','OPTIONAL REAR-HEAD SYNTHESIS FROM BASE MESH + HAIRSTYLE','HUMANOID AUTO-RIG','FACIAL BLENDSHAPE FIT','DELETE RAW CAPTURES OR EXPLICIT SAVE','localOnly:true','neutral-hairstyle-template','side-view-assisted']){
  if(!mesh.includes(token))throw new Error(`Avatar multi-view mesh pipeline missing ${token}`)
}
if(!mesh.includes("optional:['back-photo']"))throw new Error('Back-of-head photo must remain optional')
if(!mesh.includes("recommended:['left-photo OR right-photo']"))throw new Error('Side-view guidance must remain recommended, not required')
for(const token of ['detectFaceFromImage','face-api.js','generateAvatarTexture']){
  if(!avatar.includes(token))throw new Error(`Existing avatar materialization capability missing ${token}`)
}
for(const token of ["FaceMode='skip'|'camera'|'video'|'upload'","accept=\"video/mp4,video/quicktime,video/webm,video/*\"","completeEphemeralAvatarVideoProcessing('video-clip')",'tryamm:avatar-multiview-measurements','VIDEO TURN = BEST','+ SIDE PICS = BETTER','BACK = OPTIONAL','makeDerivedFaceTexture']){
  if(!creator.includes(token))throw new Error(`Avatar Creator video/side-photo flow missing ${token}`)
}
console.log('biometric avatar privacy + video/side-photo contract: GREEN')
