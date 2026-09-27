export type NewsScope='local'|'national'|'global'|'entertainment'|'business'|'weather'|'sports'|'community'
export type NewsRevenueKind='ad'|'sponsorship'|'subscription'|'syndication'|'licensed-clip'|'business-showcase'|'event'|'archive'

export interface TryammNewsChannel{
 id:string; name:string; scope:NewsScope; live:boolean; replay:boolean
 editorialIndependence:boolean; sponsorDisclosure:boolean
}

export const TRYAMM_NEWS_NETWORK:TryammNewsChannel[]=[
 {id:'local-news',name:'TRYAMM Local News',scope:'local',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
 {id:'national-news',name:'TRYAMM National News',scope:'national',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
 {id:'global-news',name:'TRYAMM Global News',scope:'global',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
 {id:'entertainment-news',name:'TRYAMM Entertainment News',scope:'entertainment',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
 {id:'business-news',name:'TRYAMM Business News',scope:'business',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
 {id:'weather',name:'TRYAMM Weather',scope:'weather',live:true,replay:true,editorialIndependence:true,sponsorDisclosure:true},
]

export const NEWS_REVENUE_LANES:NewsRevenueKind[]=[
 'ad','sponsorship','subscription','syndication','licensed-clip','business-showcase','event','archive'
]

export const NEWS_EDITORIAL_RULES={
 adsClearlyDisclosed:true,
 sponsorCannotBuyEditorialConclusion:true,
 sourceAttributionRequired:true,
 correctionsAndUpdatesRequired:true,
 rightsRequiredForThirdPartyMedia:true,
 aiGeneratedOrSyntheticMediaDisclosedWhenRequired:true,
 noFabricatedBreakingNews:true,
 politicalCoverageRequiresNeutralEditorialSeparation:true,
 serverVerifiedCommercialTransactions:true,
 audiencePrivacyAndDataMinimization:true,
} as const
