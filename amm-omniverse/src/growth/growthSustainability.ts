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
  cashAvailableForGrowthMinor?: number;
  requiredReserveContributionMinor?: number;
};

export type AdvertisingBudgetDecision = {
  currentSustainabilityRatio: number;
  revenueRequiredForTargetMinor: number;
  surplusAboveTargetMinor: number;
  reserveGapMinor: number;
  cashAfterProtectedItemsMinor: number;
  safeGrowthPoolMinor: number;
  maximumSafeAdSpendMinor: number;
  paidAcquisitionAllowed: boolean;
  reason: string;
};

export function calculateMaximumSafeAdSpend(snapshot: SustainabilitySnapshot): AdvertisingBudgetDecision {
  const currentSustainabilityRatio = safeDivide(snapshot.eligiblePlatformRevenueMinor, snapshot.infrastructureCostMinor);
  const revenueRequiredForTargetMinor = Math.round(snapshot.infrastructureCostMinor * snapshot.targetRatio);
  const surplusAboveTargetMinor = Math.max(0, snapshot.eligiblePlatformRevenueMinor - revenueRequiredForTargetMinor);
  const reserveGapMinor = Math.max(0, snapshot.protectedReserveTargetMinor - snapshot.currentReserveMinor);
  const requiredReserveContributionMinor = Math.max(0, snapshot.requiredReserveContributionMinor ?? 0);
  const cashAvailable = Math.max(0, snapshot.cashAvailableForGrowthMinor ?? snapshot.eligiblePlatformRevenueMinor);
  const cashAfterProtectedItemsMinor = Math.max(
    0,
    cashAvailable
      - snapshot.protectedObligationsMinor
      - reserveGapMinor
      - requiredReserveContributionMinor,
  );

  // Growth can only use money that is BOTH above the sustainability target and actually
  // unencumbered after obligations/reserves. The lower of those values is the safe pool.
  const safeGrowthPoolMinor = Math.min(surplusAboveTargetMinor, cashAfterProtectedItemsMinor);

  // Default guardrail: spend no more than half the protected growth pool in a measurement window.
  // The remaining half stays available for volatility, iteration, and reserve protection.
  const maximumSafeAdSpendMinor = Math.floor(safeGrowthPoolMinor * 0.5);
  const paidAcquisitionAllowed = maximumSafeAdSpendMinor > 0 && currentSustainabilityRatio >= snapshot.targetRatio;

  return {
    currentSustainabilityRatio,
    revenueRequiredForTargetMinor,
    surplusAboveTargetMinor,
    reserveGapMinor,
    cashAfterProtectedItemsMinor,
    safeGrowthPoolMinor,
    maximumSafeAdSpendMinor,
    paidAcquisitionAllowed,
    reason: paidAcquisitionAllowed
      ? 'Paid acquisition may use a controlled share of verified, unencumbered surplus above the sustainability target.'
      : 'Prove organic loops and protect obligations, reserves, and the sustainability target before increasing paid acquisition.',
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

export type ViralLoop = {
  id: 'creator_content_loop' | 'business_referral_loop';
  name: string;
  stages: string[];
  primaryMetrics: string[];
};

export const tryammViralLoops: ViralLoop[] = [
  {
    id: 'creator_content_loop',
    name: 'Creator / Content Viral Loop',
    stages: [
      'Soul Ascension / game / world / creator content',
      'Reels and approved clips',
      'Quantum Discord community sharing',
      'collaboration / remix / response',
      'new viewer or member',
      'creator follow / project participation',
      'Marketplace / ticket / creator monetization',
      'new content generated',
    ],
    primaryMetrics: [
      'share_rate',
      'invite_accept_rate',
      'viewer_to_signup_rate',
      'signup_to_creator_action_rate',
      'content_to_transaction_rate',
      'organic_k_factor',
    ],
  },
  {
    id: 'business_referral_loop',
    name: 'Business / Referral Commerce Viral Loop',
    stages: [
      'Business creates Stubbs Harmony site / Holo Store',
      'seller shares referral / Holo Coupon / spotlight',
      'new customer visits TRYAMM',
      'Marketplace / Holo Delivery transaction',
      'customer receives tracking / loyalty / referral invitation',
      'customer shares or joins community',
      'new business or buyer enters',
      'repeat commerce and referral',
    ],
    primaryMetrics: [
      'referral_click_rate',
      'referral_conversion_rate',
      'coupon_share_rate',
      'merchant_referred_signup_rate',
      'repeat_purchase_rate',
      'organic_revenue_share',
    ],
  },
];

export type AcquisitionExperiment = {
  id: string;
  name: string;
  channel: 'organic' | 'referral' | 'seo' | 'paid_social' | 'paid_search' | 'creator_partnership' | 'community';
  budgetMinor: number;
  acquiredUsers: number;
  acquiredPayingUsers: number;
  attributedRevenueMinor: number;
  grossContributionMinor: number;
};

export function evaluateAcquisitionExperiment(exp: AcquisitionExperiment) {
  const cacMinor = exp.acquiredPayingUsers > 0 ? Math.round(exp.budgetMinor / exp.acquiredPayingUsers) : Infinity;
  const revenueRoas = exp.budgetMinor > 0 ? exp.attributedRevenueMinor / exp.budgetMinor : Infinity;
  const contributionRoas = exp.budgetMinor > 0 ? exp.grossContributionMinor / exp.budgetMinor : Infinity;
  return {
    cacMinor,
    revenueRoas,
    contributionRoas,
    scalable: exp.acquiredPayingUsers > 0 && contributionRoas > 1,
  };
}

export const organicFirstLoop = [
  'ORGANIC CONTENT',
  'USERS',
  'CREATORS/BUSINESSES',
  'TRANSACTIONS',
  'TRYAMM REVENUE',
  'PAY OBLIGATIONS',
  'PROTECT RESERVES',
  'MAINTAIN SUSTAINABILITY',
  'ADVERTISING GROWTH FUND',
  'CONTROLLED PAID ACQUISITION',
  'MORE USERS',
  'MORE REVENUE',
] as const;

// Core growth rule:
// prove one or two organic/referral loops first → generate eligible platform revenue →
// pay obligations → protect reserves → preserve the long-term 3.00x sustainability target →
// recycle only a controlled share of verified surplus into measurable paid acquisition.
//
// Never fund growth by spending creator earnings, restricted mission funds, taxes,
// provider settlement obligations, refunds/reserves, domain reserves, or required infrastructure money.
