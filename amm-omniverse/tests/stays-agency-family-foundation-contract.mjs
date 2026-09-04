import fs from 'node:fs'

const source=fs.readFileSync(new URL('../src/foundation/staysAgencyFamilyFoundation.ts',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
const hub=fs.readFileSync(new URL('../src/components/StaysAgencyFamilyHub.tsx',import.meta.url),'utf8')

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

const visibleAppTokens=[
  "lazy(() => import('./components/StaysAgencyFamilyHub'))",
  'showStaysAgencyFamily',
  '__showStaysAgencyFamily',
  'STAYS · AGENCY · FAMILY',
  '<StaysAgencyFamilyHub onClose=',
]
for(const token of visibleAppTokens){
  if(!app.includes(token))throw new Error(`Missing visible stays/agency/family app wiring: ${token}`)
}

const visibleHubTokens=[
  'TRYAMM CONNECTED LIFE',
  'Stays · Agencies · Family',
  'server/provider authoritative',
  'Open PropertyVerse',
  'Open TRYAMM LIVE',
  'Creator earnings protection',
  'Privacy defaults',
  'Accessibility',
]
for(const token of visibleHubTokens){
  if(!hub.includes(token))throw new Error(`Missing visible stays/agency/family hub content: ${token}`)
}

if(source.includes("integrationBoundary:'Airbnb partnership")){
  throw new Error('Foundation must not imply an Airbnb partnership')
}

console.log('TRYAMM Stays, creator agency, family streaming authority + visible hub contract passed')
