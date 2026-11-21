import type { PromotionRecord } from './districtEvidenceIngestion'

export type CompletionStatus = 'GREEN'|'YELLOW'|'RED'
export type WorkClass = 'proof'|'repair'|'benchmark'|'security'|'compliance'|'deployment'|'feature'|'world_expansion'

export interface CompletionSlice {
  id: string
  label: string
  status: CompletionStatus
  requiredForRelease: boolean
  blockers: string[]
  evidenceCount: number
  totalRequiredGates: number
  passedRequiredGates: number
}

export interface ExpansionDecision {
  allowed: boolean
  reason: string
  blockingSlices: string[]
  permittedWork: WorkClass[]
}

export interface TenOutOfTenScorecard {
  architecture: number
  scopeDiscipline: number
  evidenceDiscipline: number
  runtimeProof: number
  securityBoundaries: number
  performanceProof: number
  accessibilityProof: number
  commerceProof: number
  deploymentReadiness: number
  regressionSafety: number
  overall: number
  blockers: string[]
}

export const ACTIVE_COMPLETION_ORDER = [
  'district01_core',
  'district01_business_os',
  'live_multiplayer',
  'money_security',
  'mobile_performance',
  'xr_performance',
  'esports_world',
  'athletics_world',
] as const

export const FINISH_BEFORE_EXPAND_RULES = [
  'new_feature_work_is_blocked_while_any_required_active_slice_is_yellow_or_red',
  'world_expansion_is_blocked_until_district01_core_and_business_os_are_green',
  'proof_repair_benchmark_security_compliance_and_deployment_work_remain_allowed_during_freeze',
  'no_manual_override_can_mark_unproven_external_evidence_green',
  'a_changed_build_invalidates_unrevalidated_evidence',
  'failed_evidence_beats_passed_evidence_for_the_same_required_gate',
  'green_requires_100_percent_of_required_gates_passed_with_valid_evidence',
] as const

export function sliceFromPromotion(label: string, promotion: PromotionRecord): CompletionSlice {
  const failed = promotion.blockers.filter(b => b.endsWith(':failed')).length
  const unproven = promotion.blockers.filter(b => b.endsWith(':unproven')).length
  const totalRequiredGates = promotion.blockers.length + Math.max(0, promotion.evidence.length - failed - unproven)
  const passedRequiredGates = Math.max(0, totalRequiredGates - promotion.blockers.length)
  return {
    id: promotion.districtId,
    label,
    status: promotion.status,
    requiredForRelease: true,
    blockers: promotion.blockers,
    evidenceCount: promotion.evidence.length,
    totalRequiredGates,
    passedRequiredGates,
  }
}

export function decideExpansion(slices: CompletionSlice[], requested: WorkClass): ExpansionDecision {
  const blocking = slices.filter(s => s.requiredForRelease && s.status !== 'GREEN')
  const alwaysAllowed: WorkClass[] = ['proof','repair','benchmark','security','compliance','deployment']

  if (alwaysAllowed.includes(requested)) {
    return {
      allowed: true,
      reason: 'completion_work_allowed_during_feature_freeze',
      blockingSlices: blocking.map(s => s.id),
      permittedWork: alwaysAllowed,
    }
  }

  if (blocking.length) {
    return {
      allowed: false,
      reason: 'finish_before_expand_freeze_active',
      blockingSlices: blocking.map(s => s.id),
      permittedWork: alwaysAllowed,
    }
  }

  return {
    allowed: true,
    reason: 'all_required_active_slices_green',
    blockingSlices: [],
    permittedWork: [...alwaysAllowed,'feature','world_expansion'],
  }
}

export function completionPercent(slice: CompletionSlice): number {
  if (slice.totalRequiredGates <= 0) return slice.status === 'GREEN' ? 100 : 0
  return Math.round((slice.passedRequiredGates / slice.totalRequiredGates) * 1000) / 10
}

export function buildTenOutOfTenScorecard(input: {
  slices: CompletionSlice[]
  architectureScore?: number
  securityScore?: number
  accessibilityScore?: number
  regressionScore?: number
}): TenOutOfTenScorecard {
  const required = input.slices.filter(s => s.requiredForRelease)
  const allGreen = required.length > 0 && required.every(s => s.status === 'GREEN')
  const averageCompletion = required.length
    ? required.reduce((sum, s) => sum + completionPercent(s), 0) / required.length
    : 0
  const normalized = Math.max(0, Math.min(10, averageCompletion / 10))
  const blockers = required.flatMap(s => s.blockers.map(b => `${s.id}:${b}`))

  const scorecard: Omit<TenOutOfTenScorecard,'overall'|'blockers'> = {
    architecture: Math.min(10, input.architectureScore ?? 9),
    scopeDiscipline: allGreen ? 10 : Math.min(9, normalized),
    evidenceDiscipline: allGreen ? 10 : normalized,
    runtimeProof: allGreen ? 10 : normalized,
    securityBoundaries: Math.min(10, input.securityScore ?? 9),
    performanceProof: allGreen ? 10 : normalized,
    accessibilityProof: Math.min(10, input.accessibilityScore ?? 9),
    commerceProof: allGreen ? 10 : normalized,
    deploymentReadiness: allGreen ? 10 : normalized,
    regressionSafety: Math.min(10, input.regressionScore ?? 9),
  }

  const values = Object.values(scorecard)
  const overall = Math.round((values.reduce((a,b) => a + b, 0) / values.length) * 10) / 10
  return { ...scorecard, overall, blockers }
}

export const TEN_OUT_OF_TEN_DEFINITION = [
  '10_out_of_10_is_not_an_opinion_score',
  'all_required_active_slices_green',
  '100_percent_required_gates_have_valid_current_build_evidence',
  'zero_known_release_blockers',
  'external_device_and_provider_gates_are_verified_not_assumed',
  'regression_suite_passes_after_the_final_change',
  'deployment_readiness_is_evidence_backed',
] as const
