import fs from 'node:fs'
import assert from 'node:assert/strict'
const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const runtime=read('amm-omniverse/src/runtime/StreetVerseMyceliumTimelineRuntime.ts')
const root=read('amm-omniverse/src/components/StreetVerseGeoSpawnBridge.tsx')
const bridge=read('public/warehouse-mycelium-bridge.mjs')
for(const check of [
 ['timeline runtime exports',runtime.includes('installStreetVerseMyceliumTimelineRuntime')],
 ['root StreetVerse runtime installed',root.includes('useLayoutEffect(()=>installStreetVerseMyceliumTimelineRuntime(),[])')],
 ['timeline restores completed checkpoints',runtime.includes('syncMyceliumFromWarehouseSave')],
 ['no real inventory changes',runtime.includes('d.affectsInventory!==false')],
 ['no blockchain authority',runtime.includes('d.createsBlockchainAnchor!==false')],
 ['no real money',runtime.includes('d.realMoney!==false')],
 ['no duplicate checkpoints',runtime.includes('checkpoint!==next')],
 ['branch-choice gate',runtime.includes('if(!current.completed')],
 ['warehouse projection event',bridge.includes('tryamm:mycelium-mission-projection')]
]){assert.ok(check[1],check[0]);console.log('PASS',check[0])}
const publicRoot=read('public/warehouse-mycelium-bridge.mjs')
const publicGame=read('amm-omniverse/public/warehouse-mycelium-bridge.mjs')
assert.equal(publicRoot,publicGame,'bridges match')
console.log('Mycelium integration contract PASS')
