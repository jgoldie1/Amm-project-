import fs from 'node:fs'

const path = new URL('../src/commerce/businessPassport.ts', import.meta.url)
const source = fs.readFileSync(path, 'utf8')

const required = [
  "BusinessPlanId = 'FREE' | 'STREET_29' | 'COMMERCE_49' | 'EXPERIENCE_499'",
  "BillingCadence = 'UNSET'",
  'BusinessCaptureConsent',
  'CaptureAsset',
  'ExtractedFact',
  'BusinessPassport',
  'SCAN_TO_TWIN_FLOW',
  'AUTHORIZED_CONSENT',
  'GUIDED_CAPTURE',
  'AI_EXTRACTION',
  'OWNER_REVIEW',
  'PUBLISH_STREETVERSE',
  'validateCaptureAsset',
  'passportCanPublish',
  'Owner approval required before publication',
  'Every extracted fact must be reviewed by the owner',
]

for (const token of required) {
  if (!source.includes(token)) throw new Error('Business Passport contract missing: ' + token)
}

if (/cadence:\s*['"]monthly['"]|cadence:\s*['"]annual['"]/i.test(source)) {
  throw new Error('Billing cadence must remain UNSET until explicitly approved')
}

console.log('Business Passport Scan-to-Twin contract: PASS')
