import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')
const mobile=read('src/components/StreetVerseMobileWorld.tsx')
const west=read('src/runtime/StreetVerseWestSideVisibleWorldRuntime.ts')
const geo=read('src/components/StreetVerseGeoSpawnBridge.tsx')
const pkg=JSON.parse(read('package.json'))

for(const token of [
  "const westSideVisibleWorld=createStreetVerseWestSideVisibleWorld(scene,externalCollisionBoxes)",
  "streetverse-west-side-el-train-v2",
  "streetverse-el-windows-v2",
  "streetverse-el-doors-v2",
  "streetverse-el-front-route-plate",
  "train.position.set(-70,7.3,-35)",
  "train.position.x=-92+((now*.018)%184)",
])assert(mobile.includes(token),'Missing existing/updated real 3D world detail: '+token)
for(const token of [
  "circle-park-visible-forge",
  "circle-park-basketball-hoop",
  "circle-park-rest-bench",
  "circle-park-entry-plaza",
  "const trackZ=-35",
  "west-side-el-station-platform",
  "streetverse-west-side-visible-world-v1",
])assert(west.includes(token),'Missing retained West Side graphics: '+token)
assert(geo.includes('StreetVerseDominionLauncher'),'Keep modded turf/city-building mode accessible')
assert(geo.includes('showRestore3D={explicitSafe}'),'Recover without stacked retry buttons')
assert(!geo.includes('{!nearWestOpen&&<StreetVerseAfterDarkAlpha/>}'),'Never overlay 3D After Dark controls on safe HTML city')
assert(String(pkg.scripts?.build||'').includes('streetverse-circle-park-el-visual-contract.mjs'),'Include visuals preservation gate in normal build')
console.log('CIRCLE PARK + L TRAIN VISUAL SOURCE CONTRACT PASS: moving train, detail meshes, track alignment, mod UI and recovery isolation')
