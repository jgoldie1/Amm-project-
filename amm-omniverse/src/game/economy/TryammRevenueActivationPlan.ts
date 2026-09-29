export type RevenueActivationPhase='now'|'next'|'scale'
export interface RevenueStreamActivation{
 id:string; name:string; phase:RevenueActivationPhase
 payer:string; value:string; billing:string
 dependsOn:string[]; metric:string
}

export const TRYAMM_REVENUE_ACTIVATION:RevenueStreamActivation[]=[
 {id:'business-plans',name:'Business Plans',phase:'now',payer:'businesses',value:'listing, QR, analytics, conversion and network tools',billing:'$29/$49/$149 recurring plus free acquisition tier',dependsOn:['verified business','checkout','entitlement'],metric:'MRR and paid conversion'},
 {id:'production',name:'Business Experience Production',phase:'now',payer:'businesses',value:'Preview, Experience and Digital Twin production',billing:'$499/$1,250/$2,500 one-time',dependsOn:['scope approval','asset rights','checkout'],metric:'gross margin per project'},
 {id:'holo-ads',name:'Holo Ads',phase:'now',payer:'advertisers',value:'measurable TV/radio/Reels/StreetVerse inventory',billing:'campaign budget / sponsorship',dependsOn:['campaign approval','inventory','verified delivery','ledger'],metric:'verified ad revenue and fill rate'},
 {id:'marketplace',name:'Marketplace & Delivery',phase:'next',payer:'merchants/customers',value:'orders, bookings and fulfillment',billing:'declared transaction/service fees',dependsOn:['merchant terms','orders','payments','refunds'],metric:'GMV and net take'},
 {id:'creator-media',name:'Creator Media Economy',phase:'next',payer:'fans/sponsors',value:'LIVE, gifts, tickets, subscriptions, PPV, music, merch',billing:'per transaction/subscription',dependsOn:['rights','creator split','entitlement','ledger'],metric:'net revenue per active creator'},
 {id:'broadcast',name:'TRYAMM TV & Networks',phase:'next',payer:'advertisers/subscribers/sponsors/licensees',value:'programming, distribution and audiences',billing:'ads, sponsorship, subscription, PPV, licensing',dependsOn:['player','EPG','rights','ads','analytics'],metric:'revenue per viewing hour'},
 {id:'scout',name:'Scout Network',phase:'now',payer:'TRYAMM funded from eligible business economics',value:'verified customer/business acquisition',billing:'declared performance compensation',dependsOn:['QR attribution','verified conversion','anti-fraud'],metric:'CAC and qualified conversions'},
 {id:'business-services',name:'AI Business Services',phase:'next',payer:'businesses',value:'support, media, booking, campaigns and automation',billing:'subscription/add-ons',dependsOn:['Business Passport','human approval','audit log'],metric:'ARPU and retention'},
 {id:'rights',name:'Rights & Distribution Services',phase:'scale',payer:'creators/businesses/licensees',value:'rights routing, royalties, eligible syndication/distribution',billing:'admin/distribution/licensing fees',dependsOn:['rights registry','contracts','reporting'],metric:'licensed catalog revenue'},
 {id:'city-api',name:'StreetVerse City API',phase:'scale',payer:'developers/enterprise partners',value:'permissioned city/business/event/media services',billing:'API/enterprise plans',dependsOn:['stable APIs','licensed data','security'],metric:'API ARR'},
]

export const ACTIVATION_ORDER=[
 'Free QR listing acquisition',
 '$29/$49/$149 recurring conversion',
 '$499/$1,250/$2,500 production upsell',
 'Holo Ads campaigns and sponsorships',
 'Marketplace/order transaction revenue',
 'LIVE/creator/ticket/subscription revenue',
 'TV/radio/network advertising and licensing',
 'AI business-service add-ons',
 'Rights/distribution services',
 'City/API enterprise revenue',
] as const

export const PROFITABILITY_GUARDRAILS={
 activateBeforeExpandingCatalog:true,
 measureContributionMarginPerStream:true,
 stopSubsidizingStreamsThatCannotShowValue:true,
 sharedIdentityPaymentsLedgerAdsAndAnalytics:true,
 avoidDuplicateInfrastructure:true,
 freeTierMustHaveUpgradePath:true,
 recurringRevenueFundsCoreOperations:true,
 oneTimeRevenueFundsProductionAndGrowth:true,
 creatorScoutAndRightsObligationsDeclared:true,
 cashReserveBeforeAggressiveReinvestment:true,
 noGuaranteedProfit:true,
} as const
