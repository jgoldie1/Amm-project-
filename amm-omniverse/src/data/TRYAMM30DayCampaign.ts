import {TRYAMM_30_MARKETING_REGISTER,canScheduleMarketing,canUsePaidSalesCallToAction} from './TRYAMM30MarketingRegister'

// One slot per business for 30 days, relative to an owner-chosen campaign start date.
// This is an editorial queue: it never posts to external social networks on its own.
export type Channel='facebook'|'instagram'|'tiktok'|'youtube'|'discord'|'tryamm'
export type CampaignSlot={day:number;businessId:string;businessName:string;vertical:string;theme:string;channels:Channel[];status:'draft';canSchedule:boolean;canSell:boolean}
export const DAILY_THEMES=['Founder introduction','Business problem solved','Website / mobile preview','Product or service walkthrough','Meet the owner','Customer FAQ','What makes the business accessible','Booking or lead capture','Behind the scenes','Founder vision'] as const
export const TRYAMM_30_DAY_ANNOUNCEMENTS:CampaignSlot[]=TRYAMM_30_MARKETING_REGISTER.slice(0,30).map((business,index)=>({
 day:index+1,businessId:business.businessId,businessName:business.businessName,vertical:business.vertical,
 theme:DAILY_THEMES[index%DAILY_THEMES.length],
 channels:['tryamm','facebook','instagram','tiktok','youtube','discord'],
 status:'draft',canSchedule:canScheduleMarketing(business),canSell:canUsePaidSalesCallToAction(business)
}))
export type CampaignAsset={businessId:string;campaignId:string;assetId:string;version:number;approved:boolean;originalCaption:string;sourceUrl?:string}
export type CampaignDelivery={assetId:string;channel:Channel;scheduledAt:string;platformPostId?:string;status:'draft'|'scheduled'|'published'|'failed';error?:string}
export function buildTrackedLandingUrl(baseUrl:string,slot:CampaignSlot,channel:Channel):string {
 const url=new URL(baseUrl)
 if(url.protocol!=='https:')throw Error('HTTPS landing page required')
 url.searchParams.set('utm_source',channel)
 url.searchParams.set('utm_medium','organic_social')
 url.searchParams.set('utm_campaign','tryamm_30_business_launch')
 url.searchParams.set('utm_content',slot.businessId+'_day_'+slot.day)
 return url.toString()
}
export function eligibleDelivery(slot:CampaignSlot,asset:CampaignAsset,landingVerified:boolean):boolean {
 return slot.canSchedule && landingVerified && asset.approved && asset.businessId===slot.businessId
}
export const CHANNEL_POLICY={
 frequency:'one featured business per day; cut down rather than spam each channel',
 times:'choose per platform analytics and audience timezone, not fake universal best times',
 cadence:'one teaser, one feature, one follow-up per business when approved; avoid duplicative daily reposts',
 weekends:'avoid scheduling Sabbath work without owner permission; pre-schedule or shift feature slots',
 attribution:'UTM links plus consent-based lead IDs; no customer PII in public analytics URLs',
 privacy:'separate owners, assets, leads, authorizations and publishing credentials by business',
 performance:'review reach, relevant followers, landing clicks, qualified leads, purchases, gross margin and refunds',
 alerts:'report failed posts and nonworking links before paid promotion',
 publishing:'never trigger a social post from a calendar entry; require connected authorized accounts and approval'
} as const
