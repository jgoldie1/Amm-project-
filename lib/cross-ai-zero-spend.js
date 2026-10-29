'use strict';
// Cross AI zero-spend gate; credits are provider allowances, not cash or blockchain tokens.
// No paid fallback and no claimed free entitlement without provider confirmation.
const {routeRequest}=require('./cross-ai-policy');
const FREE_ORDER=Object.freeze(['local','gemini','openrouter']);
function planZeroSpend(input={},env=process.env){
 const allowed=String(env.CROSS_AI_ZERO_SPEND_ENABLED||'true')!=='false';
 if(!allowed)return {ok:false,error:'zero_spend_disabled'};
 const permission=String(input.action||'draft');
 if(!['read','draft','summarize','translate'].includes(permission))return {ok:false,error:'approval_required'};
 const prompt=typeof input.prompt==='string'?input.prompt.trim():'';
 if(!prompt||prompt.length>1600)return {ok:false,error:'invalid_prompt'};
 const lane=String(input.lane||'merchant');
 const enabled={
  local:Boolean(String(env.OLLAMA_BASE_URL||'').trim()&&String(env.OLLAMA_MODEL||'').trim()&&env.CROSS_AI_LOCAL_FREE_APPROVED==='true'),
  gemini:Boolean(String(env.GEMINI_API_KEY||'').trim()&&env.CROSS_AI_GEMINI_FREE_CONFIRMED==='true'),
  openrouter:Boolean(String(env.OPENROUTER_API_KEY||'').trim()&&env.CROSS_AI_OPENROUTER_FREE_CONFIRMED==='true')
 };
 const selection=FREE_ORDER.find(name=>enabled[name]);
 if(!selection)return {ok:false,error:'no_confirmed_free_capacity',paidFallback:false};
 if(selection==='gemini'){
  const route=routeRequest({lane,provider:'gemini',prompt,action:permission},env);
  if(!route.ok)return {...route,paidFallback:false};
 }
 return {ok:true,provider:selection,lane,action:permission,execution:'server_only',paidFallback:false,requiresRuntimeQuotaCheck:true,requiresProviderAllowanceCheck:true,requiresOwnerApprovalForCosts:true};
}
module.exports={FREE_ORDER,planZeroSpend};
