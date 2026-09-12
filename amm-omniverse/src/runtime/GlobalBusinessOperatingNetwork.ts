export type BusinessNetworkTier = 'FREE' | 'DIRECTORY_PLUS' | 'GROWTH' | 'BUSINESS_PASS' | 'DIGITAL_TWIN' | 'ENTERPRISE';

export type SettlementRail = 'PROCESSOR_CONNECTED_ACCOUNT' | 'INVOICE' | 'AUTHORIZED_BANK_RAIL';

export type GlobalBusinessProfile = {
  businessId: string;
  legalName: string;
  displayName: string;
  country: string;
  city: string;
  blackOwned?: boolean;
  ownerAuthorized: boolean;
  tier: BusinessNetworkTier;
  categories: string[];
  capabilities: string[];
  payoutRail?: SettlementRail;
};

export const globalBusinessNetworkPolicy = {
  name: 'TRYAMM Global Business Operating Network',
  entryPath: [
    'DIRECTORY',
    'BUSINESS_PASSPORT',
    'DIGITAL_TWIN',
    'PLANET_CLONE',
    'STUBBS_AI',
    'MARKETPLACE',
    'CHECKOUT',
    'SERVER_VERIFICATION',
    'SETTLEMENT',
    'BUSINESS_ANALYTICS',
  ],
  monetization: [
    'SUBSCRIPTION',
    'DIGITAL_TWIN_SETUP',
    'MARKETPLACE_PLATFORM_FEE',
    'HOLO_ADS',
    'IMPLEMENTATION',
    'API_USAGE',
    'ENTERPRISE_LICENSE',
    'AUTHORIZED_REFERRAL_COMMISSION',
  ],
  balances: {
    STREET_CREDIT: 'CLOSED_LOOP_NON_CASH',
    REWARD: 'QUALIFIED_PROMOTIONAL_REWARD',
    PAYABLE: 'SERVER_VERIFIED_REAL_PAYOUT_ELIGIBILITY',
  },
  paymentRules: [
    'CLIENT_NEVER_AUTHORITATIVE_FOR_PAYABLE_BALANCE',
    'LICENSED_PROCESSOR_HANDLES_REAL_MONEY_MOVEMENT',
    'KYB_KYC_WHERE_REQUIRED',
    'SERVER_VERIFIES_TRANSACTION_BEFORE_LEDGER_POSTING',
    'IDEMPOTENCY_REQUIRED',
    'NO_HIDDEN_FEES',
    'REFERRAL_COMPENSATION_DISCLOSED',
    'TAX_AND_REPORTING_BY_JURISDICTION',
    'SANCTIONS_AND_RESTRICTED_PARTY_SCREENING_WHERE_REQUIRED',
    'CHARGEBACK_AND_REFUND_RESERVE_SUPPORTED',
  ],
  privacyRules: [
    'OWNER_AUTHORIZATION_REQUIRED_FOR_NONPUBLIC_BUSINESS_DATA',
    'DATA_MINIMIZATION',
    'PURPOSE_LIMITATION',
    'RETENTION_LIMITS',
    'ACCESS_AUDIT',
  ],
} as const;

export function canActivateCommerce(profile: GlobalBusinessProfile) {
  return profile.ownerAuthorized && Boolean(profile.payoutRail);
}

export function buildBusinessEconomicGraph(profile: GlobalBusinessProfile) {
  if (!profile.ownerAuthorized) {
    throw new Error('Business owner authorization required');
  }

  return {
    businessId: profile.businessId,
    nodes: [
      'BUSINESS',
      'BUSINESS_PASSPORT',
      'PRODUCTS_SERVICES',
      'CUSTOMERS',
      'SUPPLIERS',
      'JOBS',
      'DELIVERY',
      'MARKETPLACE',
      'ADVERTISING',
      'CONTRACT_OPPORTUNITIES',
      'DIGITAL_TWIN',
      'STREETVERSE',
      'PLANET_CLONE',
    ],
    commerceActive: canActivateCommerce(profile),
    analyticsMode: 'AUTHORIZED_AGGREGATED_DATA',
  };
}
