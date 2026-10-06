import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseBJPhotoMatchRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const character=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('BJ PHOTOMATCH RUNTIME CONTRACT FAIL: '+msg)}

must(runtime.includes("id:'streetverse-bj-stubbs-photomatched'"),'reserved BJ photo-matched asset id must be active')
must(runtime.includes("BJ_PHOTOMATCH_TEXTURE_DATA_URI='data:image/webp;base64,"),'approved reference pixels must ship as the runtime texture')
must(runtime.includes("new THREE.PlaneGeometry(BJ_V10_HEAD_PROFILE.headWidth,BJ_V10_HEAD_PROFILE.headHeight,34,40)"),'approved-reference face surface must remain a real subdivided 3D mesh')
must(runtime.includes("version:'bj-v10-approved-reference-volumetric-head'"),'BJ reference head must advertise the V10 volumetric version')
must(runtime.includes("geometryAuthority:'runtime-v10-volumetric-head-profile'"),'BJ head geometry authority must be the V10 volumetric profile')
for(const token of [
  "streetverse-bj-v10-head-volume",
  "bj-v10-cranium",
  "bj-v10-jaw-volume",
  "bj-v10-chin-volume",
  "bj-v10-cheek-left",
  "bj-v10-cheek-right",
  "bj-v10-nose-bridge-volume",
  "bj-v10-nose-tip-volume",
  "bj-v10-beard-chin-volume",
  "bj-v10-beard-lower-volume",
  "bj-v10-gray-beard-side-left",
  "bj-v10-gray-beard-side-right",
  "bj-v10-temple-left",
  "bj-v10-temple-right",
  "bj-v10-brow-ridge-left",
  "bj-v10-brow-ridge-right",
  "bj-v10-orbit-left",
  "bj-v10-orbit-right",
  "bj-v10-upper-lip-volume",
  "bj-v10-lower-lip-volume",
  "bj-v10-mouth-line",
])must(runtime.includes(token),'V10 volumetric head part missing '+token)
must(runtime.includes("volumetricHeadV10:true"),'V10 volumetric head readiness evidence must be emitted')
must(runtime.includes("facialLandmarksV10:true"),'V10 facial-landmark readiness evidence must be emitted')
must(runtime.includes("export const BJ_PHOTOMATCH_TEXTURE_DATA_URI="),'approved reference texture must be exportable to the comparison viewer')
must(runtime.includes("profileVersion:BJ_V10_HEAD_PROFILE.version"),'V10 head profile version evidence must be emitted')
must(!runtime.includes("'bj-full-beard','bj-moustache','bj-gray-chin-panel','bj-beard-gray-fleck'"),'photo activation must not hide all 3D beard volume from profile views')
must(runtime.includes("headPivot.add(mesh)"),'photo head must attach to the live rig-head')
must(runtime.includes("PROCEDURAL_FACE_PARTS")&&runtime.includes("object.visible=false"),'procedural facial geometry must hide only after photo head activation')
must(runtime.includes("tryamm:bj-photomatched-head-ready"),'photo-head readiness evidence event missing')
must(runtime.includes("certifiedLikeness:false"),'runtime must not overclaim single-reference geometry as certified likeness')
must(world.includes("bjPhotoMatch=previewPhotoHead?installBJPhotoMatchedHead(nativeHero):null"),'photo reference preview must be opt-in, leaving the volumetric game face visible by default')
must(world.includes("photoMatched:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID),source:'streetverse-mobile-approved-bj-head'"),'named-character photo-match claim must stay gated by verified authorization')
must(world.includes("referenceMatchedPreview:true")&&world.includes("certifiedLikeness:canClaimPhotoMatched(STREETVERSE_HERO_CHARACTER_ID)"),'mobile world must distinguish reference preview from verified likeness')
must(world.includes("proceduralFaceHidden:true"),'mobile world must report procedural face replacement')
must(world.includes("bjPhotoMatch?.dispose()"),'photo-head runtime must clean up safely')
must(character.includes("futurePhotoMatched:'streetverse-bj-stubbs-photomatched'"),'character registry must retain the canonical photo-matched id')

console.log('BJ PHOTOMATCH RUNTIME CONTRACT PASS: approved reference texture → V10 volumetric skull/jaw/nose/cheeks/beard → live BJ rig → generic face hidden')
