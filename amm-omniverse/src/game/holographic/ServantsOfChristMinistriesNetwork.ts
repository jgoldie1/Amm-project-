export type MinistryExperience=
 |'worship-live'|'bible-study'|'ethiopian-scripture'|'prayer'
 |'testimony'|'music-praise'|'youth-learning'|'community-service'
 |'food-clothing-support'|'ministry-showcase'

export interface MinistryNetworkProgram{
 id:string
 title:string
 experience:MinistryExperience
 faithVerseDestination:string
 liveEnabled:boolean
 replayEnabled:boolean
 allAmericanNetworkEligible:boolean
 donationEligible:boolean
 commerceEligible:boolean
}

export const SERVANTS_OF_CHRIST_NETWORK={
 id:'servants-of-christ-ministries',
 title:'Servants of Christ Ministries Network',
 homeVerse:'FaithVerse',
 nonCombat:true,
 destinations:[
  'FaithVerse',
  'Holographic Ethiopian Scripture',
  'Worship LIVE',
  'Music & Praise',
  'Bible Study',
  'Prayer & Testimony',
  'Youth Learning',
  'Community Service',
  'Ministry Showcase',
 ],
 distribution:[
  'Servants of Christ Network',
  'All American Network',
  'Holo LIVE',
  'Replay',
  'Reels',
 ],
} as const

export const MINISTRY_ECONOMY_RULES={
 donationsVoluntary:true,
 noPayToPray:true,
 noPayToReceiveSpiritualFavor:true,
 noGuaranteedBlessingOrFinancialReturn:true,
 donationsSeparateFromRankedCompetition:true,
 donorCannotBuyReligiousAuthority:true,
 restrictedFundsMustFollowDeclaredPurpose:true,
 receiptsAndApplicableTaxDisclosuresRequired:true,
 taxDeductibilityMustNotBeClaimedWithoutQualifiedStatus:true,
 merchandiseAndMediaUseNormalVerifiedCommerce:true,
 paymentVerificationServerSide:true,
 clientCannotCreatePayableBalance:true,
 rightsMetadataRequiredForMusicAndMedia:true,
 minorsRequireApplicableSafeguards:true,
} as const

export const MINISTRY_FLYWHEEL=[
 'FaithVerse discovery',
 'worship / scripture / learning / service',
 'Holo LIVE participation',
 'voluntary support or legitimate ministry commerce',
 'verified ledger and designated fund accounting',
 'community service / programming / production',
 'replay and Reels distribution',
 'All American Network ministry showcase when appropriate',
 'return to FaithVerse and community',
] as const

/**
 * Ministry support is intentionally not modeled as an infinite-money mechanism.
 * Donations and restricted ministry funds require transparent accounting and
 * must remain distinguishable from ordinary creator/business revenue.
 */
