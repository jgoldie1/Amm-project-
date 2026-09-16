export const TRADE_MISSION_DOMAINS = [
  'creator-media',
  'customer-support',
  'retail-commerce',
  'inventory-warehouse',
  'food-logistics',
  'telecom-support',
  'delivery-logistics',
  'advertising-sales',
  'entrepreneurship',
  'coding-ai',
  'defensive-cybersecurity',
  'music-production',
  'fashion-commerce',
  'business-operations',
] as const;

export const CHICAGO_MASTERY_FACTORY = [
  'NEIGHBORHOOD DEMAND',
  'SKILL / BUSINESS GAP',
  'ACADEMY LESSON',
  'STREETVERSE CHICAGO MISSION',
  'ASSESSMENT',
  'GAP DIAGNOSIS',
  'TARGETED RETEACH',
  'DIFFERENT RETRY MISSION',
  'PRACTICAL EVIDENCE',
  'SKILLS / TALENT PASSPORT',
  'REAL EMPLOYER / PROVIDER GATE',
  'APPRENTICESHIP / JOB / CREATE BUSINESS',
] as const;

export const GLOBAL_MASTERY_FACTORY = [
  'LOCALIZE LANGUAGE + ACCESSIBILITY',
  'VERIFY LOCAL CURRICULUM REQUIREMENTS',
  'VERIFY EMPLOYMENT + CREDENTIAL RULES',
  'VERIFY PROVIDERS + PAYMENT RULES',
  'LOCAL STREETVERSE MISSION',
  'MASTERY + EVIDENCE',
  'LOCAL OPPORTUNITY GATE',
] as const;

export const MISSION_TRUTH_RULES = {
  simulatedTradeMissionIsNotLicense: true,
  simulatedJobIsNotEmployment: true,
  masteryEvidenceMaySupportPortfolio: true,
  localRulesRequiredBeforeGlobalActivation: true,
  safetyCriticalPracticalMayRequireHumanEvaluator: true,
} as const;
