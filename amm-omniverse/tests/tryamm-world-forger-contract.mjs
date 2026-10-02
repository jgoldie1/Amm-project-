import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const forger=read('../src/runtime/TRYAMMWorldForger.ts')
const main=read('../src/main.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')

for(const token of [
 "name:'TRYAMM World Forger'",
 "schema:'tryamm.world-forger.v1'",
 "schema:'tryamm.cad-building.v1'",
 'CAD_FOOTPRINT_AND_LEVELS',
 'CAD_STRUCTURE_STAIRS_ELEVATORS',
 'CAD_PLUMBING_ELECTRICAL_HVAC_FIRE',
 'PHOTOREAL_FACADE_WRAP',
 'MESH_REPAIR_AND_RETROPOLOGY',
 'COLLISION_NAVMESH_ACCESSIBILITY',
 'LOD_COMPRESSION_STREAMING',
 'RIG_HUMANOID',
 'VEHICLE_RIG',
 'FOUNDER_PREVIEW',
]) assert.ok(forger.includes(token),`World Forger missing ${token}`)

assert.ok(forger.includes("supportedKinds:['building','character','vehicle','prop','environment']"),'World Forger must support full game-world asset classes')
assert.ok(forger.includes("autoPublish:false"),'World Forger must not auto-publish generated assets')
assert.ok(forger.includes("physicalConstruction:false"),'World Forger game CAD must not imply physical construction')
assert.ok(forger.includes("authorizedReference"),'World Forger must require authorized references')
assert.ok(forger.includes("cadMeaning:'Structured game-world CAD/BIM-style scene planning."),'World Forger must describe CAD accurately')
assert.ok(forger.includes('tryamm:world-forger-request'),'World Forger runtime request event missing')
assert.ok(forger.includes('tryamm:world-forger-plan'),'World Forger runtime plan event missing')
assert.ok(forger.includes('__tryammWorldForger'),'World Forger control surface missing')
assert.ok(forger.includes('__showWorldForger'),'World Forger HoloGPT surface missing')
assert.ok(main.includes('installTryammWorldForgerRuntime'),'main bootstrap must install World Forger')
assert.ok(holo.includes('__showWorldForger'),'HoloGPT must route building/CAD requests to World Forger')

console.log('TRYAMM World Forger CAD + asset orchestration contract: PASS')
