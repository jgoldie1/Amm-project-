import assert from 'node:assert/strict'
import fs from 'node:fs'
const mission=fs.readFileSync(new URL('../src/components/AniyahStreetVerseMissions.tsx',import.meta.url),'utf8')
const city=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
const literacy=fs.readFileSync(new URL('../src/components/AniyahCrossBorderLiteracy.tsx',import.meta.url),'utf8')
for(const token of ['StreetVersePhotoCamera','calculateCrossBorderQuote','mark(\'literacy\')','mark(\'order\')','localStorage.setItem','AniyahCrossBorderLiteracy','No payment or shipment'])assert.ok(mission.includes(token),'Missing mission feature '+token)
assert.ok(city.includes('ANIYAH MISSIONS')&&city.includes('<AniyahStreetVerseMissions'),'Mission launcher disconnected')
assert.ok(literacy.includes('calculateCrossBorderQuote'))
assert.ok(!mission.includes('fetch('),'Training missions must not send money or upload customer data')
console.log('Aniyah combined mission integration source contract: PASS')
