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
  | 'supervisor';

export type GuardianRequestType =
  | 'safe_walk'
  | 'late_shift_escort'
  | 'school_route'
  | 'business_checkin'
  | 'event_support'
  | 'resource_navigation'
  | 'youth_support'
  | 'accessibility_support';

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
  regulatedLicenseVerified?: boolean;
  accessibilityCapabilities?: string[];
};

export function canAssignGuardian(worker: GuardianWorker, request: GuardianRequest) {
  if (!worker.active) return { allowed: false, reason: 'Worker is inactive.' };
  if (!worker.trainingComplete) return { allowed: false, reason: 'Required training is incomplete.' };
  if (!worker.serviceAreaIds.includes(request.serviceAreaId)) return { allowed: false, reason: 'Worker is outside the service area.' };
  if (request.imminentDanger) return { allowed: false, reason: 'Imminent-danger requests are not ordinary Guardian dispatches.' };
  return { allowed: true, reason: 'Worker is eligible for assignment subject to local role/licensing rules.' };
}

export type GuardianRevenueLine = {
  source: 'membership' | 'business_contract' | 'event_contract' | 'employer_plan' | 'training' | 'saas' | 'sponsor' | 'public_or_nonprofit_contract';
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
// - no pursuit, detention, punishment, interrogation or armed-vigilante workflows;
// - no predictive-crime scoring of individuals;
// - no public victim/crisis lists;
// - where a paid activity is regulated as security/guard work, require qualified licensed providers or disable it;
// - emergency services remain the escalation path for imminent danger.
