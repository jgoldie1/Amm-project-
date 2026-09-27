export type AdSurface='tryamm-tv'|'all-american-network'|'isaiah-ai-tv'|'news'|'streetverse-radio'|'streetverse-global'|'holo-live'|'reels'|'business-twin'
export type AdBilling='cpm'|'cpc'|'cpa'|'flat-sponsorship'

export interface HoloAdCampaign{
 id:string; advertiserId:string; name:string; billing:AdBilling
 budgetMinor:number; currency:string; surfaces:AdSurface[]
 startsAt:string; endsAt:string; status:'draft'|'approved'|'active'|'paused'|'completed'
 ageAppropriate:boolean; disclosed:boolean
}

export interface VerifiedAdEvent{
 id:string; campaignId:string; surface:AdSurface
 kind:'impression'|'click'|'conversion'; occurredAt:string
 viewerToken:string; verified:boolean; billable:boolean
}

export const HOLO_ADS={
 inventory:[
  '15/30 second video spots','audio/radio spots','program sponsorships',
  'StreetVerse business placements','sponsored missions','Reels placements',
  'LIVE event sponsorships','creator/business showcase sponsorships'
 ],
 settlementFlow:[
  'approved campaign','reserved budget','eligible inventory','verified delivery',
  'fraud/duplicate filtering','billable event','advertiser charge/usage',
  'declared network/creator/platform allocation','authoritative ledger','reporting'
 ],
} as const

export const HOLO_AD_RULES={
 noFakeImpressions:true,
 noSelfClickingOrManufacturedTraffic:true,
 noBillingUnverifiedEvents:true,
 frequencyCapsRequired:true,
 sponsoredContentDisclosed:true,
 politicalAdsRequireSeparateComplianceReview:true,
 newsEditorialDecisionsNotForSale:true,
 minorsReceiveAgeAppropriateAds:true,
 sensitiveTraitsNotUsedForTargeting:true,
 preciseLocationNotRequired:true,
 advertiserBudgetCannotGoNegative:true,
 refundsCreditsAndInvalidTrafficReversible:true,
 serverAuthoritativeSettlement:true,
} as const

export const campaignHasBudget=(c:HoloAdCampaign,spendMinor:number)=>
 c.status==='active' && spendMinor>=0 && spendMinor<=c.budgetMinor
