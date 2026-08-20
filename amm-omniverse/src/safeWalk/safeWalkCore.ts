export type SafeJourneyKind = 'safe_walk' | 'safe_ride';
export type SafeJourneyState = 'requested' | 'screening' | 'awaiting_match' | 'matched' | 'en_route_to_user' | 'arrived_for_pickup' | 'in_progress' | 'safe_arrival' | 'cancelled' | 'incident_review';
export type CompanionRole = 'community_companion' | 'driver' | 'dispatcher';

export type SafeJourneyRequest = {
  id: string;
  accountId: string;
  kind: SafeJourneyKind;
  pickupLabel: string;
  destinationLabel: string;
  requestedAt: string;
  scheduledFor?: string;
  accessibilityNeeds?: string[];
  trustedContactAccountIds?: string[];
  state: SafeJourneyState;
  jurisdictionCode: string;
};

export type CompanionProfile = {
  id: string;
  accountId: string;
  role: CompanionRole;
  available: boolean;
  verifiedForPilot: boolean;
  jurisdictionCodes: string[];
  accessibilityCapabilities?: string[];
};

export type DispatchMatch = {
  journeyId: string;
  companionId: string;
  matchedAt: string;
  etaMinutes?: number;
  status: 'proposed' | 'accepted' | 'declined' | 'cancelled';
};

export type JourneyEvent = {
  id: string;
  journeyId: string;
  occurredAt: string;
  type: 'status' | 'location_ping' | 'check_in' | 'sos' | 'incident' | 'arrival_confirmation' | 'billing';
  publicMessage?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type SafeJourneyPrice = {
  currency: string;
  totalMinor: number;
  platformMinor: number;
  companionOrDriverMinor: number;
  safetyReserveMinor: number;
  processingMinor: number;
  communityOrReferralMinor?: number;
};

export function priceSafeJourney(input: {
  kind: SafeJourneyKind;
  baseMinor: number;
  distanceMinor?: number;
  timeMinor?: number;
  processingMinor?: number;
  safetyReserveMinor?: number;
  communityOrReferralMinor?: number;
}): SafeJourneyPrice {
  const processingMinor = input.processingMinor ?? 100;
  const safetyReserveMinor = input.safetyReserveMinor ?? 150;
  const communityOrReferralMinor = input.communityOrReferralMinor ?? 0;
  const totalMinor = Math.max(0, input.baseMinor + (input.distanceMinor ?? 0) + (input.timeMinor ?? 0));
  const platformMinor = Math.max(0, Math.round(totalMinor * 0.17));
  const companionOrDriverMinor = Math.max(0, totalMinor - platformMinor - safetyReserveMinor - processingMinor - communityOrReferralMinor);
  return { currency: 'USD', totalMinor, platformMinor, companionOrDriverMinor, safetyReserveMinor, processingMinor, communityOrReferralMinor };
}

export function canDispatch(journey: SafeJourneyRequest, companion: CompanionProfile) {
  if (!companion.available) return { allowed: false, reason: 'Companion/driver unavailable.' };
  if (!companion.verifiedForPilot) return { allowed: false, reason: 'Pilot verification incomplete.' };
  if (!companion.jurisdictionCodes.includes(journey.jurisdictionCode)) return { allowed: false, reason: 'Jurisdiction not approved for this companion/driver.' };
  if (journey.kind === 'safe_ride' && companion.role !== 'driver') return { allowed: false, reason: 'Safe Ride requires an approved driver.' };
  if (journey.kind === 'safe_walk' && !['community_companion','dispatcher'].includes(companion.role)) return { allowed: false, reason: 'Role not eligible for Safe Walk.' };
  return { allowed: true, reason: 'Eligible for dispatch.' };
}

export const safeWalkBoundaries = {
  purpose: 'presence, accompaniment, observation, de-escalation, check-ins, dispatch and rapid help routing',
  prohibited: ['impersonating police','acting as an unlicensed armed security service','pursuing suspects','detaining people unless independently lawful','vigilante patrols','weapons-first operations'],
};
