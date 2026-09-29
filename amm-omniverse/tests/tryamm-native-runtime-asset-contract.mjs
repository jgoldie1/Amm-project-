import fs from 'node:fs'

const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/TryammNativeAssetRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/CircleParkHolographicWorld.tsx',import.meta.url),'utf8')
const foundry=fs.readFileSync(new URL('../scripts/tryamm-native-asset-foundry.mjs',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM NATIVE RUNTIME ASSET CONTRACT FAIL: '+msg)}

must(pkg.scripts['native:assets']==='node scripts/tryamm-native-asset-foundry.mjs public/generated-assets/native','native assets must be generated into Vite public build input')
must(String(pkg.scripts.build).startsWith('npm run native:assets &&'),'native generation must run before the normal build')

for(const id of ['brick-building-module','street-lamp','tree','bench','hydrant','holo-wayfinder','vehicle-blockout','street-and-sidewalk']){
  must(catalog.includes(`id:'${id}'`),'runtime catalog missing '+id)
  must(catalog.includes(`/generated-assets/native/kit/${id}.glb`),'runtime URL mismatch for '+id)
  must(foundry.includes(`'${id}'`),'foundry does not generate runtime asset '+id)
}

must(catalog.includes("state:'PREVIEW'"),'new native assets must remain PREVIEW until certified')
must(catalog.includes("collisionAuthority:'visual-only'"),'preview assets must not silently become collision authority')
must(catalog.includes('primitiveGameplayCollisionRemainsAuthoritative:true'),'gameplay primitives must remain authoritative during preview')
must(runtime.includes("GLTFLoader"),'runtime must use GLTFLoader')
must(runtime.includes("Promise.all(uniqueKeys.map"),'native runtime assets should load in parallel')
must(runtime.includes("failed.push"),'runtime must record failed asset loads')
must(runtime.includes("previewVisualOnly:true"),'loaded preview assets must be marked visual-only')
must(runtime.includes("disposeNativeAssetLayer"),'runtime must dispose GPU resources on world exit')
must(world.includes("loadTryammNativeCircleParkLayer"),'Circle Park must load TRYAMM native assets')
must(world.includes("disposeNativeAssetLayer"),'Circle Park must clean up TRYAMM native assets')
must(world.includes("NATIVE ASSETS:"),'Circle Park must expose native asset load state')
must(world.includes("state:result.loaded>0?'READY':'FALLBACK'"),'Circle Park must fall back instead of crashing when assets are unavailable')
must(world.includes("TRYAMM native GLB preview layer + authoritative gameplay primitives"),'Circle Park must truthfully distinguish visual preview from gameplay authority')

console.log('TRYAMM NATIVE RUNTIME ASSET CONTRACT PASS: foundry -> public build -> catalog -> parallel GLB load -> visual-only fallback-safe Circle Park runtime')
