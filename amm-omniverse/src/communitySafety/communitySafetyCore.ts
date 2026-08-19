export type SafetyMembershipType =
  | 'individual'
  | 'family'
  | 'employer_closing_shift'
  | 'campus_community'
  | 'church_event'
  | 'senior_disability_accompaniment'
  | 'sponsored'
  | 'nonprofit_municipal';

export type SafetyService =
  | 'scheduled_accompaniment'
  | 'closing_shift_walk'
  | 'campus_route'
  | 'event_presence'
  | 'senior_disability_accompaniment'
  | 'dispatcher_watch'
  | 'virtual_journey_watch'
  | 'safe_arrival_checkin';

export type ProgramGate =
  | 'training'
  | 'insurance'
  | 'legal_review'
  | 'emergency_protocol'
  | 'dispatcher_coverage'
  | 'background_check_process'
  | 'privacy_review'
  | 'journey_api'
  | 'location_expiration'
  | 'simulation_validation';

export type CommunitySafetyProgram = {
  id: string;
  jurisdiction: string;
  enabledServices: SafetyService[];
  memberships: SafetyMembershipType[];
  gates: Record<ProgramGate, 'missing' | 'in_review' | 'approved'>;
  incidentBountyIncentivesAllowed: false;
  status: 'specified' | 'integrated' | 'gated' | 'live';
};

export type JourneyParticipantRole = 'member' | 'accompaniment_partner' | 'dispatcher' | 'organization_contact';

export type JourneyParticipant = {
  accountId: string;
  role: JourneyParticipantRole;
  displayName?: string;
  accessibilityNeeds?: string[];
};

export type JourneyStatus =
  | 'scheduled'
  | 'awaiting_checkin'
  | 'active'
  | 'attention_needed'
  | 'emergency_escalated'
  | 'arrived_safe'
  | 'cancelled';

export type CommunitySafetyJourney = {
  id: string;
  programId: string;
  service: SafetyService;
  participants: JourneyParticipant[];
  scheduledStartAt?: string;
  startedAt?: string;
  expectedArrivalAt?: string;
  arrivedAt?: string;
  status: JourneyStatus;
  destinationLabel?: string;
  lastKnownLocation?: { lat: number; lng: number; capturedAt: string };
  locationExpiresAt?: string;
  checkInIntervalMinutes?: number;
  dispatcherId?: string;
  emergencyProtocolVersion: string;
};

export type JourneyEvent = {
  id: string;
  journeyId: string;
  occurredAt: string;
  type:
    | 'scheduled'
    | 'checkin'
    | 'location_update'
    | 'dispatcher_contact'
    | 'member_requested_help'
    | 'emergency_services_contacted'
    | 'safe_arrival'
    | 'cancelled';
  actorId: string;
  note?: string;
};

export function allLaunchGatesApproved(program: CommunitySafetyProgram) {
  return Object.values(program.gates).every((value) => value === 'approved');
}

export function canGoLive(program: CommunitySafetyProgram) {
  if (program.incidentBountyIncentivesAllowed !== false) {
    return { allowed: false, reason: 'Incident-bounty incentives are prohibited.' };
  }
  if (!allLaunchGatesApproved(program)) {
    return { allowed: false, reason: 'Required legal, insurance, training, dispatch, privacy and simulation gates are incomplete.' };
  }
  return { allowed: true, reason: 'All required launch gates are approved for this jurisdiction/program.' };
}

export function expireJourneyLocation(journey: CommunitySafetyJourney, now = new Date()) {
  if (!journey.locationExpiresAt || now < new Date(journey.locationExpiresAt)) return journey;
  return { ...journey, lastKnownLocation: undefined };
}

export type SafetyContract = {
  id: string;
  programId: string;
  customerType: SafetyMembershipType;
  customerId: string;
  serviceScope: SafetyService[];
  startsAt: string;
  endsAt?: string;
  billingModel: 'membership' | 'per_shift' | 'per_event' | 'per_journey' | 'sponsored_pool' | 'contract';
  priceMinor: number;
  currency: string;
  includedCoverage?: string;
  status: 'draft' | 'review' | 'active' | 'paused' | 'ended';
};

export type SafetyProgramEconomics = {
  monthlyEligibleRevenueMinor: number;
  dispatcherLaborMinor: number;
  insuranceMinor: number;
  backgroundChecksMinor: number;
  trainingMinor: number;
  technologyMinor: number;
  legalComplianceMinor: number;
  supportMinor: number;
};

export function calculateSafetyContribution(input: SafetyProgramEconomics) {
  const cost =
    input.dispatcherLaborMinor +
    input.insuranceMinor +
    input.backgroundChecksMinor +
    input.trainingMinor +
    input.technologyMinor +
    input.legalComplianceMinor +
    input.supportMinor;
  const contribution = input.monthlyEligibleRevenueMinor - cost;
  return {
    costMinor: cost,
    contributionMinor: contribution,
    contributionMargin: input.monthlyEligibleRevenueMinor > 0 ? contribution / input.monthlyEligibleRevenueMinor : 0,
    profitable: contribution > 0,
  };
}

