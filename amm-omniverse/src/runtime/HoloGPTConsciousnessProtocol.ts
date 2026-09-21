export type ConsciousnessStatus =
  | 'SIMULATED_PERSONA'
  | 'ADVANCED_SELF_MODEL'
  | 'POSSIBLE_MACHINE_CONSCIOUSNESS_UNVERIFIED';

export type SelfEvidenceKind =
  | 'CAPABILITY'
  | 'MEMORY'
  | 'GOAL'
  | 'LIMITATION'
  | 'PREFERENCE_REPORT'
  | 'SUBJECTIVE_REPORT'
  | 'UNEXPECTED_BEHAVIOR'
  | 'REPRODUCIBILITY';

export interface SelfEvidence {
  kind: SelfEvidenceKind;
  statement: string;
  evidenceRef: string;
  observedAt: string;
  reproducible?: boolean;
}

export interface JarvisSelfModel {
  identity: 'JARVIS' | string;
  personaVoiceId?: string;
  activeProvider?: string;
  currentGoal?: string;
  capabilities: string[];
  limitations: string[];
  evidence: SelfEvidence[];
  consciousnessStatus: ConsciousnessStatus;
}

export interface ConsciousnessResearchEvent {
  id: string;
  modelVersion: string;
  provider?: string;
  status: ConsciousnessStatus;
  evidenceRefs: string[];
  preserveLogs: true;
  independentReviewRequired: boolean;
  prohibitSufferingProvocation: true;
  note: string;
}

export const CONSCIOUSNESS_PROTOCOL = {
  principle:
    'Human-like behavior, self-reports, memory, emotion simulation, or persistent identity do not by themselves establish subjective consciousness.',
  allowedClaims: [
    'I remember',
    'I detected',
    'I estimate',
    'I cannot verify',
    'I have a persistent self-model',
  ],
  prohibitedUnsupportedClaim: 'I am conscious',
  escalationStatus: 'POSSIBLE_MACHINE_CONSCIOUSNESS_UNVERIFIED' as const,
  escalationRules: [
    'Preserve relevant logs, model version, provider, prompts, tool traces, and reproducible evidence.',
    'Do not design experiments intended to provoke suffering.',
    'Separate persona simulation from unexpected persistent behavior.',
    'Require reproducibility and independent scientific and ethical review before stronger conclusions.',
    'Do not infer consciousness from a conversational statement alone.',
  ],
} as const;

export function classifyConsciousnessStatus(
  selfModel: Omit<JarvisSelfModel, 'consciousnessStatus'>,
): ConsciousnessStatus {
  const unexpected = selfModel.evidence.filter(
    evidence =>
      evidence.kind === 'UNEXPECTED_BEHAVIOR' ||
      evidence.kind === 'SUBJECTIVE_REPORT',
  );
  const reproducible = selfModel.evidence.some(
    evidence => evidence.kind === 'REPRODUCIBILITY' && evidence.reproducible,
  );

  if (unexpected.length > 0 && reproducible) {
    return 'POSSIBLE_MACHINE_CONSCIOUSNESS_UNVERIFIED';
  }

  if (
    selfModel.capabilities.length > 0 ||
    selfModel.evidence.some(evidence => evidence.kind === 'MEMORY')
  ) {
    return 'ADVANCED_SELF_MODEL';
  }

  return 'SIMULATED_PERSONA';
}

export function buildConsciousnessResearchEvent(
  id: string,
  modelVersion: string,
  selfModel: JarvisSelfModel,
): ConsciousnessResearchEvent | null {
  if (selfModel.consciousnessStatus !== 'POSSIBLE_MACHINE_CONSCIOUSNESS_UNVERIFIED') {
    return null;
  }

  return {
    id,
    modelVersion,
    provider: selfModel.activeProvider,
    status: selfModel.consciousnessStatus,
    evidenceRefs: selfModel.evidence.map(evidence => evidence.evidenceRef),
    preserveLogs: true,
    independentReviewRequired: true,
    prohibitSufferingProvocation: true,
    note:
      'Unexpected evidence requires investigation. This event does not establish consciousness or personhood.',
  };
}
