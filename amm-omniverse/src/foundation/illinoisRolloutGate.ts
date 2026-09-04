import type { RolloutScope } from './aaaCommerceFoundation';

export interface IllinoisRolloutEvidence {
  goldenOrderId: string;
  paidOrderVerified: boolean;
  settlementReconciled: boolean;
  inventoryReconciled: boolean;
  shipmentReconciled: boolean;
  founderKpisComplete: boolean;
  streetVerseAuthorityBoundaryVerified: boolean;
  visionQaReleaseGatePassed: boolean;
  performanceGatePassed: boolean;
  accessibilityGatePassed: boolean;
  evidenceIds: string[];
  verifiedAt?: string;
}

export interface IllinoisRolloutGateOptions {
  /** Clock injection keeps the gate deterministic in tests and audit replays. */
  nowMs?: number;
  /** Maximum age of verification evidence before a fresh proof is required. */
  maxEvidenceAgeMs?: number;
}

export interface RolloutGateDecision {
  currentScope: RolloutScope;
  nextScope?: RolloutScope;
  allowed: boolean;
  missingEvidence: string[];
}

const DEFAULT_MAX_EVIDENCE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const REQUIRED_BOOLEAN_EVIDENCE: Array<
  keyof Pick<
    IllinoisRolloutEvidence,
    | 'paidOrderVerified'
    | 'settlementReconciled'
    | 'inventoryReconciled'
    | 'shipmentReconciled'
    | 'founderKpisComplete'
    | 'streetVerseAuthorityBoundaryVerified'
    | 'visionQaReleaseGatePassed'
    | 'performanceGatePassed'
    | 'accessibilityGatePassed'
  >
> = [
  'paidOrderVerified',
  'settlementReconciled',
  'inventoryReconciled',
  'shipmentReconciled',
  'founderKpisComplete',
  'streetVerseAuthorityBoundaryVerified',
  'visionQaReleaseGatePassed',
  'performanceGatePassed',
  'accessibilityGatePassed',
];

const hasCanonicalId = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed === value;
};

const hasValidEvidenceIds = (evidenceIds: string[]): boolean => {
  if (evidenceIds.length === 0) return false;
  if (evidenceIds.some((id) => !hasCanonicalId(id))) return false;

  return new Set(evidenceIds).size === evidenceIds.length;
};

const hasValidVerificationTimestamp = (
  verifiedAt: string | undefined,
  nowMs: number,
  maxEvidenceAgeMs: number,
): boolean => {
  if (!verifiedAt?.trim()) return false;
  if (!Number.isFinite(nowMs) || !Number.isFinite(maxEvidenceAgeMs) || maxEvidenceAgeMs < 0) return false;

  const timestamp = Date.parse(verifiedAt);
  if (!Number.isFinite(timestamp)) return false;

  // Expansion evidence must already exist when the gate is evaluated. Reject
  // future-dated proof so a malformed clock or pre-staged record cannot unlock
  // geographic rollout before its verification actually occurred.
  if (timestamp > nowMs) return false;

  // Do not let an old Illinois verification remain a permanent expansion key.
  // A configurable freshness window forces the paid-order/reconciliation/QA
  // proof to be recent when U.S. expansion is proposed.
  return nowMs - timestamp <= maxEvidenceAgeMs;
};

export const evaluateIllinoisToUnitedStatesGate = (
  evidence: IllinoisRolloutEvidence,
  options: IllinoisRolloutGateOptions = {},
): RolloutGateDecision => {
  // The boolean evidence keys are only one subset of the strings that can be
  // reported as missing. Widen explicitly so structural evidence such as
  // goldenOrderId, evidenceIds, and verifiedAt can be added without unsafe casts.
  const missingEvidence: string[] = REQUIRED_BOOLEAN_EVIDENCE.filter(
    (key) => evidence[key] !== true,
  );
  const nowMs = options.nowMs ?? Date.now();
  const maxEvidenceAgeMs = options.maxEvidenceAgeMs ?? DEFAULT_MAX_EVIDENCE_AGE_MS;

  if (!hasCanonicalId(evidence.goldenOrderId)) missingEvidence.push('goldenOrderId');
  if (!hasValidEvidenceIds(evidence.evidenceIds)) missingEvidence.push('evidenceIds');
  if (!hasValidVerificationTimestamp(evidence.verifiedAt, nowMs, maxEvidenceAgeMs)) {
    missingEvidence.push('verifiedAt');
  }

  return {
    currentScope: 'illinois',
    nextScope: missingEvidence.length === 0 ? 'united-states' : undefined,
    allowed: missingEvidence.length === 0,
    missingEvidence,
  };
};

/**
 * Expansion is intentionally one-way and evidence-gated. This helper does not
 * mutate authoritative commerce state; it only evaluates whether verified
 * Illinois evidence is sufficient to propose the next geographic scope.
 *
 * Visual quality is part of the expansion contract: Illinois must have a
 * passing Vision-assisted AAA release gate before proposing U.S. expansion.
 */
export const proposeRolloutAdvance = (
  currentScope: RolloutScope,
  illinoisEvidence?: IllinoisRolloutEvidence,
  options: IllinoisRolloutGateOptions = {},
): RolloutGateDecision => {
  if (currentScope === 'illinois') {
    if (!illinoisEvidence) {
      return {
        currentScope,
        allowed: false,
        missingEvidence: ['illinoisEvidence'],
      };
    }
    return evaluateIllinoisToUnitedStatesGate(illinoisEvidence, options);
  }

  return {
    currentScope,
    allowed: false,
    missingEvidence: [
      currentScope === 'united-states'
        ? 'national-expansion-evidence-not-yet-defined'
        : 'world-is-terminal-rollout-scope',
    ],
  };
};
