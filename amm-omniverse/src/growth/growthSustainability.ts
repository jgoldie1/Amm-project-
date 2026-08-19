export type GrowthChannel =
  | 'soul_ascension'
  | 'game_world_clips'
  | 'creator_collaboration'
  | 'community_spotlight'
  | 'quantum_discord'
  | 'referral'
  | 'business_spotlight'
  | 'school_financial_literacy'
  | 'stubbs_harmony_seo'
  | 'marketplace_seller'
  | 'holo_coupon_share'
  | 'paid_ads';

export type GrowthLoopMetric = {
  channel: GrowthChannel;
  impressions: number;
  shares: number;
  visits: number;
  signups: number;
  activatedUsers: number;
  payingUsers: number;
  eligibleRevenueMinor: number;
  directCostMinor: number;
};

export type GrowthLoopScore = GrowthLoopMetric & {
  shareRate: number;
  visitToSignupRate: number;
  signupToActivationRate: number;
  activationToPaidRate: number;
  revenueToDirectCostRatio: number;
};

const safeDivide = (a: number, b: number) => (b > 0 ? a / b : 0);

export function scoreGrowthLoop(metric: GrowthLoopMetric): GrowthLoopScore {
  return {
    ...metric,
    shareRate: safeDivide(metric.shares, metric.impressions),
    visitToSignupRate: safeDivide(metric.signups, metric.visits),
    signupToActivationRate: safeDivide(metric.activatedUsers, metric.signups),
    activationToPaidRate: safeDivide(metric.payingUsers, metric.activatedUsers),
    revenueToDirectCostRatio: metric.directCostMinor > 0
      ? metric.eligibleRevenueMinor / metric.directCostMinor
      : metric.eligibleRevenueMinor > 0 ? Infinity : 0,
  };
}

export type SustainabilitySnapshot = {
  eligiblePlatformRevenueMinor: number;
  infrastructureCostMinor: number;
  protectedObligationsMinor: number;
  protectedReserveTargetMinor: number;
  currentReserveMinor: number;
  targetRatio: number;
};

export type AdvertisingBudgetDecision = {
  currentSustainabilityRatio: number;
  revenueRequiredForTargetMinor: number;
  surplusAboveTargetMinor: number;
  reserveGapMinor: number;
  maximumSafeAdSpendMinor: number;
  paidAcquisitionAllowed: boolean;
  reason: string;
};

export function calculateMaximumSafeAdSpend(snapshot: SustainabilitySnapshot): AdvertisingBudgetDecision {
  const currentSustainabilityRatio = safeDivide(snapshot.eligiblePlatformRevenueMinor, snapshot.infrastructureCostMinor);
  const revenueRequiredForTargetMinor = Math.round(snapshot.infrastructureCostMinor * snapshot.targetRatio);
  const surplusAboveTargetMinor = Math.max(0, snapshot.eligiblePlatformRevenueMinor - revenueRequiredForTargetMinor);
  const reserveGapMinor = Math.max(0, snapshot.protectedReserveTargetMinor - snapshot.currentReserveMinor);
  const availableAfterObligations = Math.max(0, surplusAboveTargetMinor - snapshot.protectedObligationsMinor - reserveGapMinor);

  // Paid acquisition is funded from demonstrated surplus above the sustainability target.
  // Default policy reserves half of available surplus for future protection/growth capacity.
  const maximumSafeAdSpendMinor = Math.floor(availableAfterObligations * 0.5);
  const paidAcquisitionAllowed = maximumSafeAdSpendMinor > 0 && currentSustainabilityRatio >= snapshot.targetRatio;

  return {
    currentSustainabilityRatio,
    revenueRequiredForTargetMinor,
    surplusAboveTargetMinor,
    reserveGapMinor,
    maximumSafeAdSpendMinor,
    paidAcquisitionAllowed,
    reason: paidAcquisitionAllowed
      ? 'Paid acquisition may use a controlled share of verified surplus above the sustainability target.'
      : 'Prove organic loops and protect obligations/reserves before increasing paid acquisition.',
  };
}

export type GrowthExperiment = {
  id: string;
  channel: GrowthChannel;
  hypothesis: string;
  budgetMinor: number;
  startedAt: string;
  endsAt?: string;
  status: 'planned' | 'running' | 'paused' | 'completed' | 'stopped';
  stopLossMinor?: number;
  targetCostPerActivatedUserMinor?: number;
  targetRevenueCostRatio?: number;
};

export function shouldStopExperiment(input: {
  experiment: GrowthExperiment;
  spendMinor: number;
  activatedUsers: number;
  eligibleRevenueMinor: number;
}) {
  const cpa = input.activatedUsers > 0 ? input.spendMinor / input.activatedUsers : Infinity;
  const revenueCostRatio = input.spendMinor > 0 ? input.eligibleRevenueMinor / input.spendMinor : 0;
  if (input.experiment.stopLossMinor && input.spendMinor >= input.experiment.stopLossMinor && input.activatedUsers === 0) {
    return { stop: true, reason: 'Stop-loss reached without activation.' };
  }
  if (input.experiment.targetCostPerActivatedUserMinor && cpa > input.experiment.targetCostPerActivatedUserMinor * 1.5) {
    return { stop: true, reason: 'Activation cost materially exceeds target.' };
  }
  if (input.experiment.targetRevenueCostRatio && input.spendMinor > 0 && revenueCostRatio < input.experiment.targetRevenueCostRatio * 0.5) {
    return { stop: true, reason: 'Revenue-to-cost performance is materially below target.' };
  }
  return { stop: false, reason: 'Experiment remains within configured guardrails.' };
}

export const organicFirstLoop = [
  'ORGANIC CONTENT',
  'USERS',
  'CREATORS/BUSINESSES',
  'TRANSACTIONS',
  'TRYAMM REVENUE',
  'PROTECT OBLIGATIONS',
  'PROTECT RESERVES',
  'MAINTAIN SUSTAINABILITY',
  'ADVERTISING GROWTH FUND',
  'CONTROLLED PAID ACQUISITION',
  'MORE USERS',
  'MORE REVENUE',
] as const;

// Core rule: never fund growth by spending creator earnings, restricted mission funds,
// taxes, provider settlement obligations, refunds/reserves, or infrastructure money.
