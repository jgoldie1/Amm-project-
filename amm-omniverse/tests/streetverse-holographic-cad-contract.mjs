import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const compiler=read('../src/runtime/StreetVerseCadBuildingCompiler.ts')
const exchange=read('../src/runtime/StreetVerseCadExchange.ts')
const runtime=read('../src/runtime/StreetVerseHolographicCadRuntime.ts')
const main=read('../src/main.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const passport=read('../src/data/buildingPassports/circlePark.ts')

for(const token of [
  "schema:'tryamm.streetverse.cad.v1'",
  "'stairs'",
  "'elevator'",
  "'plumbing'",
  "'electrical'",
  "'hvac'",
  "'fire-safety'",
  "'accessibility'",
  "'collision'",
  "'navigation'",
  "'facade'",
  'CadStair',
  'CadElevator',
  'CadPipeRun',
  'CadFixture',
  'CadFacadeWrap',
]) assert.ok(compiler.includes(token),`CAD compiler missing ${token}`)

for(const stage of [
  'BUILD_STRUCTURE_AND_SLABS',
  'BUILD_STAIRS',
  'BUILD_ELEVATOR_SHAFTS_AND_CABS',
  'BUILD_SANITARY_AND_WATER_SIMULATION_GRAPH',
  'BUILD_ACCESSIBILITY_ROUTES',
  'BUILD_COLLISION_AND_NAVIGATION',
  'APPLY_AUTHORIZED_PHOTOREALISTIC_FACADE_WRAP',
  'GENERATE_GAME_LODS_AND_STREAMING_CELLS',
  'HOLOGRAPHIC_WALKTHROUGH_QA',
]) assert.ok(compiler.includes(stage),`CAD build plan missing ${stage}`)

assert.ok(compiler.includes("source.rights==='reference-only'||!source.persistentAssetAllowed"),'reference-only imagery must not become persistent building texture')
assert.ok(compiler.includes('currentPrivateInteriorsNeverAutoPublish:true'),'CAD must preserve private-interior boundary')
assert.ok(compiler.includes('exactCurrentSecuritySystemsNeverPublish:true'),'CAD must preserve security-system boundary')
assert.ok(compiler.includes('googleStreetViewReferenceOnly:true'),'CAD must preserve Street View reference-only boundary')

assert.ok(exchange.includes('exportCadDxf'),'CAD must export DXF exchange')
assert.ok(exchange.includes('exportCadJson'),'CAD must export TRYAMM CAD JSON')
assert.ok(exchange.includes('tryamm:holographic-building-build'),'CAD must hand build plans to the holographic reconstruction layer')
assert.ok(exchange.includes('physicalConstructionDocuments:false'),'game CAD must not be misrepresented as permit-ready construction documents')

assert.ok(runtime.includes('tryamm:cad-command'),'CAD must expose an event-driven command surface')
assert.ok(runtime.includes('tryamm:cad-ready'),'CAD must publish readiness')
assert.ok(runtime.includes('__tryammCad'),'CAD must expose one runtime control API')
assert.ok(runtime.includes('__showCad'),'CAD must expose a HoloGPT command surface')
assert.ok(main.includes("installStreetVerseHolographicCadRuntime"),'StreetVerse route must install CAD lazily after the world mounts')
assert.ok(holo.includes("'__showCad'"),'HoloGPT must route CAD/building commands to the CAD runtime')

assert.ok(passport.includes("googleStreetView:'reference-navigation-only'"),'Circle Park passport must keep Google Street View reference-navigation-only')

console.log('StreetVerse holographic CAD building compiler contract: PASS')
