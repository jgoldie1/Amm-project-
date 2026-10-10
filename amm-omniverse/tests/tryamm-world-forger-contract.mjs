import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const forge=read('../src/runtime/TRYAMMWorldForger.ts')
const panel=read('../src/components/TRYAMMWorldForgerPanel.tsx')
const factory=read('../src/components/MeshyFactoryControlPanel.tsx')
const fabric=read('../src/runtime/TRYAMMSystemFabricRuntime.ts')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const building=read('../src/game/runtime/holographicBuildingReconstruction.ts')
const avatar=read('../src/runtime/AvatarMultiViewMeshPipeline.ts')
const vehicle=read('../src/runtime/StreetVersePhysicalVehicleRigRuntime.ts')

for(const kind of ['person','npc','vehicle','building','interior','street','neighborhood','prop','environment']){
 assert.ok(forge.includes(`'${kind}'`),`World Forger missing kind ${kind}`)
}
for(const stage of ['cad-structure','surface-reconstruction','mesh','rig-kinematics','materials','world-semantics','accessibility','lod-performance','qa','publish']){
 assert.ok(forge.includes(`'${stage}'`),`World Forger missing stage ${stage}`)
}
for(const tech of [
 'HoloGPT','Stubbs AI','Construct Engine','Holo Forge','Meshy',
 'Avatar Multi-View Mesh Pipeline','StreetVerse Physical Vehicle Rig',
 'Holographic Building Reconstruction','World Compiler','StreetVerse Game Ops','TRYAMM System Fabric','Guardian'
]) assert.ok(forge.includes(tech),`World Forger missing technology bridge: ${tech}`)

assert.ok(forge.includes('real-person-likeness-authorization-required'),'real-person World Forge must fail closed without likeness authorization')
assert.ok(forge.includes('stairs/elevator/plumbing/utility behavior graph'),'building output must include stairs/elevator/plumbing/utility graph when requested')
assert.ok(forge.includes('one source-of-truth manifest'),'World Forger must keep mesh/rig/textures/collision/missions connected')
assert.ok(forge.includes('doesNotClaimAutomaticPhotorealCompletion:true'),'World Forger must not overclaim automatic photoreal completion')

assert.ok(panel.includes('People • vehicles • buildings • neighborhoods • worlds'),'World Forger UI must expose major world asset families')
assert.ok(panel.includes('CAD'),'World Forger UI must expose CAD source option')
assert.ok(panel.includes('Stairs / elevator / plumbing / utility graph'),'World Forger UI must expose building system generation')
assert.ok(panel.includes('tryamm:world-forger-plan'),'World Forger UI must publish one integration event')
assert.ok(factory.includes('<TRYAMMWorldForgerPanel/>'),'Asset Factory must contain World Forger')
assert.ok(fabric.includes("|'world-forger'"),'System Fabric must track World Forger')
assert.ok(fabric.includes("'world-forger':['core','meshy-assets']"),'World Forger must participate in system dependency state')
assert.ok(fabric.includes('tryamm:world-forger-plan'),'System Fabric must consume World Forger readiness evidence')
assert.ok(holo.includes('world forger|world forge'),'HoloGPT must route natural-language creation commands to World Forger')

for(const token of ['GENERATE_STAIRS_AND_ELEVATORS','GENERATE_UTILITY_GRAPHS','GENERATE_NAVIGATION_AND_ACCESSIBILITY'])assert.ok(building.includes(token),`building reconstruction missing ${token}`)
assert.ok(avatar.includes('HUMANOID AUTO-RIG')&&avatar.includes('UV + TEXTURE WRAP'),'person forge must reuse avatar rig + texture pipeline')
assert.ok(vehicle.includes('tryamm:streetverse-vehicle-rig-ready'),'vehicle forge must reuse physical vehicle rig runtime')

console.log('TRYAMM World Forger integration contract: PASS')
