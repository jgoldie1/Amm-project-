'use strict';

const crypto=require('crypto');

function clamp(n,min=0,max=1){ return Math.max(min,Math.min(max,Number(n)||0)); }
function normalize(n){ return Math.round(clamp(n)*10000)/10000; }
function uniq(xs){ return [...new Set(xs||[])]; }

function hash(value){
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,16);
}

function createBrainResult({brainId,answer,confidence=0,evidenceIds=[],assumptions=[],risks=[],checks=[]}){
  return {
    brainId,
    answer,
    confidence:normalize(confidence),
    evidenceIds:uniq(evidenceIds),
    assumptions:uniq(assumptions),
    risks:uniq(risks),
    checks:[...checks],
    fingerprint:hash({answer,evidenceIds:uniq(evidenceIds),assumptions:uniq(assumptions)})
  };
}

function compareBrains(primary,secondary){
  if(!primary||!secondary) return {agreement:0,status:'incomplete',reasons:['missing-brain-result']};
  const answerMatch=primary.fingerprint===secondary.fingerprint ? 1 : 0;
  const sharedEvidence=primary.evidenceIds.filter(x=>secondary.evidenceIds.includes(x));
  const evidenceUnion=uniq([...primary.evidenceIds,...secondary.evidenceIds]);
  const evidenceOverlap=evidenceUnion.length ? sharedEvidence.length/evidenceUnion.length : 0;
  const confidenceGap=Math.abs(primary.confidence-secondary.confidence);
  const agreement=normalize((answerMatch*.55)+(evidenceOverlap*.30)+((1-confidenceGap)*.15));
  const reasons=[];
  if(!answerMatch) reasons.push('different-conclusion-or-support');
  if(evidenceOverlap<.5) reasons.push('low-evidence-overlap');
  if(confidenceGap>.25) reasons.push('confidence-disagreement');
  return {agreement,status:agreement>=.85?'agree':agreement>=.60?'review':'disagree',reasons,sharedEvidence,evidenceOverlap:normalize(evidenceOverlap),confidenceGap:normalize(confidenceGap)};
}

function critique(primary,secondary){
  const comparison=compareBrains(primary,secondary);
  const issues=[];
  if(primary.evidenceIds.length===0) issues.push('primary-has-no-evidence');
  if(secondary.evidenceIds.length===0) issues.push('secondary-has-no-evidence');
  if(comparison.status!=='agree') issues.push(...comparison.reasons);
  if(primary.assumptions.length>0||secondary.assumptions.length>0) issues.push('explicit-assumptions-present');
  if(primary.risks.length>0||secondary.risks.length>0) issues.push('identified-risks-present');
  return {comparison,issues:uniq(issues),requiresRepair:issues.length>0};
}

function verificationGate({primary,secondary,sandboxResult,externalEvidenceIds=[],actionRisk='low'}){
  const c=compareBrains(primary,secondary);
  const evidence=uniq([...primary.evidenceIds,...secondary.evidenceIds,...externalEvidenceIds]);
  const sandboxOk=!!sandboxResult && sandboxResult.status==='pass' && !sandboxResult.error;
  const highRisk=['high','critical'].includes(actionRisk);
  const enoughEvidence=highRisk ? evidence.length>=2 : evidence.length>=1;
  const agreementRequired=highRisk ? c.agreement>=.90 : c.agreement>=.80;
  const accept=sandboxOk&&enoughEvidence&&agreementRequired;
  const reasons=[];
  if(!sandboxOk) reasons.push('sandbox-not-passed');
  if(!enoughEvidence) reasons.push('insufficient-evidence');
  if(!agreementRequired) reasons.push('brain-disagreement');
  if(highRisk&&!externalEvidenceIds.length) reasons.push('high-risk-needs-independent-evidence');
  return {
    decision:accept?'accept':'repair-or-block',
    accepted:accept,
    agreement:c.agreement,
    evidenceIds:evidence,
    reasons:uniq(reasons),
    requiresHumanApproval:highRisk,
    rollbackRequired:!accept&&!!sandboxResult&&sandboxResult.changedState===true
  };
}

function buildDoublePassPlan(task,{risk='low'}={}){
  return {
    taskId:task?.id||`task-${Date.now()}`,
    risk,
    stages:[
      'primary-solve',
      'second-brain-independent-solve',
      'cross-critique',
      'repair',
      'quantum-sandbox-rerun',
      'evidence-reconcile',
      'consensus-gate',
      'human-approval-if-required',
      'accept-or-rollback'
    ],
    rules:[
      'Second Brain must not receive the Primary Brain conclusion before producing its independent answer.',
      'Agreement is not proof; evidence and sandbox execution are required.',
      'High-risk actions require independent evidence and human approval.',
      'If results conflict, mark REVIEW/BLOCKED instead of forcing consensus.',
      'Production state must be rolled back when a failed candidate changed state.'
    ]
  };
}

module.exports={createBrainResult,compareBrains,critique,verificationGate,buildDoublePassPlan};
