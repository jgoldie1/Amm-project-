export type MemberRole='creator'|'player'|'agency-owner'|'agency-manager'|'family-leader'|'family-member'|'admin'
export type DiscoveryUser={id:string;handle:string;displayName:string;roles:MemberRole[];live:boolean;game?:string;language?:string;region?:string;verified?:boolean}
export type GrowthAction='watch-live'|'play-mission'|'join-pk'|'join-family'|'follow'|'share'|'create-reel'|'shop'|'return-to-game'
export const CREATOR_GROWTH_LOOP={
 establishedCreatorsBringAudience:true,
 emergingCreatorsGetDiscovery:true,
 gameFeedsLive:true,
 liveFeedsGame:true,
 reelsFeedLiveAndGame:true,
 agencyRecruiting:true,
 familyRetention:true,
 searchableUsers:true,
 adminModeration:true,
 serverVerifiedRewardsOnly:true,
 noPayForFakeTraffic:true,
 noBotEngagement:true,
 externalPlatformMoneyRemainsExternal:true
} as const
export function searchUsers(users:DiscoveryUser[],query:string){const q=query.trim().toLowerCase();if(!q)return[];return users.filter(u=>[u.handle,u.displayName,u.game,u.language,u.region].filter(Boolean).some(v=>String(v).toLowerCase().includes(q))).slice(0,50)}
export function nextGrowthActions(u:DiscoveryUser):GrowthAction[]{return u.live?['watch-live','join-pk','follow','share','return-to-game']:['play-mission','create-reel','join-family','follow','share']}
export type PogEvent={playerId:string;kind:'mission'|'pk'|'stream-minute'|'reel'|'referral'|'community';verified:boolean;points:number}
export function pogPoints(e:PogEvent){return e.verified?Math.max(0,Math.min(10_000,Math.floor(e.points))):0}
export const POG_RULES={meaning:'play-or-grow points',cashEquivalent:false,withdrawable:false,serverVerified:true,antiBot:true,rateLimited:true} as const
