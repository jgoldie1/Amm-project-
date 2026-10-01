import fs from 'node:fs'
import assert from 'node:assert/strict'

const body=fs.readFileSync(new URL('../src/runtime/StreetVersePublishedBodyBaseRuntime.ts',import.meta.url),'utf8')
const npc=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))

for(const token of [
  'TRYAMM_NATIVE_RUNTIME_ASSETS.residentA.url',
  'TRYAMM_NATIVE_RUNTIME_ASSETS.residentB.url',
  "source:nativeFallback?'tryamm-native':'meshy'",
  'upgradePending:nativeFallback',
  'finalLikeness:false'
])assert.ok(body.includes(token),'body fallback missing '+token)

for(const token of [
  'NATIVE_RESIDENT_URLS',
  'residentA.url','residentB.url','residentC.url','residentD.url',
  'residentE.url','residentF.url','residentG.url','residentH.url',
  "staticMeshyReady?staticMeshyUrl:nativeUrl",
  "tryamm:native-character-ready",
  "upgradePending:nativeFallback"
])assert.ok(npc.includes(token),'NPC native fallback missing '+token)

for(const token of ['streetverse-hero-player.glb','resident-archetype-a.glb','resident-archetype-h.glb'])
  assert.ok(catalog.includes(token),'native catalog missing '+token)

assert.ok(String(pkg.scripts?.build||'').includes('native:assets'),'production build must generate native GLBs before Vite')
assert.ok(String(pkg.scripts?.['native:assets']||'').includes('tryamm-native-asset-foundry.mjs'),'native GLB foundry script missing')

console.log('NATIVE-FIRST / MESHY-OPTIONAL CHARACTER PIPELINE PASS')
