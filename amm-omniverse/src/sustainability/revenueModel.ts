export type RevenueChannel = 'b2c' | 'b2b' | 'institutional' | 'sponsored';

export type ServiceEconomics = {
  id: string;
  name: string;
  channel: RevenueChannel;
  customerPriceMinor: number;
  workerPayMinor: number;
  paymentCostsMinor: number;
  insuranceAllocationMinor: number;
  dispatchSupportMinor: number;
  technologyMinor: number;
  reserveAllocationMinor: number;
  otherVariableCostsMinor?: number;
};

export type ContributionResult = ServiceEconomics & {
  contributionMinor: number;
  contributionMarginPercent: number;
  profitableBeforeFixedOverhead: boolean;
};

export function calculateContribution(input: ServiceEconomics): ContributionResult {
  const costs =
    input.workerPayMinor +
    input.paymentCostsMinor +
    input.insuranceAllocationMinor +
    input.dispatchSupportMinor +
    input.technologyMinor +
    input.reserveAllocationMinor +
    (input.otherVariableCostsMinor ?? 0);
  const contributionMinor = input.customerPriceMinor - costs;
  const contributionMarginPercent = input.customerPriceMinor > 0
    ? (contributionMinor / input.customerPriceMinor) * 100
    : 0;
  return {
    ...input,
    contributionMinor,
    contributionMarginPercent,
    profitableBeforeFixedOverhead: contributionMinor > 0,
  };
}

export type PortfolioEconomics = {
  monthlyEligibleRevenueMinor: number;
  monthlyInfrastructureCostMinor: number;
  monthlyFixedOperatingCostMinor: number;
  monthlyVariableContributionMinor: number;
};

export function evaluatePortfolio(input: PortfolioEconomics) {
  const sustainabilityRatio = input.monthlyInfrastructureCostMinor > 0
    ? input.monthlyEligibleRevenueMinor / input.monthlyInfrastructureCostMinor
    : Infinity;
  const operatingSurplusMinor =
    input.monthlyVariableContributionMinor - input.monthlyFixedOperatingCostMinor;
  return {
    sustainabilityRatio,
    target3xMet: sustainabilityRatio >= 3,
    appSupportsInfrastructure: sustainabilityRatio >= 1,
    operatingSurplusMinor,
    operatingSelfSustaining: operatingSurplusMinor >= 0,
  };
}

export type SafetyService = {
  id: string;
  model: 'b2c' | 'b2b' | 'institutional' | 'sponsored';
  serviceType:
    | 'safe_walk_companion'
    | 'event_presence'
    | 'school_route_support'
    | 'senior_checkin'
    | 'merchant_escort'
    | 'community_ambassador'
    | 'deescalation_support'
    | 'resource_navigation';
  armed: false;
  lawEnforcementAuthority: false;
  detentionAuthority: false;
  escalationPolicy: 'observe_support_report_emergency_services';
};

// TRYAMM community-safety services are designed as non-vigilante, non-police,
// non-security-guard support unless separately licensed and authorized by law.
// Workers may accompany, observe, de-escalate, connect people to resources,
// document incidents when lawful, and contact emergency/public services.
// They do not chase, detain, search, interrogate, impersonate law enforcement,
// or use force as an ordinary operating model.
