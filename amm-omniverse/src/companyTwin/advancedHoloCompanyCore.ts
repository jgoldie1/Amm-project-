export type TwinNodeType = 'goal'|'person'|'role'|'product'|'service'|'customer_segment'|'supplier'|'inventory'|'order'|'delivery'|'campaign'|'project'|'account'|'risk'|'opportunity'|'asset'|'location';
export type TwinNode = { id:string; type:TwinNodeType; label:string; status:'healthy'|'watch'|'risk'|'blocked'|'unknown'; metrics?:Record<string,number>; tags?:string[]; updatedAt:string };
export type TwinEdge = { from:string; to:string; relation:string; weight?:number };
export type HoloCompanyTwin = { businessId:string; version:number; nodes:TwinNode[]; edges:TwinEdge[]; goals:string[]; lastEventAt?:string };

export type HoloLayer = 'people'|'commerce'|'money'|'operations'|'delivery'|'marketing'|'risk'|'opportunity';
export function projectHoloLayer(twin:HoloCompanyTwin, layer:HoloLayer):TwinNode[]{
  const map:Record<HoloLayer,TwinNodeType[]>={
    people:['person','role'], commerce:['product','service','customer_segment','order'], money:['account'],
    operations:['supplier','inventory','project','asset','location'], delivery:['delivery'], marketing:['campaign'],
    risk:['risk'], opportunity:['opportunity','goal']
  };
  return twin.nodes.filter(n=>map[layer].includes(n.type));
}

export type SimulationChange = { key:string; description:string; deltaPercent?:number; value?:number|string|boolean };
export type SimulationMetric = { name:string; baseline:number; projected:number; confidence:'low'|'medium'|'high'; rationale:string };
export type BusinessSimulation = { id:string; businessId:string; title:string; hypothesis:string; changes:SimulationChange[]; metrics:SimulationMetric[]; risks:string[]; assumptions:string[]; status:'draft'|'ready_for_review'|'approved_test'|'running'|'adopted'|'rolled_back'|'rejected' };
export function compareSimulation(sim:BusinessSimulation){
  return sim.metrics.map(m=>({...m, delta:m.projected-m.baseline, deltaPercent:m.baseline===0?null:((m.projected-m.baseline)/m.baseline)*100}));
}

export type CreditPurpose = 'ai_action'|'render'|'holo_scene'|'business_simulation'|'creator_generation'|'agent_run'|'data_enrichment';
export type HoloCreditLedgerEntry = { id:string; accountId:string; amount:number; direction:'credit'|'debit'; purpose:CreditPurpose; source:'subscription'|'promotion'|'gift'|'sponsor'|'purchase'|'refund'|'admin_adjustment'; createdAt:string; expiresAt?:string; referenceId?:string };
export function holoCreditBalance(entries:HoloCreditLedgerEntry[], accountId:string){ return entries.filter(e=>e.accountId===accountId).reduce((s,e)=>s+(e.direction==='credit'?e.amount:-e.amount),0); }

export type DataFundingPolicy = {
  allowCreditsForDataEnrichment:boolean;
  approvedDataPurposes:string[];
  prohibitPersonalDataResale:boolean;
  requireConsentForPersonalization:boolean;
  requireLicensedOrAuthorizedSources:boolean;
};
export const defaultDataFundingPolicy:DataFundingPolicy={ allowCreditsForDataEnrichment:true, approvedDataPurposes:['catalog enrichment','business analytics','authorized research','maps/search/provider usage','model/tool usage'], prohibitPersonalDataResale:true, requireConsentForPersonalization:true, requireLicensedOrAuthorizedSources:true };

export type HoloGift = { id:string; senderId:string; recipientId:string; kind:'hologift'|'creator_gift'|'ai_actions'|'hologpt_credits'; creditAmount?:number; paidValueMinor?:number; currency?:string; status:'prepared'|'payment_pending'|'settled'|'reversed'; message?:string };
// Paid gifts and creator earnings MUST flow through Jin Pay/Money Engine. HoloGPT Credits are usage credits, not cash or withdrawable stored value.

export type HarmonyArtifactType = 'website'|'landing_page'|'storefront'|'portfolio'|'campaign_page'|'course_page'|'event_page'|'holo_experience';
export type HarmonyChange = { id:string; prompt:string; scope:'element'|'section'|'page'|'site'; previewRequired:boolean; approved:boolean; createdAt:string };
export type StubbsHarmonyProject = { id:string; ownerId:string; businessId?:string; type:HarmonyArtifactType; brandProfileId?:string; pages:string[]; responsive:true; accessibilityChecked:boolean; seoChecked:boolean; commerceConnected:boolean; changes:HarmonyChange[] };

export function canPublishHarmony(project:StubbsHarmonyProject){
  const unapproved=project.changes.some(c=>c.previewRequired&&!c.approved);
  if(unapproved) return {allowed:false,reason:'AI-generated changes still require review.'};
  if(!project.accessibilityChecked) return {allowed:false,reason:'Accessibility review is required before publish.'};
  return {allowed:true,reason:'Project has passed required publish checks.'};
}

// Stubbs Harmony is TRYAMM's own AI + visual creation concept. It must not use Wix branding or imply Wix affiliation.
// Inspiration boundary: prompt-to-site/page/element, visual refinement, responsive output and human approval are product patterns, not copied proprietary UI/assets.
