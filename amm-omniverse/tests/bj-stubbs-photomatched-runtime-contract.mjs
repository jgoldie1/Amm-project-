import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseBJPhotoMatchRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const character=fs.readFileSync(new URL('../src/data/streetVerseBJStubbsCharacter.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('BJ PHOTOMATCH RUNTIME CONTRACT FAIL: '+msg)}

must(runtime.includes("id:'streetverse-bj-stubbs-photomatched'"),'reserved BJ photo-matched asset id must be active')
must(runtime.includes("BJ_PHOTOMATCH_TEXTURE_DATA_URI='data:image/webp;base64,"),'approved reference pixels must ship as the runtime texture')
must(runtime.includes("new THREE.PlaneGeometry(.62,.72,22,26)"),'photo head must be a real curved 3D mesh, not a DOM image')
must(runtime.includes("headPivot.add(mesh)"),'photo head must attach to the live rig-head')
must(runtime.includes("PROCEDURAL_FACE_PARTS")&&runtime.includes("object.visible=false"),'procedural facial geometry must hide only after photo head activation')
must(runtime.includes("tryamm:bj-photomatched-head-ready"),'photo-head readiness evidence event missing')
must(runtime.includes("certifiedLikeness:false"),'runtime must not overclaim single-reference geometry as certified likeness')
must(world.includes("installBJPhotoMatchedHead(nativeHero)"),'mobile BJ must install the approved photo-matched head')
must(world.includes("photoMatched:true,source:'streetverse-mobile-approved-bj-head'"),'named-character authority must flip to photo-matched after successful load')
must(world.includes("proceduralFaceHidden:true"),'mobile world must report procedural face replacement')
must(world.includes("bjPhotoMatch?.dispose()"),'photo-head runtime must clean up safely')
must(character.includes("futurePhotoMatched:'streetverse-bj-stubbs-photomatched'"),'character registry must retain the canonical photo-matched id')

console.log('BJ PHOTOMATCH RUNTIME CONTRACT PASS: approved reference texture → curved 3D head shell → live BJ rig → procedural face hidden')
