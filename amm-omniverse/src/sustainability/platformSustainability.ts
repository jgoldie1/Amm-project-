export type RevenueSource = 'subscription' | 'marketplace_fee' | 'delivery_fee' | 'ads' | 'holo_coupon_campaign' | 'hologpt_credits' | 'stubbs_harmony' | 'creator_tools' | 'business_tools' | 'skill_marketplace' | 'events' | 'education_contract' | 'other';
export type CostCategory = 'ai_compute' | 'data_provider' | 'database' | 'storage' | 'bandwidth' | 'video_live' | 'maps_delivery' | 'email_sms_push' | 'moderation' | 'security' | 'rendering' | 'support' | 'other';

export type SustainabilityEntry = {
  id: string;
  occurredAt: string;
  amountMinor: number;
  currency: string;
  kind: 'revenue' | 'cost';
  source?: RevenueSource;
  costCategory?: CostCategory;
  product?: string;
  accountId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type SustainabilitySnapshot = {
  currency: string;
  revenueMinor: number;
  infrastructureCostMinor: number;
  contributionMinor: number;
  selfSupportRatio: number;
  status: 'subsidized' | 'break_even' | 'self_supporting' | 'reserve_building';
  revenueBySource: Partial<Record<RevenueSource, number>>;
  costByCategory: Partial<Record<CostCategory, number>>;
};

export function calculateSustainability(entries: SustainabilityEntry[], currency = 'USD'): SustainabilitySnapshot {
  const filtered = entries.filter((e) => e.currency === currency);
  let revenueMinor = 0;
  let infrastructureCostMinor = 0;
  const revenueBySource: Partial<Record<RevenueSource, number>> = {};
  const costByCategory: Partial<Record<CostCategory, number>> = {};

  for (const entry of filtered) {
    if (entry.kind === 'revenue') {
      revenueMinor += entry.amountMinor;
      if (entry.source) revenueBySource[entry.source] = (revenueBySource[entry.source] ?? 0) + entry.amountMinor;
    } else {
      infrastructureCostMinor += entry.amountMinor;
      if (entry.costCategory) costByCategory[entry.costCategory] = (costByCategory[entry.costCategory] ?? 0) + entry.amountMinor;
    }
  }

  const selfSupportRatio = infrastructureCostMinor === 0 ? (revenueMinor > 0 ? Infinity : 0) : revenueMinor / infrastructureCostMinor;
  const contributionMinor = revenueMinor - infrastructureCostMinor;
  let status: SustainabilitySnapshot['status'] = 'subsidized';
  if (selfSupportRatio >= 1 && selfSupportRatio < 1.1) status = 'break_even';
  if (selfSupportRatio >= 1.1 && selfSupportRatio < 1.5) status = 'self_supporting';
  if (selfSupportRatio >= 1.5) status = 'reserve_building';

  return { currency, revenueMinor, infrastructureCostMinor, contributionMinor, selfSupportRatio, status, revenueBySource, costByCategory };
}

export type AiWorkloadEstimate = {
  taskType: 'classification' | 'chat' | 'reasoning' | 'image' | 'video' | 'holo_render' | 'simulation' | 'data_enrichment';
  estimatedCostMinor: number;
  aiActionsRequired: number;
  holoCreditsRequired: number;
  recommendedTier: 'light' | 'standard' | 'advanced' | 'generation';
};

export function shouldRequireCreditConfirmation(estimate: AiWorkloadEstimate, includedActionsRemaining: number) {
  return estimate.aiActionsRequired > includedActionsRemaining || estimate.holoCreditsRequired > 0;
}

export type SustainabilityAlert = {
  level: 'info' | 'warning' | 'critical';
  code: string;
  message: string;
};

export function buildSustainabilityAlerts(snapshot: SustainabilitySnapshot): SustainabilityAlert[] {
  const alerts: SustainabilityAlert[] = [];
  if (snapshot.selfSupportRatio < 0.75) alerts.push({ level: 'critical', code: 'LOW_SELF_SUPPORT', message: 'Platform revenue covers less than 75% of measured infrastructure cost.' });
  else if (snapshot.selfSupportRatio < 1) alerts.push({ level: 'warning', code: 'BELOW_BREAK_EVEN', message: 'Measured infrastructure cost is currently higher than platform revenue.' });
  else alerts.push({ level: 'info', code: 'INFRASTRUCTURE_COVERED', message: 'Measured platform revenue currently covers measured infrastructure cost.' });
  return alerts;
}

// This engine measures operating sustainability only. Creator earnings, restricted mission
// funds, taxes, refunds/reserves, provider settlements and other liabilities remain separate
// Money Engine accounts and must not be misclassified as spendable platform revenue.
