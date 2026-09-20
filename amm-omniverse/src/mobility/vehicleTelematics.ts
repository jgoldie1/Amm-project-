export type VehicleLocationPurpose =
  | 'PICKUP_RETURN'
  | 'ROADSIDE_ASSISTANCE'
  | 'FLEET_OPERATIONS'
  | 'TRIP_MILEAGE'
  | 'THEFT_RECOVERY'

export type GeofenceKind = 'PICKUP' | 'RETURN' | 'SERVICE_AREA' | 'RESTRICTED'

export interface VehicleTrackingConsent {
  vehicleId: string
  ownerUserId: string
  enabled: boolean
  allowedPurposes: VehicleLocationPurpose[]
  consentedAt: string
  revokedAt?: string
}

export interface VehicleLocationEvent {
  vehicleId: string
  occurredAt: string
  latitude: number
  longitude: number
  accuracyMeters?: number
  source: 'AUTHORIZED_TELEMATICS_PROVIDER' | 'AUTHORIZED_DEVICE'
  purpose: VehicleLocationPurpose
}

export interface VehicleGeofence {
  id: string
  vehicleId?: string
  kind: GeofenceKind
  centerLatitude: number
  centerLongitude: number
  radiusMeters: number
  enabled: boolean
}

export const VEHICLE_TELEMATICS_RELEASE_GATES = Object.freeze({
  explicitOwnerConsentRequired: true,
  covertPersonTrackingAllowed: false,
  preciseLocationPubliclyVisible: false,
  serverAuthoritativeLocationEvents: true,
  providerCredentialsServerSideOnly: true,
  roleBasedLocationAccessRequired: true,
  accessAuditRequired: true,
  retentionLimitRequired: true,
  providerAuthorizationRequired: true,
  productionEndToEndTestRequired: true,
  liveTrackingEnabledByDefault: false,
})

export function canAcceptLocationEvent(input: {
  consent: VehicleTrackingConsent
  event: VehicleLocationEvent
  now?: string
}) {
  if (!input.consent.enabled || input.consent.revokedAt) return false
  if (input.consent.vehicleId !== input.event.vehicleId) return false
  if (!input.consent.allowedPurposes.includes(input.event.purpose)) return false
  if (!Number.isFinite(input.event.latitude) || input.event.latitude < -90 || input.event.latitude > 90) return false
  if (!Number.isFinite(input.event.longitude) || input.event.longitude < -180 || input.event.longitude > 180) return false
  if (!Number.isFinite(Date.parse(input.event.occurredAt))) return false
  const now = Date.parse(input.now ?? new Date().toISOString())
  return Date.parse(input.event.occurredAt) <= now + 60_000
}

export function isInsideCircularGeofence(location: Pick<VehicleLocationEvent, 'latitude' | 'longitude'>, fence: VehicleGeofence) {
  if (!fence.enabled || fence.radiusMeters <= 0) return false
  const earthRadiusMeters = 6_371_000
  const toRad = (degrees: number) => degrees * Math.PI / 180
  const dLat = toRad(location.latitude - fence.centerLatitude)
  const dLon = toRad(location.longitude - fence.centerLongitude)
  const lat1 = toRad(fence.centerLatitude)
  const lat2 = toRad(location.latitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const distance = 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return distance <= fence.radiusMeters
}
