'use strict';
// Cross AI: pure routing policy. Never accepts credentials from browsers.
const PROVIDERS=Object.freeze(['openai','anthropic','gemini','deepseek']);
const LANES=Object.freeze(['merchant','travel','creator','game','accessibility']);
const ENV=Object.freeze({
 openai:['OPENAI_API_KEY','HOLOGPT_OPENAI_MODEL'],
 anthropic:['ANTHROPIC_API_KEY','HOLOGPT_CLAUDE_MODEL'],
 gemini:['GEMINI_API_KEY','HOLOGPT_GEMINI_MODEL'],
 deepseek:['DEEPSEEK_API_KEY','HOLOGPT_DEEPSEEK_MODEL']
});
const APPROVAL_ACTIONS=new Set(['publish','purchase','payment','transfer','send_email','submit_application','book','delete','deploy']);
function providerStatus(env=process.env){
 return PROVIDERS.map(id=>({id,configured:Boolean(String(env[ENV[id][0]]||'').trim()),model:String(env[ENV[id][1]]||'').trim()||null}));
}
function routeRequest(input={},env=process.env){
 const lane=String(input.lane||'').trim();
 if(!LANES.includes(lane))return {ok:false,error:'unsupported_lane'};
 const provider=String(input.provider||'openai').trim().toLowerCase();
 if(!PROVIDERS.includes(provider))return {ok:false,error:'unsupported_provider'};
 const prompt=typeof input.prompt==='string'?input.prompt.trim():'';
 if(!prompt||prompt.length>1600)return {ok:false,error:'invalid_prompt'};
 const action=String(input.action||'read').toLowerCase();
 if(APPROVAL_ACTIONS.has(action))return {ok:false,error:'approval_required',approvalAction:action};
 if(!['read','draft','summarize','translate'].includes(action))return {ok:false,error:'unsupported_action'};
 if(!String(env[ENV[provider][0]]||'').trim())return {ok:false,error:'provider_not_configured',provider};
 return {ok:true,provider,lane,action,model:String(env[ENV[provider][1]]||'').trim()||null,
         execution:'server_only',toolAccess:'none',needsHumanReview:lane==='accessibility'||action==='translate'};
}
module.exports={PROVIDERS,LANES,ENV,providerStatus,routeRequest};
