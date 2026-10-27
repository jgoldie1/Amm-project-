/**
 * AI Café zero-spend model selection policy.
 * Pure planning logic: no API calls, secrets, model execution, or automatic upgrades.
 * Provider free allowances must be verified at runtime; model replies never authorize tools.
 */
export const FREE_MODEL_SOURCES=['local','gemini-free','openrouter-free'] as const
export type FreeModelSource=(typeof FREE_MODEL_SOURCES)[number]
export type ModelCandidate={source:FreeModelSource;id:string;freeTierVerified:boolean;commercialTermsReviewed:boolean;privacyReviewed:boolean;quotaRemaining:boolean}
export type ModelSelection={selected:ModelCandidate|null;reason:string}
const SAFE_MODEL_ID=/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,127}$/
export function chooseZeroSpendModel(candidates:ModelCandidate[],opts:{containsSensitiveData:boolean;allowedSources?:FreeModelSource[]}):ModelSelection{
 if(opts.containsSensitiveData)return{selected:null,reason:'sensitive_data_requires_private_approved_runtime'}
 const allowed=opts.allowedSources??FREE_MODEL_SOURCES
 for(const provider of FREE_MODEL_SOURCES){
  if(!allowed.includes(provider))continue
  const found=candidates.find(c=>c.source===provider&&SAFE_MODEL_ID.test(c.id)&&c.freeTierVerified&&c.commercialTermsReviewed&&c.privacyReviewed&&c.quotaRemaining)
  if(found)return{selected:found,reason:'verified_free_capacity'}
 }
 return{selected:null,reason:'no_approved_free_capacity_stop_without_charge'}
}
export const AI_CAFE_ZERO_SPEND_GUARD=Object.freeze({maxDollarSpend:0,autoPaidFallback:false,autoKeyCreation:false,autoSubscription:false,productionWrites:false})
