export type BroadcastChannelKind=
 |'ministry'|'news'|'local'|'entertainment'|'music'|'sports'
 |'movies'|'education'|'business'|'creator'|'kids-family'|'community'

export type BroadcastDelivery=
 |'tryamm-app'|'web'|'holo-live'|'fast'|'ctv'|'ott'|'replay'|'reels'

export interface TryammBroadcastChannel{
 id:string
 name:string
 kind:BroadcastChannelKind
 ownerKey:string
 liveEnabled:boolean
 linearEnabled:boolean
 onDemandEnabled:boolean
 delivery:BroadcastDelivery[]
}

export interface ProgramGuideEntry{
 id:string
 channelId:string
 title:string
 startsAt:string
 endsAt:string
 live:boolean
 rating?:string
 captions?:boolean
 replayEligible?:boolean
}

export const TRYAMM_BROADCAST_NETWORK={
 id:'tryamm-broadcast-network',
 name:'TRYAMM Broadcast Network',
 model:'cable-style-ip-network',
 coreChannels:[
  'Servants of Christ Network',
  'All American Network',
  'Local / StreetVerse TV',
  'Global News',
  'Entertainment',
  'MusicVerse',
  'SportsVerse',
  'Holo Theater / Movies',
  'Education',
  'Business Showcase',
  'Creator Channels',
 ],
 capabilities:[
  'linear channels',
  'electronic program guide',
  'live simulcast',
  'video on demand',
  'replay',
  'reels discovery',
  'channel subscriptions',
  'eligible PPV',
  'advertising and sponsorship',
  'creator and ministry channels',
  'local and global programming',
 ],
} as const

export const BROADCAST_CONTROL_PLANE=[
 'channel registry',
 'program and rights registry',
 'electronic program guide',
 'live ingest',
 'transcoding / adaptive streaming',
 'captions / accessibility',
 'moderation and parental controls',
 'ad / sponsorship scheduling',
 'entitlement checks for paid programming',
 'replay / VOD catalog',
 'analytics and royalty reporting',
 'distribution adapters for FAST / CTV / OTT',
] as const

export const BROADCAST_RULES={
 noClaimOfCableCarrierStatus:true,
 internetFirstDistribution:true,
 externalDistributionRequiresProviderAgreements:true,
 contentRightsRequired:true,
 musicRightsRequired:true,
 ageRatingsAndYouthSafeguardsRequired:true,
 captionsAccessibilityAndTranslationPlanned:true,
 paidAccessUsesServerVerifiedEntitlements:true,
 adsCannotOverrideEditorialOrRankedCompetition:true,
 ministryDonationsRemainSeparateFromCommercialRevenue:true,
 audiencePrivacyAndDataMinimizationRequired:true,
} as const

/**
 * TRYAMM can behave like its own cable-style programming network inside its
 * apps/web experience. Distribution onto third-party FAST/CTV/OTT platforms
 * remains a separate certified integration and contractual step.
 */
