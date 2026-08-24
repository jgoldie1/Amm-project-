export type WorkStudyLane = 'cyber_qa' | 'release_testing' | 'accessibility_qa' | 'real_estate_lab' | 'ad_campaign_qa' | 'documentation';

export type WorkStudyRate = {
  lane: WorkStudyLane;
  hourlyRateCents: number;
  weeklyHourCap: number;
};

// Initial planning rates only. Employment classification, payroll/tax treatment,
// minimum wage, and university/work authorization rules must be verified before activation.
export const JACOBIE_WORK_STUDY_RATES: WorkStudyRate[] = [
  { lane: 'cyber_qa', hourlyRateCents: 2200, weeklyHourCap: 8 },
  { lane: 'release_testing', hourlyRateCents: 2000, weeklyHourCap: 8 },
  { lane: 'accessibility_qa', hourlyRateCents: 2000, weeklyHourCap: 6 },
  { lane: 'real_estate_lab', hourlyRateCents: 1800, weeklyHourCap: 6 },
  { lane: 'ad_campaign_qa', hourlyRateCents: 1800, weeklyHourCap: 6 },
  { lane: 'documentation', hourlyRateCents: 1800, weeklyHourCap: 6 },
];

export type WorkEvidence = {
  taskId: string;
  lane: WorkStudyLane;
  minutesWorked: number;
  evidenceUrl?: string;
  supervisorApproved: boolean;
  schoolConflictConfirmedFalse: boolean;
};

export function calculateApprovedWorkPay(evidence: WorkEvidence, rate: WorkStudyRate) {
  if (!evidence.supervisorApproved || !evidence.schoolConflictConfirmedFalse) return 0;
  const cappedMinutes = Math.min(evidence.minutesWorked, rate.weeklyHourCap * 60);
  return Math.round((cappedMinutes / 60) * rate.hourlyRateCents);
}

export type WorkStudyFundingSource =
  | 'holo_ad_operating_share'
  | 'product_placement_operating_share'
  | 'creator_campaign_operating_share'
  | 'marketplace_operating_share'
  | 'subscription_operating_share'
  | 'tryamm_general_operations';

export const WORK_STUDY_FUNDING_PRIORITY: WorkStudyFundingSource[] = [
  'holo_ad_operating_share',
  'product_placement_operating_share',
  'creator_campaign_operating_share',
  'marketplace_operating_share',
  'subscription_operating_share',
  'tryamm_general_operations',
];

export type WorkStudyPaymentGate = {
  taskApproved: boolean;
  evidenceVerified: boolean;
  schoolPriorityProtected: boolean;
  operatingFundsAvailable: boolean;
  payrollOrContractorSetupVerified: boolean;
};

export function workStudyPaymentReady(gate: WorkStudyPaymentGate) {
  return Object.values(gate).every(Boolean);
}
