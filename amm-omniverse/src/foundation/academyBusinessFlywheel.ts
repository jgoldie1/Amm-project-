export const ACADEMY_BUSINESS_FLYWHEEL = [
  'RECRUIT LEARNER / BUSINESS',
  'ASSESS SKILLS + ACCESS NEEDS',
  'TRAIN',
  'PRACTICE IN STREETVERSE',
  'VERIFY EVIDENCE',
  'ISSUE / UPDATE SKILLS-TALENT PASSPORT',
  'MATCH OPPORTUNITY OR CREATE BUSINESS',
  'REAL EMPLOYER / PROVIDER / COMPLIANCE GATE',
  'WORK / SELL / CREATE',
  'AUTHORITATIVE EARNINGS ATTRIBUTION',
  'BUILD PORTFOLIO + OUTCOMES',
  'HIRE / MENTOR NEXT PERSON',
  'REPLICATE TO NEXT NEIGHBORHOOD',
] as const;

export const FLYWHEEL_REVENUE_SURFACES = [
  'business services',
  'authorized carrier/agent commissions',
  'creator commerce attribution',
  'Holo Ads / sponsorship',
  'marketplace services',
  'warehouse / delivery services',
  'training services where permitted',
  'business subscriptions',
] as const;

export const FLYWHEEL_TRUTH = {
  revenueIsNotGuaranteed: true,
  jobsAreNotGuaranteed: true,
  carrierCommissionRequiresAuthorizedAgreement: true,
  creatorCommissionRequiresValidAgreement: true,
  paymentSettlementRemainsProviderAuthoritative: true,
} as const;
