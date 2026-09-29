export type QrOwnerType='app'|'user'|'creator'|'business'|'scout'|'event'|'place'|'campaign'
export type QrAction='install-app'|'open-passport'|'follow'|'open-business'|'join-live'|'open-streetverse'|'claim-referral'|'start-order'|'open-campaign'

export interface TryammQrPassport{
 id:string; ownerType:QrOwnerType; ownerId:string
 actions:QrAction[]; shortCode:string; active:boolean
}

export interface ScoutAttribution{
 scoutId:string; qrId:string; businessId?:string; userId?:string
 event:'scan'|'install'|'signup'|'business-claim'|'verified-onboarding'|'eligible-purchase'
 occurredAt:string; verified:boolean
}

export const TRYAMM_QR_NETWORK={
 appQr:{
  purpose:'one scan opens the correct install/PWA path and preserves attribution',
  actions:['install-app','open-streetverse','claim-referral'],
 },
 userQr:{
  purpose:'portable TRYAMM Passport for profile, follow, creator/business discovery and approved sharing',
  actions:['open-passport','follow','join-live'],
 },
 businessQr:{
  purpose:'turn a physical storefront, vehicle, menu, card or event into a TRYAMM Business Twin entry point',
  actions:['open-business','start-order','open-streetverse','open-campaign'],
 },
 scoutQr:{
  purpose:'attribute verified business/user onboarding to a Scout without exposing private account data',
  actions:['claim-referral','open-business','install-app'],
 },
} as const

export const SCOUT_NETWORK={
 mission:'Bring real businesses and users into the TRYAMM ecosystem with attributable QR Passports.',
 flow:[
  'Scout receives unique verified Scout QR/referral identity',
  'Scout meets or identifies an eligible business',
  'business owner scans QR and sees transparent TRYAMM onboarding',
  'owner explicitly claims/verifies the Business Passport',
  'Business Twin can connect storefront, media, ads, delivery and StreetVerse',
  'verified attribution event is written server-side',
  'eligible Scout compensation is calculated only under declared program terms',
 ],
 surfaces:['storefront sticker','table card','receipt','business card','vehicle','event booth','creator profile','StreetVerse location'],
} as const

export const QR_SCOUT_RULES={
 dynamicRedirectsPreferred:true,
 preserveCampaignAndScoutAttribution:true,
 qrNeverContainsPasswordsOrSensitiveTokens:true,
 noAutomaticAccountCreationOnScan:true,
 ownerConsentRequiredForBusinessClaim:true,
 noPaymentForRawUnverifiedScans:true,
 noPyramidOrRecruitmentOnlyRewards:true,
 compensationRequiresDefinedEligibleEvent:true,
 duplicateAndSelfReferralFiltering:true,
 serverVerifiedAttribution:true,
 privacyPreservingAnalytics:true,
 accessibleFallbackShortCode:true,
 deepLinkWithWebFallback:true,
} as const
