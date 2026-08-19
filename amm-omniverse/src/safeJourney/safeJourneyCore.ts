export type SafeJourneyRole = 'traveler' | 'dispatcher' | 'community_responder' | 'supervisor';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'suspended' | 'expired';
export type TrainingStatus = 'not_started' | 'in_progress' | 'completed' | 'expired';

export type SafeJourneyMember = {
  id: string;
  role: SafeJourneyRole;
  displayName: string;
  verificationStatus: VerificationStatus;
  trainingStatus?: TrainingStatus;
  authorizedForPilot: boolean;
  authorizationScope: string[];
  createdAt: string;
};

export const PILOT_DISPATCHER: SafeJourneyMember = {
  id: 'pilot-dispatcher-001',
  role: 'dispatcher',
  displayName: 'Safe Journey Pilot Dispatcher',
  verificationStatus: 'verified',
  trainingStatus: 'completed',
  authorizedForPilot: true,
  authorizationScope: ['journey.read', 'journey.dispatch', 'journey.escalate', 'journey.close'],
  createdAt: new Date().toISOString(),
};

export const PILOT_RESPONDER: SafeJourneyMember = {
  id: 'pilot-responder-001',
  role: 'community_responder',
  displayName: 'Safe Journey Pilot Responder',
  verificationStatus: 'verified',
  trainingStatus: 'completed',
  authorizedForPilot: true,
  authorizationScope: ['dispatch.accept', 'journey.check_in', 'journey.assist', 'journey.complete'],
  createdAt: new Date().toISOString(),
};

export type JourneyRiskLevel = 'routine' | 'elevated' | 'urgent' | 'emergency';
export type JourneyState =
  | 'requested'
  | 'authenticated'
  | 'dispatcher_review'
  | 'responder_assigned'
  | 'responder_en_route'
  | 'responder_arrived'
  | 'journey_active'
  | 'safe_arrival'
  | 'escalated'
  | 'cancelled';

export type SafeJourneyRequest = {
  id: string;
  travelerAccountId: string;
  originLabel: string;
  destinationLabel: string;
  riskLevel: JourneyRiskLevel;
  state: JourneyState;
  dispatcherId?: string;
  responderId?: string;
  requestedAt: string;
  authenticatedAt?: string;
  completedAt?: string;
};

export type DispatchEvent = {
  journeyId: string;
  actorId: string;
  actorRole: SafeJourneyRole | 'system';
  event: string;
  at: string;
  note?: string;
};

export function canDispatch(member: SafeJourneyMember) {
  return member.role === 'dispatcher'
    && member.verificationStatus === 'verified'
    && member.trainingStatus === 'completed'
    && member.authorizedForPilot
    && member.authorizationScope.includes('journey.dispatch');
}

export function canRespond(member: SafeJourneyMember) {
  return member.role === 'community_responder'
    && member.verificationStatus === 'verified'
    && member.trainingStatus === 'completed'
    && member.authorizedForPilot;
}

export function authenticateJourney(request: SafeJourneyRequest): SafeJourneyRequest {
  return { ...request, state: 'authenticated', authenticatedAt: new Date().toISOString() };
}

export function assignResponder(
  request: SafeJourneyRequest,
  dispatcher: SafeJourneyMember,
  responder: SafeJourneyMember,
): SafeJourneyRequest {
  if (request.state !== 'authenticated' && request.state !== 'dispatcher_review') {
    throw new Error('Journey must be authenticated before dispatch.');
  }
  if (!canDispatch(dispatcher)) throw new Error('Dispatcher is not authorized.');
  if (!canRespond(responder)) throw new Error('Responder is not pilot-ready.');
  return {
    ...request,
    state: 'responder_assigned',
    dispatcherId: dispatcher.id,
    responderId: responder.id,
  };
}

export function progressJourney(request: SafeJourneyRequest, next: JourneyState): SafeJourneyRequest {
  const allowed: Record<JourneyState, JourneyState[]> = {
    requested: ['authenticated', 'cancelled'],
    authenticated: ['dispatcher_review', 'responder_assigned', 'cancelled'],
    dispatcher_review: ['responder_assigned', 'escalated', 'cancelled'],
    responder_assigned: ['responder_en_route', 'escalated', 'cancelled'],
    responder_en_route: ['responder_arrived', 'escalated', 'cancelled'],
    responder_arrived: ['journey_active', 'safe_arrival', 'escalated'],
    journey_active: ['safe_arrival', 'escalated'],
    safe_arrival: [],
    escalated: [],
    cancelled: [],
  };
  if (!allowed[request.state].includes(next)) throw new Error(`Invalid journey transition: ${request.state} -> ${next}`);
  return {
    ...request,
    state: next,
    completedAt: next === 'safe_arrival' ? new Date().toISOString() : request.completedAt,
  };
}

export function requiresEmergencyServices(request: SafeJourneyRequest) {
  return request.riskLevel === 'emergency';
}

// Safety boundaries:
// - Safe Journey responders are not police/security guards and do not receive law-enforcement powers.
// - Pilot responders are de-escalation/community-support roles only.
// - Weapons, pursuit, detention, searches, forced entry and vigilante enforcement are prohibited.
// - Emergency/imminent-danger cases must escalate to appropriate emergency services rather than dispatching a community responder as a substitute.
// - Production authorization requires real identity/background/training evidence stored server-side; these pilot identities are test fixtures only.
