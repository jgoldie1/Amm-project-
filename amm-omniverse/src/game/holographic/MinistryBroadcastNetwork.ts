export type MinistryBroadcastFormat=
 |'worship-service'|'teaching'|'bible-study'|'music-praise'
 |'testimony'|'youth-program'|'community-special'|'documentary'
 |'ministry-news'|'live-event'

export type MinistryDistributionLane=
 |'servants-of-christ-network'|'faithverse'|'holo-live'
 |'all-american-network'|'fast-channel'|'ctv-ott'
 |'replay'|'reels'|'ppv'

export interface MinistryBroadcastProgram{
 id:string
 ministryId:string
 title:string
 format:MinistryBroadcastFormat
 live:boolean
 scheduledAt?:string
 durationMinutes?:number
 distribution:MinistryDistributionLane[]
 rightsCleared:boolean
 youthContent:boolean
 status:'draft'|'scheduled'|'live'|'replay'|'archived'
}

export const MINISTRY_BROADCAST_PIPELINE=[
 'ministry onboarding and verification',
 'channel and program creation',
 'schedule / electronic program guide',
 'rights and moderation review',
 'Holo LIVE production',
 'Servants of Christ Network broadcast',
 'FaithVerse simulcast when appropriate',
 'All American Network distribution when approved',
 'FAST / CTV / OTT packaging when technically and contractually ready',
 'replay library',
 'Reels and short-form discovery',
 'audience returns to ministry profile / FaithVerse',
] as const

export const MINISTRY_BROADCAST_RULES={
 ministryOwnsItsChannelIdentity:true,
 rightsClearanceRequired:true,
 licensedMusicRequired:true,
 liveModerationRequired:true,
 youthSafeguardsRequired:true,
 captionsAndAccessibilityPlanned:true,
 translationPlanned:true,
 emergencyBroadcastOverrideNotImplied:true,
 ppvOptionalForEligibleNonDonationProgramming:true,
 donationsRemainVoluntary:true,
 noPayToPray:true,
 verifiedPaymentRequiredForPaidProgramming:true,
 replayRetentionRequiresPolicy:true,
 distributionRequiresPlatformAndCarrierReadiness:true,
} as const

export const SERVANTS_OF_CHRIST_BROADCAST_CHANNEL={
 id:'servants-of-christ-network',
 title:'Servants of Christ Network',
 origin:'FaithVerse',
 formats:[
  'worship-service','teaching','bible-study','music-praise',
  'testimony','youth-program','community-special','documentary',
  'ministry-news','live-event',
 ] as MinistryBroadcastFormat[],
 lanes:[
  'servants-of-christ-network','faithverse','holo-live',
  'all-american-network','replay','reels',
 ] as MinistryDistributionLane[],
} as const

/**
 * This registry defines the broadcasting architecture only. FAST, CTV, OTT,
 * carrier distribution and external channel publication require real provider
 * integrations, rights clearance, moderation and release certification.
 */
