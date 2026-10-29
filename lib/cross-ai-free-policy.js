'use strict';
// Cross AI free-use routing. Free external quotas are NOT platform credits.
const {routeRequest}=require('./cross-ai-policy');
const FREE_ORDER=Object.freeze(['local','gemini','openrouter']);
function planFreeRequest({lane,prompt,action='draft'}={},env=process.env){
 if(!['read','draft','summarize','translate'].includes(action))return {ok:false,error:'approval_or_unsupported_action'};
 if(typeof prompt!=='string'||!prompt.trim()||prompt.length>1600)return {ok:false,error:'invalid_prompt'};
 if(!['merchant','travel','creator','game','accessibility'].includes(lane))return {ok:false,error:'unsupported_lane'};
 const local=Boolean(String(env.OLLAMA_BASE_URL||'').trim()&&String(env.OLLAMA_MODEL||'').trim()&&String(env.CROSSAI_LOCAL_ALLOWED||'')==='true');
 if(local)return {ok:true,provider:'local',mode:'free_local',model:env.OLLAMA_MODEL,execution:'server_only',toolAccess:'none'};
 // Free-tier provider usage is opt-in and only allowed after current quota/terms are verified by the operator.
 const gemini=String(env.CROSSAI_GEMINI_FREE_VERIFIED||'')==='true'&&Boolean(String(env.GEMINI_API_KEY||'').trim())&&Boolean(String(env.HOLOGPT_GEMINI_MODEL||'').trim());
 if(gemini)return {...routeRequest({lane,prompt,action,provider:'gemini'},{...env,GEMINI_API_KEY:env.GEMINI_API_KEY}),mode:'verified_free_tier'};
 const openrouter=String(env.CROSSAI_OPENROUTER_FREE_VERIFIED||'')==='true'&&Boolean(String(env.OPENROUTER_API_KEY||'').trim())&&/\:free$/.test(String(env.CROSSAI_OPENROUTER_MODEL||''));
 if(openrouter)return {ok:true,provider:'openrouter',mode:'verified_free_tier',model:env.CROSSAI_OPENROUTER_MODEL,execution:'server_only',toolAccess:'none',needsHumanReview:action==='translate'};
 return {ok:false,error:'free_capacity_unavailable',paidFallback:false};
}
function creditPolicy(){return {freeTokensAreNotCurrency:true,allowCreditMinting:false,allowCashRedemption:false,allowPayouts:false,allowAutomaticPaidFallback:false,requireServerVerifiedLedgerForPromotionalCredits:true};}
module.exports={FREE_ORDER,planFreeRequest,creditPolicy};
