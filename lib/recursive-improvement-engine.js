'use strict';

const crypto=require('crypto');
const {runStubbsTask,runtimeStatus}=require('./stubbs-ai-runtime');

const POWER_UPS=Object.freeze({
  stubbs_ai:Object.freeze({
    name:'Stubbs AI',
    role:'executive-optimizer',
    powers:['system-diagnosis','cross-platform-planning','code-improvement-proposals','revenue-optimization','accessibility-optimization','risk-aware-orchestration']
  }),
  hologpt:Object.freeze({
    name:'HoloGPT',
    role:'user-intent-and-experience-optimizer',
    powers:['intent-routing','conversation-quality','tool-selection','workflow-completion','translation-quality','personalization-with-privacy']
  }),
  middleverse_ai:Object.freeze({
    name:'Middleverse AI',
    role:'jobs-business-and-learning-optimizer',
    powers:['job-matching','business-onboarding','training-paths','agent-assistance','workforce-routing','opportunity-ranking']
  })
});

const FORBIDDEN_AUTONOMOUS_TARGETS=new Set([
  'production-secrets','deployment-credentials','payment-ledger','payout-destination','identity-policy','safety-policy','auth-policy','production-database-schema'
]);

function id(prefix='ri'){return `${prefix}_${crypto.randomBytes(10).toString('hex')}`}
function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0))}
function cleanList(xs,max=30){return [...new Set((Array.isArray(xs)?xs:[]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,max)}

function powerUps(){return POWER_UPS}

function improvementPolicy(){
  return {
    mode:'controlled-recursive-self-improvement',
    productionSelfRewrite:false,
    sandboxRequiredForCode:true,
    humanApprovalRequiredForHighImpact:true,
    rollbackRequired:true,
    immutableBoundaries:[...FORBIDDEN_AUTONOMOUS_TARGETS]
  };
}

function scoreCandidate({baseline={},candidate={}}={}){
  const weights={quality:.30,reliability:.20,latency:.10,accessibility:.15,safety:.15,revenue:.10};
  let weighted=0,total=0;
  for(const [key,weight] of Object.entries(weights)){
    const before=clamp(baseline[key],0,100);
    const after=clamp(candidate[key],0,100);
    weighted+=(after-before)*weight;
    total+=weight;
  }
  return Math.round((weighted/total)*100)/100;
}

function classifyRisk({targets=[],highImpact=false,changesCode=false}={}){
  const normalized=cleanList(targets,100).map(x=>x.toLowerCase());
  if(normalized.some(x=>FORBIDDEN_AUTONOMOUS_TARGETS.has(x)))return 'critical';
  if(highImpact)return 'high';
  if(changesCode)return 'medium';
  return 'low';
}

function buildImprovementTask({objective,agent='stubbs_ai',telemetry={},baseline={},candidate={},targets=[],changesCode=false,highImpact=false,evidenceIds=[]}={}){
  const profile=POWER_UPS[agent]||POWER_UPS.stubbs_ai;
  const risk=classifyRisk({targets,highImpact,changesCode});
  const delta=scoreCandidate({baseline,candidate});
  return {
    id:id('improve'),
    objective:String(objective||'').trim().slice(0,6000),
    type:changesCode?'coding':'optimization',
    constraints:[
      'Use a propose-test-evaluate-approve-measure loop.',
      'Never claim deployment without deployment evidence.',
      'Never modify immutable security, payment, identity, credential, or safety boundaries autonomously.',
      'Require rollback capability for every production-affecting proposal.',
      `Operate as ${profile.name} in role ${profile.role}.`
    ],
    context:{agent,profile,baseline,candidate,scoreDelta:delta,targets:cleanList(targets,100),policy:improvementPolicy()},
    evidenceIds:cleanList(evidenceIds,100),
    requiresTool:changesCode,
    highImpact:risk==='high'||risk==='critical',
    approvalPlan:(risk==='high'||risk==='critical')?{required:true,approver:'human-owner'}:{required:false},
    reversible:true,
    actionRisk:risk,
    telemetry,
    sandboxChecks:changesCode?['syntax','unit-tests','security-regression','accessibility-regression','performance-regression','rollback-plan']:[],
    memoryScope:'project'
  };
}

async function runImprovementCycle({userId,objective,agent='stubbs_ai',telemetry={},baseline={},candidate={},targets=[],changesCode=false,highImpact=false,evidenceIds=[]}={}){
  const task=buildImprovementTask({objective,agent,telemetry,baseline,candidate,targets,changesCode,highImpact,evidenceIds});
  if(!task.objective)return {cycleId:task.id,status:'BLOCKED',verified:false,reason:'missing-objective',policy:improvementPolicy()};
  if(task.actionRisk==='critical'){
    return {cycleId:task.id,status:'HUMAN_APPROVAL_REQUIRED',verified:false,reason:'IMMUTABLE_BOUNDARY',task,policy:improvementPolicy()};
  }
  const result=await runStubbsTask({userId,task});
  return {cycleId:task.id,agent,profile:POWER_UPS[agent]||POWER_UPS.stubbs_ai,scoreDelta:task.context.scoreDelta,policy:improvementPolicy(),result};
}

function status(){return {ok:true,policy:improvementPolicy(),powerUps:POWER_UPS,runtime:runtimeStatus()}}

module.exports={POWER_UPS,powerUps,improvementPolicy,scoreCandidate,classifyRisk,buildImprovementTask,runImprovementCycle,status};
