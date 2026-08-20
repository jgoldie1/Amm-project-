export type JourneyState = 'requested' | 'dispatcher_review' | 'authorized' | 'responder_assigned' | 'en_route' | 'accompanying' | 'arrived' | 'disengaged' | 'emergency_handoff' | 'closed' | 'cancelled' | 'escalated';
export type ResponderStatus = 'pending' | 'eligible' | 'suspended' | 'expired' | 'revoked';
export type ServicePackage = 'individual' | 'family' | 'employer_closing_shift' | 'campus_community' | 'church_event' | 'senior_disability' | 'sponsored' | 'nonprofit_municipal';
export type RiskLevel = 'low' | 'elevated' | 'high' | 'imminent_danger';

export type ResponderEligibility = {
  responderId: string;
  status: ResponderStatus;
  identityVerified: boolean;
  trainingComplete: boolean;
  backgroundCheckState?: 'not_required' | 'pending' | 'passed' | 'failed' | 'expired';
  insuranceVerified?: boolean;
  jurisdictionApproved?: boolean;
  prohibitedFromWeaponsOrEnforcementRole?: boolean;
  serviceAreas: string[];
  accessibilitySkills?: string[];
  expiresAt?: string;
};

export type DispatcherAuthorization = {
  dispatcherId: string;
  roles: Array<'dispatcher' | 'supervisor' | 'admin'>;
  active: boolean;
  serviceAreas: string[];
};

export type SafeArrivalJourney = {
  id: string;
  accountId: string;
  package: ServicePackage;
  state: JourneyState;
  riskLevel: RiskLevel;
  originLabel: string;
  destinationLabel: string;
  requestedAt: string;
  authorizedAt?: string;
  responderId?: string;
  dispatcherId?: string;
  scheduledFor?: string;
  arrivalWindowMinutes?: number;
  locationExpiresAt?: string;
  consentToLiveLocation: boolean;
  escalationReason?: string;
  emergencyServicesContactedAt?: string;
  closedAt?: string;
};

export type JourneyLocation = {
  journeyId: string;
  actorType: 'member' | 'responder';
  actorId: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  capturedAt: string;
  expiresAt: string;
};

