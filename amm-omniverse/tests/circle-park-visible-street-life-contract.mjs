import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const foundry=read('../scripts/tryamm-native-asset-foundry.mjs')
const catalog=read('../src/data/TryammNativeRuntimeAssetCatalog.ts')
const mobile=read('../src/components/StreetVerseMobileWorld.tsx')

for(const asset of ['bus-shelter','basketball-hoop','bike-rack','storefront-awning']){
  assert.ok(foundry.includes(`'${asset}'`),`native foundry missing ${asset}`)
  assert.ok(catalog.includes(`${asset}.glb`),`runtime catalog missing ${asset}.glb`)
}
for(const label of [
 'mobile-native-bus-shelter-west',
 'mobile-native-basketball-hoop-west',
 'mobile-native-basketball-hoop-east',
 'mobile-native-bike-rack',
 'mobile-native-storefront-awning-west',
]) assert.ok(mobile.includes(label),`mobile Circle Park missing visible placement ${label}`)

assert.ok(catalog.includes("collisionAuthority:'visual-only'"),'new visible assets must remain visual-only until runtime/collision certification')
assert.ok(mobile.includes("previewVisualOnly:true"),'Circle Park native layer must continue reporting preview visual authority')
assert.ok(mobile.includes("assetAuthority:'generated-glb-visuals-over-primitive-control-roots'"),'working gameplay/collision roots must stay authoritative while visuals improve')

console.log('Circle Park visible street-life upgrade contract: PASS')
