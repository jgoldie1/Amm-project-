export type JourneyState = 'requested' | 'authorized' | 'responder_assigned' | 'en_route' | 'accompanying' | 'arrived' | 'closed' | 'cancelled' | 'escalated';
export type ResponderStatus = 'pending' | 'eligible' | 'suspended' | 'expired' | 'revoked';
export type ServicePackage = 'individual' | 'family' | 'employer_closing_shift' | 'campus_community' | 'church_event' | 'senior_disability' | 'sponsored' | 'nonprofit_municipal';

export type ResponderEligibility = {
  responderId: string;
  status: ResponderStatus;
  identityVerified: boolean;
  trainingComplete: boolean;
  backgroundCheckState?: 'not_required' | 'pending' | 'passed' | 'failed' | 'expired';
  insuranceVerified?: boolean;
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

export function authorizeDispatcherAction(input: {
  dispatcher: DispatcherAuthorization | undefined;
  journey: SafeArrivalJourney;
  action: 'authorize' | 'assign' | 'escalate' | 'close' | 'cancel';
}) {
  const { dispatcher, journey, action } = input;
  if (!dispatcher?.active) return { allowed: false, reason: 'Dispatcher is inactive or missing.' };
  if (!dispatcher.roles.includes('dispatcher') && !dispatcher.roles.includes('supervisor') && !dispatcher.roles.includes('admin')) {
    return { allowed: false, reason: 'Dispatcher role is not authorized.' };
  }
  const inArea = dispatcher.roles.includes('admin') || dispatcher.serviceAreas.includes('*') || dispatcher.serviceAreas.includes(journey.originLabel);
  if (!inArea) return { allowed: false, reason: 'Journey is outside dispatcher service area.' };
  if (action === 'authorize' && journey.state !== 'requested') return { allowed: false, reason: 'Only requested journeys can be authorized.' };
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
  if (!r.serviceAreas.includes('*') && !r.serviceAreas.includes(input.journey.originLabel)) return { allowed: false, reason: 'Journey is outside responder service area.' };
  return { allowed: true, reason: 'Responder is eligible for this journey.' };
}

const transitions: Record<JourneyState, JourneyState[]> = {
  requested: ['authorized', 'cancelled'],
  authorized: ['responder_assigned', 'cancelled', 'escalated'],
  responder_assigned: ['en_route', 'cancelled', 'escalated'],
  en_route: ['accompanying', 'cancelled', 'escalated'],
  accompanying: ['arrived', 'escalated'],
  arrived: ['closed', 'escalated'],
  closed: [], cancelled: [], escalated: ['closed'],
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
// - Responders are not police/security substitutes and must not chase, detain, interrogate, search, or escalate conflicts.
// - Imminent danger routes to 911/local emergency services; responders disengage and prioritize distance/safety.
// - Precise member/responder location is purpose-limited and expires after the active journey/retention window.
// - Production state, eligibility, audit logs, and pricing authority must be server-side; client state is display-only.
