export type OmniRevenueRail='subscription'|'tryamm-gift'|'sponsorship'|'creator-tools'|'business-server'|'commerce'|'replay-vod'|'event-ticket'
export type RevenuePolicy={rail:OmniRevenueRail;enabled:boolean;serverVerified:boolean;configurableSplit:boolean;externalSettlement:boolean}
export const OMNI_REVENUE_RAILS:RevenuePolicy[]=[
 {rail:'subscription',enabled:true,serverVerified:true,configurableSplit:true,externalSettlement:false},
 {rail:'tryamm-gift',enabled:true,serverVerified:true,configurableSplit:true,externalSettlement:false},
 {rail:'sponsorship',enabled:true,serverVerified:true,configurableSplit:true,externalSettlement:false},
 {rail:'creator-tools',enabled:true,serverVerified:true,configurableSplit:false,externalSettlement:false},
 {rail:'business-server',enabled:true,serverVerified:true,configurableSplit:false,externalSettlement:false},
 {rail:'commerce',enabled:true,serverVerified:true,configurableSplit:true,externalSettlement:false},
 {rail:'replay-vod',enabled:true,serverVerified:true,configurableSplit:true,externalSettlement:false},
 {rail:'event-ticket',enabled:false,serverVerified:true,configurableSplit:true,externalSettlement:false}
]
export const OMNI_MONEY_RULES={
 externalPlatformRevenueRemainsExternal:true,
 noRevenueFromUnverifiedGiftEvents:true,
 noHardCodedPermanentCreatorSplit:true,
 separateCreatorSponsorAgentLedgers:true,
 serverAuthoritativePurchasesRefundsAndPayouts:true,
 pkPointsNeverEqualCash:true,
 paidContestLaunchRequiresLegalReview:true,
 youthPaidFeaturesRequireAdultManagedControls:true
} as const
export function enabledRevenueRails(){return OMNI_REVENUE_RAILS.filter(x=>x.enabled)}
