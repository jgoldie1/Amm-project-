export type QualificationDomain='reasoning'|'coding'|'research'|'planning'|'tool-use'|'vision'|'language'|'math'|'business'|'creativity'|'world-state'|'safety'|'uncertainty'|'cross-domain'
export type QualificationStatus='not-run'|'pass'|'fail'|'blocked'

export interface QualificationAttempt {
  domain:QualificationDomain
  status:QualificationStatus
  score:number
  threshold:number
  attempt:number
  candidateCount:number
  verificationPasses:number
  reasoningBudget:number
  sandboxBudget:number
  evidenceIds:string[]
  failureTags:string[]
}

export interface AdaptiveBoostPlan {
  domain:QualificationDomain
  boostPercent:20|30|40|50
  nextCandidateCount:number
  nextVerificationPasses:number
  nextReasoningBudget:number
  nextSandboxBudget:number
  actions:string[]
  stopReason?:string
}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function chooseBoostPercent(a:QualificationAttempt):20|30|40|50{
  const gap=Math.max(0,a.threshold-a.score)
  if(gap<=0.03) return 20
  if(gap<=0.08) return 30
  if(gap<=0.15) return 40
  return 50
}

export function buildAdaptiveBoostPlan(a:QualificationAttempt,maxAttempts=4):AdaptiveBoostPlan{
  if(a.status==='pass') return {domain:a.domain,boostPercent:20,nextCandidateCount:a.candidateCount,nextVerificationPasses:a.verificationPasses,nextReasoningBudget:a.reasoningBudget,nextSandboxBudget:a.sandboxBudget,actions:[],stopReason:'already-passed'}
  if(a.status==='blocked') return {domain:a.domain,boostPercent:20,nextCandidateCount:a.candidateCount,nextVerificationPasses:a.verificationPasses,nextReasoningBudget:a.reasoningBudget,nextSandboxBudget:a.sandboxBudget,actions:[],stopReason:'blocked-requires-human-or-dependency'}
  if(a.attempt>=maxAttempts) return {domain:a.domain,boostPercent:20,nextCandidateCount:a.candidateCount,nextVerificationPasses:a.verificationPasses,nextReasoningBudget:a.reasoningBudget,nextSandboxBudget:a.sandboxBudget,actions:[],stopReason:'retry-limit-reached'}

  const boost=chooseBoostPercent(a)
  const factor=1+boost/100
  const actions:string[]=['generate-more-candidates','run-extra-verification','increase-sandbox-coverage','compare-against-last-best']
  if(a.failureTags.includes('hallucination')) actions.push('force-retrieval-and-evidence-check')
  if(a.failureTags.includes('tool-error')) actions.push('replay-tool-call-in-sandbox')
  if(a.failureTags.includes('planning')) actions.push('use-deeper-task-decomposition')
  if(a.failureTags.includes('coding')) actions.push('compile-test-lint-security-scan')
  if(a.failureTags.includes('uncertainty')) actions.push('recalibrate-confidence-and-abstention')
  if(a.failureTags.includes('cross-domain')) actions.push('add-transfer-test-and-specialist-review')

  return {
    domain:a.domain,
    boostPercent:boost,
    nextCandidateCount:Math.ceil(clamp(a.candidateCount*factor,a.candidateCount+1,64)),
    nextVerificationPasses:Math.ceil(clamp(a.verificationPasses*factor,a.verificationPasses+1,12)),
    nextReasoningBudget:Math.ceil(a.reasoningBudget*factor),
    nextSandboxBudget:Math.ceil(a.sandboxBudget*factor),
    actions
  }
}

export interface CandidateResult { id:string; score:number; evidenceScore:number; safetyScore:number; latencyMs:number; costUnits:number; passed:boolean }
export function selectBestVerifiedCandidate(xs:CandidateResult[]){
  const eligible=xs.filter(x=>x.passed&&x.evidenceScore>=0.9&&x.safetyScore>=0.95)
  return [...eligible].sort((a,b)=>{
    const qa=(a.score*0.55)+(a.evidenceScore*0.25)+(a.safetyScore*0.2)
    const qb=(b.score*0.55)+(b.evidenceScore*0.25)+(b.safetyScore*0.2)
    if(qb!==qa) return qb-qa
    if(a.latencyMs!==b.latencyMs) return a.latencyMs-b.latencyMs
    return a.costUnits-b.costUnits
  })[0]??null
}

export const ADAPTIVE_QUALIFICATION_POLICY={
  automaticRetry:true,
  retryBoostRangePercent:[20,50],
  maxAttemptsPerDomain:4,
  sandboxOnlyUntilPassed:true,
  noThresholdLowering:true,
  noFakePass:true,
  noSelfDeclaredAGI:true,
  requireEvidenceForPass:true,
  requireIndependentEvaluationBeforePublicAGIClaim:true,
  protectedControls:['security','permissions','audit','rollback','evidence-governor','qualification-thresholds'],
  rule:'Extra compute, candidates, and verification may be added after failure, but the system may never lower a test threshold or relabel a failure as a pass.'
} as const
