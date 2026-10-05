import fs from 'node:fs'

const sync=fs.readFileSync(new URL('../scripts/sync-cc0-free-assets.mjs',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammCc0FreeAssetCatalog.ts',import.meta.url),'utf8')
const runtime=fs.readFileSync(new URL('../src/runtime/TryammCc0FreeAssetRuntime.ts',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('CC0 FREE ASSET LAYER CONTRACT FAIL: '+msg)}

must(sync.includes("SOURCE_COMMIT='1f7dee9076ee848773f08fd632ab4e4e73357777'"),'source mirror must be pinned to an immutable commit')
must(sync.includes("license:'CC0-1.0'"),'sync manifest must record CC0 license')
must(sync.includes("creditsUsed:0"),'sync must declare zero Meshy credits used')
must(sync.includes("packs/car-kit/police.glb"),'police vehicle must be in free asset pack')
must(sync.includes("packs/car-kit/firetruck.glb"),'firetruck must be in free asset pack')
must(sync.includes("packs/city-kit-roads/traffic-light.glb"),'traffic light must be in free asset pack')
must(sync.includes("packs/nature-kit/tree-oak.glb"),'tree must be in free asset pack')
must(catalog.includes("commercialUse:true"),'catalog must record commercial-use permission')
must(catalog.includes("attributionRequired:false"),'catalog must record attribution rule')
must(runtime.includes("createTryammCc0FreeAssetLayer"),'runtime loader missing')
must(runtime.includes("visualOnly:true"),'free layer must not silently become physics authority')
must(runtime.includes("collisionAuthority:false"),'free layer must not alter vehicle collision controls')
must(mobile.includes("createTryammCc0FreeAssetLayer(scene)"),'StreetVerse mobile must mount the free layer')
must(mobile.includes("cc0FreeLayer?.dispose()"),'StreetVerse mobile must dispose the free layer')
must(String(pkg.scripts?.['free:assets']||'').includes('sync-cc0-free-assets.mjs'),'free asset npm script missing')
must(String(pkg.scripts?.build||'').startsWith('npm run free:assets && node tests/cc0-free-asset-layer-contract.mjs'),'production build must sync and validate CC0 assets first')

console.log('CC0 FREE ASSET LAYER CONTRACT PASS')
