export type ShowcaseFormat='artist-showcase'|'business-showcase'|'film-premiere'|'fashion-show'|'sports-showcase'|'creator-showcase'|'community-special'
export type DistributionLane='all-american-network'|'holo-live'|'fast-channel'|'ctv-ott'|'ppv'|'replay'|'reels'

export interface AllAmericanShowcaseEvent{
 id:string
 title:string
 format:ShowcaseFormat
 originVerse:string
 stageId:string
 liveRoomId?:string
 arenaSessionId?:string
 creatorIds:string[]
 distribution:DistributionLane[]
 status:'scheduled'|'live'|'replay'|'archived'
}

export const ALL_AMERICAN_SHOWCASE_RULES={
 showcaseIsProgrammingLayer:true,
 allAmericanNetworkIsDistributionLayer:true,
 crossVerseSuppliesInteractiveWorlds:true,
 holoLiveSuppliesLiveBroadcast:true,
 pkCanQualifyCreatorsForShowcase:true,
 holoMusicCanFeedArtistShowcases:true,
 sportsVerseCanFeedSportsShowcases:true,
 streetVerseCanFeedBusinessAndCreatorShowcases:true,
 starVerseCanFeedTalentShowcases:true,
 replayCanFeedReels:true,
 ppvRequiresVerifiedEntitlement:true,
 creatorRevenueRequiresServerVerifiedLedger:true,
 rightsMetadataRequired:true,
 moderationRequired:true,
} as const

export const distributionPlan=(event:AllAmericanShowcaseEvent)=>({
 discover:`${event.originVerse} → ${event.format}`,
 live:event.liveRoomId?'Holo LIVE + All American Network':'All American Network showcase',
 interactive:event.arenaSessionId?'CrossVerse/Holo Arena interaction enabled':'broadcast/showcase mode',
 after:'Replay → clips/Reels → creator page → commerce/ledger',
})
