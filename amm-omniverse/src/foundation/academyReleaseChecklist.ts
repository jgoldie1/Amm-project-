export const ACADEMY_RELEASE_CHECKLIST = [
  'foundation contracts present',
  'preservation registry present',
  'Streamers Academy curriculum present',
  'Skills/Talent Passport truth rules present',
  'Opportunity Center pathways present',
  'Create My Business workflow present',
  'Hire From StreetVerse workflow present',
  'MiddleVerse accessible work-from-home roles present',
  'Chicago 77 opportunity loop present',
  'youth/family/agency safeguards present',
  'credential truth checks pass',
  'money/employment authority checks pass',
  'production UI wired',
  'persistent backend wired',
  'provider/employer integrations verified where claimed',
  'accessibility QA passes',
  'mobile QA passes',
  'release preservation CI passes',
] as const;

export const ACADEMY_RELEASE_GATE = {
  contractsAloneDoNotMeanLive: true,
  liveRequiresProductionUi: true,
  liveRequiresBackendEvidence: true,
  realJobsRequireEmployerEvidence: true,
  realPaymentsRequireProviderEvidence: true,
  thirdPartyCredentialsRequireIssuerEvidence: true,
} as const;
