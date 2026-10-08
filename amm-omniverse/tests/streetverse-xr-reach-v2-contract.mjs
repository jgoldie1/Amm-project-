import fs from 'node:fs'

const reach=fs.readFileSync(new URL('../src/runtime/StreetVerseXRReachRuntime.ts',import.meta.url),'utf8')
const west=fs.readFileSync(new URL('../src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('STREETVERSE XR REACH V2 CONTRACT FAIL: '+msg)}

for(const token of [
  "xrTabletopGrabbable:true",
  "xrGrabScope:'immersive-ar'",
  "xrGrabKind:'vehicle'",
  "vehicleId:name",
])must(west.includes(token),'West Side vehicle XR tag missing '+token)

for(const token of [
  'tabletopWorldInteractables',
  'refreshTabletopWorldInteractables',
  "object.userData?.xrTabletopGrabbable===true",
  "currentPresentation==='immersive-ar'",
  'allowedForCurrentPresentation',
  'activeInteractables()',
  'grabOffsetPreserved:true',
  "source:'streetverse-xr-reach-v2'",
  'tryamm:xr-reach-world-scan',
])must(reach.includes(token),'XR Reach V2 runtime missing '+token)

must(!/west-side-road-[^'"]*['"][^\n]*xrGrabbable:true/.test(west),'roads must not become XR grabbable')
must(!/architecturePass:[^\n]*xrGrabbable:true/.test(west),'building groups must not become XR grabbable')
must(String(pkg.scripts?.build||'').includes('streetverse-xr-reach-v1-contract.mjs'),'XR V1 contract must remain in production build')
must(String(pkg.scripts?.build||'').includes('streetverse-xr-reach-v2-contract.mjs'),'XR V2 contract must be in production build')

console.log('STREETVERSE XR REACH V2 CONTRACT PASS: AR-only tagged West Side cars + protected roads/buildings + preserved-offset grab telemetry + V1 fallback')
