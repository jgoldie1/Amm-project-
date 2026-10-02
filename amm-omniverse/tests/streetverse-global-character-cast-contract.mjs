import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const registry=read('../src/data/StreetVerseGlobalCharacterRegistry.ts')
const world=read('../src/components/StreetVerseGlobalWorld.tsx')
const globalRegistry=read('../src/data/StreetVerseGlobalRegistry.ts')

for(const city of ['chicago','lagos','abuja','accra','nairobi','johannesburg','addis-ababa']){
 assert.ok(registry.includes(`${city}:[`)||registry.includes(`'${city}':[`),`first-wave global character cast missing ${city}`)
}
for(const slot of ['sv-black-man-youngadult-01','sv-black-woman-youngadult-01','sv-black-man-adult-01','sv-black-woman-adult-01']){
 assert.ok(registry.includes(slot),`global cast must reuse certified shared slot ${slot}`)
}
assert.ok(registry.includes('fictional:true'),'global named city cast must be explicitly fictional')
assert.ok(registry.includes('realPersonLikenessRequiresAuthorization:true'),'global cast must preserve likeness authorization policy')
assert.ok(registry.includes('oneSharedRigPackWithCitySpecificCasting:true'),'global cast must share the base rig pack across cities')
assert.ok(registry.includes('childAndTeenAfterDarkBlocked:true'),'global cast policy must block child/teen After Dark casting')

for(const token of [
 'CITY CHARACTER CAST',
 'tryamm:streetverse-global-character-select',
 'tryamm:streetverse-player-asset-select',
 'tryamm.streetverse.playable-character.v1',
 'streetverse-global-living-city',
 'streetverse-global-after-dark',
]){
 assert.ok(world.includes(token),`StreetVerse Global character UI missing ${token}`)
}

assert.ok(globalRegistry.includes("id:'lagos'")&&globalRegistry.includes("id:'abuja'"),'Nigeria launch cities must remain in global registry')
assert.ok(world.includes('Generic rigs are not likeness claims.'),'global UI must not misrepresent generic rigs as real-person likenesses')

console.log('StreetVerse Global city character cast contract: PASS')
