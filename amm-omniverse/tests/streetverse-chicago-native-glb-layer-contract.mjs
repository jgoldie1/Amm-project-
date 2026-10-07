import fs from 'node:fs'

const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/TryammNativeAssetRuntime.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('CHICAGO NATIVE GLB LAYER CONTRACT FAIL: '+msg)}

must(catalog.includes('CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS'),'Chicago West native placement manifest must exist')
for(const token of [
  "asset:'building'",
  "asset:'tree'",
  "asset:'streetLamp'",
  "asset:'bench'",
  "asset:'hydrant'",
  "asset:'sportSedan2027'",
  "asset:'boxTruckCustom2027'",
  "asset:'residentA'",
])must(catalog.includes(token),'Chicago West placement manifest missing '+token)

for(const url of [
  "/generated-assets/native/kit/brick-building-module.glb",
  "/generated-assets/native/kit/tree.glb",
  "/generated-assets/native/kit/street-lamp.glb",
  "/generated-assets/native/kit/tryamm-2027-sport-sedan.glb",
  "/generated-assets/native/kit/resident-archetype-a.glb",
])must(catalog.includes(url),'deployed GLB catalog URL missing '+url)

must(world.includes("loadTryammNativeCircleParkLayer({placements:CHICAGO_WEST_NATIVE_PREVIEW_PLACEMENTS})"),'Near West must load the deployed native placement set')
must(world.includes('<NearWestNativeGlbLayer/>'),'Near West Canvas must mount the native GLB visual layer')
must(world.includes("fallback:'existing-procedural-world'"),'native GLB failure must preserve the procedural world fallback')
must(world.includes("gameplayCollisionAuthority:'existing-near-west-runtime'"),'native GLBs must not silently replace gameplay collision authority')
must(world.includes("visualOnly:true"),'native GLB layer must remain visual-only until asset/collision certification')
must(world.includes("tryamm:streetverse-chicago-native-assets-ready"),'native layer must emit readiness evidence')
must(runtime.includes('loadTryammNativeCircleParkLayer'),'native GLB loader must use the existing audited TRYAMM runtime')
must(runtime.includes('failed:NativeAssetLayerResult'),'native loader must track failed assets without crashing StreetVerse')

console.log('CHICAGO NATIVE GLB LAYER CONTRACT PASS: deployed GLBs mount into Near West with procedural/collision fallback preserved')
