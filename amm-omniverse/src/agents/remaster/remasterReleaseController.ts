export type RemasterAgentId = 'visual'|'glb_asset'|'ui_ux'|'performance'|'accessibility'|'world'|'commerce'|'live'|'regression'
export type RemasterTaskStatus = 'queued'|'running'|'proposed'|'testing'|'accepted'|'rejected'|'rolled_back'
export type RiskDomain = 'visual'|'asset'|'ui'|'performance'|'accessibility'|'world'|'commerce'|'live'|'security'|'money'|'age_gate'

export interface RemasterEvidence {
  kind: 'screenshot'|'metric'|'test'|'trace'|'artifact'|'provider_receipt'
  ref: string
  summary: string
}

export interface RemasterTask {
  id: string
  agent: RemasterAgentId
  domain: RiskDomain
  title: string
  targetPaths: string[]
  status: RemasterTaskStatus
  baselineCommit: string
  candidateCommit?: string
  before: RemasterEvidence[]
  after: RemasterEvidence[]
  deterministicFallback: boolean
  reversible: boolean
  featureFlag?: string
  blockedBy?: string[]
}

export const REMASTER_HARD_BLOCKS: RiskDomain[] = ['security','money','age_gate']

export const REMASTER_RELEASE_RULES = [
  'one_task_has_one_owner_agent',
  'every_task_has_before_and_after_evidence',
  'no_task_may_self_approve',
  'security_money_and_age_gate_changes_require_non_agent_authoritative_review',
  'all accepted changes must pass district proof and regression gates',
  'failed or worse-than-baseline changes are rejected or rolled_back',
  'feature flags required for risky rollout',
  'deterministic fallback required where agent/model behavior is involved',
  'tasks are bound to exact baseline and candidate commits',
] as const

export function canAgentOwn(domain: RiskDomain) {
  return !REMASTER_HARD_BLOCKS.includes(domain)
}

export function hasRequiredEvidence(task: RemasterTask) {
  return task.before.length > 0 && task.after.length > 0
}

export function canAcceptTask(task: RemasterTask, regressionGreen: boolean, districtProofGreen: boolean) {
  if (!canAgentOwn(task.domain)) return false
  if (!task.reversible) return false
  if (!hasRequiredEvidence(task)) return false
  if (!regressionGreen || !districtProofGreen) return false
  return task.status === 'testing' || task.status === 'proposed'
}

export const DEFAULT_REMASTER_QUEUE: Omit<RemasterTask,'baselineCommit'|'status'|'before'|'after'>[] = [
  {id:'remaster-character-rendering',agent:'visual',domain:'visual',title:'Character skin hair eyes teeth and lighting QA',targetPaths:['src/game','src/holo'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_VISUAL_ENABLED'},
  {id:'remaster-glb-streaming',agent:'glb_asset',domain:'asset',title:'GLB validation LOD collision material and stream budget',targetPaths:['src/game','src/assets'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_ASSET_ENABLED'},
  {id:'remaster-app-shell',agent:'ui_ux',domain:'ui',title:'App navigation cockpit and district UX',targetPaths:['src/components','src/App.tsx'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_UI_ENABLED'},
  {id:'remaster-performance',agent:'performance',domain:'performance',title:'Mobile XR and district frame budget repair',targetPaths:['src/game','src/holo'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_PERF_ENABLED'},
  {id:'remaster-accessibility',agent:'accessibility',domain:'accessibility',title:'One hand seated captions visual cues and XR comfort',targetPaths:['src/game','src/components'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_ACCESSIBILITY_ENABLED'},
  {id:'remaster-world',agent:'world',domain:'world',title:'World Pulse SpaceOS wildlife acoustics and missions',targetPaths:['src/game/world','src/game/discovery'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_WORLD_ENABLED'},
  {id:'remaster-commerce',agent:'commerce',domain:'commerce',title:'Store inventory delivery appointments entitlements and reconciliation',targetPaths:['src/game/commerce','src/game/business','src/services'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_COMMERCE_ENABLED'},
  {id:'remaster-live',agent:'live',domain:'live',title:'LIVE reconnect two-device voice chat and room lifecycle',targetPaths:['src','amm-backend'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_LIVE_ENABLED'},
  {id:'remaster-regression',agent:'regression',domain:'performance',title:'Cross-system regression proof and rollback readiness',targetPaths:['src','amm-backend'],deterministicFallback:true,reversible:true,featureFlag:'REMASTER_REGRESSION_ENABLED'},
]

export const REMASTER_PIPELINE = [
  'RECOVER','ADAPT','WIRE','MIGRATE','TEST','REPAIR','BENCHMARK','DEPLOY'
] as const
