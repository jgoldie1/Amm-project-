'use strict';
// HoloGPT feature planner: transparent routing, privacy gates and no silent spending.
const {routeRequest}=require('./cross-ai-policy');
const {planZeroSpend}=require('./cross-ai-zero-spend');
const CAPABILITIES=Object.freeze({
 research:{lane:'travel',action:'summarize',review:true},
 business:{lane:'merchant',action:'draft',review:false},
 coding:{lane:'game',action:'draft',review:true},
 creator:{lane:'creator',action:'draft',review:false},
 accessibility:{lane:'accessibility',action:'draft',review:true},
 translation:{lane:'travel',action:'translate',review:true}
});
function makePlan(request={},env=process.env){
 const feature=String(request.feature||'').toLowerCase();
 const spec=CAPABILITIES[feature];
 if(!spec)return {ok:false,error:'unsupported_feature'};
 const prompt=typeof request.prompt==='string'?request.prompt.trim():'';
 if(!prompt||prompt.length>1600)return {ok:false,error:'invalid_prompt'};
 if(request.containsSensitiveData===true)return {ok:false,error:'sensitive_data_requires_private_review'};
 const noSpend=request.allowPaid!==true;
 const task={lane:spec.lane,action:spec.action,prompt};
 if(noSpend){
   const free=planZeroSpend(task,env);
   return {...free,feature,requiresHumanReview:spec.review,mode:'zero_spend',
     explain:free.ok?'Free tier configured; runtime quota and allowance must still be checked.':'No verified free route is available. No paid API calls were authorized.'};
 }
 if(request.confirmedPaidBudget!==true)return {ok:false,error:'paid_budget_not_approved',mode:'paid_opt_in'};
 const provider=String(request.provider||'openai').toLowerCase();
 const routed=routeRequest({...task,provider},env);
 return {...routed,feature,requiresHumanReview:spec.review,mode:'paid_opt_in',
    requiresRuntimeBudgetCheck:true,requiresCostEstimate:true,requiresUserApprovalPerPaidExecution:true};
}
module.exports={CAPABILITIES,makePlan};
