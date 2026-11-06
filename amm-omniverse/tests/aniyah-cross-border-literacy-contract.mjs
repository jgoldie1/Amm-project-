import assert from 'node:assert/strict'
import fs from 'node:fs'
const component=fs.readFileSync(new URL('../src/components/AniyahCrossBorderLiteracy.tsx',import.meta.url),'utf8')
const parent=fs.readFileSync(new URL('../src/components/CrossVerseCreatorEconomyCenter.tsx',import.meta.url),'utf8')
for(const token of ['calculateCrossBorderQuote','Number.isFinite','received','effectiveRate','Safety and scams','Consumer protection','No real payment is initiated','age-appropriate account ownership'])assert.ok(component.includes(token),'Missing safety/learning requirement '+token)
assert.ok(parent.includes('<AniyahCrossBorderLiteracy/>'),'Simulator not mounted')
assert.ok(!component.includes('getUserMedia('))
assert.ok(!component.includes('fetch('),'No money-transfer or third-party call from education simulator')
console.log('Aniyah Cross Borders financial literacy source contract: PASS')
