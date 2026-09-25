import assert from 'node:assert/strict'
import fs from 'node:fs'
const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const ui=read('../src/components/BusinessPassportCenter.tsx')
const builder=read('../src/components/MetaverseBusinessBuilder.tsx')
const core=read('../src/commerce/businessPassport.ts')

assert.match(builder,/lazy\(\(\)=>import\('\.\/BusinessPassportCenter'\)\)/,'Business Passport should remain lazy-loaded')
assert.match(builder,/BUSINESS PASSPORT \/ SCAN-TO-TWIN/,'Living World Business Builder must expose the Passport entry')
for(const token of ['Authorized capture','Owner-reviewed facts','OWNER APPROVE DRAFT','BUILD STREETVERSE STOREFRONT DRAFT','NOT LIVE','session-unverified','buildStreetVerseStorefrontDraft','storefrontCanPublish']) assert.ok(ui.includes(token),'Visible Passport workflow missing: '+token)
assert.match(ui,/type="file" accept="image\/\*" capture="environment"/,'mobile camera/file capture entry must exist')
assert.match(ui,/Nothing is uploaded from this screen/,'visible workflow must disclose session-only capture')
assert.match(ui,/merchant verification: \{storefront\.merchant\.verification\}/,'visible draft must expose merchant verification state')
assert.doesNotMatch(ui,/fetch\(/,'first visible Passport build must not pretend to upload or publish through an unverified backend')
assert.match(core,/Consent does not permit AI draft processing/,'capture validation must require explicit AI-draft consent')
console.log('Visible Business Passport builder contract: PASS')
