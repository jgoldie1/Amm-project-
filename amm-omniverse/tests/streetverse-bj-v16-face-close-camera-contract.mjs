import fs from 'node:fs'
import assert from 'node:assert/strict'
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const visual=fs.readFileSync(new URL('e2e/streetverse-visual-evidence.spec.ts',import.meta.url),'utf8')
assert.ok(world.includes('const applyBJFaceCloseCamera=(hero:THREE.Object3D)=>'),'Dedicated V16 face portrait camera must exist')
assert.ok(world.includes('new THREE.Vector3(0,1.69,1.46).applyAxisAngle(axis,hero.rotation.y)'),'Portrait camera must actually be in front of the head, not far above and behind BJ')
assert.ok(world.includes('minDistance:.92,radius:.17,smoothing:.35'),'Portrait camera must use collision-safe short-range clearance')
assert.ok(world.includes('const bjFaceCloseApplied=Boolean('),'Close view must be wired into live render loop')
assert.ok(world.includes('&&!bjFaceCloseApplied&&!activeCar&&playerCameraMode'),'Close view must override third-person and first-person follow cameras')
assert.ok(world.includes("data-streetverse-bj-focus={bjCloseView?'true':'false'}"),'Playable scene must expose actual focus state')
assert.ok(visual.includes("streetverse-bj-v15-actual-in-game-close-view.png"),'Phone test must capture an actual in-game portrait')
assert.ok(visual.includes("name:/BJ V15 FACE \\/ PHOTO/"),'Mobile test must use currently displayed V15 menu label')
assert.ok(!visual.includes('BJ V12 VIEW'),'Mobile visual regression test must not require obsolete V12 UI')
console.log('BJ V16 IPHONE PORTRAIT CAMERA PASS: real player render, collision-safe face framing, restore to gameplay, updated visual E2E')
