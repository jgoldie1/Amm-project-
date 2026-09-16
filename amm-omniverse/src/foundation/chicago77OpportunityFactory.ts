export type NeighborhoodOpportunityDemand = {
  neighborhoodId: string;
  businessesNeeded: readonly string[];
  jobsNeeded: readonly string[];
  academyTracks: readonly string[];
};

export const CHICAGO_77_OPPORTUNITY_LOOP = [
  'NEIGHBORHOOD',
  'BUSINESS DEMAND',
  'JOB DEMAND',
  'ACADEMY / SKILLS GAP',
  'TRAINING + PRACTICE',
  'VERIFIED PASSPORT',
  'MATCH / CREATE BUSINESS',
  'REAL PROVIDER / EMPLOYER GATE',
  'MISSION + CUSTOMER DEMAND',
  'AUTHORITATIVE TRANSACTION / PAYROLL',
  'OUTCOME EVIDENCE',
  'NEXT NEIGHBORHOOD',
] as const;

export const CHICAGO_77_FACTORY_RULES = {
  neighborhoodCountTarget: 77,
  configurationDoesNotEqualProductionPlayable: true,
  demandMayCreateTrainingRecommendation: true,
  demandMayNotPromiseJob: true,
  simulatedMissionMayNotBeRepresentedAsRealEmployment: true,
  realBusinessRequiresRealOwnerProviderAndCompliance: true,
  globalReplicationRequiresCountrySpecificRules: true,
} as const;
