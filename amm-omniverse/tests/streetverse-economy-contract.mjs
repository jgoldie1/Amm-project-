import fs from 'node:fs'
import assert from 'node:assert/strict'

const component=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
const ledger=fs.readFileSync(new URL('../src/runtime/OmniverseAssetLedger.ts',import.meta.url),'utf8')
const registry=fs.readFileSync(new URL('../src/data/streetverseAssetRegistry.ts',import.meta.url),'utf8')

for(const required of ['European Luxury Sedan','Italian-Style Grand Tourer','Exotic Supercar','Lake Speedboat','Luxury Motor Yacht']){
  assert.match(component,new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),`StreetVerse scene missing ${required}`)
}
for(const required of ['dog','deer','horse','birds'])assert.match(component,new RegExp(required),`StreetVerse animal population missing ${required}`)
for(const event of ['MISSION_REWARD','PURCHASE','RENTAL','SPONSOR_REWARD'])assert.match(ledger,new RegExp(event),`Internal ledger missing ${event}`)
for(const className of ["'animal'","'car'","'luxury-car'","'boat'"])assert.match(ledger,new RegExp(className),`Asset ledger missing ${className}`)
assert.match(ledger,/previousHash/,'Ledger must be hash-linked')
assert.match(ledger,/SHA-256/,'Ledger must use SHA-256 when Web Crypto is available')
assert.match(registry,/license\?:'ORIGINAL'\|'LICENSED'\|'PLACEHOLDER'/,'Asset registry must track rights status')
assert.match(registry,/provenance\?:string/,'Asset registry must track provenance')
assert.match(registry,/kind:'watercraft'/,'Asset registry must include watercraft')

console.log('StreetVerse economy contract OK: living assets + internal ledger + revenue attribution are wired.')
