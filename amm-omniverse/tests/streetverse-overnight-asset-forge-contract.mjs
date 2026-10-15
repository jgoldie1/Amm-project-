import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root=new URL('../',import.meta.url)
const read=file=>fs.readFileSync(new URL(file,root),'utf8')
const dir=new URL('public/generated-assets/overnight-kit/',root)
const catalog=read('src/data/TryammNativeRuntimeAssetCatalog.ts')
const mobile=read('src/components/StreetVerseMobileWorld.tsx')
const nearWest=read('src/components/StreetVerseNearWest3D.tsx')
const hero=read('src/runtime/StreetVerseMeshyBJHeroRuntime.ts')
const inventory=JSON.parse(fs.readFileSync(new URL('inventory.json',dir),'utf8'))
assert.equal(inventory.assets.length,9,'Nine unique original GLBs must exist')
assert.equal(new Set(inventory.assets.map(a=>a.id)).size,9,'No duplicate asset IDs')

const report={date:new Date().toISOString(),generated:0,totalBytes:0,heavy:[],failed:[],areas:[]}
for(const asset of inventory.assets){
 const file=new URL(asset.filename,dir)
 const buf=fs.readFileSync(file)
 assert.equal(buf.subarray(0,4).toString(),'glTF',asset.id+' must be a binary glTF')
 assert.equal(buf.readUInt32LE(4),2,asset.id+' must be GLB v2')
 assert.ok(buf.length>=512&&buf.length<=1_500_000,asset.id+' must fit mobile payload guard')
 const jsonSize=buf.readUInt32LE(12)
 const gltf=JSON.parse(buf.subarray(20,20+jsonSize).toString('utf8'))
 assert.ok(gltf.meshes?.length>0,asset.id+' must contain visible geometry')
 assert.ok(gltf.materials?.length>0,asset.id+' must contain materials')
 assert.equal(asset.sha256,crypto.createHash('sha256').update(buf).digest('hex'),asset.id+' must match inventory checksum')
 assert.ok(catalog.includes(asset.url),'World Builder catalog must register '+asset.id)
 assert.equal(asset.state,'PREVIEW','Do not mislabel blockout art as photoreal/certified')
 assert.equal(asset.gameplayCollisionAuthority,'existing-runtime','Preview must never override collisions')
 report.generated++;report.totalBytes+=buf.length
 if(buf.length>100_000)report.heavy.push(asset.id)
}
for(const key of ['circleParkHoop','circleParkEntry','westSideGuardGate','taylorBikeRack','taylorPlanter','westSideBusShelter','westSideBench','westSideFoodKiosk','circleParkWaterFountain']){
 assert.ok(catalog.includes(key+':{id:'),'Missing registry key '+key)
}
assert.ok(catalog.includes('CIRCLE_PARK_OVERNIGHT_MOBILE_PLACEMENTS'),'mobile placement list exists')
assert.ok(catalog.includes('CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS'),'West Side placement list exists')
assert.ok(nearWest.includes('loadTryammNativeCircleParkLayer({placements:CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS})'),'NearWest actually loads visual assets')
assert.ok(mobile.includes('loadTryammNativeCircleParkLayer({placements:CIRCLE_PARK_OVERNIGHT_MOBILE_PLACEMENTS})'),'mobile Chicago actually loads new props')
assert.ok(mobile.includes("'tryamm:streetverse-bj-hero-mounted'"),'mobile props wait until hero is mounted')
assert.ok(mobile.includes("result.group.name='circle-park-overnight-asset-forge-visuals'"),'unique runtime layer exists')
assert.ok(mobile.includes('deferredResidentsStarted=true'),'NPCs cannot start duplicate generation requests')
assert.ok(hero.includes('BJ_STUBBS_V15_ACTING_FACE_LOOK_NOD.glb'),'actual animated BJ V15 path preserved')
assert.ok(hero.includes('BJ GLB decode timed out'),'old iPhone load must remain bounded')
report.areas=['Chicago West Side','Circle Park','Taylor Street','Roosevelt','UIC']
console.log('OVERNIGHT_ASSET_FORGE_PASS',JSON.stringify(report))
