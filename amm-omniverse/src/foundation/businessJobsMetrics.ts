export const BUSINESS_JOBS_METRICS = [
  'learners_enrolled',
  'projects_completed',
  'skills_verified',
  'portfolios_created',
  'real_job_applications',
  'verified_hires',
  'apprenticeships_started',
  'businesses_launched',
  'businesses_hiring',
  'creator_businesses_launched',
  'verified_worker_retention',
  'neighborhoods_with_active_opportunities',
] as const;

export const METRIC_TRUTH_RULES = {
  simulationMayNotCountAsRealHire: true,
  sandboxBusinessMayNotCountAsRealBusinessLaunch: true,
  jobApplicationMayNotCountAsHire: true,
  providerEvidenceRequiredForRealPaymentMetric: true,
  aggregatedReportingPreferred: true,
  unnecessaryIdentifiableActivityRetentionProhibited: true,
} as const;
