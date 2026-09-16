export type EvidenceStatus = 'self-reported' | 'course-complete' | 'project-verified' | 'issuer-verified' | 'expired';

export type SkillEvidence = {
  skillId: string;
  status: EvidenceStatus;
  evidenceRef?: string;
  issuer?: string;
  expiresAt?: string;
};

export type SkillsTalentPassport = {
  learnerId: string;
  training: readonly string[];
  projects: readonly string[];
  portfolio: readonly string[];
  evidence: readonly SkillEvidence[];
  accessibilityPreferencesStoredMinimally: boolean;
};

export const PASSPORT_RULES = {
  aiMayInventEvidence: false,
  selfReportedIsNotVerified: true,
  courseCompleteIsNotExternalLicense: true,
  issuerVerifiedRequiredForThirdPartyCredential: true,
  expiredCredentialMayNotBePresentedAsCurrent: true,
  collectOnlyNecessaryPersonalData: true,
  supportUserRequestedDeletionWhenNotLegallyRequired: true,
} as const;

export const PASSPORT_DESTINATIONS = [
  'Creator Portal',
  'MiddleVerse Jobs',
  'TRYAMM Opportunity Center',
  'Hire From StreetVerse',
  'Create My Business',
  'StreetVerse Missions',
  'Apprenticeships',
  'Employer Interest',
] as const;
