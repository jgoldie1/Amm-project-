'use strict';
// Read-only orchestrator: composes existing feature planner, no API calls or tool execution.
const {makePlan}=require('./hologpt-feature-planner');
const TASKS=Object.freeze({
 launch_website:[['business','Create a deliverable website launch checklist'],['accessibility','Review one-hand/mobile accessibility acceptance criteria'],['coding','Propose isolated test and rollback steps']],
 global_marketplace:[['research','Identify evidence needed to verify a local merchant and logistics region'],['business','Draft a merchant onboarding checklist'],['translation','Prepare a human-reviewed localization checklist']],
 creator_campaign:[['creator','Draft an accessible short-form video storyboard'],['business','Define a measurable lead qualification workflow']],
 streetverse_repair:[['coding','Identify a minimal reproducer and branch-only patch plan'],['accessibility','Create a mobile one-hand control test plan']]
});
function createMission(input={},env=process.env){
 const kind=String(input.mission||'');
 const steps=TASKS[kind];
 if(!steps)return {ok:false,error:'unknown_mission'};
 const context=typeof input.context==='string'?input.context.trim():'';
 if(context.length>900)return {ok:false,error:'context_too_long'};
 if(input.containsSensitiveData===true)return {ok:false,error:'sensitive_data_requires_review'};
 const planned=steps.map(([feature,description],i)=>{
   const prompt=[description,context].filter(Boolean).join('. ');
   const plan=makePlan({feature,prompt,allowPaid:false},env);
   return {step:i+1,feature,description,route:plan.ok?plan.provider:null,
     status:plan.ok?'planned_pending_runtime_checks':'blocked',
     reason:plan.ok?null:plan.error,requiresHumanReview:Boolean(plan.requiresHumanReview)};
 });
 return {ok:true,mission:kind,mode:'zero_spend',execution:'not_started',
   noAutomaticWrites:true,paidFallback:false,steps:planned,
   readyForRuntimeExecution:false,explanation:'Planning only; provider quota, consent, security and tool permissions must be verified before executing.'};
}
module.exports={TASKS,createMission};
