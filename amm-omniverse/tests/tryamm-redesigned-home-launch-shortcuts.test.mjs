import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
const home=fs.readFileSync(new URL('../src/components/TryAMMHome.tsx',import.meta.url),'utf8')
const hub=fs.readFileSync(new URL('../src/components/UnifiedCommerceHub.tsx',import.meta.url),'utf8')
test('redesign keeps one-hand accessible direct routes above the 3D world hero',()=>{
 const shortcuts=home.indexOf('Quick access to worlds and businesses')
 const hero=home.indexOf('tryamm-world-hero')
 assert.ok(shortcuts>=0&&shortcuts<hero)
 for(const route of ['/streetverse','/yahavah-grocery','/farm-to-family','/stores','/beauty-supply'])assert.ok(home.includes(route),route)
 assert.match(home,/minHeight:58/)
 assert.match(home,/aria-label="Direct business and game shortcuts"/)
 assert.match(home,/No full-screen menu required/)
})
test('Farm Passport is wired to existing commerce route rather than a dead button',()=>{
 assert.match(hub,/p==='\/farm-to-family'/)
 assert.match(hub,/<FarmToFamilyPilot\/>/)
})
