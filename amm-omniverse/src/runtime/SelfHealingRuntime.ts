export type HealingSeverity='info'|'warning'|'error'|'critical'
export type HealingAction='retry'|'restart-worker'|'failover-provider'|'disable-feature'|'rollback'|'generate-patch'|'human-review'
export type HealingStage='observed'|'diagnosed'|'candidate'|'sandboxed'|'verified'|'canary'|'promoted'|'rolled-back'|'blocked'

export type HealthSignal={
  id:string
  subsystem:string
  kind:string
  severity:HealingSeverity
  message:string
  value?:number
  threshold?:number
  occurredAt:number
  metadata?:Record<string,unknown>
}

export type RepairCandidate={
  id:string
  subsystem:string
  description:string
  action:HealingAction
  riskScore:number
  reversible:boolean
  touchesMoney:boolean
  touchesIdentity:boolean
  touchesPermissions:boolean
  touchesCompetitiveState:boolean
  patchRef?:string
  generatedAt:number
}

export type VerificationEvidence={
  buildPassed:boolean
  unitPassed:boolean
  integrationPassed:boolean
  securityPassed:boolean
  regressionPassed:boolean
  sandboxPassed:boolean
  canaryHealthy?:boolean
  notes?:string[]
}

export type HealingDecision={
  allowed:boolean
  autoExecute:boolean
  stage:HealingStage
  reason:string
  requiredEvidence:(keyof VerificationEvidence)[]
}

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))

export function scoreSignal(signal:HealthSignal){
  const base:Record<HealingSeverity,number>={info:10,warning:35,error:65,critical:90}
  let score=base[signal.severity]
  if(typeof signal.value==='number'&&typeof signal.threshold==='number'&&signal.threshold!==0){
    score+=Math.min(10,Math.max(0,((signal.value-signal.threshold)/Math.abs(signal.threshold))*20))
  }
  return clamp(Math.round(score))
}

export function proposeHealingAction(signal:HealthSignal):HealingAction{
  const k=signal.kind.toLowerCase()
  if(k.includes('timeout')||k.includes('temporary')||k.includes('rate-limit')) return 'retry'
  if(k.includes('worker-crash')||k.includes('worker-stalled')) return 'restart-worker'
  if(k.includes('provider-down')||k.includes('provider-error')) return 'failover-provider'
  if(k.includes('feature-regression')) return 'disable-feature'
  if(k.includes('deployment-regression')||k.includes('error-rate-spike')) return 'rollback'
  if(k.includes('code')||k.includes('build')||k.includes('test')) return 'generate-patch'
  return 'human-review'
}

export function createRepairCandidate(signal:HealthSignal,overrides:Partial<RepairCandidate>={}):RepairCandidate{
  const action=overrides.action||proposeHealingAction(signal)
  const risk=scoreSignal(signal)
  return {
    id:`repair-${signal.id}-${Date.now()}`,
    subsystem:signal.subsystem,
    description:`${action} for ${signal.kind}: ${signal.message}`,
    action,
    riskScore:risk,
    reversible:['retry','restart-worker','failover-provider','disable-feature','rollback'].includes(action),
    touchesMoney:false,touchesIdentity:false,touchesPermissions:false,touchesCompetitiveState:false,
    generatedAt:Date.now(),
    ...overrides,
  }
}

export function evaluateRepair(candidate:RepairCandidate,evidence:Partial<VerificationEvidence>={}):HealingDecision{
  const highImpact=candidate.touchesMoney||candidate.touchesIdentity||candidate.touchesPermissions||candidate.touchesCompetitiveState
  const safeAuto=new Set<HealingAction>(['retry','restart-worker','failover-provider','disable-feature','rollback'])
  const required:(keyof VerificationEvidence)[]=['sandboxPassed']

  if(candidate.action==='generate-patch') required.push('buildPassed','unitPassed','integrationPassed','securityPassed','regressionPassed')
  if(highImpact) required.push('securityPassed','integrationPassed','regressionPassed')

  const missing=[...new Set(required)].filter(key=>evidence[key]!==true)
  if(missing.length) return {allowed:false,autoExecute:false,stage:'blocked',reason:`Missing verification: ${missing.join(', ')}`,requiredEvidence:[...new Set(required)]}

  if(highImpact) return {allowed:true,autoExecute:false,stage:'verified',reason:'High-impact repair verified but requires explicit approval/canary.',requiredEvidence:[...new Set(required)]}
  if(candidate.riskScore>=80) return {allowed:true,autoExecute:false,stage:'verified',reason:'Critical-risk repair requires approval/canary despite passing tests.',requiredEvidence:[...new Set(required)]}

  return {allowed:true,autoExecute:safeAuto.has(candidate.action),stage:'verified',reason:safeAuto.has(candidate.action)?'Low-impact reversible repair may auto-execute.':'Verified repair candidate requires canary promotion.',requiredEvidence:[...new Set(required)]}
}

export function evaluateCanary(evidence:VerificationEvidence){
  return evidence.canaryHealthy===true
    ? {promote:true,stage:'promoted' as const,reason:'Canary healthy; candidate may be promoted.'}
    : {promote:false,stage:'rolled-back' as const,reason:'Canary unhealthy or unverified; rollback to last known good version.'}
}

export function createHealingAudit(signal:HealthSignal,candidate:RepairCandidate,decision:HealingDecision,evidence:Partial<VerificationEvidence>){
  return {
    eventType:'self-healing-decision',
    createdAt:new Date().toISOString(),
    signal,
    candidate,
    decision,
    evidence,
    immutableIntent:true,
  }
}

export const SELF_HEALING_POLICY={
  levels:{
    autoHeal:['retry','restart-worker','failover-provider','disable-feature','rollback'],
    repairCandidate:['generate-patch'],
    selfImprovement:['benchmark-against-frozen-baseline','hidden-regression-suite','canary-only-promotion'],
  },
  neverAutoPromote:['payments','wallet-ledger','payouts','identity','permissions','moderation-enforcement','competitive-economy','player-inventory'],
  rule:'AI may propose changes. Tests, sandbox evidence, canary health and rollback authority determine whether changes reach users.',
} as const
