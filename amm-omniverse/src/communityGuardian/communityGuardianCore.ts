export type GuardianRole =
  | 'community_guide'
  | 'safe_escort'
  | 'youth_mentor'
  | 'event_ambassador'
  | 'business_safety_liaison'
  | 'resource_navigator'
  | 'deescalation_lead'
  | 'dispatch_coordinator'
  | 'accessibility_ambassador'
  | 'first_aid_support'
  | 'supervisor';

export type GuardianQualification =
  | 'identity_verified'
  | 'background_check_where_required'
  | 'deescalation_training'
  | 'first_aid_cpr_certified'
  | 'youth_safeguarding_training'
  | 'accessibility_training'
  | 'local_program_orientation'
  | 'regulated_license_verified';

export type GuardianRequestType =
  | 'safe_walk'
  | 'late_shift_escort'
  | 'school_route'
  | 'business_checkin'
  | 'event_support'
  | 'resource_navigation'
  | 'youth_support'
  | 'accessibility_support'
  | 'first_aid_support';

export type GuardianRequestState =
  | 'requested'
  | 'risk_screen'
  | 'referred_to_emergency_services'
  | 'available'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'needs_followup';

export type GuardianRequest = {
  id: string;
  accountId: string;
  type: GuardianRequestType;
  state: GuardianRequestState;
  requestedAt: string;
  serviceAreaId: string;
  accessibilityNeeds?: string[];
  guardianId?: string;
  imminentDanger: boolean;
  privateNotes?: string;
};

export function triageGuardianRequest(request: GuardianRequest) {
  if (request.imminentDanger) {
    return {
      nextState: 'referred_to_emergency_services' as const,
      dispatchGuardian: false,
      reason: 'Imminent danger should be routed to appropriate emergency services rather than an unqualified civilian response.',
    };
  }
  return {
    nextState: 'available' as const,
    dispatchGuardian: true,
    reason: 'Request may proceed through the non-emergency Guardian service workflow.',
  };
}

export type GuardianWorker = {
  id: string;
  roles: GuardianRole[];
  serviceAreaIds: string[];
  active: boolean;
  trainingComplete: boolean;
  qualifications?: GuardianQualification[];
  regulatedLicenseVerified?: boolean;
  accessibilityCapabilities?: string[];
};

function hasQualification(worker: GuardianWorker, qualification: GuardianQualification) {
  return worker.qualifications?.includes(qualification) ?? false;
}

export function canAssignGuardian(worker: GuardianWorker, request: GuardianRequest) {
  if (!worker.active) return { allowed: false, reason: 'Worker is inactive.' };
  if (!worker.trainingComplete) return { allowed: false, reason: 'Required training is incomplete.' };
  if (!worker.serviceAreaIds.includes(request.serviceAreaId)) return { allowed: false, reason: 'Worker is outside the service area.' };
  if (request.imminentDanger) return { allowed: false, reason: 'Imminent-danger requests are not ordinary Guardian dispatches.' };
  if (!hasQualification(worker, 'identity_verified')) return { allowed: false, reason: 'Identity verification is required.' };
  if (request.type === 'youth_support' && !hasQualification(worker, 'youth_safeguarding_training')) {
    return { allowed: false, reason: 'Youth safeguarding training is required.' };
  }
  if (request.type === 'first_aid_support' && !hasQualification(worker, 'first_aid_cpr_certified')) {
    return { allowed: false, reason: 'Current first-aid/CPR certification is required.' };
  }
  return { allowed: true, reason: 'Worker is eligible for assignment subject to local role/licensing rules.' };
}

export type SafetyEscalation = {
  requestId: string;
  category: 'medical_emergency' | 'immediate_danger' | 'weapon_observed' | 'fire' | 'missing_person' | 'other';
  instruction: 'contact_emergency_services' | 'leave_area_and_contact_emergency_services' | 'contact_program_supervisor';
  createdAt: string;
};

export const PROHIBITED_GUARDIAN_ACTIONS = [
  'weapons_enforcement',
  'detention',
  'pursuit',
  'search_or_seizure',
  'impersonating_police',
  'profiling',
  'physical_punishment',
  'gang_confrontation',
  'vigilante_patrols',
] as const;

export type GuardianRevenueLine = {
  source:
    | 'membership'
    | 'business_contract'
    | 'event_contract'
    | 'employer_plan'
    | 'training'
    | 'saas'
    | 'sponsor'
    | 'public_or_nonprofit_contract';
  revenueMinor: number;
  directLaborMinor: number;
  insuranceComplianceMinor: number;
  technologyDispatchMinor: number;
  restrictedFundsMinor?: number;
};

export function guardianContribution(lines: GuardianRevenueLine[]) {
  const totals = lines.reduce(
    (acc, line) => {
      acc.revenue += line.revenueMinor;
      acc.direct += line.directLaborMinor + line.insuranceComplianceMinor + line.technologyDispatchMinor;
      acc.restricted += line.restrictedFundsMinor ?? 0;
      return acc;
    },
    { revenue: 0, direct: 0, restricted: 0 },
  );
  const eligibleRevenue = Math.max(0, totals.revenue - totals.restricted);
  const contributionMinor = eligibleRevenue - totals.direct;
  const contributionMargin = eligibleRevenue > 0 ? contributionMinor / eligibleRevenue : 0;
  return { ...totals, eligibleRevenue, contributionMinor, contributionMargin };
}

export function guardianProfitabilityGate(lines: GuardianRevenueLine[], minimumContributionMargin = 0.25) {
  const result = guardianContribution(lines);
  return {
    ...result,
    profitableAtContributionLevel: result.contributionMinor > 0,
    meetsMarginTarget: result.contributionMargin >= minimumContributionMargin,
    reason:
      result.contributionMinor <= 0
        ? 'Direct labor/compliance/dispatch costs exceed eligible Guardian revenue.'
        : result.contributionMargin < minimumContributionMargin
          ? 'Positive contribution, but below the configured margin target.'
          : 'Guardian service meets the configured contribution-margin target.',
  };
}

export type GuardianImpact = {
  escortsCompleted: number;
  businessCheckins: number;
  youthReferrals: number;
  resourceConnections: number;
  hazardsReported: number;
  hazardsResolved: number;
  partnerRenewals: number;
};

export function guardianImpactSummary(input: GuardianImpact) {
  return {
    serviceActions: input.escortsCompleted + input.businessCheckins + input.resourceConnections,
    youthPathways: input.youthReferrals,
    infrastructureResolutionRate: input.hazardsReported > 0 ? input.hazardsResolved / input.hazardsReported : 0,
    partnerRenewals: input.partnerRenewals,
  };
}

// Important boundaries:
// - Community Guardian is community support/safety navigation, not law enforcement.
// - no pursuit, detention, punishment, interrogation, armed-vigilante workflows, profiling or gang confrontation;
// - no predictive-crime scoring of individuals and no public victim/crisis lists;
// - where a paid activity is regulated as security/guard work, require qualified licensed providers or disable it;
// - emergency services remain the escalation path for imminent danger;
// - profitable service design must never create incentives for confrontation, detention or unnecessary escalation.
