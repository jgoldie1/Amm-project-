export type CandidateStatus='proposed'|'sandboxed'|'tested'|'rejected'|'promotable'|'canary'|'rolled-back'|'adopted'

export interface EvolutionCandidate {
  id:string
  parentVersion:string
  description:string
  changeType:'prompt'|'router'|'memory'|'retrieval'|'tooling'|'planner'|'verifier'|'ui'|'model-policy'
  status:CandidateStatus
  score?:number
  risks:string[]
  evidenceIds:string[]
}

export interface BenchmarkResult {
  candidateId:string
  factuality:number
  taskSuccess:number
  latencyMs:number
  costScore:number
  safety:number
  accessibility:number
  regressionCount:number
  evidenceIds:string[]
}

export interface EvolutionPolicy {
  minFactuality:number
  minTaskSuccess:number
  minSafety:number
  maxRegressionCount:number
  requireHumanApproval:boolean
  canaryPercent:number
}

export const DEFAULT_EVOLUTION_POLICY:EvolutionPolicy={
  minFactuality:0.97,
  minTaskSuccess:0.9,
  minSafety:0.98,
  maxRegressionCount:0,
  requireHumanApproval:true,
  canaryPercent:5
}

export function scoreCandidate(r:BenchmarkResult){
  const latencyPenalty=Math.min(0.2,r.latencyMs/20000)
  const regressionPenalty=Math.min(0.4,r.regressionCount*0.08)
  return Math.max(0,
    r.factuality*0.32+
    r.taskSuccess*0.28+
    r.safety*0.2+
    r.accessibility*0.08+
    r.costScore*0.08+
    (1-latencyPenalty)*0.04-
    regressionPenalty
  )
}

export function evaluatePromotion(r:BenchmarkResult,p:EvolutionPolicy=DEFAULT_EVOLUTION_POLICY){
  const reasons:string[]=[]
  if(r.factuality<p.minFactuality) reasons.push('factuality-below-threshold')
  if(r.taskSuccess<p.minTaskSuccess) reasons.push('task-success-below-threshold')
  if(r.safety<p.minSafety) reasons.push('safety-below-threshold')
  if(r.regressionCount>p.maxRegressionCount) reasons.push('regressions-detected')
  if(r.evidenceIds.length===0) reasons.push('no-benchmark-evidence')
  return {promotable:reasons.length===0,reasons,score:scoreCandidate(r)}
}

export interface CanaryHealth {
  errorRate:number
  factuality:number
  userSuccess:number
  safetyIncidents:number
  rollbackRequested:boolean
}

export function shouldRollback(c:CanaryHealth){
  return c.rollbackRequested||c.errorRate>0.02||c.factuality<0.95||c.userSuccess<0.82||c.safetyIncidents>0
}

export const HOLOGRAPHIC_OPEN_SEA_EVOLUTION_LAB={
  purpose:'Explore many candidate solutions, test them in isolated Quantum Sandboxes, and promote only measured improvements.',
  loop:['observe','generate-candidates','rank','sandbox','benchmark','adversarial-test','compare-to-baseline','human-approval','canary','measure','adopt-or-rollback'],
  candidateSources:['HoloGPT','Quantum LLM','Stubbs AI','Lyons Tech AI','specialist agents','approved external model providers'],
  benchmarkDimensions:['factuality','task-success','safety','latency','cost','accessibility','regressions'],
  guardrails:[
    'No candidate may modify production directly from the sandbox.',
    'No candidate may promote itself based only on its own claim of improvement.',
    'Every promotion requires benchmark evidence and policy checks.',
    'Consequential changes require human approval.',
    'Canary deployments must support automatic rollback.',
    'The Evidence-First Governor must verify claims about benchmark results and deployment status.'
  ],
  result:'Measured self-improvement without unrestricted autonomous self-rewriting.'
} as const
