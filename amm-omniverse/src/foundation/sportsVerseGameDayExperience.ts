export const SPORTSVERSE_GAMEDAY_EXPERIENCE = {
 releaseLane:'post-alpha', featureFlag:'sportsverseGameDayExperience',
 worldPulse:{enabled:true,eventClasses:['tailgate','pregame','kickoff-tipoff-first-pitch','halftime-intermission','postgame','championship-celebration'],inputs:['time','district','weather','player-population','businesses','starverse-schedule','creator-events','sports','nightlife','story-events']},
 tailgate:{fanZones:true,teamZones:true,creatorStages:true,vendorMarket:true,foodAndMerch:true,miniGames:true,skillChallenges:true,avatarMeetups:true,watchParties:true,sponsorActivations:true,accessibleParticipation:true},
 halftime:{starVersePerformances:true,creatorAuditions:true,headlinePerformers:true,bandDanceCheer:true,fanChallenges:true,mascotEvents:true,holoShows:true,scoreboardIntegration:true,holoDirectorBroadcast:true},
 creatorPipeline:['event-detection','authorized-highlight-capture','holo-music-rights-check','ai-edit','reel-live-publish','streetverse-deep-link','product-artist-location-tags','verified-commerce','creator-attribution','server-settlement'],
 commerce:{marketplace:true,merchantTools:true,creatorCommerce:true,advertising:true,holoCoupons:true,subscriptions:true,liveEvents:true,serverVerifiedSettlement:true},
 safety:{ageAppropriateZones:true,moderation:true,rightsClearanceRequired:true,noClientMintedCashRewards:true},
 accessibility:{adaptiveOneHand:true,voice:true,touch:true,gamepad:true,keyboard:true,holoHandOptional:true}
} as const
