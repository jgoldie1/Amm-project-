export type WorkLane =
  | 'customer_support'
  | 'sales_inbound'
  | 'sales_opt_in'
  | 'requested_callback'
  | 'existing_customer_outreach'
  | 'delivery_support'
  | 'marketplace_ops'
  | 'moderation'
  | 'hr_recruiting'
  | 'education_tutoring'
  | 'interpreting'
  | 'technical_support'
  | 'cybersecurity_support'
  | 'community_navigation';

export type PayModel = 'hourly' | 'salary' | 'per_completed_task' | 'commission_plus_base' | 'stipend_plus_milestone';

export type JobDefinition = {
  id: string;
  title: string;
  lane: WorkLane;
  payModel: PayModel;
  baseRateMinor?: number;
  currency: string;
  commissionPercent?: number;
  minimumGuaranteedMinor?: number;
  remoteEligible: boolean;
  accessibilitySupported: boolean;
  trainingRequired: boolean;
  status: 'draft' | 'approved' | 'open' | 'paused' | 'filled' | 'closed';
};

export type SlidingScaleTier = {
  id: string;
  label: string;
  customerPriceMinor: number;
  providerPayMinor: number;
  sponsorSubsidyMinor?: number;
  eligibilityRule?: string;
};

export function validateSlidingScaleTier(tier: SlidingScaleTier) {
  const funded = tier.customerPriceMinor + (tier.sponsorSubsidyMinor ?? 0);
  return {
    valid: funded >= tier.providerPayMinor,
    shortfallMinor: Math.max(0, tier.providerPayMinor - funded),
  };
}

export type SupportSignal = {
  id: string;
  source: 'holo_delivery' | 'marketplace' | 'jin_pay' | 'website' | 'other';
  category: string;
  volume: number;
  period: string;
};

export type RootCauseFinding = {
  problem: string;
  likelySource: string;
  estimatedSupportReductionPercent?: number;
  evidence: string[];
  proposedFixes: string[];
  confidence: 'low' | 'medium' | 'high';
};

export function buildDeliveryRootCauseFinding(input: {
  issueVolume: number;
  attributableToUpstreamDelivery: number;
  evidence: string[];
}): RootCauseFinding {
  const pct = input.issueVolume > 0
    ? Math.round((input.attributableToUpstreamDelivery / input.issueVolume) * 100)
    : 0;

  return {
    problem: 'Recurring support contacts linked to Holo Delivery',
    likelySource: 'Upstream Holo Delivery workflow',
    estimatedSupportReductionPercent: pct,
    evidence: input.evidence,
    proposedFixes: [
      'Improve ETA accuracy and arrival notifications',
      'Add clearer courier/merchant handoff states',
      'Detect stalled orders before customers contact support',
      'Automate proactive customer updates',
      'Route repeated issue categories into Product/Operations review',
    ],
    confidence: pct >= 25 ? 'high' : pct >= 10 ? 'medium' : 'low',
  };
}

export type OutreachPolicy = {
  lane: 'inbound_support' | 'opt_in_leads' | 'requested_callbacks' | 'existing_customers' | 'permissioned_outreach';
  requiresDocumentedConsent: boolean;
  doNotContactHonored: boolean;
  frequencyCapPerWeek?: number;
};

export const defaultOutreachPolicies: OutreachPolicy[] = [
  { lane: 'inbound_support', requiresDocumentedConsent: false, doNotContactHonored: true },
  { lane: 'opt_in_leads', requiresDocumentedConsent: true, doNotContactHonored: true, frequencyCapPerWeek: 3 },
  { lane: 'requested_callbacks', requiresDocumentedConsent: true, doNotContactHonored: true },
  { lane: 'existing_customers', requiresDocumentedConsent: true, doNotContactHonored: true, frequencyCapPerWeek: 2 },
  { lane: 'permissioned_outreach', requiresDocumentedConsent: true, doNotContactHonored: true, frequencyCapPerWeek: 2 },
];

// Principles:
// - TRYAMM creates paid pathways, not exploitative unpaid labor.
// - Sliding-scale prices must still fund fair provider compensation unless an explicit sponsor subsidy covers the gap.
// - Commission-only work should not replace required wage protections where law requires base pay.
// - Outreach is permissioned; cold/spam outreach is not the default growth model.
// - Support staffing and root-cause product fixes are both measured so the platform does not profit from avoidable defects.
