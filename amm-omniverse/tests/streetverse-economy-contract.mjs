import fs from 'node:fs'
import assert from 'node:assert/strict'

const component=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
const mobile=fs.readFileSync(new URL('../src/components/StreetVerseMobilePlayableWorld.tsx',import.meta.url),'utf8')
const ledger=fs.readFileSync(new URL('../src/runtime/OmniverseAssetLedger.ts',import.meta.url),'utf8')
const mobileRewards=fs.readFileSync(new URL('../src/runtime/StreetVerseMobileMissionRewardRuntime.ts',import.meta.url),'utf8')
const checkpointRuntime=fs.readFileSync(new URL('../src/runtime/StreetVerseCheckpointRuntime.ts',import.meta.url),'utf8')
const registry=fs.readFileSync(new URL('../src/data/streetverseAssetRegistry.ts',import.meta.url),'utf8')
const combined=`${component}\n${ledger}\n${registry}`

for(const required of ['European Luxury Sedan','Italian-Style Grand Tourer','Exotic Supercar','Lake Speedboat','Luxury Motor Yacht']){
  assert.ok(combined.includes(required),`StreetVerse asset catalog missing ${required}`)
}
for(const required of ['dog','deer','horse','birds'])assert.match(component,new RegExp(required),`StreetVerse animal population missing ${required}`)
for(const event of ['MISSION_REWARD','PURCHASE','RENTAL','SPONSOR_REWARD'])assert.match(ledger,new RegExp(event),`Internal ledger missing ${event}`)
for(const className of ["'animal'","'car'","'luxury-car'","'boat'"])assert.ok(ledger.includes(className),`Asset ledger missing ${className}`)
assert.match(ledger,/previousHash/,'Ledger must be hash-linked')
assert.match(ledger,/SHA-256/,'Ledger must use SHA-256 when Web Crypto is available')
assert.match(registry,/license\?:'ORIGINAL'\|'LICENSED'\|'PLACEHOLDER'/,'Asset registry must track rights status')
assert.match(registry,/provenance\?:string/,'Asset registry must track provenance')
assert.match(registry,/kind:'watercraft'/,'Asset registry must include watercraft')

assert.match(mobile,/tryamm:streetverse-checkpoint/,'Mobile safe city must emit checkpoint completion events')
assert.match(mobile,/tryamm:streetverse-mission-complete/,'Mobile safe city must emit district completion')
assert.match(mobileRewards,/studio:20,market:25,river:35,stage:30/,'Mobile safe mission reward schedule changed unexpectedly')
assert.match(mobileRewards,/recordMissionReward\(amount,mission\)/,'Mobile safe checkpoints must record rewards through the internal ledger')
assert.match(mobileRewards,/ledgerAlreadyHas\(mission\)/,'Mobile safe rewards must dedupe against the authoritative mission ledger')
assert.match(mobileRewards,/tryamm\.streetverse\.mobile-rewards\.v1/,'Mobile safe rewards must persist one-time completion state')
assert.match(mobileRewards,/tryamm:streetverse-mobile-reward-recorded/,'Mobile safe rewards must expose a confirmed receipt event')
assert.match(mobileRewards,/DEMO CREDITS/,'Mobile safe reward UI must label credits as demo credits')
assert.match(checkpointRuntime,/installStreetVerseMobileMissionRewardRuntime\(\)/,'Mobile mission reward runtime must be installed with StreetVerse checkpoint runtime')

console.log('StreetVerse economy contract OK: living assets + one-time mobile mission rewards + internal ledger + revenue attribution are wired.')
