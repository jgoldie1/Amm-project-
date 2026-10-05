export type AniyahStudioSku='aniyah-30d-pass'|'aniyah-ai-session'|'aniyah-engineer-session'|'aniyah-remote-record'|'aniyah-mix-master'|'aniyah-soundtrack-package'
export type AniyahStudioOffer={id:AniyahStudioSku;name:string;priceMinor:number;kind:'access-pass'|'session'|'service';description:string}

export const ANIYAH_64_TRACK_BUSINESS={
 businessId:'aniyah-64-track-studio',
 displayName:'Aniyah 64-Track Studio',
 brandOwner:'Aniyah',
 platform:'TRYAMM',
 studioIdentity:'creator-mode + engineer-mode',
 sellerShareBasisPoints:8500,
 tryammShareBasisPoints:1500,
 currency:'USD',
 payoutRule:'Merchant proceeds become payable only after server-verified payment, fulfillment/entitlement, reconciliation and seller-transfer eligibility.',
 ageAndPayoutRule:'Payout onboarding must follow the payment provider’s age/identity rules; use guardian/custodial business handling when legally required.',
 familySupport:{
  enabled:true,
  automaticCashTransfer:false,
  purpose:'Optional reinvestment from Aniyah Studio business proceeds into approved sibling/family projects.',
  recommendedReserveBasisPoints:1000,
  requiresOwnerOrGuardianApproval:true,
  destinations:['family creator projects','Isaiah AI TV / StarVerse productions','Jacobie Vision / real-estate productions','shared CampusVerse productions'],
 },
} as const

export const ANIYAH_64_TRACK_OFFERS:readonly AniyahStudioOffer[]=[
 {id:'aniyah-30d-pass',name:'64-Track Studio 30-Day Pass',priceMinor:1499,kind:'access-pass',description:'Create Mode + Engineer Mode access for 30 days. Not an auto-renewing subscription.'},
 {id:'aniyah-ai-session',name:'AI Producer Session',priceMinor:999,kind:'session',description:'One guided AI-producer project session with safe preview/version controls.'},
 {id:'aniyah-engineer-session',name:'Engineer Mode Session',priceMinor:1499,kind:'session',description:'Hands-on 64-track DAW session with track mixer, vocal, guitar, podcast and mastering tools.'},
 {id:'aniyah-remote-record',name:'Remote Recording Session',priceMinor:2500,kind:'service',description:'Remote-recording service booking. Provider/live collaboration remains readiness-gated.'},
 {id:'aniyah-mix-master',name:'Mix + Master Service',priceMinor:4900,kind:'service',description:'Mix/master service package with final delivery subject to project review.'},
 {id:'aniyah-soundtrack-package',name:'Reel / TV / Movie Soundtrack Package',priceMinor:9900,kind:'service',description:'Custom soundtrack package for TRYAMM Reels, Isaiah AI TV, All American Network or Movie Studio projects.'},
] as const

export const ANIYAH_STUDIO_REVENUE_CHANNELS=[
 '30-day studio access passes',
 'AI Producer sessions',
 'Engineer Mode sessions',
 'remote recording',
 'mixing and mastering',
 'soundtrack production for Reels, TV and movies',
 'future beat/sample/asset licensing through verified marketplace listings',
 'future recurring membership after subscription billing is implemented and verified',
] as const

export const formatUsd=(minor:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(minor/100)