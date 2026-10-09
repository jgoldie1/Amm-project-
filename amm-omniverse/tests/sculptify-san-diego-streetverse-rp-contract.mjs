import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const profile=read('../src/data/sculptifySanDiegoStreetVerse.ts')
const registry=read('../src/data/universalMissionRegistry.ts')
const director=read('../src/components/UniversalMissionDirector.tsx')
const runtime=read('../src/runtime/SculptifySanDiegoStreetVerseRuntime.ts')
const growth=read('../src/runtime/StreetVerseGrowthNetworkRuntime.ts')
const splits=read('../src/game/economy/TryammSplitPolicy.ts')
const main=read('../src/main.tsx')

for(const id of [
  'sculptify-sd-grand-opening',
  'sculptify-sd-wellness-district',
  'sculptify-sd-academy-career',
  'sculptify-sd-partner-run',
  'sculptify-sd-city-showcase',
]) assert.ok(profile.includes(id),`missing Sculptify mission ${id}`)

assert.ok(registry.includes('SCULPTIFY_SAN_DIEGO_MISSIONS'),'Sculptify mission pack must be registered')
assert.ok(registry.includes("'open-sculptify-san-diego'"),'Sculptify StreetVerse action missing')
for(const event of [
  'sculptify-booking-intent',
  'sculptify-academy-intent',
  'sculptify-store-interaction',
  'sculptify-referral-verified',
  'sculptify-referred-user-active',
]) assert.ok(registry.includes(event),`mission event missing ${event}`)

assert.ok(director.includes("tryamm:sculptify-rp-signal"),'Universal Mission Director must consume Sculptify RP evidence')
assert.ok(director.includes("city=san-diego&business=sculptifyltd"),'mission action must target Sculptify San Diego')
assert.ok(main.includes('installSculptifySanDiegoStreetVerseRuntime'),'Sculptify runtime must install after app mount')

assert.ok(profile.includes("partnerCode:'SV-SCULPTIFY-SD'"),'Sculptify partner code missing')
assert.ok(profile.includes('initialPartnerShareBps:500'),'starter referral share must be 5%')
assert.ok(profile.includes('paysForRawScan:false'),'raw QR scans must not create payment')
assert.ok(profile.includes('paysForRawSignup:false'),'raw signups must not create payment')
assert.ok(profile.includes('oneLevelOnly:true'),'business referrals must remain one-level')
assert.ok(profile.includes('serverAuthoritativeSettlement:true'),'partner settlement must be server authoritative')

assert.ok(runtime.includes("event==='sculptify-referral-verified'||event==='sculptify-referred-user-active'"),'valuable referral progress must require server verification')
assert.ok(runtime.includes("serverVerified!==true"),'runtime must reject unverified referral evidence')
assert.ok(runtime.includes('financial:false'),'client RP dominance state must not be financial authority')
assert.doesNotMatch(runtime,/payableBalance|withdrawable|stripe.*create|awardCash/i,'Sculptify client RP runtime must not create cash authority')

assert.ok(growth.includes("'wellness'"),'StreetVerse Growth Network must support wellness businesses')
for(const lane of ['wellness-booking','academy','staffing-pathway','wellness-store','business-template-sales','streetverse-rp-missions']){
  assert.ok(growth.includes(lane),`wellness growth lane missing ${lane}`)
}

assert.ok(splits.includes("'business-user-referral'"),'business-user-referral split template missing')
assert.ok(splits.includes("'referrer-business'"),'referrer-business split destination missing')
assert.ok(splits.includes('basisPoints:500'),'business referral share must include 500 bps starter allocation')
assert.ok(splits.includes('noPaymentForRawBusinessReferralScanOrSignup:true'),'split policy must prohibit payment for raw signups')
assert.ok(splits.includes('businessReferralRequiresEligiblePlatformRevenue:true'),'split policy must require real platform revenue')
assert.ok(splits.includes('businessReferralOneLevelOnly:true'),'split policy must prohibit multi-level referral chains')

for(const token of [
  'verifiedServiceCompletion:40',
  'verifiedStoreOrder:20',
  'approvedAcademyCompletion:60',
  'verifiedStaffingPlacement:80',
  'verifiedStreetVerseActivation:25',
  'verifiedLocalBusinessCollaboration:50',
]) assert.ok(profile.includes(token),`RP reputation event missing ${token}`)

console.log('Sculptify San Diego StreetVerse RP contract: PASS')
