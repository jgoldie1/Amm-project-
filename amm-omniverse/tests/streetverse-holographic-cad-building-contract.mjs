import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const recon=read('../src/game/runtime/holographicBuildingReconstruction.ts')
const cad=read('../src/runtime/StreetVerseCadBimBridge.ts')
const runtime=read('../src/runtime/StreetVerseHolographicCadBuilderRuntime.ts')
const main=read('../src/main.tsx')
const circle=read('../src/data/buildingPassports/circlePark.ts')

for(const token of [
  "'cad-dwg'","'cad-dxf'","'bim-ifc'","'floor-plan-svg'","'point-cloud'","'mesh-glb'",
  "'NORMALIZE_CAD_AND_BIM_LAYERS'",
  "'GENERATE_STAIRS_AND_ELEVATORS'",
  "'GENERATE_UTILITY_GRAPHS'",
  "'GENERATE_NAVIGATION_AND_ACCESSIBILITY'",
]) assert.ok(recon.includes(token),`building reconstruction missing ${token}`)

for(const token of [
  "schema:'tryamm.holographic-cad-building.v1'",
  "stairs:boolean",
  "elevators:boolean",
  "plumbing:boolean",
  "electrical:boolean",
  "hvac:boolean",
  "fireProtection:boolean",
  "interactableElevators:elevators",
  "interactablePlumbing:plumbing",
  "collision",
  "navmesh",
  "lod-pack",
]) assert.ok(cad.includes(token),`CAD/BIM bridge missing ${token}`)

assert.ok(cad.includes("Reference-only imagery may guide alignment and facade proportions but is not baked into persistent game textures."),'reference imagery must not silently become persistent facade texture')
assert.ok(cad.includes("PERSISTENT_RIGHTS"),'persistent facade material must require an allowed rights class')
assert.ok(runtime.includes("tryamm:cad-building-compile"),'runtime must accept CAD building compile requests')
assert.ok(runtime.includes("tryamm:cad-building-ready"),'runtime must publish compiled CAD building plans')
assert.ok(runtime.includes("tryamm:system-fabric-signal"),'CAD building runtime must report into shared system fabric')
assert.ok(runtime.includes("__tryammCadBuilder"),'CAD builder must expose one command surface')
assert.ok(main.includes("installStreetVerseHolographicCadBuilder"),'main bootstrap must install CAD builder lazily after core mount')

assert.ok(circle.includes("googleStreetView:'reference-navigation-only'"),'Circle Park policy must keep Google Street View reference-navigation-only')
assert.ok(circle.includes("'open municipal data'")&&circle.includes("'licensed imagery'")&&circle.includes("'owner-authorized plans'")&&circle.includes("'TRYAMM-created scans/models'"),'Circle Park must define persistent reconstruction source options')

console.log('StreetVerse holographic CAD/BIM building compiler contract: PASS')
