import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')
const market=read('src/components/StreetVerseTampaCommercialMarketplace.tsx')
const world=read('src/components/StreetVerseNearWest3D.tsx')
for(const id of ['website-450','storefront','holo-ad','event','brand-partnership'])assert.ok(market.includes("id:'"+id+"'"))
for(const term of ['$450 USD','SAVE INQUIRY DRAFT','localStorage.setItem','Not sent to LaTeasia','No automatic Cash App payments'])assert.ok(market.includes(term))
assert.match(world,/<StreetVerseTampaCommercialMarketplace\/>/)
console.log('Tampa commercial marketplace static contract PASS')
