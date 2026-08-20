export type RevenueClass = 'subscriptions'|'marketplace_fees'|'delivery_fees'|'holo_ads'|'holo_coupon_campaigns'|'hologpt_credits'|'stubbs_harmony'|'forever_website'|'forever_domain_care'|'creator_tools'|'business_tools'|'events'|'education_contracts'|'other_eligible';
export type ExcludedRevenueClass = 'creator_earnings'|'restricted_mission_funds'|'taxes_payable'|'provider_settlement'|'refund_reserve'|'customer_wallet_liability';
export type CostClass = 'ai_compute'|'data_provider'|'database'|'storage'|'bandwidth'|'live_video'|'maps_delivery'|'sms_email_push'|'moderation'|'security'|'rendering'|'support'|'domain_renewals'|'other';

export type MoneyEvent = { id:string; occurredAt:string; amountMinor:number; currency:string; source:RevenueClass|ExcludedRevenueClass|CostClass; direction:'revenue'|'excluded_revenue'|'cost'; feature?:string; plan?:string; provider?:string; correlationId?:string };
export type SustainabilitySnapshot = { currency:string; eligibleRevenueMinor:number; excludedRevenueMinor:number; infrastructureCostMinor:number; selfSupportRatio:number; targetRatio:number; targetRevenueMinor:number; revenueGapMinor:number; status:'subsidized'|'break_even'|'self_supporting'|'reserve_building'|'target_met'; contributionMinor:number };
export const TRYAMM_SUSTAINABILITY_TARGET = 3;

export function calculateSustainability(events:MoneyEvent[], currency='USD'):SustainabilitySnapshot {
  const scoped=events.filter(e=>e.currency===currency);
  const eligibleRevenueMinor=scoped.filter(e=>e.direction==='revenue').reduce((s,e)=>s+e.amountMinor,0);
  const excludedRevenueMinor=scoped.filter(e=>e.direction==='excluded_revenue').reduce((s,e)=>s+e.amountMinor,0);
  const infrastructureCostMinor=scoped.filter(e=>e.direction==='cost').reduce((s,e)=>s+e.amountMinor,0);
  const selfSupportRatio=infrastructureCostMinor>0?eligibleRevenueMinor/infrastructureCostMinor:0;
  const targetRevenueMinor=Math.ceil(infrastructureCostMinor*TRYAMM_SUSTAINABILITY_TARGET);
  const revenueGapMinor=Math.max(0,targetRevenueMinor-eligibleRevenueMinor);
  const contributionMinor=eligibleRevenueMinor-infrastructureCostMinor;
  let status:SustainabilitySnapshot['status']='subsidized';
  if(selfSupportRatio>=3) status='target_met'; else if(selfSupportRatio>=1.5) status='reserve_building'; else if(selfSupportRatio>1) status='self_supporting'; else if(selfSupportRatio===1) status='break_even';
  return {currency,eligibleRevenueMinor,excludedRevenueMinor,infrastructureCostMinor,selfSupportRatio,targetRatio:3,targetRevenueMinor,revenueGapMinor,status,contributionMinor};
}

export function calculateFeatureEconomics(events:MoneyEvent[]) {
  const features=[...new Set(events.map(e=>e.feature).filter(Boolean) as string[])];
  return features.map(feature=>{const scoped=events.filter(e=>e.feature===feature);const revenueMinor=scoped.filter(e=>e.direction==='revenue').reduce((s,e)=>s+e.amountMinor,0);const variableCostMinor=scoped.filter(e=>e.direction==='cost').reduce((s,e)=>s+e.amountMinor,0);const contributionMinor=revenueMinor-variableCostMinor;return {feature,revenueMinor,variableCostMinor,contributionMinor,contributionMargin:revenueMinor>0?contributionMinor/revenueMinor:null};});
}

export function sustainabilityAlert(snapshot:SustainabilitySnapshot){
  if(snapshot.status==='target_met') return {severity:'ok' as const,message:`3.00x sustainability target achieved at ${snapshot.selfSupportRatio.toFixed(2)}x.`};
  if(snapshot.selfSupportRatio>=1) return {severity:'watch' as const,message:`Infrastructure is covered at ${snapshot.selfSupportRatio.toFixed(2)}x; more eligible revenue is required for 3.00x.`};
  return {severity:'critical' as const,message:`Platform is below break-even at ${snapshot.selfSupportRatio.toFixed(2)}x.`};
}

// Production must ingest reconciled events only. Excluded obligations are never treated as TRYAMM revenue.
