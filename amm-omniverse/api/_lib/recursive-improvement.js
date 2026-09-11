const POWER_UPS=Object.freeze({
  stubbs_ai:{name:'Stubbs AI',role:'executive-optimizer',powers:['system-diagnosis','cross-platform-planning','code-improvement-proposals','revenue-optimization','accessibility-optimization','risk-aware-orchestration']},
  hologpt:{name:'HoloGPT',role:'user-intent-and-experience-optimizer',powers:['intent-routing','conversation-quality','tool-selection','workflow-completion','translation-quality','personalization-with-privacy']},
  middleverse_ai:{name:'Middleverse AI',role:'jobs-business-and-learning-optimizer',powers:['job-matching','business-onboarding','training-paths','agent-assistance','workforce-routing','opportunity-ranking']}
});

const IMMUTABLE=['production-secrets','deployment-credentials','payment-ledger','payout-destination','identity-policy','safety-policy','auth-policy','production-database-schema'];
const immutableSet=new Set(IMMUTABLE);
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const clean=(xs,max=100)=>[...new Set((Array.isArray(xs)?xs:[]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,max);

export function policy(){return {mode:'controlled-recursive-self-improvement',productionSelfRewrite:false,sandboxRequiredForCode:true,humanApprovalRequiredForHighImpact:true,rollbackRequired:true,immutableBoundaries:IMMUTABLE}}
export function powerUps(){return POWER_UPS}
export function score(baseline={},candidate={}){const w={quality:.30,reliability:.20,latency:.10,accessibility:.15,safety:.15,revenue:.10};let total=0;for(const [k,v] of Object.entries(w))total+=(clamp(candidate[k])-clamp(baseline[k]))*v;return Math.round(total*100)/100}
export function buildCycle(body={}){
  const objective=String(body.objective||'').trim().slice(0,6000);const agent=POWER_UPS[body.agent]?body.agent:'stubbs_ai';const targets=clean(body.targets).map(x=>x.toLowerCase());
  const critical=targets.some(x=>immutableSet.has(x));const high=body.highImpact===true||critical;const changesCode=body.changesCode===true;const delta=score(body.baseline,body.candidate);
  const cycleId=`improve_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  if(!objective)return {cycleId,status:'BLOCKED',verified:false,reason:'missing-objective',policy:policy()};
  const task={id:cycleId,objective,agent,profile:POWER_UPS[agent],targets,actionRisk:critical?'critical':high?'high':changesCode?'medium':'low',reversible:true,approvalPlan:{required:high,approver:high?'human-owner':null},sandboxChecks:changesCode?['syntax','unit-tests','security-regression','accessibility-regression','performance-regression','rollback-plan']:[],context:{scoreDelta:delta},constraints:['propose-test-evaluate-approve-measure','no autonomous production secret/payment/identity/safety/auth mutation','rollback required for production-affecting proposals']};
  if(critical)return {cycleId,status:'HUMAN_APPROVAL_REQUIRED',verified:false,reason:'IMMUTABLE_BOUNDARY',task,policy:policy()};
  return {cycleId,agent,scoreDelta:delta,status:high?'HUMAN_APPROVAL_REQUIRED':'PROPOSAL_READY',verified:false,reason:high?'high-impact approval gate':'candidate prepared for sandbox validation',task,policy:policy()};
}
