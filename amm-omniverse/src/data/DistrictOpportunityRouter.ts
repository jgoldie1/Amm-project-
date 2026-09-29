export type DistrictOpportunityKind='mission'|'job'|'business'|'event'|'live'|'tv'|'radio'|'marketplace'|'delivery'
export interface DistrictOpportunity{
 id:string;cityId:string;districtId:string;kind:DistrictOpportunityKind;title:string;
 status:'preview'|'available'|'paused';requiresAuth:boolean;rewardBearing:boolean;
 businessId?:string;mediaChannelId?:string;entitlement?:string;
}
export interface OpportunityContext{cityId:string;districtId:string;signedIn:boolean;entitlements:string[]}

export class DistrictOpportunityRouter{
 constructor(private opportunities:DistrictOpportunity[]){}
 available(ctx:OpportunityContext){
  return this.opportunities.filter(o=>o.cityId===ctx.cityId&&o.districtId===ctx.districtId&&o.status==='available')
   .filter(o=>!o.requiresAuth||ctx.signedIn)
   .filter(o=>!o.entitlement||ctx.entitlements.includes(o.entitlement))
 }
 route(o:DistrictOpportunity){
  const routes:Record<DistrictOpportunityKind,string>={
   mission:'/streetverse/missions',job:'/middleverse/jobs',business:'/business',
   event:'/events',live:'/live',tv:'/tv',radio:'/radio',marketplace:'/marketplace',delivery:'/delivery',
  }
  return `${routes[o.kind]}?city=${encodeURIComponent(o.cityId)}&district=${encodeURIComponent(o.districtId)}&opportunity=${encodeURIComponent(o.id)}`
 }
}

export const DISTRICT_COMMERCE_FLOW=[
 'discover-in-world','open-business-or-opportunity','server-price-or-reward-lookup',
 'verified-checkout-or-qualified-action','provider-webhook-or-server-event','entitlement-or-reward',
 'internal-ledger-post','creator-business-scout-split-policy','receipt-and-analytics',
] as const

export const DISTRICT_OPPORTUNITY_RULES={
 noClientAwardedMoney:true,noClientTrustedPrices:true,serverVerifiedRewards:true,
 verifiedBusinessesForCommerce:true,rightsRequiredForMedia:true,minorSafeguards:true,
 adsAndSponsorshipsDisclosed:true,newsEditorialIndependence:true,
 scoutAttributionVerified:true,locationOptional:true,accessibleAlternativesRequired:true,
 previewCannotMasqueradeAsLive:true,
} as const

export function createStarterDistrictOpportunities(cityId:string,districtId:string):DistrictOpportunity[]{
 return[
  {id:`${districtId}-explore`,cityId,districtId,kind:'mission',title:'Explore the district',status:'available',requiresAuth:false,rewardBearing:false},
  {id:`${districtId}-business`,cityId,districtId,kind:'business',title:'Discover local businesses',status:'available',requiresAuth:false,rewardBearing:false},
  {id:`${districtId}-jobs`,cityId,districtId,kind:'job',title:'Jobs and creator opportunities',status:'available',requiresAuth:true,rewardBearing:false},
  {id:`${districtId}-live`,cityId,districtId,kind:'live',title:'Holo LIVE from this city',status:'available',requiresAuth:false,rewardBearing:false},
  {id:`${districtId}-tv`,cityId,districtId,kind:'tv',title:'Watch TRYAMM TV',status:'available',requiresAuth:false,rewardBearing:false},
  {id:`${districtId}-market`,cityId,districtId,kind:'marketplace',title:'Open Marketplace',status:'available',requiresAuth:false,rewardBearing:false},
 ]
}
