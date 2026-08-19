export type GrowthFundSource = 'platform_margin' | 'sponsor' | 'merchant_coop' | 'creator_campaign' | 'grant' | 'founder' | 'other';

export type GrowthFund = {
  id: string;
  currency: string;
  availableMinor: number;
  protectedReservesMinor: number;
  monthlyCapMinor: number;
  targetRoas: number;
  minSelfSupportRatio: number;
  sources: Array<{ source: GrowthFundSource; amountMinor: number }>;
};

export type CampaignPlan = {
  id: string;
  name: string;
  channel: 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'search' | 'creator' | 'community' | 'email' | 'sms' | 'other';
  budgetMinor: number;
  expectedRevenueMinor?: number;
  expectedSignups?: number;
  sponsorFunded?: boolean;
  status: 'draft' | 'approved' | 'running' | 'paused' | 'completed' | 'rejected';
};

export function maxSafeAdSpend(input: {
  eligibleRevenueMinor: number;
  infrastructureCostMinor: number;
  currentCashMinor: number;
  protectedObligationsMinor: number;
  requestedAdSpendMinor: number;
  targetSelfSupportRatio?: number;
}) {
  const target = input.targetSelfSupportRatio ?? 3;
  const requiredRevenueForTarget = input.infrastructureCostMinor * target;
  const surplusAboveTarget = Math.max(0, input.eligibleRevenueMinor - requiredRevenueForTarget);
  const freeCash = Math.max(0, input.currentCashMinor - input.protectedObligationsMinor);
  const safe = Math.max(0, Math.min(input.requestedAdSpendMinor, freeCash, surplusAboveTarget));
  return {
    safeAdSpendMinor: safe,
    targetRatio: target,
    blockedMinor: Math.max(0, input.requestedAdSpendMinor - safe),
    reason: safe >= input.requestedAdSpendMinor
      ? 'Requested spend fits current protected-growth rules.'
      : 'Ad spend is capped to protect obligations and the sustainability target.',
  };
}

export function campaignRoas(spendMinor: number, attributedRevenueMinor: number) {
  return spendMinor > 0 ? attributedRevenueMinor / spendMinor : 0;
}

export type GrowthAllocationPolicy = {
  creatorFundsProtected: true;
  restrictedMissionFundsProtected: true;
  taxReserveProtected: true;
  domainReserveProtected: true;
  infrastructureReserveProtected: true;
  payrollReserveProtected: true;
};

export const defaultGrowthAllocationPolicy: GrowthAllocationPolicy = {
  creatorFundsProtected: true,
  restrictedMissionFundsProtected: true,
  taxReserveProtected: true,
  domainReserveProtected: true,
  infrastructureReserveProtected: true,
  payrollReserveProtected: true,
};

// Advertising fund principles:
// - Paid acquisition should come from true available margin, sponsors/co-op campaigns, or separately raised growth funds.
// - Never spend creator earnings, taxes, restricted grants/donations, domain reserves, or required infrastructure/payroll reserves on ads.
// - Start with measurable experiments; pause campaigns that fail predefined CAC/ROAS thresholds.
// - Organic loops (Reels, Quantum Discord, referrals, Community Spotlight, creator collaborations, SEO) remain the default low-cash growth path.
