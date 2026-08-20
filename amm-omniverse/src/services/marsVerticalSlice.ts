export type MarsProofStep =
  | 'device_a_authenticated'
  | 'device_b_authenticated'
  | 'same_world_instance'
  | 'crew_joined'
  | 'preflight_checkpoint'
  | 'mars_selected'
  | 'assets_prefetched'
  | 'travel_started'
  | 'mars_arrived'
  | 'canyon_mission_started'
  | 'live_connected'
  | 'chat_verified'
  | 'mission_checkpoint_saved'
  | 'both_disconnected'
  | 'both_rejoined'
  | 'canonical_state_restored'
  | 'world_state_restored'
  | 'panic_mode_verified'
  | 'known_good_recovery_verified'
  | 'performance_budget_passed'

export interface MarsProofEvidence {
  step: MarsProofStep
  passed: boolean
  evidenceRef?: string
  notes?: string
}

export interface MarsProofResult {
  status: 'GREEN' | 'YELLOW' | 'RED'
  completed: number
  total: number
  missing: MarsProofStep[]
  failed: MarsProofStep[]
}

export const MARS_PROOF_STEPS: MarsProofStep[] = [
  'device_a_authenticated','device_b_authenticated','same_world_instance','crew_joined','preflight_checkpoint',
  'mars_selected','assets_prefetched','travel_started','mars_arrived','canyon_mission_started','live_connected',
  'chat_verified','mission_checkpoint_saved','both_disconnected','both_rejoined','canonical_state_restored',
  'world_state_restored','panic_mode_verified','known_good_recovery_verified','performance_budget_passed',
]

export function evaluateMarsProof(evidence: MarsProofEvidence[]): MarsProofResult {
  const byStep = new Map(evidence.map(e => [e.step, e]))
  const missing = MARS_PROOF_STEPS.filter(step => !byStep.has(step) || !byStep.get(step)?.evidenceRef)
  const failed = MARS_PROOF_STEPS.filter(step => byStep.get(step)?.passed === false)
  const completed = MARS_PROOF_STEPS.filter(step => byStep.get(step)?.passed && byStep.get(step)?.evidenceRef).length
  const status = failed.length ? 'RED' : missing.length ? 'YELLOW' : 'GREEN'
  return { status, completed, total: MARS_PROOF_STEPS.length, missing, failed }
}

export const MARS_PERFORMANCE_BUDGET = Object.freeze({
  mobileMinFps: 30,
  desktopTargetFps: 60,
  xrTargetFps: 72,
  maxFrameTimeMsDesktop: 20,
  maxFrameTimeMsMobile: 34,
  maxInputLatencyMs: 100,
  requireAdaptiveQuality: true,
  requireLowPolyFallback: true,
  requireAudioOnlyLiveFallback: true,
})
