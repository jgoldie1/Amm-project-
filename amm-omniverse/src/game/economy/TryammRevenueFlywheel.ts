export type FlywheelSource=
 |'live-gift'|'ticket'|'ppv'|'subscription'|'sponsorship'|'merch'
 |'music-sale'|'stream-royalty'|'marketplace-sale'|'business-service'
 |'ad-revenue'|'creator-service'|'tournament-entry'|'digital-item'

export type FlywheelDestination=
 |'creator'|'collaborator'|'rights-holder'|'business'|'venue'
 |'platform'|'community-fund'|'prize-pool'|'creator-growth'|'operations'

export interface FlywheelRevenueEvent{
 id:string
 source:FlywheelSource
 grossMinor:number
 currency:string
 originVerse:string
 sessionId?:string
 showcaseId?:string
 liveRoomId?:string
 creatorId?:string
 businessId?:string
 verified:boolean
 createdAt:number
}

export interface FlywheelAllocation{
 destination:FlywheelDestination
 payeeId?:string
 basisPoints:number
}

export interface FlywheelCycle{
 discover:string[]
 engage:string[]
 transact:string[]
 retain:string[]
 reinvest:string[]
}

export const TRYAMM_REVENUE_FLYWHEEL:FlywheelCycle={
 discover:[
  'StreetVerse missions and businesses',
  'StarVerse talent discovery',
  'Holo Music performances',
  'SportsVerse competitions',
  'All American Showcase programming',
  'All American Network distribution',
 ],
 engage:[
  'LIVE viewing',
  'PK and CrossVerse competition',
  'Holo Arena participation',
  'Reels and replay clips',
  'creator and business follows',
 ],
 transact:[
  'tickets and PPV',
  'gifts and subscriptions',
  'sponsorships and ads',
  'merchandise and marketplace',
  'music sales and royalties',
  'creator and business services',
  'digital items and tournament entry',
 ],
 retain:[
  'creator progression and rankings',
  'business passports and storefronts',
  'saved replays and creator libraries',
  'subscriptions and memberships',
  'cross-Verse identity and inventory',
 ],
 reinvest:[
  'creator growth campaigns',
  'showcase production',
  'prize pools',
  'community programs',
  'platform operations',
  'new StreetVerse and CrossVerse experiences',
 ],
}

export const FLYWHEEL_RULES={
 noGuaranteedReturns:true,
 noSelfFundingPurchaseLoops:true,
 noArtificialTransactionVolume:true,
 noWashTrading:true,
 noPayToWinRankedOutcomes:true,
 clientCannotVerifyRevenue:true,
 verifiedProcessorEventRequired:true,
 ledgerEntryRequiredBeforePayableBalance:true,
 refundsAndChargebacksCanReverseRevenue:true,
 rightsMetadataRequiredForLicensedContent:true,
 creatorAndBusinessSplitsMustBePredeclared:true,
 valuableRewardsRequireServerAuthority:true,
 disclosuresAndApplicableTaxRecordsRequired:true,
 minorsNeedApplicablePlatformAndGuardianControls:true,
} as const

export const validateFlywheelAllocations=(items:FlywheelAllocation[])=>{
 const total=items.reduce((n,item)=>n+item.basisPoints,0)
 return items.length>0&&total===10000&&items.every(item=>Number.isInteger(item.basisPoints)&&item.basisPoints>=0)
}

export const createFlywheelRevenueEvent=(input:Omit<FlywheelRevenueEvent,'id'|'verified'|'createdAt'>):FlywheelRevenueEvent=>({
 ...input,
 id:`tryamm-revenue-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
 verified:false,
 createdAt:Date.now(),
})

export const nextFlywheelActions=(event:FlywheelRevenueEvent)=>[
 'verify payment or processor event server-side',
 'write immutable transaction and entitlement records',
 'calculate approved creator/business/rights splits',
 'post eligible balances to ledgers',
 'create replay/Reel and recommendation signals when permitted',
 'route approved reinvestment budget to growth/showcase/prize/community buckets',
 'bring users back into the next CrossVerse/Showcase/Network experience',
] as const

/**
 * This is a sustainable revenue flywheel, not an infinite-money or guaranteed-return mechanism.
 * Real revenue must come from genuine users, purchases, advertisers, sponsors, services or licensed commerce.
 */
