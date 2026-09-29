import fs from 'node:fs'

const sw=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM NATIVE PWA ASSET CACHE CONTRACT FAIL: '+msg)}

must(sw.includes("20260929-chicago-alive-native-v2"),'service-worker release must advance for native asset cache rules')
must(sw.includes('glb|gltf|bin'),'service worker must cache native 3D formats')
must(sw.includes('caches.open(CACHE_NAME).then(cache => cache.put(request, clone))'),'successful generated assets must be cached')
must(sw.includes('catch(() => caches.match(request))'),'offline requests must fall back to cache')
must(catalog.includes('/generated-assets/native/kit/'),'runtime catalog must use same-origin generated asset URLs')
console.log('TRYAMM NATIVE PWA ASSET CACHE CONTRACT PASS: generated GLBs cache after first fetch and fall back offline')