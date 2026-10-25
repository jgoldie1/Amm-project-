import {TRYAMM_30_DAY_ANNOUNCEMENTS,buildTrackedLandingUrl,type Channel} from './TRYAMM30DayCampaign'
import {TRYAMM_30_MARKETING_REGISTER} from './TRYAMM30MarketingRegister'

export type ContentTemplate='launch'|'founder'|'website-tour'|'offer'|'faq'|'testimonial-request'|'reel'|'referral'|'behind-the-scenes'|'follow-up'
export type ContentDraft={id:string;businessId:string;businessName:string;day:number;kind:ContentTemplate;caption:string;status:'draft';mediaApprovalRequired:true;offerApprovalRequired:boolean}
const kinds:ContentTemplate[]=['launch','founder','website-tour','offer','faq','testimonial-request','reel','referral','behind-the-scenes','follow-up']
function textFor(name:string,kind:ContentTemplate){
 const base='Explore the approved business preview and request details when the owner makes it available.'
 switch(kind){
  case 'launch':return 'Introducing '+name+'. '+base
  case 'founder':return 'Meet the people and purpose behind '+name+'. Learn the story from the owner.'
  case 'website-tour':return 'Take a look at the website preview for '+name+'. Publication and availability will be confirmed.'
  case 'offer':return 'Interested in '+name+'? Request the current owner-approved service options and pricing.'
  case 'faq':return 'Questions about '+name+'? Send an inquiry for verified services, availability and terms.'
  case 'testimonial-request':return 'Have firsthand experience with '+name+'? Share optional honest feedback with permission to publish.'
  case 'reel':return 'A quick introduction to '+name+'. Follow for owner-approved updates and launch details.'
  case 'referral':return 'Know someone who might need '+name+'? Share this business preview—no purchase required.'
  case 'behind-the-scenes':return 'Go behind the scenes with '+name+' when the owner approves their story and media.'
  case 'follow-up':return 'Stay informed about '+name+'. Request updates or join the opt-in launch interest list.'
 }
}
export const TRYAMM_CONTENT_FACTORY_DRAFTS:ContentDraft[]=TRYAMM_30_DAY_ANNOUNCEMENTS.flatMap(slot=>kinds.map((kind,index)=>({
 id:slot.businessId+'-'+kind, businessId:slot.businessId,businessName:slot.businessName,day:slot.day,kind,
 caption:textFor(slot.businessName,kind),status:'draft',mediaApprovalRequired:true,
 offerApprovalRequired:kind==='offer'
})))
export type ChannelDelivery={businessId:string;assetId:string;channel:Channel;status:'draft'|'approved'|'scheduled'|'published'|'failed'|'paused';platformPostId?:string;approvedBy?:string;error?:string}
export type CampaignSafety={accountConnected:boolean;ownerAuthorized:boolean;mediaApproved:boolean;landingVerified:boolean;checkoutVerified:boolean;serviceAvailable:boolean;paused:boolean;requiresPayment:boolean}
export function campaignPublishingGate(c:CampaignSafety):{allowed:boolean;reasons:string[]} {
 const reasons:string[]=[]
 if(!c.accountConnected)reasons.push('social-account-not-connected')
 if(!c.ownerAuthorized)reasons.push('owner-authorization-required')
 if(!c.mediaApproved)reasons.push('media-not-approved')
 if(!c.landingVerified)reasons.push('landing-page-unverified')
 if(!c.serviceAvailable)reasons.push('service-unavailable')
 if(c.paused)reasons.push('campaign-paused')
 if(c.requiresPayment&&!c.checkoutVerified)reasons.push('checkout-unverified')
 return{allowed:reasons.length===0,reasons}
}
export function businessScopedDeliveries(records:ChannelDelivery[],businessId:string){return records.filter(x=>x.businessId===businessId)}
export type MetricSnapshot={businessId:string;visits:number;leads:number;verifiedOrders:number;grossRevenueCents:number;refundsCents:number;adCostCents:number;fulfillmentCostCents:number;period:string}
export function summarizeBusinessMetrics(rows:MetricSnapshot[],businessId:string) {
 const filtered=rows.filter(r=>r.businessId===businessId)
 return filtered.reduce((a,r)=>({
  visits:a.visits+r.visits,leads:a.leads+r.leads,verifiedOrders:a.verifiedOrders+r.verifiedOrders,
  revenueCents:a.revenueCents+r.grossRevenueCents,refundCents:a.refundCents+r.refundsCents,
  costCents:a.costCents+r.adCostCents+r.fulfillmentCostCents
 }),{visits:0,leads:0,verifiedOrders:0,revenueCents:0,refundCents:0,costCents:0})
}
export const CAMPAIGN_PLAYBOOK={
 frequency:'One featured business per day; captions adjusted per network and posting frequency determined by analytics.',
 process:['draft','owner approval','preview QA','channel connection','schedule','publish','measure','reconcile','optimize'],
 neededConnectors:['social scheduler','Discord bot authorized for relevant channels','web analytics','business-scoped CRM','server-verified Stripe settlement'],
 emergencyStop:['broken checkout','missing fulfillment capacity','unavailable offer','unapproved media','security incident'],
 tracking:'Use UTM source/channel/campaign and business ID; never embed private customer data in URLs',
 mobile:'Require readable typography, captions, alt text and accessible call to action',
 campaigns:TRYAMM_30_MARKETING_REGISTER.length,
 drafts:TRYAMM_CONTENT_FACTORY_DRAFTS.length
} as const
export function taggedLink(url:string,businessId:string,channel:Channel){
 const slot=TRYAMM_30_DAY_ANNOUNCEMENTS.find(x=>x.businessId===businessId)
 if(!slot)throw Error('Unknown business')
 return buildTrackedLandingUrl(url,slot,channel)
}
