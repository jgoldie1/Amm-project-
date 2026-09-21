import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/commerce/businessPassportStorefront.ts', import.meta.url), 'utf8')
const required = [
  'buildStreetVerseStorefrontDraft',
  'StreetVerseStorefrontDraft',
  "channels: ['ai-storefront', 'streetverse']",
  "verification: 'draft'",
  "status: 'draft'",
  "stockOnHand: 0",
  "fulfillment: []",
  "world: 'streetverse'",
  'referralScoutId',
  'Merchant verification required before commerce publication',
  'Scan-to-Twin cannot silently activate commerce listings',
]
for (const token of required) {
  if (!source.includes(token)) throw new Error('Passport storefront bridge missing: ' + token)
}
if (/verification:\s*['"]verified['"]/.test(source)) throw new Error('Passport approval must not auto-verify merchant')
if (/status:\s*['"]active['"]/.test(source)) throw new Error('Scan-to-Twin must not auto-activate listings')
console.log('Business Passport -> StreetVerse storefront bridge: PASS')
