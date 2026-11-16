import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const load=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')
test('one-tap Chicago West Side and Greenville 3D buttons open the recovered 3D scenes',()=>{
 const bridge=load('amm-omniverse/src/components/StreetVerseGeoSpawnBridge.tsx')
 const scene=load('amm-omniverse/src/components/StreetVerseNearWest3D.tsx')
 assert.match(bridge,/data-streetverse-demo="chicago"/)
 assert.match(bridge,/data-streetverse-demo="greenville"/)
 assert.match(bridge,/setDemoDestination\('chicago'\);setNearWestOpen\(true\)/)
 assert.match(bridge,/setDemoDestination\('greenville'\);setNearWestOpen\(true\)/)
 assert.match(bridge,/<StreetVerseNearWest3D key={demoDestination} initialDestination={demoDestination}\/>/)
 assert.match(scene,/initialDestination==='greenville'/)
 assert.match(scene,/if\(greenvilleOpen\)return <GreenvilleCampusVerseScene/)
 assert.match(scene,/NearWestNativeGlbLayer/)
})
test('desktop launch has large accessible buttons and safe fallback still exists',()=>{
 const bridge=load('amm-omniverse/src/components/StreetVerseGeoSpawnBridge.tsx')
 assert.match(bridge,/aria-label="Launch Chicago West Side 3D world"/)
 assert.match(bridge,/aria-label="Launch Greenville CampusVerse 3D world"/)
 assert.match(bridge,/minHeight:58/)
 assert.match(bridge,/StreetVerseSafeWorld/)
 assert.match(bridge,/Retry StreetVerse 3D/i)
})
test('world positions contain known Chicago landmarks rather than a newly invented city',()=>{
 const grid=load('amm-omniverse/src/data/StreetVerseChicagoGrid.ts')
 assert.match(grid,/CIRCLE_PARK_SPAWN/)
 assert.match(grid,/Taylor Street/)
 assert.match(grid,/Roosevelt Road/)
 assert.match(grid,/Pilsen/)
})
