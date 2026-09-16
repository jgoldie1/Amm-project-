export type MasteryState =
  | 'TEACH'
  | 'DEMONSTRATE'
  | 'MISSION'
  | 'ASSESS'
  | 'DIAGNOSE'
  | 'RETEACH'
  | 'RETRY'
  | 'PRACTICAL'
  | 'MASTERED'
  | 'GRADUATION_EVIDENCE'
  | 'OPPORTUNITY';

export type SkillObjective = {
  id: string;
  title: string;
  passingScore: number;
  requiredPracticalEvidence: boolean;
  externalCredentialRequired: boolean;
};

export type AssessmentResult = {
  objectiveId: string;
  score: number;
  missedConcepts: readonly string[];
  evidenceRef?: string;
};

export const STREETVERSE_MASTERY_LOOP: readonly MasteryState[] = [
  'TEACH', 'DEMONSTRATE', 'MISSION', 'ASSESS', 'DIAGNOSE', 'RETEACH', 'RETRY',
  'PRACTICAL', 'MASTERED', 'GRADUATION_EVIDENCE', 'OPPORTUNITY',
] as const;

export const RETEACH_POLICY = {
  diagnoseMissedConcepts: true,
  targetOnlySkillGaps: true,
  explainUsingAnotherMethod: true,
  provideAccessibleAlternative: true,
  requireDifferentRetryMission: true,
  unlimitedLearningRetries: true,
  punishmentForLearningFailure: false,
  aiMayLowerRequiredSafetyStandard: false,
} as const;

export const MASTERY_AUTHORITY = {
  clientMayInventGrade: false,
  aiMayInventCredential: false,
  aiMayPromiseGraduation: false,
  aiMayPromiseEmployment: false,
  courseGraduationIsNotAccreditedDegree: true,
  externalLicenseRequiresIssuerVerification: true,
  hazardousTradeRequiresApplicableExternalCredential: true,
  realJobRequiresRealEmployer: true,
  realPayRequiresAuthorizedProvider: true,
} as const;

export function nextMasteryState(result: AssessmentResult, objective: SkillObjective): MasteryState {
  if (result.score < objective.passingScore || result.missedConcepts.length > 0) return 'RETEACH';
  if (objective.requiredPracticalEvidence && !result.evidenceRef) return 'PRACTICAL';
  return 'MASTERED';
}
