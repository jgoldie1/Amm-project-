export type AcademyLane =
  | 'streamers-academy'
  | 'all-american-university'
  | 'youth-media-academy'
  | 'jacobie-vision-cyber-academy'
  | 'holostyle-fashion-academy'
  | 'music-record-label-academy'
  | '64-track-studio';

export type OpportunityLane =
  | 'creator'
  | 'employee'
  | 'agent'
  | 'business-owner'
  | 'apprentice'
  | 'mentor';

export const ACADEMY_PROGRESSION = [
  'Explorer',
  'Apprentice',
  'Builder',
  'Creator',
  'Entrepreneur',
  'Professional',
  'Mentor',
] as const;

export const STREAMERS_ACADEMY_TRACKS = [
  'camera-lighting-audio',
  'live-hosting',
  'pk-panels',
  'reels-editing',
  'podcasting-radio',
  'music-64-track-studio',
  'creator-safety-moderation',
  'copyright-basics',
  'interviewing-journalism',
  'live-commerce',
  'sponsorship-product-placement',
  'holo-ads',
  'audience-development',
  'ai-assisted-production',
  'accessibility',
  'multi-platform-distribution',
  'ctv-ott-fast',
  'long-form-holo-drama',
] as const;

export const ACADEMY_REGISTRY: ReadonlyArray<{
  id: AcademyLane;
  purpose: string;
  protected: true;
}> = [
  { id: 'streamers-academy', purpose: 'LIVE, PK, Reels, radio, podcast, commerce and creator-business training', protected: true },
  { id: 'all-american-university', purpose: 'learn-practice-build-earn workforce and entrepreneurship pathway', protected: true },
  { id: 'youth-media-academy', purpose: 'age-appropriate media, coding, journalism, fashion and entrepreneurship tracks', protected: true },
  { id: 'jacobie-vision-cyber-academy', purpose: 'authorized defensive cyber range, verified skills and employer pathways', protected: true },
  { id: 'holostyle-fashion-academy', purpose: 'fashion skills, creator commerce and business development', protected: true },
  { id: 'music-record-label-academy', purpose: 'music creation, artist development, rights literacy and release workflow', protected: true },
  { id: '64-track-studio', purpose: 'recording, production and creator portfolio pathway', protected: true },
] as const;

export const SKILLS_PASSPORT_CONTRACT = {
  recordsTraining: true,
  recordsProjects: true,
  recordsSkills: true,
  recordsPortfolio: true,
  recordsVerifiedCredentials: true,
  recordsRenewalAndExpiration: true,
  aiMayInventCredentials: false,
  lessonCompletionMayUnlockHazardousEquipment: false,
  externalCredentialVerificationRequired: true,
} as const;

export const OPPORTUNITY_CENTER = {
  createMyBusiness: true,
  hireFromStreetVerse: true,
  middleVerseJobs: true,
  workFromHomeSupport: true,
  businessScout: true,
  livePkSales: true,
  warehouseDelivery: true,
  holofonAgentDealer: true,
  allAmericanStoreOperator: true,
  beautyOperator: true,
  yahavahSeller: true,
  apprenticeships: true,
  mentorship: true,
  chicago77Territories: true,
  countrySpecificLocalization: true,
} as const;

export const CREATOR_TO_BUSINESS_LOOP = [
  'ACADEMY',
  'SKILLS / TALENT PASSPORT',
  'PRACTICE + STREETVERSE MISSIONS',
  'PORTFOLIO',
  'CREATOR / EMPLOYEE / AGENT OPPORTUNITY',
  'VERIFIED WORK',
  'SERVER-AUTHORITATIVE EARNINGS ATTRIBUTION',
  'CREATE MY BUSINESS',
  'HIRE FROM STREETVERSE',
  'MENTOR NEXT LEARNER',
] as const;

export const CREATOR_DISTRIBUTION_LOOP = [
  'LIVE',
  'PK',
  'REELS',
  'PODCAST / OMNI RADIO',
  'HOLO MUSIC / 64-TRACK STUDIO',
  'HOLO ADS + SPONSORSHIP',
  'LIVE COMMERCE',
  'CTV / OTT / FAST',
  'LONG-FORM MEDIA',
  'CREATOR PORTFOLIO',
] as const;

export const ACADEMY_JOBS_GUARDRAILS = {
  realJobRequiresRealEmployer: true,
  realPayRequiresAuthorizedProvider: true,
  commissionsRequireAgreement: true,
  clientMaySettleRealMoney: false,
  clientMayInventCertification: false,
  accreditedDegreeClaimRequiresAuthorization: true,
  hazardousWorkRequiresVerifiedExternalCredentialWhenApplicable: true,
  familyGroupCannotAutoEnrollAgency: true,
  accessibilityRequired: true,
  dataMinimizationRequired: true,
} as const;
