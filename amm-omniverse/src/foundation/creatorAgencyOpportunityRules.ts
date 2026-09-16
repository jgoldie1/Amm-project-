export const CREATOR_AGENCY_CAPABILITIES = [
  'LIVE',
  'PK / panels',
  'Reels',
  'creator commerce',
  'training',
  'moderation',
  'settlement attribution',
] as const;

export const CREATOR_AGENCY_RULES = {
  validAgreementRequired: true,
  agencyMayNotSeizeCreatorFunds: true,
  agencyMayNotSilentlyAlterCommission: true,
  settlementProviderAuthoritative: true,
  clientMaySettleRealMoney: false,
  familyGroupMayNotAutoEnrollAgency: true,
  guardianControlsWhereApplicable: true,
  ageAppropriateDiscovery: true,
  accessibilityRequired: true,
} as const;
