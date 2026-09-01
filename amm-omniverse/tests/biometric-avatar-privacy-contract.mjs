import fs from 'node:fs'

const privacy=fs.readFileSync(new URL('../src/runtime/BiometricAvatarPrivacyRuntime.ts',import.meta.url),'utf8')
const mesh=fs.readFileSync(new URL('../src/runtime/AvatarMultiViewMeshPipeline.ts',import.meta.url),'utf8')
const avatar=fs.readFileSync(new URL('../src/game/avatar/AvatarSystem.ts',import.meta.url),'utf8')

for(const token of ['identityRecognition:false','identityMatching:false','fingerprintCollection:false','emotionInference:false','protectedAttributeInference:false','sellOrTradeBiometrics:false','modelTrainingUse:false','session-only','requestAvatarBiometricDeletion']){
  if(!privacy.includes(token))throw new Error(`Biometric avatar privacy contract missing ${token}`)
}
for(const token of ['CONSENT GATE','FRONT / SIDE / BACK CAPTURE','NON-IDENTITY GEOMETRY FIT','HUMANOID AUTO-RIG','FACIAL BLENDSHAPE FIT','DELETE RAW CAPTURES OR EXPLICIT SAVE','localOnly:true']){
  if(!mesh.includes(token))throw new Error(`Avatar multi-view mesh pipeline missing ${token}`)
}
for(const token of ['detectFaceFromImage','face-api.js','generateAvatarTexture']){
  if(!avatar.includes(token))throw new Error(`Existing avatar materialization capability missing ${token}`)
}
console.log('biometric avatar privacy contract: GREEN')
