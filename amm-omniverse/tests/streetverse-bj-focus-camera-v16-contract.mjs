import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
const game=read('../src/components/StreetVerseMobileWorld.tsx')
const viewer=read('../src/components/BJStubbsV7Viewer.tsx')
for(const token of [
 "const [bjCloseView,setBjCloseView]=useState(false)",
 'const bjCloseViewRef=useRef(false)',
 "addEventListener('tryamm:streetverse-bj-close-view',onBjCloseView)",
 "removeEventListener('tryamm:streetverse-bj-close-view',onBjCloseView)",
 "portraitFramingPass:bjCloseViewRef.current?'bj-portrait-v16'",
 'bjFocusActive:bjCloseViewRef.current',
 'bjCloseViewRef.current?.69:1',
 'const lookAhead=bjCloseViewRef.current?.65:3.15',
 "['bj-close',bjCloseView?",
 "['bj-proof','📸 BJ V15 • 4-ANGLE FACE PROOF']",
 "window.location.assign('/bj-v10-preview'+(match?'?svBJModel=meshy':''))",
 'const applyBJFaceCloseCamera=(hero:THREE.Object3D)=>',
 'bjFaceCloseApplied=Boolean(',
 'missionGuide&&!bjCloseView',
 "data-streetverse-bj-focus={bjCloseView?'true':'false'}"
])assert.ok(game.includes(token),'BJ V16 camera / UI integration missing '+token)
assert.ok(game.includes('resolveStreetVerseThirdPersonCameraSafety(origin,desired,camera.position'),'BJ close-view must retain collision-safe third-person camera')
assert.ok(game.includes('STREETVERSE_CAMERA_MIN_DISTANCE'),'BJ close-view must preserve minimum camera clearance')
assert.ok(game.includes("if(activeCar){setMessage('BJ CLOSE VIEW • exit the vehicle"),'Close view should not override vehicle camera')
assert.ok(viewer.includes('📸 RENDER REAL 3D FACE COMPARISON'),'Face proof must use rendered GLB, not concept art')
assert.ok(viewer.includes('data-bj-face-front="true"')&&viewer.includes('data-bj-face-left="true"')&&viewer.includes('data-bj-face-right="true"'),'Face proof must include multiple angle views')
console.log('BJ V16 CAMERA + RENDER PROOF PASS • collision-safe one-hand zoom, uncluttered mission banner and four-angle portrait route')
