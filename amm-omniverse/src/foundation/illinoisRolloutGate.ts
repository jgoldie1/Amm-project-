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
const MAX_CANONICAL_ID_LENGTH = 256;
const MAX_EVIDENCE_IDS = 128;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/;

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

const ROLLOUT_EVIDENCE_FIELDS: Array<keyof IllinoisRolloutEvidence> = [
  'goldenOrderId',
  ...REQUIRED_BOOLEAN_EVIDENCE,
  'evidenceIds',
  'verifiedAt',
];

const hasOnlyReviewedEvidenceFields = (evidence: object): boolean =>
  Reflect.ownKeys(evidence).every(
    (key) => typeof key === 'string' && ROLLOUT_EVIDENCE_FIELDS.includes(key as keyof IllinoisRolloutEvidence),
  );

const hasSerializableDataEvidenceFields = (evidence: object): boolean =>
  ROLLOUT_EVIDENCE_FIELDS.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(evidence, key);
    return (
      descriptor === undefined ||
      ('value' in descriptor &&
        descriptor.get === undefined &&
        descriptor.set === undefined &&
        descriptor.enumerable === true)
    );
  });

const hasCanonicalId = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= MAX_CANONICAL_ID_LENGTH &&
    trimmed === value &&
    !CONTROL_CHARACTER_PATTERN.test(value)
  );
};

const hasValidEvidenceIds = (evidenceIds: unknown): evidenceIds is string[] => {
  if (!Array.isArray(evidenceIds) || Object.getPrototypeOf(evidenceIds) !== Array.prototype) return false;

  const lengthDescriptor = Object.getOwnPropertyDescriptor(evidenceIds, 'length');
  if (
    !lengthDescriptor ||
    !('value' in lengthDescriptor) ||
    lengthDescriptor.value === 0 ||
    lengthDescriptor.value > MAX_EVIDENCE_IDS
  ) {
    return false;
  }

  const reviewedIds: string[] = [];
  for (let index = 0; index < lengthDescriptor.value; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(evidenceIds, String(index));
    if (
      !descriptor ||
      !('value' in descriptor) ||
      descriptor.enumerable !== true ||
      !hasCanonicalId(descriptor.value)
    ) {
      return false;
    }
    reviewedIds.push(descriptor.value);
  }

  const expectedKeys = new Set(['length', ...reviewedIds.map((_, index) => String(index))]);
  if (Reflect.ownKeys(evidenceIds).some((key) => typeof key !== 'string' || !expectedKeys.has(key))) return false;

  return new Set(reviewedIds).size === reviewedIds.length;
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

  // Rollout evidence is an auditable release artifact, so require one canonical
  // UTC representation instead of accepting locale-dependent or ambiguous date
  // strings that happen to be parseable by the JavaScript runtime.
  if (verifiedAt !== verifiedAt.trim() || new Date(timestamp).toISOString() !== verifiedAt) return false;

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
  if (typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)) {
    return {
      currentScope: 'illinois',
      allowed: false,
      missingEvidence: ['illinoisEvidenceInvalid'],
    };
  }

  // Evidence is a serialized release artifact. Reject class instances and
  // custom-prototype objects so inherited getters/properties cannot satisfy the
  // rollout proof contract or execute while the server-authoritative gate reads it.
  const evidencePrototype = Object.getPrototypeOf(evidence);
  if (evidencePrototype !== Object.prototype && evidencePrototype !== null) {
    return {
      currentScope: 'illinois',
      allowed: false,
      missingEvidence: ['illinoisEvidenceInvalid'],
    };
  }

  // Keep the proof envelope closed to the reviewed schema. Reflect.ownKeys also
  // catches symbol and non-enumerable fields so hidden metadata cannot hitchhike
  // through the Illinois expansion decision as if it were part of verified proof.
  if (!hasOnlyReviewedEvidenceFields(evidence)) {
    return {
      currentScope: 'illinois',
      allowed: false,
      missingEvidence: ['illinoisEvidenceInvalid'],
    };
  }

  // Rollout proof must survive normal JSON-style serialization without changing
  // what the gate saw. Reject accessor-backed or non-enumerable reviewed fields
  // before reading any evidence so hidden proof cannot unlock expansion and then
  // disappear from the persisted audit artifact.
  if (!hasSerializableDataEvidenceFields(evidence)) {
    return {
      currentScope: 'illinois',
      allowed: false,
      missingEvidence: ['illinoisEvidenceInvalid'],
    };
  }

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
