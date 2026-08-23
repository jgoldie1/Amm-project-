export type AKCafeFunction =
  | 'ai_ordering'
  | 'menu_recommendations'
  | 'allergy_guard'
  | 'inventory_forecasting'
  | 'waste_reduction'
  | 'staff_scheduling'
  | 'workforce_training'
  | 'customer_support'
  | 'loyalty_rewards'
  | 'holo_advertising'
  | 'creator_campaigns'
  | 'delivery_dispatch'
  | 'drone_delivery_simulation'
  | 'event_catering'
  | 'financial_reporting'
  | 'fraud_checks'
  | 'accessibility_support';

export type AKCafeOrderChannel = 'counter' | 'mobile' | 'web' | 'live' | 'holographic_kiosk' | 'delivery';

export type AKCafeOrder = {
  id: string;
  userId?: string;
  channel: AKCafeOrderChannel;
  items: Array<{ sku: string; name: string; quantity: number; unitPriceCents: number }>;
  subtotalCents: number;
  discountsCents: number;
  taxCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  status: 'draft' | 'submitted' | 'paid' | 'preparing' | 'ready' | 'completed' | 'refunded' | 'cancelled';
  createdAt: string;
};

export type AKCafeWorkerRole =
  | 'barista'
  | 'kitchen'
  | 'cashier'
  | 'customer_support'
  | 'inventory_assistant'
  | 'marketing_assistant'
  | 'delivery_coordinator'
  | 'qa_tester'
  | 'manager';

export type AKCafeWorkLab = {
  id: string;
  title: string;
  role: AKCafeWorkerRole;
  skill: string;
  instructions: string[];
  evidenceRequired: string[];
  paidEligible: boolean;
  supervisorApprovalRequired: boolean;
};

export const AK_CAFE_WORK_LABS: AKCafeWorkLab[] = [
  {
    id: 'ak-order-qa',
    title: 'AI Ordering QA',
    role: 'qa_tester',
    skill: 'commerce QA',
    instructions: ['Run approved test orders', 'Check item totals and discounts', 'Verify accessibility and error handling', 'Document defects'],
    evidenceRequired: ['test case', 'screenshot or log reference', 'result'],
    paidEligible: true,
    supervisorApprovalRequired: true,
  },
  {
    id: 'ak-inventory-lab',
    title: 'Inventory Forecasting Lab',
    role: 'inventory_assistant',
    skill: 'inventory analysis',
    instructions: ['Review prior sales', 'Compare stock on hand', 'Flag likely shortages', 'Recommend reorder quantities'],
    evidenceRequired: ['forecast worksheet', 'variance notes'],
    paidEligible: true,
    supervisorApprovalRequired: true,
  },
  {
    id: 'ak-holo-ad-lab',
    title: 'Holo Advertising Campaign Lab',
    role: 'marketing_assistant',
    skill: 'campaign QA',
    instructions: ['Verify sponsor assets', 'Check placement and CTA', 'Confirm campaign ID attribution', 'Report impressions and interactions'],
    evidenceRequired: ['campaign checklist', 'placement proof', 'analytics summary'],
    paidEligible: true,
    supervisorApprovalRequired: true,
  },
  {
    id: 'ak-support-lab',
    title: 'Customer Experience Lab',
    role: 'customer_support',
    skill: 'service operations',
    instructions: ['Handle sandbox support scenarios', 'Use approved scripts', 'Escalate food-safety or payment issues', 'Document resolution'],
    evidenceRequired: ['case log', 'resolution code'],
    paidEligible: true,
    supervisorApprovalRequired: true,
  },
];

export type AKCafeAIRequest = {
  function: AKCafeFunction;
  userIntent: string;
  allergiesOrRestrictions?: string[];
  accessibilityNeeds?: string[];
};

export type AKCafeAIDecision = {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
};

export function guardAKCafeAI(request: AKCafeAIRequest): AKCafeAIDecision {
  if (request.function === 'allergy_guard') {
    return { allowed: true, requiresHumanApproval: true, reason: 'AI may assist with allergen information, but staff must verify ingredient and cross-contact data.' };
  }
  if (request.function === 'staff_scheduling') {
    return { allowed: true, requiresHumanApproval: true, reason: 'AI may propose schedules; a manager approves labor assignments.' };
  }
  if (request.function === 'financial_reporting' || request.function === 'fraud_checks') {
    return { allowed: true, requiresHumanApproval: true, reason: 'AI may summarize or flag anomalies; accounting/payment actions remain controlled.' };
  }
  if (request.function === 'drone_delivery_simulation') {
    return { allowed: true, requiresHumanApproval: true, reason: 'Simulation only unless a lawful real-world drone operator and approved route are verified.' };
  }
  return { allowed: true, requiresHumanApproval: false, reason: 'Normal AK Cafe assistant function.' };
}

export type AKCafeRevenueLane =
  | 'food_beverage_sales'
  | 'subscriptions_memberships'
  | 'catering'
  | 'delivery_fees'
  | 'holo_ads'
  | 'product_placement'
  | 'creator_campaigns'
  | 'loyalty_partnerships'
  | 'events';

export const AK_CAFE_REVENUE_RULES = {
  oneOrderOneSettlement: true,
  verifiedPaymentBeforeRevenue: true,
  refundsReduceRevenue: true,
  tipsAreWorkerLiabilitiesNotPlatformRevenue: true,
  taxesAreNotPlatformRevenue: true,
  restrictedGetPaidToPlayFundsCannotCoverCafePayroll: true,
} as const;
