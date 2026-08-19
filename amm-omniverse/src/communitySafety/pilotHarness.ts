import {
  authorizeDispatcherAction,
  canTransitionJourney,
  evaluatePilotReadiness,
  isLocationValid,
  responderCanAccept,
  type DispatcherAuthorization,
  type JourneyLocation,
  type ResponderEligibility,
  type SafeArrivalJourney,
} from './safeArrivalCore';

export type PilotHarnessResult = {
  name: string;
  passed: boolean;
  detail: string;
};

const now = new Date('2026-08-19T12:00:00.000Z');

const journey: SafeArrivalJourney = {
  id: 'journey-1',
  accountId: 'acct-1',
  package: 'employer_closing_shift',
  state: 'requested',
  originLabel: 'zone-chicago-1',
  destinationLabel: 'home-safe-zone',
  requestedAt: now.toISOString(),
  consentToLiveLocation: true,
};

const dispatcher: DispatcherAuthorization = {
  dispatcherId: 'dispatcher-1',
  roles: ['dispatcher'],
  active: true,
  serviceAreas: ['zone-chicago-1'],
};

const responder: ResponderEligibility = {
  responderId: 'responder-1',
  status: 'eligible',
  identityVerified: true,
  trainingComplete: true,
  backgroundCheckState: 'passed',
  serviceAreas: ['zone-chicago-1'],
  expiresAt: '2027-08-19T00:00:00.000Z',
};

const validLocation: JourneyLocation = {
  journeyId: 'journey-1',
  actorType: 'responder',
  actorId: 'responder-1',
  lat: 41.88,
  lng: -87.63,
  capturedAt: '2026-08-19T11:59:00.000Z',
  expiresAt: '2026-08-19T12:30:00.000Z',
};

const expiredLocation: JourneyLocation = {
  ...validLocation,
  expiresAt: '2026-08-19T11:59:30.000Z',
};

export function runSafeArrivalPilotHarness(): PilotHarnessResult[] {
  const dispatcherDecision = authorizeDispatcherAction({ dispatcher, journey, action: 'authorize' });
  const responderDecision = responderCanAccept({ responder, journey: { ...journey, state: 'authorized' }, now });
  const readiness = evaluatePilotReadiness({
    serverAuthoritativeDispatcher: true,
    responderEligibilityRecords: true,
    synchronizedJourneyApi: true,
    auditLogging: true,
    locationExpiration: true,
    controlledFieldHarness: true,
    noIncidentBounties: true,
    pricingNotTiedToConfrontations: true,
  });

  return [
    { name: 'dispatcher authorization', passed: dispatcherDecision.allowed, detail: dispatcherDecision.reason },
    { name: 'responder eligibility', passed: responderDecision.allowed, detail: responderDecision.reason },
    { name: 'valid journey transition', passed: canTransitionJourney('authorized', 'responder_assigned'), detail: 'authorized → responder_assigned' },
    { name: 'invalid journey transition blocked', passed: !canTransitionJourney('requested', 'arrived'), detail: 'requested → arrived must fail' },
    { name: 'live location accepted before expiry', passed: isLocationValid(validLocation, now), detail: validLocation.expiresAt },
    { name: 'expired location rejected', passed: !isLocationValid(expiredLocation, now), detail: expiredLocation.expiresAt },
    { name: 'pilot evidence gate', passed: readiness.ready, detail: readiness.status },
  ];
}

export function assertSafeArrivalPilotHarness() {
  const results = runSafeArrivalPilotHarness();
  const failed = results.filter((r) => !r.passed);
  if (failed.length) throw new Error(`Safe-arrival pilot harness failed: ${failed.map((f) => f.name).join(', ')}`);
  return results;
}
