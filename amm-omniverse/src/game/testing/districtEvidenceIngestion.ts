export type EvidenceStatus = 'PASS'|'FAIL'|'UNPROVEN'
export type EvidenceSource = 'ci'|'runtime'|'device'|'provider'|'manual-reviewed'

export interface DistrictEvidenceEnvelope {
  districtId: string
  buildId: string
  commitSha: string
  collectedAt: string
  source: EvidenceSource
  gateId: string
  status: EvidenceStatus
  artifactUri?: string
  metrics?: Record<string, number|string|boolean>
  notes?: string[]
  verifiedBy?: string
}

export interface PromotionRecord {
  districtId: string
  buildId: string
  commitSha: string
  evidence: DistrictEvidenceEnvelope[]
  status: 'GREEN'|'YELLOW'|'RED'
  blockers: string[]
  generatedAt: string
}

export const REQUIRED_DISTRICT_01_GATES = [
  'glb_load','district_render','player_spawn','authoritative_movement','spaceos_buildings',
  'building_acoustics','vehicle_acoustics','parks_woods_wildlife','character_intelligence',
  'race','arcade_pinball','escape_room','starverse_stage','world_pulse','two_device_live',
  'save_rejoin','commerce_sandbox_10usd','panic_mode','mobile_performance','xr_performance',
  'black_poc_render_qa','quantum_cone_lens','open_wild','money_security_boundaries',
] as const

export function buildPromotionRecord(
  districtId: string,
  buildId: string,
  commitSha: string,
  evidence: DistrictEvidenceEnvelope[],
): PromotionRecord {
  const valid = evidence.filter(e => e.districtId === districtId && e.buildId === buildId && e.commitSha === commitSha)
  const blockers: string[] = []
  let hasFail = false

  for (const gateId of REQUIRED_DISTRICT_01_GATES) {
    const gateEvidence = valid.filter(e => e.gateId === gateId)
    if (!gateEvidence.length) {
      blockers.push(`${gateId}:unproven`)
      continue
    }
    if (gateEvidence.some(e => e.status === 'FAIL')) {
      blockers.push(`${gateId}:failed`)
      hasFail = true
      continue
    }
    if (!gateEvidence.some(e => e.status === 'PASS')) blockers.push(`${gateId}:unproven`)
  }

  return {
    districtId,
    buildId,
    commitSha,
    evidence: valid,
    status: hasFail ? 'RED' : blockers.length ? 'YELLOW' : 'GREEN',
    blockers,
    generatedAt: new Date().toISOString(),
  }
}

export function ingestCiCheck(input: {
  districtId:string; buildId:string; commitSha:string; gateId:string; passed:boolean; artifactUri?:string; notes?:string[]
}): DistrictEvidenceEnvelope {
  return {
    districtId: input.districtId,
    buildId: input.buildId,
    commitSha: input.commitSha,
    collectedAt: new Date().toISOString(),
    source: 'ci',
    gateId: input.gateId,
    status: input.passed ? 'PASS' : 'FAIL',
    artifactUri: input.artifactUri,
    notes: input.notes,
  }
}

export function ingestRuntimeMetric(input: {
  districtId:string; buildId:string; commitSha:string; gateId:string; passed:boolean; metrics:Record<string,number|string|boolean>; artifactUri?:string
}): DistrictEvidenceEnvelope {
  return {
    districtId: input.districtId,
    buildId: input.buildId,
    commitSha: input.commitSha,
    collectedAt: new Date().toISOString(),
    source: 'runtime',
    gateId: input.gateId,
    status: input.passed ? 'PASS' : 'FAIL',
    metrics: input.metrics,
    artifactUri: input.artifactUri,
  }
}

export function ingestDeviceProof(input: {
  districtId:string; buildId:string; commitSha:string; gateId:string; passed:boolean; artifactUri:string; notes?:string[]
}): DistrictEvidenceEnvelope {
  return {
    districtId: input.districtId,
    buildId: input.buildId,
    commitSha: input.commitSha,
    collectedAt: new Date().toISOString(),
    source: 'device',
    gateId: input.gateId,
    status: input.passed ? 'PASS' : 'FAIL',
    artifactUri: input.artifactUri,
    notes: input.notes,
  }
}

export function ingestProviderReceipt(input: {
  districtId:string; buildId:string; commitSha:string; gateId:string; passed:boolean; provider:string; receiptId:string; artifactUri?:string
}): DistrictEvidenceEnvelope {
  return {
    districtId: input.districtId,
    buildId: input.buildId,
    commitSha: input.commitSha,
    collectedAt: new Date().toISOString(),
    source: 'provider',
    gateId: input.gateId,
    status: input.passed ? 'PASS' : 'FAIL',
    artifactUri: input.artifactUri,
    metrics: { provider: input.provider, receiptId: input.receiptId },
  }
}

export const PROMOTION_RULES = [
  'evidence_must_match_exact_commit_and_build',
  'provider_backed_gates_require_provider_receipt_or_equivalent_external_evidence',
  'two_device_live_requires_two_distinct_authenticated_sessions',
  'performance_gates_require_captured_runtime_metrics',
  'render_qa_requires_multiple_lighting_conditions_and_skin_tone_coverage',
  'panic_mode_requires_before_after_state_evidence',
  'money_security_cannot_be_overridden_by_ai_or_manual_green_flag',
  'old_evidence_never_promotes_a_new_build_without_explicit_revalidation',
] as const
