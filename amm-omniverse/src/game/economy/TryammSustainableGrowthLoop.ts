export type GrowthStage='discover'|'engage'|'create'|'distribute'|'transact'|'retain'|'reinvest'
export type GrowthSurface='streetverse'|'streetverse-radio'|'streetverse-global'|'tryamm-tv'|'all-american-network'|'isaiah-ai-tv'|'news'|'holo-live'|'reels'|'marketplace'|'holo-ads'|'holo-labs'

export interface VerifiedValueEvent{
 id:string; userId?:string; creatorId?:string; businessId?:string
 surface:GrowthSurface; kind:'purchase'|'ad-impression'|'subscription'|'ticket'|'gift'|'sponsorship'|'marketplace-order'|'licensed-content'
 grossMinor:number; currency:string; verified:boolean
}

export const TRYAMM_SUSTAINABLE_GROWTH_LOOP:GrowthStage[]=[
 'discover','engage','create','distribute','transact','retain','reinvest'
]

export const GROWTH_LOOP={
 discover:['Reels','News','StreetVerse','StreetVerse Radio','StreetVerse Global','All American Network'],
 engage:['Holo LIVE','StarVerse','StreetVerse missions','TRYAMM TV','creator communities'],
 create:['Creator Studio','Holo Labs','Isaiah AI TV','business showcases','music and shows'],
 distribute:['TRYAMM TV','All American Network','StreetVerse Radio','StreetVerse Global','Reels','eligible FAST/CTV/OTT'],
 transact:['Holo Ads','subscriptions','tickets','PPV','gifts','marketplace','merch','music','business services'],
 retain:['Passport','entitlements','replay/VOD','creator follows','loyalty','new episodes/events'],
 reinvest:['creator payouts','rights-holder payouts','operations','content production','growth','reserves'],
} as const

export const VALUE_LOOP_RULES={
 noGuaranteedOrInfiniteMoneyClaims:true,
 noArtificialTrafficOrFakeImpressions:true,
 noSelfDealingToManufactureRevenue:true,
 noWashTransactions:true,
 noPyramidOrRecruitmentOnlyEconomics:true,
 payoutsOnlyFromVerifiedValueEvents:true,
 refundsAndChargebacksReverseEligibleEarnings:true,
 creatorAndRightsSplitsDeclaredBeforeSettlement:true,
 taxesFeesAndReservesAccountedFor:true,
 adsAndSponsorshipsDisclosed:true,
 editorialNewsIndependentFromAdvertisers:true,
 serverAuthoritativeSettlement:true,
 measurableUnitEconomicsRequiredBeforeScaling:true,
} as const

export const canSettleValueEvent=(e:VerifiedValueEvent)=>
 e.verified && e.grossMinor>0 && /^[A-Z]{3}$/.test(e.currency)
