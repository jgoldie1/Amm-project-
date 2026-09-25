import assert from 'node:assert/strict'
import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/commerce/businessPassport.ts',import.meta.url),'utf8')
for(const token of [
 'BusinessCaptureConsent','CaptureAsset','ExtractedFact','BusinessPassport','SCAN_TO_TWIN_FLOW',
 'AUTHORIZED_CONSENT','GUIDED_CAPTURE','AI_EXTRACTION','OWNER_REVIEW','AUTHORITATIVE_PRICE_RESOLUTION',
 'PUBLISH_STREETVERSE','validateCaptureAsset','passportCanPublish',
 'Owner approval required before publication','Every extracted fact must be reviewed by the owner',
 'hardcodedPassportPricesAllowed: false','authoritativePricingRequiredBeforeCheckout: true',
 "sourceOfTruth: 'authoritative-pricing-or-offer-service'"
]) assert.ok(source.includes(token),'Business Passport contract missing: '+token)
assert.doesNotMatch(source,/priceUsd\s*:|price_usd\s*:|STREET_29|COMMERCE_49|EXPERIENCE_499/,'Business Passport must not restore stale hardcoded plan prices')
console.log('Business Passport Scan-to-Twin authority contract: PASS')
