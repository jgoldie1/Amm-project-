import fs from 'node:fs'

const css=fs.readFileSync(new URL('../src/components/streetverse-mobile-layout.css',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const camera=fs.readFileSync(new URL('../src/runtime/StreetVerseCameraClearance.ts',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE MOBILE V11 CLEAR-VIEW CONTRACT FAIL: '+msg)}

for(const token of [
  'V11 clear-view portrait pass',
  'width: min(78vw, 304px)',
  '[data-mission-objective]',
  '[data-mission-action]',
  'width: 86px !important',
  'min-width: 104px !important',
  'width: 92px !important',
  'height: 92px !important',
  'width: 38px !important',
  'bottom: calc(env(safe-area-inset-bottom) + 68px) !important',
  'content: "☁"',
])must(css.includes(token),'portrait clear-view CSS missing '+token)

for(const token of [
  'portraitClearView=window.innerWidth<=480&&window.innerHeight>window.innerWidth',
  'cameraShoulder=portraitClearView?.70:.78',
  'cameraHeight=portraitClearView?3.28:3.65',
  'cameraBack=portraitClearView?5.70:6.6',
  "portraitFramingPass:portraitClearView?'clear-view-v11':'standard'",
  'resolveStreetVerseThirdPersonCameraSafety(origin,desired,camera.position',
  'data-mission-objective="true"',
  'data-mission-action="true"',
  'new THREE.MeshStandardMaterial({color:0x31566d',
])must(mobile.includes(token),'mobile V11 implementation missing '+token)

for(const token of [
  'STREETVERSE_CAMERA_MIN_DISTANCE=2.8',
  "STREETVERSE_CAMERA_OCCLUSION_PASS='sphere-cast-rescue-v10'",
  'resolveStreetVerseThirdPersonCameraSafety',
])must(camera.includes(token),'Camera V10 safety must remain intact: '+token)

const build=String(pkg.scripts?.build||'')
for(const gate of [
  'streetverse-mobile-v7-convergence-contract.mjs',
  'streetverse-v8-no-regression-contract.mjs',
  'stubbs-ai-holographic-business-os-contract.mjs',
  'streetverse-chicago-bj-v9-v13-contract.mjs',
  'streetverse-camera-v10-safety-contract.mjs',
  'streetverse-mobile-v11-clear-view-contract.mjs',
])must(build.includes(gate),'combined build missing preserved gate '+gate)

console.log('STREETVERSE MOBILE V11 CLEAR-VIEW CONTRACT PASS: compact portrait HUD + closer safe framing + restrained facade glass + preserved Camera V10')
