import fs from 'node:fs'
import assert from 'node:assert/strict'
const hub=fs.readFileSync(new URL('../src/components/UnifiedCommerceHub.tsx',import.meta.url),'utf8')
const fridge=fs.readFileSync(new URL('../src/components/HoloFridge.tsx',import.meta.url),'utf8')
for(const token of ['YAHAVAH Food','Eat Wild Food','__showYahavahFood','__showEatWildFood','live-commerce-open','SERVER-AUTHORIZED ORDER','Storehouse allocations remain separately accounted']) assert.ok(hub.includes(token),`commerce recovery missing ${token}`)
for(const token of ['Verified wild-caught fish','Pantry Supply Box','Family Food Supply Box','Community Food Box','Emergency Rotation Box','STOREHOUSE','Unknown wild mushrooms','Storehouse allocation is recorded separately']) assert.ok(fridge.includes(token),`fridge/storehouse recovery missing ${token}`)
assert.ok(hub.includes('verified source')||hub.includes('verified-source'),'source verification missing')
assert.ok(hub.includes('authoritative inventory')||hub.includes('AUTHORITATIVE INVENTORY'),'authoritative inventory boundary missing')
console.log('YAHAVAH Food / Eat Wild / Storehouse recovery contract passed')
