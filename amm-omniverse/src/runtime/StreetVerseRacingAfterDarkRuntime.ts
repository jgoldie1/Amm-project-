import { installAfterDarkIntimateDeviceRuntime } from './AfterDarkIntimateDeviceRuntime'

export type StreetVerseEventKind =
  | 'circuit-race' | 'point-to-point-race' | 'drift-challenge' | 'motorcycle-race'
  | 'delivery-mission' | 'crew-challenge' | 'date-night' | 'after-dark-event'

export type RelationshipState = 'stranger' | 'friend' | 'rival' | 'dating' | 'partner' | 'ex'

export interface StreetVerseWorldEvent {
  eventId: string
  kind: StreetVerseEventKind
  playerId: string
  locationId: string
  vehicleId?: string
  businessId?: string
  crewId?: string
  relationshipId?: string
  adultOnly?: boolean
  sponsorCampaignId?: string
  metadata?: Record<string, unknown>
}

export interface AfterDarkConsent {
  userId: string
  ageVerified18Plus: boolean
  afterDarkOptIn: boolean
  intimateDeviceOptIn: boolean
  privateSession: boolean
}

const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }))

export function scoreDrift(input: { speed: number; angle: number; line: number; proximity: number; comboSeconds: number }) {
  const clamp = (n: number) => Math.max(0, Math.min(100, n))
  const base = clamp(input.speed) * .2 + clamp(input.angle) * .3 + clamp(input.line) * .2 + clamp(input.proximity) * .2
  const combo = Math.min(2, 1 + Math.max(0, input.comboSeconds) / 60)
  return Math.round(base * combo * 10) / 10
}

export function buildStreetVerseEventConsequences(event: StreetVerseWorldEvent) {
  const destinations = ['world-memory', 'missions', 'reels', 'live', 'pk-events', 'holo-ads', 'business-network', 'earnings-ledger', 'command-nexus']
  if (event.kind === 'delivery-mission') destinations.push('marketplace', 'holo-delivery', 'middleverse-work')
  if (event.kind.includes('race') || event.kind === 'drift-challenge' || event.kind === 'crew-challenge') destinations.push('racing-season', 'crew-reputation', 'ctv-ott-fast')
  if (event.kind === 'date-night' || event.kind === 'after-dark-event') destinations.push('relationship-memory', 'omniverse-after-dark')
  return { ...event, destinations, recordedAt: new Date().toISOString() }
}

export function recordStreetVerseWorldEvent(event: StreetVerseWorldEvent) {
  const consequence = buildStreetVerseEventConsequences(event)
  emit('tryamm:world-event', consequence)
  emit('tryamm:world-memory:record', consequence)
  emit('tryamm:creator:clip-opportunity', { eventId: event.eventId, source: event.kind, surfaces: ['reels', 'live', 'ctv-ott-fast'] })
  if (event.businessId || event.sponsorCampaignId) emit('tryamm:holo-ads:event-attribution', consequence)
  if (event.kind === 'delivery-mission') emit('tryamm:delivery:mission-result', consequence)
  if (event.kind.includes('race') || event.kind === 'drift-challenge' || event.kind === 'crew-challenge') emit('tryamm:racing:event-result', consequence)
  return consequence
}

export function updateRelationship(input: { playerId: string; characterId: string; from: RelationshipState; to: RelationshipState; reason: string }) {
  const record = { ...input, recordedAt: new Date().toISOString() }
  emit('tryamm:relationship:changed', record)
  emit('tryamm:world-memory:record', { type: 'relationship', ...record })
  return record
}

export function requestAfterDarkSession(consent: AfterDarkConsent) {
  const allowed = consent.ageVerified18Plus && consent.afterDarkOptIn
  const intimateDeviceAllowed = allowed && consent.intimateDeviceOptIn && consent.privateSession
  const result = {
    allowed,
    intimateDeviceAllowed,
    rules: {
      defaultOff: true,
      explicitConsentRequired: true,
      teenFamilyLaneIsolation: true,
      noPublicIntimateTelemetry: true,
      noAdTargetingFromIntimateActivity: true,
      noOrdinaryAnalyticsFromIntimateActivity: true,
      providerPairingRequired: intimateDeviceAllowed,
    },
  }
  emit('tryamm:after-dark:session-gate', result)
  return result
}

export function dispatchDynamicCityEvent(input: { type: 'rain' | 'traffic' | 'concert' | 'nightlife-surge' | 'business-demand'; locationId: string; severity?: number }) {
  const event = { ...input, createdAt: new Date().toISOString(), effects: ['handling', 'routes', 'delivery-demand', 'business-demand', 'creator-content', 'world-memory'] }
  emit('tryamm:city:event', event)
  emit('tryamm:dynamic-dispatch:event', event)
  return event
}

export function installStreetVerseRacingAfterDarkRuntime() {
  installAfterDarkIntimateDeviceRuntime()
  const w = window as typeof window & {
    __recordStreetVerseWorldEvent?: typeof recordStreetVerseWorldEvent
    __scoreStreetVerseDrift?: typeof scoreDrift
    __updateStreetVerseRelationship?: typeof updateRelationship
    __requestAfterDarkSession?: typeof requestAfterDarkSession
    __dispatchStreetVerseCityEvent?: typeof dispatchDynamicCityEvent
  }
  w.__recordStreetVerseWorldEvent = recordStreetVerseWorldEvent
  w.__scoreStreetVerseDrift = scoreDrift
  w.__updateStreetVerseRelationship = updateRelationship
  w.__requestAfterDarkSession = requestAfterDarkSession
  w.__dispatchStreetVerseCityEvent = dispatchDynamicCityEvent
  emit('tryamm:racing-after-dark:ready', {
    systems: ['cars', 'motorcycles', 'drifting', 'racing-seasons', 'delivery-missions', 'crew-system', 'relationships', 'dynamic-city-events', 'omniverse-after-dark', 'lovense-compatible-haptics', 'creator-clips', 'ctv-ott-fast', 'world-memory'],
    providerGates: ['real-money-settlement', 'external-intimate-device-pairing', 'ctv-ott-distribution'],
  })
}
