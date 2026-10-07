import fs from 'node:fs'

const runtime=fs.readFileSync(new URL('../src/runtime/TryammNativeAssetRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseNearWest3D.tsx',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('MOVING NATIVE ACTOR CONTRACT FAIL: '+msg)}

must(runtime.includes('nativeVisualSourceCache'),'moving native visuals must share a source cache')
must(runtime.includes('loadTryammNativeVisualInstance'),'runtime must expose a moving visual instance loader')
must(runtime.includes("collisionAuthority:'parent-gameplay-runtime'"),'moving native visual must leave movement/collision authority with parent gameplay runtime')
must(runtime.includes('releaseTryammNativeVisualInstance'),'moving visual instances must detach safely')
must(runtime.includes('source.clone(true)')||runtime.includes('cloneForPlacement(source)'),'moving native instances must clone visual sources')

must(world.includes("loadTryammNativeVisualInstance('sportSedan2027'"),'moving civilian traffic must load the deployed sport sedan GLB')
for(const resident of ['residentE','residentF','residentG','residentH']){
  must(world.includes("'"+resident+"'"),'moving pedestrian pool missing '+resident)
}
must(world.includes('MovingNativeVehicleVisual'),'Near West moving car visual wrapper missing')
must(world.includes('MovingNativeResidentVisual'),'Near West moving resident visual wrapper missing')
must(world.includes("tryamm:streetverse-moving-native-ready"),'moving visual readiness evidence event missing')
must(world.includes('!ready&&<>'),'moving actors must retain primitive visual fallback until GLB load succeeds')
must(world.includes('tRef.current=(tRef.current+dt*speed)%1'),'existing traffic route movement must remain intact')
must(world.includes("tRef.current=(tRef.current+dt*.075)%1"),'existing pedestrian path movement must remain intact')

for(const url of [
  "/generated-assets/native/kit/tryamm-2027-sport-sedan.glb",
  "/generated-assets/native/kit/resident-archetype-e.glb",
  "/generated-assets/native/kit/resident-archetype-h.glb",
]){
  must(catalog.includes(url),'moving actor deployed GLB URL missing '+url)
}

console.log('MOVING NATIVE ACTOR CONTRACT PASS: traffic + pedestrians use cached deployed GLBs with movement authority and primitive fallbacks preserved')
