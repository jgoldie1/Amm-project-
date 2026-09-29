export type StarPath='music'|'acting'|'dance'|'comedy'|'sports'|'gaming'|'fashion'|'film'|'podcast'|'creator'|'host'
export type StarStage='discover'|'audition'|'develop'|'showcase'|'live'|'network'|'professional'

export interface StarPassport{
 id:string
 userId:string
 displayName:string
 paths:StarPath[]
 stage:StarStage
 portfolioIds:string[]
 reelIds:string[]
 verifiedAgeBand:'minor'|'adult'|'unknown'
 guardianConsentRequired:boolean
}

export const ISAIAH_AI_TV={
 id:'isaiah-ai-tv',
 title:'Isaiah AI TV',
 slogan:'Anyone Can Be a Star',
 homeVerse:'StarVerse',
 mission:'discover, develop, showcase and distribute emerging talent',
} as const

export const STARVERSE_PIPELINE=[
 'create Star Passport',
 'choose talent path',
 'upload or create audition / Reel',
 'AI-assisted coaching and production tools',
 'community-safe audition or challenge',
 'StarVerse stage / showcase',
 'Holo LIVE or eligible PK competition',
 'Isaiah AI TV programming',
 'All American Showcase',
 'All American Network / TRYAMM TV distribution',
 'replay / Reels / creator profile',
 'eligible sponsorship, ticket, PPV, subscription, merch or music commerce',
 'verified ledger and creator earnings',
] as const

export const STARVERSE_ZONES=[
 'Audition Hall',
 'Creator Academy',
 'Holo Studio',
 'Music Stage',
 'Film & Acting Lot',
 'Comedy Room',
 'Dance Arena',
 'Sports Talent Lab',
 'Fashion Runway',
 'Podcast & Host Studio',
 'Isaiah AI TV Studio',
 'StarVerse Main Stage',
] as const

export const ISAIAH_AI_TV_RULES={
 openTalentDiscovery:true,
 noGuaranteedFame:true,
 noPayForGuaranteedPlacement:true,
 transparentSelectionCriteriaRequired:true,
 originalOrLicensedContentRequired:true,
 likenessConsentRequired:true,
 minorsNeedAgeAppropriateSafeguards:true,
 guardianConsentWhereRequired:true,
 moderationRequired:true,
 sponsorshipDisclosureRequired:true,
 rankedResultsNeedServerAuthority:true,
 paidAccessNeedsVerifiedEntitlement:true,
 creatorRevenueNeedsVerifiedLedger:true,
} as const

/**
 * Isaiah AI TV is the programming/discovery channel; StarVerse is the
 * interactive talent world. "Anyone Can Be a Star" means everyone can access
 * a path to create, learn, audition and be discovered—not guaranteed fame.
 */
