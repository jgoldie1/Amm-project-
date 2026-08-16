export type GoalType='research'|'coding'|'business'|'creative'|'world-sim'|'science'|'operations'|'education'
export type TaskStatus='queued'|'planning'|'running'|'verified'|'blocked'|'failed'

export interface StubbsGoal { id:string; type:GoalType; objective:string; constraints:string[]; successMetrics:string[] }
export interface StubbsTask { id:string; goalId:string; title:string; specialist:string; status:TaskStatus; evidenceIds:string[]; requiresApproval:boolean }
export interface StubbsMemory { id:string; scope:'session'|'project'|'long-term'; summary:string; sourceIds:string[]; confidence:number }
export interface CapabilityScore { domain:string; score:number; evidenceCount:number; lastEvaluatedAt:string }
export interface GeneralIntelligenceState {
  activeGoals:StubbsGoal[]
  tasks:StubbsTask[]
  memories:StubbsMemory[]
  capabilities:CapabilityScore[]
  confidence:number
  uncertainty:string[]
}

const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n))

export function createGoal(type:GoalType,objective:string,constraints:string[]=[],successMetrics:string[]=[]):StubbsGoal{
  return {id:`goal-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type,objective,constraints,successMetrics}
}

export function decomposeGoal(goal:StubbsGoal):StubbsTask[]{
  const base=[
    ['understand','context-retrieval'],
    ['plan','planner'],
    ['execute','specialist-router'],
    ['test','quantum-sandbox'],
    ['verify','evidence-governor']
  ]
  return base.map(([title,specialist],i)=>({id:`${goal.id}-t${i+1}`,goalId:goal.id,title,specialist,status:i===0?'queued':'queued',evidenceIds:[],requiresApproval:title==='execute'}))
}

export function recordMemory(state:GeneralIntelligenceState,memory:StubbsMemory){
  const normalized={...memory,confidence:clamp(memory.confidence)}
  return {...state,memories:[...state.memories.filter(m=>m.id!==memory.id),normalized]}
}

export function updateCapability(state:GeneralIntelligenceState,domain:string,score:number,evidenceCount:number,at=new Date().toISOString()){
  const next={domain,score:clamp(score),evidenceCount,lastEvaluatedAt:at}
  return {...state,capabilities:[...state.capabilities.filter(c=>c.domain!==domain),next]}
}

export interface CandidateResult { id:string; score:number; verified:boolean; evidenceIds:string[]; failedChecks:string[] }
export function chooseVerifiedCandidate(candidates:CandidateResult[]){
  return [...candidates]
    .filter(c=>c.verified&&c.failedChecks.length===0&&c.evidenceIds.length>0)
    .sort((a,b)=>b.score-a.score)[0]??null
}

export const STUBBS_GI_POLICY={
  label:'General Intelligence Runtime (AGI-style architecture)',
  claimTrueAGI:false,
  principles:[
    'Broad competence must be demonstrated by benchmarks, not declared by the model.',
    'Important factual claims require evidence or an explicit uncertainty label.',
    'Candidate improvements execute in Quantum Sandbox before production use.',
    'High-impact actions require authorization and post-action verification.',
    'The system may propose self-improvements but may not silently rewrite its own security, permission, audit, or rollback controls.',
    'Memory writes preserve provenance and confidence.',
    'Unknown is an acceptable answer state.'
  ],
  coreModules:['HoloGPT','Quantum LLM','Holographic Open Sea','Quantum Sandbox','Evidence-First Governor','HoloTrust','specialist agents','tool router','memory','multimodal perception','planner','critic/verifier'],
  domains:['coding','research','business','creative','games','Living Worlds','science','education','operations','accessibility','translation'],
  promotionGate:'candidate -> sandbox -> benchmark -> security/evidence review -> approval where required -> canary -> monitor -> keep/rollback'
} as const
