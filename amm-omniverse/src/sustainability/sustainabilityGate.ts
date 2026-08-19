export type RevenueBucket =
  | 'subscriptions'
  | 'marketplace'
  | 'delivery'
  | 'ads'
  | 'coupon_campaigns'
  | 'hologpt_credits'
  | 'stubbs_harmony'
  | 'forever_website'
  | 'forever_domain_care'
  | 'creator_tools'
  | 'events'
  | 'education_contracts'
  | 'enterprise'
  | 'other_eligible';

export type CostBucket =
  | 'ai_compute'
  | 'data_providers'
  | 'database'
  | 'storage'
  | 'bandwidth'
  | 'live_streaming'
  | 'maps_delivery'
  | 'messaging'
  | 'moderation'
  | 'security'
  | 'rendering'
  | 'support'
  | 'domain_reserves'
  | 'other_infrastructure';

export type MoneyPoint = { bucket: string; amountMinor: number; currency: string };

export type SustainabilitySnapshot = {
  periodStart: string;
  periodEnd: string;
  revenue: MoneyPoint[];
  infrastructureCosts: MoneyPoint[];
  excludedLiabilitiesMinor?: number;
  cashReserveMinor?: number;
  currency: string;
};

export type SustainabilityLevel =
  | 'subsidized'
  | 'break_even'
  | 'self_supporting'
  | 'reserve_building'
  | 'target_3x_met';

export type SustainabilityResult = {
  eligibleRevenueMinor: number;
  infrastructureCostMinor: number;
  ratio: number;
  level: SustainabilityLevel;
  revenueNeededFor1xMinor: number;
  revenueNeededFor2xMinor: number;
  revenueNeededFor3xMinor: number;
  surplusAfterInfrastructureMinor: number;
  canClaimAppSupportsItself: boolean;
  target3xMet: boolean;
};

const total = (points: MoneyPoint[]) => points.reduce((sum, p) => sum + Math.max(0, p.amountMinor), 0);

export function evaluateSustainability(snapshot: SustainabilitySnapshot): SustainabilityResult {
  const eligibleRevenueMinor = total(snapshot.revenue);
  const infrastructureCostMinor = total(snapshot.infrastructureCosts);
  const ratio = infrastructureCostMinor > 0 ? eligibleRevenueMinor / infrastructureCostMinor : 0;

  let level: SustainabilityLevel = 'subsidized';
  if (ratio >= 3) level = 'target_3x_met';
  else if (ratio >= 2) level = 'reserve_building';
  else if (ratio >= 1.25) level = 'self_supporting';
  else if (ratio >= 1) level = 'break_even';

  return {
    eligibleRevenueMinor,
    infrastructureCostMinor,
    ratio,
    level,
    revenueNeededFor1xMinor: Math.max(0, infrastructureCostMinor - eligibleRevenueMinor),
    revenueNeededFor2xMinor: Math.max(0, infrastructureCostMinor * 2 - eligibleRevenueMinor),
    revenueNeededFor3xMinor: Math.max(0, infrastructureCostMinor * 3 - eligibleRevenueMinor),
    surplusAfterInfrastructureMinor: eligibleRevenueMinor - infrastructureCostMinor,
    canClaimAppSupportsItself: ratio >= 1,
    target3xMet: ratio >= 3,
  };
}

export function sustainabilityLabel(result: SustainabilityResult) {
  const ratio = result.ratio.toFixed(2);
  if (result.target3xMet) return `TRYAMM SUSTAINABILITY: ${ratio}× — 3.00× TARGET MET`;
  if (result.canClaimAppSupportsItself) return `TRYAMM SUSTAINABILITY: ${ratio}× — APP SUPPORTS ITS MEASURED INFRASTRUCTURE`;
  return `TRYAMM SUSTAINABILITY: ${ratio}× — STILL SUBSIDIZED`;
}

// Accounting guardrails:
// - Do not count creator earnings, taxes collected, restricted mission funds, provider settlements,
//   refunds/reserves, customer wallet balances, or other liabilities as platform revenue.
// - 1.00× means measured eligible revenue covers measured infrastructure only; it does NOT mean
//   every legal, payroll, tax, insurance, or other operating obligation is covered.
// - 3.00× is a management target, not a guarantee of profitability.
