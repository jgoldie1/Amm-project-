import fs from 'node:fs'

const helper=fs.readFileSync(new URL('../src/runtime/StreetVerseCameraClearance.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE CAMERA V10 SAFETY CONTRACT FAIL: '+msg)}

for(const token of [
  'STREETVERSE_CAMERA_MIN_DISTANCE=2.8',
  'STREETVERSE_CAMERA_SPHERE_RADIUS=.42',
  "STREETVERSE_CAMERA_OCCLUSION_PASS='sphere-cast-rescue-v10'",
  'resolveStreetVerseThirdPersonCameraSafety',
  'expandByScalar(radius)',
  'nextDistance>=minDistance-.001',
  'nextClearance>=nextDistance-.01',
  'honoredMinDistance:finalDistance>=minDistance-.001',
  'angleCandidates=[0,.42,-.42,.78,-.78,1.16,-1.16,Math.PI]',
  'liftCandidates=[0,.72,1.35,2.05,2.85]',
])must(helper.includes(token),'camera safety helper missing '+token)

must(!helper.includes('Math.max(.5,origin.distanceTo(hit)-.6)'),'legacy fallback .5-unit camera collapse must not return')
must(!mobile.includes('Math.max(.95,origin.distanceTo(hit)-.68)'),'legacy shoulder .95-unit camera collapse must not return')
must(mobile.includes('resolveStreetVerseThirdPersonCameraSafety(origin,desired,camera.position'),'third-person shoulder must use V10 safety resolver')

for(const token of [
  "tryamm:streetverse-camera-state",
  "mode:'third-person'",
  'insideGeometry:cameraSafety.insideGeometry',
  'minDistance:STREETVERSE_CAMERA_MIN_DISTANCE',
  'honoredMinDistance:cameraSafety.honoredMinDistance',
  'clearance:Number(cameraSafety.clearance.toFixed(3))',
  'targetDistance:Number(cameraSafety.targetDistance.toFixed(3))',
  'occlusionPass:STREETVERSE_CAMERA_OCCLUSION_PASS',
])must(mobile.includes(token),'trace-compatible telemetry missing '+token)

const build=String(pkg.scripts?.build||'')
for(const gate of [
  'streetverse-mobile-v7-convergence-contract.mjs',
  'streetverse-v8-no-regression-contract.mjs',
  'stubbs-ai-holographic-business-os-contract.mjs',
  'streetverse-chicago-bj-v9-v13-contract.mjs',
  'streetverse-camera-v10-safety-contract.mjs',
])must(build.includes(gate),'combined build missing preserved gate '+gate)

console.log('STREETVERSE CAMERA V10 SAFETY CONTRACT PASS: hard min 2.8 + sphere clearance + rescue + trace telemetry + preserved V7/V8/BusinessOS/V9 gates')