export type SafetyAuditEvent = {
  id: string;
  journeyId: string;
  actorType: 'member' | 'dispatcher' | 'responder' | 'system' | 'supervisor';
  actorId: string;
  action: string;
  result: 'allowed' | 'denied' | 'success' | 'failure' | 'pending';
  occurredAt: string;
  correlationId: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type SafeArrivalMembership = {
  id: string;
  kind: ServicePackage;
  billingModel: 'monthly' | 'annual' | 'per_use' | 'contract' | 'sponsored';
  includedUses?: number;
  serviceAreaIds: string[];
  active: boolean;
};

export function authorizeDispatcherAction(input: {
  dispatcher: DispatcherAuthorization | undefined;
  journey: SafeArrivalJourney;
  action: 'review' | 'authorize' | 'assign' | 'escalate' | 'close' | 'cancel';
}) {
  const { dispatcher, journey, action } = input;
  if (!dispatcher?.active) return { allowed: false, reason: 'Dispatcher is inactive or missing.' };
  if (!dispatcher.roles.includes('dispatcher') && !dispatcher.roles.includes('supervisor') && !dispatcher.roles.includes('admin')) {
    return { allowed: false, reason: 'Dispatcher role is not authorized.' };
  }
  const inArea = dispatcher.roles.includes('admin') || dispatcher.serviceAreas.includes('*') || dispatcher.serviceAreas.includes(journey.originLabel);
  if (!inArea) return { allowed: false, reason: 'Journey is outside dispatcher service area.' };
  if (action === 'review' && journey.state !== 'requested') return { allowed: false, reason: 'Only requested journeys enter dispatcher review.' };
  if (action === 'authorize' && !['requested', 'dispatcher_review'].includes(journey.state)) return { allowed: false, reason: 'Journey must be requested/reviewed before authorization.' };
  if (action === 'assign' && journey.state !== 'authorized') return { allowed: false, reason: 'Responder assignment requires an authorized journey.' };
  return { allowed: true, reason: 'Dispatcher action is within scope.' };
}

export function responderCanAccept(input: {
  responder: ResponderEligibility | undefined;
  journey: SafeArrivalJourney;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const r = input.responder;
  if (!r) return { allowed: false, reason: 'Responder record not found.' };
  if (r.status !== 'eligible' || !r.identityVerified || !r.trainingComplete) return { allowed: false, reason: 'Responder is not currently eligible.' };
  if (r.expiresAt && new Date(r.expiresAt) <= now) return { allowed: false, reason: 'Responder eligibility expired.' };
  if (r.backgroundCheckState && !['not_required', 'passed'].includes(r.backgroundCheckState)) return { allowed: false, reason: 'Responder background-check requirement is not satisfied.' };
  if (r.insuranceVerified === false || r.jurisdictionApproved === false) return { allowed: false, reason: 'Responder coverage/jurisdiction requirement is not satisfied.' };
  if (r.prohibitedFromWeaponsOrEnforcementRole === false) return { allowed: false, reason: 'Responder role must remain non-enforcement/non-weaponized.' };
  if (!r.serviceAreas.includes('*') && !r.serviceAreas.includes(input.journey.originLabel)) return { allowed: false, reason: 'Journey is outside responder service area.' };
  return { allowed: true, reason: 'Responder is eligible for this journey.' };
}

export function evaluateRiskForDispatch(journey: SafeArrivalJourney) {
  if (journey.riskLevel === 'imminent_danger') {
    return {
      assignResponder: false,
      emergencyHandoff: true,
      instructions: ['DISENGAGE', 'CREATE_DISTANCE', 'CONTACT_APPROPRIATE_EMERGENCY_SERVICES', 'SUPERVISOR_AUDIT'],
    } as const;
  }
  return { assignResponder: true, emergencyHandoff: false, instructions: ['DISPATCHER_AUTHORIZATION', 'ELIGIBILITY_CHECK', 'ASSIGNMENT'] } as const;
}

const transitions: Record<JourneyState, JourneyState[]> = {
  requested: ['dispatcher_review', 'authorized', 'cancelled'],
  dispatcher_review: ['authorized', 'cancelled', 'escalated', 'emergency_handoff'],
  authorized: ['responder_assigned', 'cancelled', 'escalated', 'emergency_handoff'],
  responder_assigned: ['en_route', 'cancelled', 'escalated', 'emergency_handoff'],
  en_route: ['accompanying', 'cancelled', 'escalated', 'emergency_handoff'],
  accompanying: ['arrived', 'disengaged', 'escalated', 'emergency_handoff'],
  arrived: ['closed', 'escalated'],
  disengaged: ['emergency_handoff', 'closed'],
  emergency_handoff: ['closed'],
  closed: [], cancelled: [], escalated: ['disengaged', 'emergency_handoff', 'closed'],
};

export function canTransitionJourney(from: JourneyState, to: JourneyState) {
  return transitions[from].includes(to);
}

export function isLocationValid(location: JourneyLocation, now = new Date()) {
  return new Date(location.expiresAt) > now && new Date(location.capturedAt) <= now;
}

export function createSafetyAuditEvent(input: Omit<SafetyAuditEvent, 'id' | 'occurredAt'>): SafetyAuditEvent {
  return {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? `safety-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    occurredAt: new Date().toISOString(),
  };
}

export type PilotEvidence = {
  serverAuthoritativeDispatcher: boolean;
  responderEligibilityRecords: boolean;
  synchronizedJourneyApi: boolean;
  auditLogging: boolean;
  locationExpiration: boolean;
  controlledFieldHarness: boolean;
  noIncidentBounties: boolean;
  pricingNotTiedToConfrontations: boolean;
  trainingVerified: boolean;
  insuranceVerified: boolean;
  legalReviewVerified: boolean;
  emergencyProtocolVerified: boolean;
  dispatcherCoverageVerified: boolean;
  backgroundCheckProcessVerified: boolean;
  privacyReviewVerified: boolean;
  simulationPassed: boolean;
};

export function evaluatePilotReadiness(evidence: PilotEvidence) {
  const checks = Object.entries(evidence);
  const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
  return {
    ready: failed.length === 0,
    failed,
    status: failed.length === 0 ? 'PILOT_READY' as const : 'INTEGRATED_GATED' as const,
  };
}

// Safety/business rules:
// - Compensation is for time, availability, accompaniment, dispatch coverage, accessibility support, training, and service delivery.
// - No worker, contractor, member, or partner is paid per confrontation, arrest, suspicious-person report, weapon discovery, or incident found.
// - Responders are not police/security substitutes and must not chase, detain, interrogate, search, pursue, or escalate conflicts.
// - Imminent danger path: disengage -> create distance -> contact appropriate emergency services -> supervisor/audit -> close.
// - Precise member/responder location is purpose-limited and expires after the active journey/retention window.
// - Production state, eligibility, audit logs, and pricing authority must be server-side; client state is display-only.
// - Real-world pilots remain gated by jurisdiction-specific legal/insurance/training/operations requirements.
