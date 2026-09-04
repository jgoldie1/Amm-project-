import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/foundation/staysAgencyFamilyFoundation.ts',import.meta.url),'utf8')

const required=[
  "brandName:'TRYAMM Stays'",
  "brandName:'TRYAMM Creator Agencies'",
  "brandName:'TRYAMM Family Groups'",
  'PropertyVerse',
  'StreetVerse',
  'TRYAMM LIVE',
  'PK/panels',
  'Creator Commerce',
  'reservation.held',
  'payment.authorized',
  'host.payout.settled',
  "complianceStatus!=='APPROVED'",
  'availability-hold-required',
  'payment-authorization-required',
  'creator-consent-required',
  'contract-evidence-required',
  'minor-age-compliance-review-required',
  'minor-guardian-consent-required',
  'minor-moderation-lane-required',
  'minor-precise-location-sharing-blocked',
  'mayStayClientConfirmReservationOrPayout(){return false as const}',
  'mayAgencySeizeCreatorEarnings(){return false as const}',
  'mayAgencyChangeCommissionWithoutCreatorAgreement(){return false as const}',
  'mayMinorJoinAgencyWithoutGuardianReview(){return false as const}',
  'mayFamilyPoolWalletsByDefault(){return false as const}',
  'mayFamilySharePreciseLocationByDefault(){return false as const}',
]

for(const token of required){
  if(!source.includes(token))throw new Error(`Missing stays/agency/family protection: ${token}`)
}

if(source.includes("integrationBoundary:'Airbnb partnership")){
  throw new Error('Foundation must not imply an Airbnb partnership')
}

console.log('TRYAMM Stays, creator agency, and family streaming authority contract passed')
