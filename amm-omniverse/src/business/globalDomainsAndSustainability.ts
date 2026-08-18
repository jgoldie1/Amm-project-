export type DomainClass = 'generic' | 'country_code' | 'city_region' | 'technology' | 'app' | 'ai' | 'other';

export type DomainOption = {
  tld: string;
  label: string;
  class: DomainClass;
  jurisdiction?: string;
  registryNotes?: string;
  eligibilityNotes?: string;
  supportsForeverReserve: boolean;
};

export const commonDomainOptions: DomainOption[] = [
  { tld: '.com', label: 'Commercial / global', class: 'generic', supportsForeverReserve: true },
  { tld: '.org', label: 'Organization', class: 'generic', supportsForeverReserve: true },
  { tld: '.net', label: 'Network', class: 'generic', supportsForeverReserve: true },
  { tld: '.app', label: 'App', class: 'app', supportsForeverReserve: true },
  { tld: '.io', label: 'Technology / startup', class: 'technology', supportsForeverReserve: true },
  { tld: '.ai', label: 'AI', class: 'ai', supportsForeverReserve: true },
  { tld: '.us', label: 'United States country-code domain', class: 'country_code', jurisdiction: 'US', supportsForeverReserve: true },
  { tld: '.ca', label: 'Canada country-code domain', class: 'country_code', jurisdiction: 'CA', supportsForeverReserve: true },
  { tld: '.ng', label: 'Nigeria country-code domain', class: 'country_code', jurisdiction: 'NG', supportsForeverReserve: true },
  { tld: '.za', label: 'South Africa country-code domain', class: 'country_code', jurisdiction: 'ZA', supportsForeverReserve: true },
  { tld: '.uk', label: 'United Kingdom country-code domain', class: 'country_code', jurisdiction: 'GB', supportsForeverReserve: true },
];

export function classifyDomainOption(tld: string): DomainClass {
  const normalized = tld.startsWith('.') ? tld.toLowerCase() : `.${tld.toLowerCase()}`;
  const known = commonDomainOptions.find((option) => option.tld === normalized);
  return known?.class ?? 'other';
}

export type SustainabilityTarget = {
  targetRatio: number;
  minimumHealthyRatio: number;
  reserveBuildingRatio: number;
};

export const tryammSustainabilityTarget: SustainabilityTarget = {
  targetRatio: 3.0,
  minimumHealthyRatio: 1.25,
  reserveBuildingRatio: 1.5,
};

export type SustainabilitySnapshot = {
  eligibleRevenueMinor: number;
  infrastructureCostMinor: number;
  restrictedOrPassThroughMinor?: number;
  currency: string;
};

export type SustainabilityAssessment = {
  ratio: number;
  status: 'subsidized' | 'break_even' | 'self_supporting' | 'reserve_building' | 'three_x_goal_met';
  surplusMinor: number;
  distanceToThreeXMinor: number;
  targetRatio: number;
};

export function assessSustainability(snapshot: SustainabilitySnapshot): SustainabilityAssessment {
  const cost = snapshot.infrastructureCostMinor;
  const revenue = snapshot.eligibleRevenueMinor;
  const ratio = cost > 0 ? revenue / cost : revenue > 0 ? Infinity : 0;
  let status: SustainabilityAssessment['status'] = 'subsidized';
  if (ratio >= 3) status = 'three_x_goal_met';
  else if (ratio >= 1.5) status = 'reserve_building';
  else if (ratio >= 1.0) status = 'self_supporting';
  else if (ratio >= 0.95) status = 'break_even';

  return {
    ratio,
    status,
    surplusMinor: revenue - cost,
    distanceToThreeXMinor: Math.max(0, cost * 3 - revenue),
    targetRatio: 3,
  };
}

export function allocationEnvelopeAtThreeX(infrastructureCostMinor: number) {
  const targetRevenueMinor = infrastructureCostMinor * 3;
  const infrastructureCoverageMinor = infrastructureCostMinor;
  const remainingAfterInfrastructureMinor = targetRevenueMinor - infrastructureCoverageMinor;
  return {
    targetRevenueMinor,
    infrastructureCoverageMinor,
    remainingAfterInfrastructureMinor,
  };
}

// Policy notes:
// - City/state/continent-branded domain names are only offered when an actual registry/TLD or registrar product supports them.
// - TRYAMM does not invent non-existent public DNS TLDs such as `.usa` unless a recognized registry delegates them.
// - Country-code domains may have local-presence/eligibility restrictions depending on the registry.
// - 3.00x is a business sustainability target, not a guaranteed margin or investment return.
// - Creator earnings, taxes, restricted mission funds, refunds/reserves and payment-provider settlements are excluded from eligible platform revenue.
