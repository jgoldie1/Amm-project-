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
const grid=read('src/data/StreetVerseChicagoGrid.ts')
const builder=read('src/components/StreetVerseWestSideWorldBuilder.tsx')
const safeCity=read('src/components/StreetVerseMobilePlayableWorld.tsx')
assert(safeCity.includes('Safe city walking and driving controls'),'Safe HTML city must show visible fallback movement controls')
for(const command of ["btn('▲','up')","btn('◀','left')","btn('▼','down')","btn('▶','right')"])
  assert(safeCity.includes(command),'Safe HTML city missing movement button '+command)
for(const id of ['circle-park-1111-laflin','taylor-laflin','abla-village','abla-new-homes']){
  assert(grid.includes("id:'"+id+"'"),'Chicago grid lacks named block '+id)
  assert(builder.includes("id:'"+id+"'"),'World Builder lacks named block '+id)
}
assert(mobile.includes('1111 S LAFLIN • CIRCLE PARK'),'3D Circle Park entrance lacks exact address')
assert(mobile.includes('TAYLOR + LAFLIN • CHICAGO 60607'),'3D Taylor + Laflin wayfinding missing')
assert(mobile.includes('circle-park-era-1996-abla'),'retain original historical ABLA Time Machine')
assert(west.includes('abla-new-homes-townhome-'),'Village must have actual renderable townhome geometry')
assert(west.includes('abla-village-step-free-promenade'),'Village pedestrian corridor must remain visible')
assert(west.includes('sharedBoxGeometries.clear()'),'webgl recovery must clear freed geometry cache')
assert(builder.includes('tryamm:west-side-route-request'),'World Builder block actions must request real 3D traversal')
assert(geo.includes('StreetVerseDominionLauncher'),'Keep modded turf/city-building mode accessible')
assert(geo.includes('showRestore3D={explicitSafe}'),'Recover without stacked retry buttons')
assert(!geo.includes('{!nearWestOpen&&<StreetVerseAfterDarkAlpha/>}'),'Never overlay 3D After Dark controls on safe HTML city')
assert(String(pkg.scripts?.build||'').includes('streetverse-circle-park-el-visual-contract.mjs'),'Include visuals preservation gate in normal build')
console.log('CIRCLE PARK + L TRAIN VISUAL SOURCE CONTRACT PASS: moving train, detail meshes, track alignment, mod UI and recovery isolation')
