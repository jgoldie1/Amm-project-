import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const pipeline=read('../src/runtime/StreetVerseCADHoloBuildPipeline.ts')
const runtime=read('../src/runtime/StreetVerseCADHoloBuildRuntime.ts')
const mesh=read('../src/runtime/StreetVerseCADMeshBuilder.ts')
const registry=read('../src/data/StreetVerseWestSideBuildRegistry.ts')
const main=read('../src/main.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const reconstruction=read('../src/game/runtime/holographicBuildingReconstruction.ts')

for(const token of [
  "'floor-slab'","'wall'","'stair'","'elevator-shaft'","'plumbing-run'","'drain-run'","'electrical-run'","'hvac-run'",
  "'CAD_FOOTPRINT'","'CAD_STRUCTURE'","'CAD_INTERIORS'","'CAD_STAIRS_ELEVATORS'","'CAD_UTILITIES'",
  "'MESH_GENERATION'","'AUTHORIZED_TEXTURE_WRAP'","'INTERACTIVE_RIGGING'","'COLLISION_NAVMESH'",
  "'LOD_MOBILE_OPTIMIZATION'","'HOLOFORGE_PACKAGE'","'GAMEPLAY_BINDINGS'","'GAME_OPS_QA'","'FOUNDER_PREVIEW'",
]) assert.ok(pipeline.includes(token),`CAD/HoloBuild pipeline missing ${token}`)

assert.ok(pipeline.includes("googleStreetView:'reference-navigation-only'"),'Street View must remain navigation/reference only')
assert.ok(pipeline.includes("photorealisticWrap:'authorized-sources-only'"),'photoreal wrap must require authorized sources')
assert.ok(pipeline.includes("buildingRigging:['doors','windows','stairs','elevators','lights','plumbing-fixtures','appliances']"),'building rigging must cover requested interactive systems')
assert.ok(reconstruction.includes("'GENERATE_STAIRS_AND_ELEVATORS'"),'existing reconstruction engine must retain stairs/elevator generation')
assert.ok(reconstruction.includes("'GENERATE_UTILITY_GRAPHS'"),'existing reconstruction engine must retain utility graph generation')

for(const zone of [
  "'circle-park'","'jefferson-school'","'roosevelt-taylor'","'university-village-little-italy'","'pilsen'","'illinois-medical-district'","'near-west-side'"
]) assert.ok(registry.includes(zone),`West Side build registry missing ${zone}`)
assert.ok(registry.includes("currentResidentPrivacy"),'West Side builder must preserve resident privacy')
assert.ok(registry.includes("sensitiveInfrastructure"),'West Side builder must protect sensitive building systems')
assert.ok(registry.includes("Google Street View")||registry.includes("googleStreetView"),'West Side source policy must address Street View')

for(const event of [
 'tryamm:shared-world-context-query',
 'tryamm:construct:build-proposal',
 'tryamm:holo-forge-build-request',
 'tryamm:streetverse-cad-build-plan',
 'tryamm:system-fabric-signal',
 'tryamm:cursor-cad-build-request',
 'tryamm:west-side-build-wave-request',
]) assert.ok(runtime.includes(event),`CAD/HoloBuild runtime missing integration event ${event}`)
assert.ok(runtime.includes("productionMutation:false"),'CAD/HoloBuild proposal must not silently mutate production')
assert.ok(runtime.includes("founderApprovalRequired:true"),'CAD/HoloBuild runtime must preserve founder approval')
assert.ok(runtime.includes("surface:'cursor'"),'Cursor surface must be connected to shared world context')
assert.ok(runtime.includes("bennyConstruct:true")&&runtime.includes("holoForge:true")&&runtime.includes("meshy:true")&&runtime.includes("gameOps:true"),'HoloBuild ready event must name integrated technologies')

assert.ok(mesh.includes("const THREE=await import('three')"),'CAD mesh builder must isolate Three.js behind dynamic loading')
assert.ok(!mesh.includes("import * as THREE from 'three'"),'CAD mesh builder must not statically couple Three.js into boot')
assert.ok(mesh.includes("TextureLoader().loadAsync"),'CAD mesh builder must support authorized texture wrapping')
assert.ok(mesh.includes("interactiveRig='elevator'")&&mesh.includes("interactiveRig=isDoor?'door':'window'"),'CAD mesh must preserve interactive rig metadata')
assert.ok(mesh.includes("proposalGeometry:true"),'generated CAD preview must not masquerade as verified exact reconstruction')

assert.ok(main.includes("installStreetVerseCADHoloBuildRuntime"),'main bootstrap must install CAD/HoloBuild orchestration')
assert.ok(holo.includes("__showCADHoloBuild"),'HoloGPT must route CAD/West Side build requests to the new pipeline')
assert.ok(holo.includes("cursor.*cad"),'HoloGPT must recognize Cursor-to-CAD intent')

console.log('StreetVerse CAD + HoloBuild + mesh/wrap/rig integration contract: PASS')
