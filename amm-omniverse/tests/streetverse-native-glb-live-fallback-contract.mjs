import fs from 'node:fs'
import assert from 'node:assert/strict'

const character=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyCharacterRuntime.ts',import.meta.url),'utf8')
const body=fs.readFileSync(new URL('../src/runtime/StreetVersePublishedBodyBaseRuntime.ts',import.meta.url),'utf8')
const catalog=fs.readFileSync(new URL('../src/data/TryammNativeRuntimeAssetCatalog.ts',import.meta.url),'utf8')

for(const token of [
  'NATIVE_RESIDENT_URLS',
  "contentType.includes('text/html')",
  "contentType.includes('application/xhtml+xml')",
  "staticMeshyReady?staticMeshyUrl:nativeUrl",
  "tryamm:native-character-ready",
  "source:nativeFallback?'tryamm-native':'meshy'",
  'upgradePending:nativeFallback'
])assert.ok(character.includes(token),'character live fallback missing '+token)

for(const token of [
  'TRYAMM_NATIVE_RUNTIME_ASSETS.residentA.url',
  'TRYAMM_NATIVE_RUNTIME_ASSETS.residentB.url',
  "published?.walkUrl",
  "published?.runUrl",
  "source:nativeFallback?'tryamm-native':'meshy'",
  'finalLikeness:false'
])assert.ok(body.includes(token),'body live fallback missing '+token)

for(const token of ['resident-archetype-a.glb','resident-archetype-b.glb','resident-archetype-h.glb'])
  assert.ok(catalog.includes(token),'native GLB catalog missing '+token)

console.log('STREETVERSE NATIVE GLB LIVE FALLBACK PASS')
