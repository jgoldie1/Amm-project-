import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const forge=read('../src/runtime/StreetVerseChicagoWorldForge.ts')
const runtime=read('../src/runtime/StreetVerseWorldForgeRuntime.ts')
const panel=read('../src/components/StreetVerseWorldForgePanel.tsx')
const app=read('../src/App.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const main=read('../src/main.tsx')

for(const id of [
 'circle-park-complete',
 'thomas-jefferson-school-complete',
 'roosevelt-road-corridor',
 'taylor-street-corridor',
 'near-west-neighborhood',
 'pilsen-neighborhood',
]) assert.ok(forge.includes(id),`World Forge missing West Side preset ${id}`)

for(const token of [
 'PARAMETRIC_STRUCTURAL_SHELL',
 'ROOM_AND_INTERIOR_LAYOUT',
 'STAIRS_AND_VERTICAL_CIRCULATION',
 'ELEVATOR_SHAFT_AND_LANDINGS',
 'PLUMBING_SUPPLY_DRAIN_FIXTURES',
 'ELECTRICAL_LIGHTING_INTERACTIONS',
 'HVAC_ZONES_AND_VENTS',
 'EGRESS_FIRE_SAFETY_ACCESSIBILITY',
 'COLLISION_NAVMESH_STREAMING_CELLS',
]) assert.ok(forge.includes(token),`World Forge CAD/building pipeline missing ${token}`)

assert.ok(forge.includes("kind:'street-view-reference'"),'World Forge must explicitly model Street View-style reference input')
assert.ok(forge.includes("mayUseAsTexture:false"),'reference imagery must not automatically become a production texture')
assert.ok(forge.includes("scrapeIntoGame:false"),'reference imagery must not be scraped into the game')
assert.ok(forge.includes("createStreetVerseAssetRequirements('building','premium')"),'World Forge must reuse the photoreal asset pipeline')
assert.ok(forge.includes('BUILDING_RECONSTRUCTION_STAGES'),'World Forge must reuse holographic building reconstruction stages')
assert.ok(forge.includes('CHICAGO_AREA_COMPILER_STAGES'),'World Forge must reuse Chicago area compiler QA')
assert.ok(forge.includes('WORLD_CERTIFICATION_CHECKS'),'World Forge must reuse world certification gates')
assert.ok(forge.includes('PHYSICAL_IPHONE_VISUAL_PROOF'),'World Forge must preserve physical iPhone proof')

for(const token of [
 'tryamm:streetverse-world-forge-plan',
 'tryamm:system-fabric-signal',
 'tryamm:shared-world-context-query',
 'tryamm:construct:targets',
 'tryamm:streetverse-world-forge-provider-proposal',
]) assert.ok(runtime.includes(token),`World Forge orchestration missing ${token}`)
assert.ok(runtime.includes('automaticProviderCharge:false'),'World Forge must not automatically spend provider credits')
assert.ok(runtime.includes('automaticProductionMutation:false'),'World Forge must not silently mutate production')

assert.ok(panel.includes('CAD → Holographic Build → Photoreal World'),'World Forge UI must expose the unified pipeline')
assert.ok(panel.includes('BUILD WEST SIDE PLAN'),'World Forge UI must provide a one-action build-plan path')
assert.ok(panel.includes('CREATE PROVIDER TASK PROPOSAL'),'World Forge UI must keep provider generation at proposal stage')
assert.ok(app.includes('__showWorldForge'),'App must expose World Forge opener')
assert.ok(app.includes('CHICAGO WORLD FORGE'),'Command Nexus must expose World Forge')
assert.ok(holo.includes("__showWorldForge"),'HoloGPT must route CAD/build commands into World Forge')
assert.ok(main.includes('installStreetVerseWorldForgeRuntime'),'main bootstrap must install World Forge runtime')

console.log('StreetVerse Chicago CAD + holographic World Forge contract: PASS')
