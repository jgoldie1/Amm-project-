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

// Operating principles:
// - This is accompaniment, dispatch, journey monitoring and community presence; it is not vigilante enforcement.
// - Personnel do not pursue, detain, interrogate, search, seize property, impersonate police or earn money for finding incidents.
// - Imminent danger is escalated according to approved emergency protocol and local law.
// - Precise location data is minimized and expires automatically.
// - Accessibility support may shape how accompaniment/check-ins work but never lowers privacy or safety standards.
