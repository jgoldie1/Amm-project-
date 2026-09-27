export type ReleaseScope='city'|'state-region'|'country'|'continent'|'global'
export type PromotionKind='launch'|'business-drive'|'creator-challenge'|'music-showcase'|'sports-event'|'tourism'|'community'|'sponsor'|'seasonal'

export interface StreetVerseRelease{
 id:string;scope:ReleaseScope;name:string;country:string
 parentId?:string;cityIds:string[];status:'planned'|'building'|'preview'|'released'
 launchWindow?:string;promotionKinds:PromotionKind[]
}

export const STREETVERSE_RELEASE_MODEL={
 city:'A playable local launch with city missions, businesses, creators, media and commerce.',
 stateRegion:'Groups eligible cities into a state/province/region release with shared promotion and discovery.',
 country:'Connects city and state/region releases into a national StreetVerse portal, media schedule and campaign.',
 continent:'Cross-country discovery, events, creator/business showcases and regional sponsorship inventory.',
 global:'Worldwide launcher, Passport travel, global events and cross-border discovery.',
} as const

export const STREETVERSE_RELEASES:StreetVerseRelease[]=[
 {id:'us-il',scope:'state-region',name:'StreetVerse Illinois',country:'United States',cityIds:['chicago'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','sports-event','community','sponsor']},
 {id:'us',scope:'country',name:'StreetVerse USA',country:'United States',cityIds:['chicago','new-york','los-angeles'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','sports-event','tourism','sponsor','seasonal']},
 {id:'ng',scope:'country',name:'StreetVerse Nigeria',country:'Nigeria',cityIds:['lagos','abuja'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','community','sponsor']},
 {id:'gh',scope:'country',name:'StreetVerse Ghana',country:'Ghana',cityIds:['accra'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','tourism','sponsor']},
 {id:'ke',scope:'country',name:'StreetVerse Kenya',country:'Kenya',cityIds:['nairobi'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','tourism','sponsor']},
 {id:'za',scope:'country',name:'StreetVerse South Africa',country:'South Africa',cityIds:['johannesburg','cape-town'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','sports-event','tourism','sponsor']},
 {id:'et',scope:'country',name:'StreetVerse Ethiopia',country:'Ethiopia',cityIds:['addis-ababa'],status:'building',promotionKinds:['launch','business-drive','creator-challenge','music-showcase','community','tourism','sponsor']},
]

export const PROMOTION_FUNNEL=[
 'announce verified release/preview status',
 'open city/state/country landing destination',
 'feature local creators and participating businesses',
 'run QR/Scout acquisition campaign',
 'schedule TRYAMM TV/Radio/News/Holo LIVE programming',
 'offer disclosed Holo Ads and sponsorship inventory',
 'run eligible missions/challenges/events',
 'measure installs, verified signups, business claims, purchases and retention',
 'publish replays/Reels and route users into the next release',
] as const

export const RELEASE_PROMOTION_RULES={
 noFalseLiveClaims:true,
 previewAndProductionLabelsMustBeAccurate:true,
 localCreatorsAndBusinessesRequirePermission:true,
 paidPromotionDisclosed:true,
 sponsorCannotBuyNewsEditorialConclusions:true,
 musicAndMediaRightsRequired:true,
 minorsNeedApplicableSafeguards:true,
 politicalPromotionRequiresSeparateComplianceReview:true,
 verifiedEventsOnlyForScoutOrRevenueAttribution:true,
 countryAndStateReleaseCanLaunchWithSubsetOfCitiesIfClearlyDisclosed:true,
} as const
