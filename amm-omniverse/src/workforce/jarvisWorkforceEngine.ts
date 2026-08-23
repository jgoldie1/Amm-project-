export type WorkforceLane =
  | 'cyber_qa'
  | 'release_testing'
  | 'accessibility_qa'
  | 'real_estate_research'
  | 'ad_campaign_qa'
  | 'documentation'
  | 'creator_operations'
  | 'marketplace_operations'
  | 'media_qa'
  | 'customer_support'
  | 'data_quality'
  | 'education_support';

export type WorkerStage = 'student' | 'apprentice' | 'associate' | 'specialist' | 'lead';

export type WorkforceProfile = {
  workerId: string;
  stage: WorkerStage;
  lanes: WorkforceLane[];
  schoolPriority?: boolean;
  weeklyHourCap: number;
  approvedHourlyRateCents: number;
  supervisorId?: string;
  payrollReady: boolean;
};

export type WorkforceTask = {
  id: string;
  lane: WorkforceLane;
  title: string;
  instructions: string[];
  estimatedMinutes: number;
  evidenceRequired: string[];
  dueAt?: string;
  fundingSource: WorkforceFundingSource;
  status: 'available' | 'assigned' | 'submitted' | 'approved' | 'rejected' | 'paid';
};

export type WorkforceFundingSource =
  | 'holo_ad_operating_share'
  | 'product_placement_operating_share'
  | 'creator_campaign_operating_share'
  | 'marketplace_operating_share'
  | 'subscription_operating_share'
  | 'media_operating_share'
  | 'education_contract_operating_share'
  | 'tryamm_general_operations';

export type WorkforceSubmission = {
  taskId: string;
  workerId: string;
  minutesWorked: number;
  evidenceRefs: string[];
  submittedAt: string;
  supervisorApproved: boolean;
  schoolConflictConfirmedFalse: boolean;
};

export function calculateWorkforcePay(profile: WorkforceProfile, submission: WorkforceSubmission) {
  if (!profile.payrollReady || !submission.supervisorApproved) return 0;
  if (profile.schoolPriority && !submission.schoolConflictConfirmedFalse) return 0;
  const cappedMinutes = Math.min(Math.max(0, submission.minutesWorked), profile.weeklyHourCap * 60);
  return Math.round((cappedMinutes / 60) * profile.approvedHourlyRateCents);
}

export function canAssignTask(profile: WorkforceProfile, task: WorkforceTask) {
  return profile.lanes.includes(task.lane) && task.status === 'available';
}

export type WorkforcePaymentGate = {
  identityVerified: boolean;
  classificationVerified: boolean;
  payrollReady: boolean;
  taskApproved: boolean;
  evidenceVerified: boolean;
  operatingFundsAvailable: boolean;
  noRestrictedFundsUsed: boolean;
};

export function workforcePaymentReady(gate: WorkforcePaymentGate) {
  return Object.values(gate).every(Boolean);
}

export const WORKFORCE_RULES = {
  schoolComesFirstForStudents: true,
  browserCannotSetPayRate: true,
  browserCannotApproveOwnWork: true,
  getPaidToPlayReserveMayFundPayroll: false,
  creatorLiabilitiesMayFundPayroll: false,
  customerBalancesMayFundPayroll: false,
  restrictedLegacyOrMinistryFundsMayFundPayroll: false,
} as const;
