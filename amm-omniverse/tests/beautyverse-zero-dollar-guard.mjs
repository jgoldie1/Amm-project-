import fs from 'node:fs'
import assert from 'node:assert/strict'
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const book=fs.readFileSync(new URL('../src/components/BeautyVerseBookingBeta.tsx',import.meta.url),'utf8')
const owner=fs.readFileSync(new URL('../src/components/BeautyVerseOwnerBeta.tsx',import.meta.url),'utf8')
const manifest=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
assert.ok(main.includes('VITE_ENABLE_TAMPA_VOLCANO_BETA'), 'Beta must be disabled unless explicitly enabled')
assert.ok(book.includes('No payment, customer information, or appointments are collected.'), 'Booking demo must disclose limits')
assert.ok(owner.includes('This page is not an authenticated owner portal'), 'Owner preview must not imply privacy')
for(const source of [book,owner]){
 assert.doesNotMatch(source,/\bfetch\s*\(|localStorage\.|sessionStorage\.|new WebSocket\(/,'No network or private persistence in public prototypes')
}
assert.ok(!Object.keys(manifest.dependencies||{}).some(n=>/twilio|sendgrid|paddle/.test(n)), 'No extra paid service client dependency should be added')
console.log('PASS BeautyVerse zero-dollar guard checks')
