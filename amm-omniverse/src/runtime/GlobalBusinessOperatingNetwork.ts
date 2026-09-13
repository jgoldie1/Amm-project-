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
    'DISPUTE_EVIDENCE_RETAINED_ONLY_AS_REQUIRED',
    'CURRENCY_CONVERSION_DISCLOSED_BEFORE_CONFIRMATION',
    'PAYOUTS_BLOCKED_UNTIL_REQUIRED_VERIFICATION_PASSES',
  ],
  commerceGuards: [
    'COUNTRY_AND_PRODUCT_ELIGIBILITY_CHECK',
    'RESTRICTED_GOODS_AND_SERVICES_POLICY',
    'FRAUD_AND_VELOCITY_LIMITS',
    'REFUND_AND_CANCELLATION_POLICY',
    'SELLER_PAYOUT_HOLD_WHERE_RISK_REQUIRES',
    'WEBHOOK_SIGNATURE_VERIFICATION',
    'RECONCILIATION_AGAINST_PROCESSOR_RECORDS',
    'DOUBLE_ENTRY_OR_EQUIVALENT_LEDGER_CONTROLS',
  ],
  privacyRules: [
    'OWNER_AUTHORIZATION_REQUIRED_FOR_NONPUBLIC_BUSINESS_DATA',
    'DATA_MINIMIZATION',
    'PURPOSE_LIMITATION',
    'RETENTION_LIMITS',
    'ACCESS_AUDIT',
  ],
  directoryRules: [
    'BLACK_BUSINESS_DIRECTORY_REMAINS_DISCOVERABLE_WITHIN_BROADER_NETWORK',
    'BLACK_OWNERSHIP_STATUS_REQUIRES_BUSINESS_ATTESTATION_OR_VERIFICATION_POLICY',
    'NO_UNVERIFIED_IDENTITY_OR_OWNERSHIP_CLAIMS',
    'FREE_LISTING_DOES_NOT_IMPLY_TRYAMM_ENDORSEMENT',
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