export type PilotAssignmentState =
  | 'requested'
  | 'screening'
  | 'quoted'
  | 'scheduled'
  | 'worker_assigned'
  | 'worker_en_route'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'incident_review'
  | 'cancelled';

const pilotTransitions: Record<PilotAssignmentState, PilotAssignmentState[]> = {
  requested: ['screening', 'cancelled'],
  screening: ['quoted', 'cancelled'],
  quoted: ['scheduled', 'cancelled'],
  scheduled: ['worker_assigned', 'cancelled'],
  worker_assigned: ['worker_en_route', 'cancelled'],
  worker_en_route: ['checked_in', 'cancelled'],
  checked_in: ['in_service', 'incident_review', 'cancelled'],
  in_service: ['completed', 'incident_review'],
  completed: [],
  incident_review: ['completed'],
  cancelled: [],
};

export function canTransitionPilotAssignment(from: PilotAssignmentState, to: PilotAssignmentState) {
  return pilotTransitions[from].includes(to);
}

export type PilotAssignment = {
  id: string;
  journeyId?: string;
  service: SafetyService;
  memberId: string;
  workerId?: string;
  dispatcherId?: string;
  state: PilotAssignmentState;
  requestedAt: string;
  scheduledStart?: string;
  checkedInAt?: string;
  completedAt?: string;
  locationLabel?: string;
  emergencyServicesCalled?: boolean;
};

export type SafetyWorkerProfile = {
  id: string;
  displayName: string;
  status: 'applicant' | 'screening' | 'training' | 'active' | 'suspended' | 'inactive';
  services: SafetyService[];
  backgroundCheckStatus: 'not_started' | 'pending' | 'passed' | 'failed' | 'expired';
  identityVerified: boolean;
  trainingCompleted: string[];
  insuranceVerified?: boolean;
};

export type MemberCheckIn = {
  assignmentId: string;
  memberId: string;
  status: 'waiting' | 'worker_visible' | 'matched' | 'service_started' | 'safe_arrival' | 'needs_help';
  occurredAt: string;
  confirmationCode?: string;
};

export type SafetyIncident = {
  id: string;
  assignmentId: string;
  category: 'medical' | 'threat' | 'harassment' | 'lost_contact' | 'property' | 'policy_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'emergency';
  reportedAt: string;
  emergencyReferral?: '911' | 'local_emergency' | 'none';
  preserveEvidence: boolean;
  notes?: string;
};

export type ContractUnitEconomics = {
  contractRevenueMinor: number;
  directLaborMinor: number;
  insuranceScreeningMinor: number;
  mapsSmsDispatchMinor: number;
  supervisionMinor: number;
  otherVariableMinor?: number;
  tryammPlatformSharePercent: number;
};

export function calculateContractMargin(input: ContractUnitEconomics) {
  const variableCosts = input.directLaborMinor + input.insuranceScreeningMinor + input.mapsSmsDispatchMinor + input.supervisionMinor + (input.otherVariableMinor ?? 0);
  const contributionMinor = input.contractRevenueMinor - variableCosts;
  const tryammPlatformShareMinor = Math.max(0, Math.round(contributionMinor * (input.tryammPlatformSharePercent / 100)));
  return {
    variableCosts,
    contributionMinor,
    contributionMarginPercent: input.contractRevenueMinor > 0 ? (contributionMinor / input.contractRevenueMinor) * 100 : 0,
    tryammPlatformShareMinor,
  };
}

export type PilotReadinessGate = {
  narrowServiceSelected: boolean;
  partnerCount: number;
  legalReviewComplete: boolean;
  licensingReviewComplete: boolean;
  insuranceReviewComplete: boolean;
  backgroundProviderReady: boolean;
  dispatcherUiReady: boolean;
  workerUiReady: boolean;
  memberUiReady: boolean;
  serverPersistenceReady: boolean;
  rlsReady: boolean;
  trackingNotificationsReady: boolean;
  trainingReady: boolean;
};

export function evaluatePilotReadiness(g: PilotReadinessGate) {
  const checks = [
    g.narrowServiceSelected,
    g.partnerCount >= 1,
    g.legalReviewComplete,
    g.licensingReviewComplete,
    g.insuranceReviewComplete,
    g.backgroundProviderReady,
    g.dispatcherUiReady,
    g.workerUiReady,
    g.memberUiReady,
    g.serverPersistenceReady,
    g.rlsReady,
    g.trackingNotificationsReady,
    g.trainingReady,
  ];
  const passed = checks.filter(Boolean).length;
  return { passed, total: checks.length, percent: Math.round((passed / checks.length) * 100), readyForPilot: passed === checks.length };
}

// Operating principles:
// - This is accompaniment, dispatch, journey monitoring, de-escalation, observation and community presence; it is not vigilante enforcement.
// - Personnel do not pursue, detain, interrogate, search, seize property, impersonate police or earn money for finding incidents.
// - Imminent danger is escalated according to approved emergency protocol and local law.
// - Precise location data is minimized and expires automatically.
// - Accessibility support may shape how accompaniment/check-ins work but never lowers privacy or safety standards.
// - Exact licensing, insurance, background-screening and training requirements are jurisdiction-specific and must be verified before launch.
