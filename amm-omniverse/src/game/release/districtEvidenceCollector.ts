export type EvidenceKind =
  | 'glb_load'
  | 'district_render'
  | 'player_spawn'
  | 'authoritative_movement'
  | 'spaceos_building'
  | 'building_acoustics'
  | 'vehicle_acoustics'
  | 'parks_wildlife'
  | 'character_intelligence'
  | 'race'
  | 'arcade_pinball'
  | 'escape_room'
  | 'starverse_stage'
  | 'world_pulse'
  | 'two_device_live'
  | 'save_rejoin'
  | 'commerce_sandbox'
  | 'panic_mode'
  | 'mobile_performance'
  | 'xr_performance'
  | 'black_poc_render_qa'
  | 'quantum_cone_lens_qa'
  | 'open_wild'
  | 'money_security'

export type EvidenceStatus = 'PASS'|'FAIL'|'UNPROVEN'

export interface EvidenceArtifact {
  id: string
  kind: EvidenceKind
  status: EvidenceStatus
  createdAt: string
  source: 'automated_test'|'runtime_probe'|'device_test'|'provider_test'|'manual_qa'
  commitSha?: string
  buildId?: string
  deviceId?: string
  sessionId?: string
  metrics?: Record<string, number|string|boolean>
  artifactUri?: string
  notes?: string
}

export interface DistrictEvidenceBundle {
  districtId: string
  commitSha: string
  buildId: string
  artifacts: EvidenceArtifact[]
}

export const REQUIRED_DISTRICT_01_EVIDENCE: EvidenceKind[] = [
  'glb_load','district_render','player_spawn','authoritative_movement','spaceos_building',
  'building_acoustics','vehicle_acoustics','parks_wildlife','character_intelligence','race',
  'arcade_pinball','escape_room','starverse_stage','world_pulse','two_device_live',
  'save_rejoin','commerce_sandbox','panic_mode','mobile_performance','xr_performance',
  'black_poc_render_qa','quantum_cone_lens_qa','open_wild','money_security',
]

export function collectLatestEvidence(bundle: DistrictEvidenceBundle) {
  const latest = new Map<EvidenceKind, EvidenceArtifact>()
  for (const artifact of bundle.artifacts) {
    const previous = latest.get(artifact.kind)
    if (!previous || new Date(artifact.createdAt).getTime() > new Date(previous.createdAt).getTime()) {
      latest.set(artifact.kind, artifact)
    }
  }
  return latest
}

export function computeDistrictGate(bundle: DistrictEvidenceBundle): EvidenceStatus {
  const latest = collectLatestEvidence(bundle)
  for (const kind of REQUIRED_DISTRICT_01_EVIDENCE) {
    const artifact = latest.get(kind)
    if (!artifact) return 'UNPROVEN'
    if (artifact.commitSha && artifact.commitSha !== bundle.commitSha) return 'UNPROVEN'
    if (artifact.buildId && artifact.buildId !== bundle.buildId) return 'UNPROVEN'
    if (artifact.status === 'FAIL') return 'FAIL'
    if (artifact.status !== 'PASS') return 'UNPROVEN'
  }
  return 'PASS'
}

export function missingEvidence(bundle: DistrictEvidenceBundle) {
  const latest = collectLatestEvidence(bundle)
  return REQUIRED_DISTRICT_01_EVIDENCE.filter(kind => !latest.has(kind) || latest.get(kind)?.status !== 'PASS')
}

export const EVIDENCE_INTEGRITY_RULES = [
  'evidence_is_bound_to_exact_commit_and_build',
  'stale_evidence_cannot_greenlight_new_build',
  'provider_and_device_gates_require_real_provider_or_device_source',
  'manual_qa_cannot_replace_security_or_money_engine_tests',
  'screenshots_without_machine_readable_metrics_do_not_replace_performance_proof',
  'two_device_live_requires_two_distinct_authenticated_device_or_session_ids',
  'commerce_sandbox_requires_authoritative_provider_or_money_engine_receipt',
  'panic_mode_requires_observed_safe_state_transition',
  'black_poc_render_qa_requires_multiple_lighting_conditions_and_skin_tone_samples',
] as const
