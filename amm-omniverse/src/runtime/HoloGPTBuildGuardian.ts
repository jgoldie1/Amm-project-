import type { HoloCapability, HoloInputKind, IntentPlan, IntentStep } from './HoloGPTSovereignIntentFabric'

export type ProblemClass =
  | 'LOST_WORK' | 'DEPLOYMENT_DRIFT' | 'FALSE_COMPLETION' | 'CI_FAILURE' | 'PROVIDER_OUTAGE'
  | 'MISSING_FILE' | 'DUPLICATE_SYSTEM' | 'CONFIG_DRIFT' | 'ACCESSIBILITY_FRICTION'
  | 'UNSAFE_ACTION' | 'COST_OVERRUN' | 'DATA_RETENTION' | 'UNKNOWN'

export type WorkReceipt = {
  id:string
  intentId:string
  stepId:string
  state:'PLANNED'|'APPROVED'|'RUNNING'|'VERIFIED'|'FAILED'|'ROLLED_BACK'
  evidence:string[]
  commitSha?:string
  deploymentId?:string
  createdAt:string
}

export type RecoveryCheckpoint = {
  id:string
  intentId:string
  sourceRevision?:string
  artifactHashes:string[]
  configurationFingerprint:string
  createdAt:string
}

export function classifyBuildProblem(message:string):ProblemClass {
  const s=message.toLowerCase()
  if(/lost|deleted|erased|missing work/.test(s)) return 'LOST_WORK'
  if(/deploy|vercel|render|production/.test(s)) return 'DEPLOYMENT_DRIFT'
  if(/ci|typecheck|test|workflow/.test(s)) return 'CI_FAILURE'
  if(/file|upload|attachment/.test(s)) return 'MISSING_FILE'
  if(/duplicate|two systems|conflict/.test(s)) return 'DUPLICATE_SYSTEM'
  if(/config|environment|env var|node version/.test(s)) return 'CONFIG_DRIFT'
  if(/one hand|voice|accessibility|mobile/.test(s)) return 'ACCESSIBILITY_FRICTION'
  if(/cost|budget|token limit/.test(s)) return 'COST_OVERRUN'
  return 'UNKNOWN'
}

export function canClaimComplete(receipt:WorkReceipt) {
  return receipt.state==='VERIFIED' && receipt.evidence.length>0
}

export function requireRollbackCheckpoint(step:IntentStep, checkpoint?:RecoveryCheckpoint) {
  if(step.risk!=='READ_ONLY' && !checkpoint) throw new Error('write actions require a recovery checkpoint')
  return true
}

export const HOLOGPT_BUILD_GUARDIAN = {
  name:'Build Guardian',
  purpose:'Turn app-building failures into recoverable, evidence-backed workflows instead of repeated manual loops.',
  controls:[
    'automatic checkpoint before every write/deploy/migration',
    'work receipts that separate planned committed tested merged deployed and live',
    'artifact/file vault with hashes and provenance',
    'branch and deployment drift detector',
    'CI failure triage using the exact failing job and log',
    'configuration fingerprint for runtime package and environment drift',
    'duplicate-system detector before creating new ledgers routers services or databases',
    'provider health and fallback routing without silently changing user intent',
    'cost/time budget guardrails before expensive generation or agent loops',
    'one-hand voice and large-target interaction contract for founder workflows',
    'safe rollback to the last verified checkpoint',
    'data retention and deletion policy enforcement',
    'human approval for financial publication communication and destructive actions',
  ],
} as const

export const FOUNDER_COMMAND_LOOP = [
  'CAPTURE_INTENT',
  'DISCOVER_EXISTING_WORK',
  'PLAN_MINIMUM_CHANGE',
  'CHECKPOINT',
  'EXECUTE',
  'TEST',
  'VERIFY_EVIDENCE',
  'COMMIT',
  'CI',
  'MERGE',
  'DEPLOY',
  'PRODUCTION_PROBE',
  'RECEIPT',
] as const

export function compileRecoveryIntent(problem:string):IntentPlan {
  const kind=classifyBuildProblem(problem)
  const steps:IntentStep[]=[
    {id:'discover',capability:'coding' as HoloCapability,instruction:`Inspect existing work and evidence for ${kind}; do not duplicate systems.`,risk:'READ_ONLY',requiresApproval:false},
    {id:'repair',capability:'coding' as HoloCapability,instruction:'Prepare the smallest reversible repair against the verified source revision.',risk:'REVERSIBLE_WRITE',requiresApproval:false},
    {id:'release',capability:'agent-actions' as HoloCapability,instruction:'Advance only through test, CI, merge and deploy gates supported by evidence.',risk:'PUBLICATION',requiresApproval:true},
  ]
  return {intentId:`recovery:${Date.now()}`,goal:problem,steps,createdAt:new Date().toISOString()}
}
