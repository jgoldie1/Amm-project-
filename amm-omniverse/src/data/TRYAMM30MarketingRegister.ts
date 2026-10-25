import {TRYAMM_FIRST_30_WEBSITES} from './TRYAMMFirst30WebsiteLaunch'

/** Draft-only preparation of the first 30 website marketing campaigns.
 * Calendar events are not publication authorization or evidence of sales.
 */
export type MarketingStage='draft'|'owner-review'|'approved'|'scheduled'|'published'
export type MarketingCampaign={
 businessId:string;businessName:string;websiteStage:string;marketingStage:MarketingStage;
 vertical:string;messages:string[];channels:string[];landingPageVerified:boolean;
 ownerMediaApproved:boolean;checkoutVerified:boolean
}
function verticalFor(name:string):string {
 const n=name.toLowerCase()
 if(/beauty|jasmine|alyssa|kim|salon|fashion/.test(n))return'beauty-fashion'
 if(/mobility|care|cna|fitness|brielle/.test(n))return'accessibility-wellness'
 if(/music|studio|kirkland|creator|tasha ash/.test(n))return'creator-entertainment'
 if(/security/.test(n))return'security-training'
 if(/newumerica|bj stubbs/.test(n))return'tech-commerce'
 return'local-business'
}
const copy:Record<string,string[]>={
 'beauty-fashion':['Meet the brand and founder','Preview approved services or collections','Ask about availability and confirmed offers'],
 'accessibility-wellness':['Meet the business and its accessibility goals','Explore approved services and support options','Request a consultation; no medical outcomes promised'],
 'creator-entertainment':['Meet the creator and their story','Explore approved studio or production services','Ask about bookings and published work'],
 'security-training':['Meet the lawful security services team','Review approved services and qualifications','Request information; licensing claims require verification'],
 'tech-commerce':['Meet the technology brand','See licensed or owner-approved product previews','Request availability and confirmed terms'],
 'local-business':['Meet the founder','See the proposed business website','Request services and confirmed prices']
}
export const TRYAMM_30_MARKETING_REGISTER:MarketingCampaign[]=TRYAMM_FIRST_30_WEBSITES.map(x=>{
 const vertical=verticalFor(x.name)
 return {
  businessId:x.id,businessName:x.name,websiteStage:x.stage,marketingStage:'draft',
  vertical,messages:copy[vertical],channels:['Facebook','Instagram','TikTok','YouTube Shorts','Discord'],
  landingPageVerified:false,ownerMediaApproved:false,checkoutVerified:false
 }
})
export function canScheduleMarketing(x:MarketingCampaign):boolean {
 return x.marketingStage==='approved' && x.ownerMediaApproved && x.landingPageVerified
}
export function canUsePaidSalesCallToAction(x:MarketingCampaign):boolean {
 return canScheduleMarketing(x) && x.checkoutVerified
}
export const MARKETING_GUARDRAILS=[
 'Do not advertise or post on behalf of an owner without permission',
 'No public customer testimonials without specific consent',
 'Disability access claims require practical verification',
 'No healthcare, investment return or licensing guarantees',
 'Use verified landing pages and business-specific sales links',
 'Do not label a draft site published or an unverified transaction paid',
 'All social platform and Discord accounts must be connected before automated posting'
] as const
