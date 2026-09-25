import assert from 'node:assert/strict'
import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/commerce/businessPassportStorefront.ts',import.meta.url),'utf8')
for(const token of [
 'buildStreetVerseStorefrontDraft','StreetVerseStorefrontDraft',"channels: ['ai-storefront', 'streetverse']",
 "verification: 'draft'","status: 'draft'","stockOnHand: 0","fulfillment: []","world: 'streetverse'",
 'referralScoutId','Merchant verification required before commerce publication','Scan-to-Twin cannot silently activate commerce listings'
]) assert.ok(source.includes(token),'Passport storefront bridge missing: '+token)
assert.doesNotMatch(source,/verification:\s*['"]verified['"]/,'Passport approval must not auto-verify merchant')
assert.doesNotMatch(source,/status:\s*['"]active['"]/,'Scan-to-Twin must not auto-activate listings')
console.log('Business Passport -> StreetVerse storefront bridge: PASS')
