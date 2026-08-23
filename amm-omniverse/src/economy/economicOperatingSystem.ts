export type RevenueLane =
  | 'subscriptions' | 'marketplace' | 'delivery' | 'ads' | 'coupons'
  | 'holo_advertising' | 'holo_3d_advertising' | 'product_placement' | 'world_sponsorships' | 'creator_campaigns'
  | 'hologpt_credits' | 'stubbs_harmony' | 'forever_website' | 'forever_domain'
  | 'creator_services' | 'events' | 'education_contracts' | 'business_services'
  | 'regulated_service_platform_fees' | 'community_peace_contracts';

export type CostLane =
  | 'ai_compute' | 'data_providers' | 'database' | 'storage' | 'bandwidth'
  | 'live_video' | 'maps_delivery' | 'sms_email_push' | 'moderation' | 'security'
  | 'rendering' | 'support' | 'domain_reserves' | 'provider_fees' | 'insurance' | 'legal_compliance'
  | 'campus_media_operations';

export type EconomicSnapshot = {
  periodStart: string;
  periodEnd: string;
  eligibleRevenueMinor: number;
  infrastructureCostMinor: number;
  totalOperatingCostMinor: number;
  restrictedFundsMinor: number;
  creatorLiabilitiesMinor: number;
  providerLiabilitiesMinor: number;
  revenueByLane: Partial<Record<RevenueLane, number>>;
  costByLane: Partial<Record<CostLane, number>>;
};

export type SustainabilityResult = {
  selfSupportRatio: number;
  totalCostCoverageRatio: number;
  targetRatio: number;
  targetMet: boolean;
  eligibleRevenueGapToTargetMinor: number;
  infrastructureSurplusMinor: number;
  status: 'subsidized' | 'break_even' | 'self_supporting' | 'reserve_building' | 'target_met';
};

export function evaluateEconomicSustainability(snapshot: EconomicSnapshot, targetRatio = 3): SustainabilityResult {
  const infra = Math.max(1, snapshot.infrastructureCostMinor);
  const total = Math.max(1, snapshot.totalOperatingCostMinor);
  const selfSupportRatio = snapshot.eligibleRevenueMinor / infra;
  const totalCostCoverageRatio = snapshot.eligibleRevenueMinor / total;
  const targetRevenue = Math.ceil(infra * targetRatio);
  const gap = Math.max(0, targetRevenue - snapshot.eligibleRevenueMinor);
  let status: SustainabilityResult['status'] = 'subsidized';
  if (selfSupportRatio >= targetRatio) status = 'target_met';
  else if (selfSupportRatio >= 1.5) status = 'reserve_building';
  else if (selfSupportRatio > 1) status = 'self_supporting';
  else if (selfSupportRatio === 1) status = 'break_even';
  return {
    selfSupportRatio,
    totalCostCoverageRatio,
    targetRatio,
    targetMet: selfSupportRatio >= targetRatio,
    eligibleRevenueGapToTargetMinor: gap,
    infrastructureSurplusMinor: snapshot.eligibleRevenueMinor - snapshot.infrastructureCostMinor,
    status,
  };
}

export type ProviderIntegration = {
  id: string;
  category: 'domain_dns' | 'payments' | 'communications' | 'maps_delivery' | 'identity' | 'regulated_service' | 'data';
  providerName: string;
  environment: 'sandbox' | 'production';
  connected: boolean;
  verifiedAt?: string;
  lastHealthCheckAt?: string;
};

export type ProviderVerification = {
  providerId: string;
  serviceType: 'legal' | 'medical' | 'telehealth' | 'tax_bookkeeping' | 'insurance' | 'realty' | 'notary' | 'interpreting' | 'beauty' | 'security' | 'medicaid_billing';
  credentialAuthority?: string;
  credentialReference?: string;
  jurisdiction?: string;
  status: 'unverified' | 'pending' | 'verified' | 'expired' | 'suspended';
  verifiedAt?: string;
  expiresAt?: string;
};

export type UnitEconomics = {
  product: string;
  revenuePerUnitMinor: number;
  variableCostPerUnitMinor: number;
  contributionMinor: number;
  contributionMarginPercent: number;
};

export function calculateUnitEconomics(product: string, revenueMinor: number, variableCostMinor: number): UnitEconomics {
  const contribution = revenueMinor - variableCostMinor;
  return {
    product,
    revenuePerUnitMinor: revenueMinor,
    variableCostPerUnitMinor: variableCostMinor,
    contributionMinor: contribution,
    contributionMarginPercent: revenueMinor > 0 ? (contribution / revenueMinor) * 100 : 0,
  };
}

export type MainJourney =
  | 'start_business' | 'student_to_opportunity' | 'creator_to_earnings'
  | 'marketplace_to_delivery' | 'regulated_service_booking' | 'community_peace_request';

export type JourneyGate = {
  journey: MainJourney;
  authenticated: boolean;
  persistenceReady: boolean;
  rlsVerified: boolean;
  providerReady: boolean;
  pricingVerified: boolean;
  legalPolicyReady: boolean;
  e2eTestPassed: boolean;
};

export function journeyIsLaunchReady(g: JourneyGate) {
  return Object.entries(g)
    .filter(([key]) => key !== 'journey')
    .every(([, value]) => value === true);
}
