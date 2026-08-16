'use strict';

const {evidenceDecision,postActionVerification,extraBudget}=require('./stubbs-ai-remediation');

const RISK_BANDS=Object.freeze({GREEN:[0,29],YELLOW:[30,59],ORANGE:[60,79],RED:[80,100]});

function clamp(n,min=0,max=100){ return Math.max(min,Math.min(max,Number(n)||0)); }
function avg(xs){ return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0; }
function normalizedConclusion(result={}){
  return String(result.conclusionKey||result.decision||result.answer||'').trim().toLowerCase().replace(/\s+/g,' ');
}

function classifyRisk(score){
  const s=Math.round(clamp(score));
  if(s>=80) return 'RED';
  if(s>=60) return 'ORANGE';
  if(s>=30) return 'YELLOW';
  return 'GREEN';
}

function spiderSense(signals={}){
  const weights={
    unusualAgentBehavior:18,
    unexpectedPermission:22,
    suspiciousPrompt:20,
    conflictingEvidence:16,
    abnormalApiActivity:14,
    unexpectedDbChange:18,
    confidenceDrop:10,
    costSpike:8,
    performanceDegradation:8,
    failedAuthentication:20,
    promptInjection:28,
    sandboxAnomaly:18,
    secretAccess:30,
    privilegeEscalation:30
  };
  let score=0;
  const reasons=[];
  for(const [key,weight] of Object.entries(weights)){
    const raw=signals[key];
    const strength=raw===true?1:raw===false||raw==null?0:Math.max(0,Math.min(1,Number(raw)||0));
    if(strength>0){ score+=weight*strength; reasons.push(key); }
  }
  score=Math.round(clamp(score));
  const band=classifyRisk(score);
  const action=band==='GREEN'?'proceed':band==='YELLOW'?'extra-verification':band==='ORANGE'?'double-pass+sandbox':'block-isolate-rollback';
  return {score,band,action,reasons};
}

function secondBrainCritique(proposal={}){
  const issues=[];
  if(!proposal.objective) issues.push('missing-objective');
  if(proposal.type==='fact'){
    const evidence=evidenceDecision(proposal);
    if(!evidence.allowed) issues.push(evidence.reason||'unverified-fact');
  }
  if(proposal.requiresTool&& !proposal.toolPlan) issues.push('missing-tool-plan');
  if(proposal.highImpact&& !proposal.approvalPlan) issues.push('missing-approval-plan');
  if(proposal.reversible===false&&proposal.highImpact) issues.push('irreversible-high-impact-action');
  return {passed:issues.length===0,issues};
}

function solarPlexusGuard({proposal={},signals={},action}={}){
  const sense=spiderSense(signals);
  const critique=secondBrainCritique(proposal);
  const actionCheck=action?postActionVerification(action):{ok:true};
  const blocked=sense.band==='RED'||!critique.passed||!actionCheck.ok;
  const sandboxRequired=sense.band==='ORANGE'||sense.band==='YELLOW'||!critique.passed;
  return {
    blocked,
    sandboxRequired,
    risk:sense,
    critique,
    actionCheck,
    decision:blocked?'BLOCK':sandboxRequired?'VERIFY':'PROCEED'
  };
}

function compareBrains(primary={},secondary={}){
  const disagreement=[];
  const primaryConclusion=normalizedConclusion(primary);
  const secondaryConclusion=normalizedConclusion(secondary);
  if(!primaryConclusion||!secondaryConclusion) disagreement.push('missing-conclusion');
  else if(primaryConclusion!==secondaryConclusion) disagreement.push('conclusion');
  if(Array.isArray(primary.evidenceIds)&&Array.isArray(secondary.evidenceIds)){
    const a=new Set(primary.evidenceIds),b=new Set(secondary.evidenceIds);
    const overlap=[...a].filter(x=>b.has(x)).length;
    if(Math.max(a.size,b.size)>0&&overlap/Math.max(a.size,b.size)<0.5) disagreement.push('evidence');
  }
  return {agree:disagreement.length===0,disagreement,primaryConclusion,secondaryConclusion};
}

function consensusGate({primary,secondary,guardian,sandboxResult}={}){
  if(!primary||!secondary||!guardian) return {accepted:false,status:'BLOCKED',reason:'missing-brain-output'};
  if(guardian.blocked) return {accepted:false,status:'BLOCKED',reason:'guardian-block'};
  const cmp=compareBrains(primary,secondary);
  if(!cmp.agree) return {accepted:false,status:'REVIEW',reason:'brain-disagreement',disagreement:cmp.disagreement};
  if(guardian.sandboxRequired){
    if(!sandboxResult) return {accepted:false,status:'VERIFY',reason:'sandbox-required'};
    if(!sandboxResult.passed||!sandboxResult.evidenceIds?.length) return {accepted:false,status:'FAILED',reason:'sandbox-not-verified'};
  }
  return {accepted:true,status:'VERIFIED'};
}

function adaptiveIntelligenceBudget({score,target,complexity=0.5,riskBand='GREEN'}={}){
  const base=extraBudget(Number(score)||0,Number(target)||0);
  const complexityBoost=Math.max(0,Math.min(.2,(Number(complexity)||0)*.2));
  const riskBoost=riskBand==='RED'?.2:riskBand==='ORANGE'?.15:riskBand==='YELLOW'?.1:0;
  return Math.min(.5,Math.max(base,base+complexityBoost+riskBoost));
}

function systemBodyState(metrics={}){
  const values=['cpu','gpu','memory','latency','apiErrorRate','dbErrorRate','securityAlerts','agentFailureRate']
    .map(k=>Math.max(0,Math.min(1,Number(metrics[k])||0)));
  const stress=avg(values);
  return {
    stress:Number(stress.toFixed(4)),
    state:stress>=.75?'RED':stress>=.5?'ORANGE':stress>=.25?'YELLOW':'GREEN',
    metrics
  };
}

module.exports={RISK_BANDS,classifyRisk,spiderSense,secondBrainCritique,solarPlexusGuard,compareBrains,consensusGate,adaptiveIntelligenceBudget,systemBodyState};
