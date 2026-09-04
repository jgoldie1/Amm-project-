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

export interface RolloutGateDecision {
  currentScope: RolloutScope;
  nextScope?: RolloutScope;
  allowed: boolean;
  missingEvidence: string[];
}

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

const hasValidEvidenceIds = (evidenceIds: string[]): boolean => {
  if (evidenceIds.length === 0) return false;

  const normalizedIds = evidenceIds.map((id) => id.trim());
  if (normalizedIds.some((id) => id.length === 0)) return false;

  return new Set(normalizedIds).size === normalizedIds.length;
};

const hasValidVerificationTimestamp = (verifiedAt?: string): boolean => {
  if (!verifiedAt?.trim()) return false;
  return Number.isFinite(Date.parse(verifiedAt));
};

export const evaluateIllinoisToUnitedStatesGate = (
  evidence: IllinoisRolloutEvidence,
): RolloutGateDecision => {
  const missingEvidence = REQUIRED_BOOLEAN_EVIDENCE.filter((key) => evidence[key] !== true);

  if (!evidence.goldenOrderId.trim()) missingEvidence.push('goldenOrderId');
  if (!hasValidEvidenceIds(evidence.evidenceIds)) missingEvidence.push('evidenceIds');
  if (!hasValidVerificationTimestamp(evidence.verifiedAt)) missingEvidence.push('verifiedAt');

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
): RolloutGateDecision => {
  if (currentScope === 'illinois') {
    if (!illinoisEvidence) {
      return {
        currentScope,
        allowed: false,
        missingEvidence: ['illinoisEvidence'],
      };
    }
    return evaluateIllinoisToUnitedStatesGate(illinoisEvidence);
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
