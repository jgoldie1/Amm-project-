export type CarShareVehicleStatus = 'DRAFT' | 'AVAILABLE' | 'PAUSED' | 'BOOKED'
export type CarShareBookingStatus = 'REQUESTED' | 'APPROVED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED'

export interface CarShareVehicle {
  id: string
  ownerUserId: string
  displayName: string
  vehicleClass: string
  pickupArea: string
  dailyRateCents: number
  currency: 'USD'
  status: CarShareVehicleStatus
  provider: 'TRYAMM'
}

export interface CarShareBookingRequest {
  vehicleId: string
  renterUserId: string
  startsAt: string
  endsAt: string
}

export interface CarShareBooking {
  id: string
  vehicleId: string
  renterUserId: string
  startsAt: string
  endsAt: string
  status: CarShareBookingStatus
  paymentStatus: 'NOT_STARTED' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED'
  identityStatus: 'REQUIRED' | 'VERIFIED'
  protectionStatus: 'REQUIRED' | 'VERIFIED'
}

export const TRYAMM_CAR_SHARE_RELEASE_GATES = Object.freeze({
  serverAuthoritativeBookings: true,
  serverAuthoritativePayments: true,
  identityVerificationRequired: true,
  driverEligibilityVerificationRequired: true,
  protectionOrInsuranceVerificationRequired: true,
  ownerVehicleVerificationRequired: true,
  paymentCaptureClientSide: false,
  rawIdentityDocumentRetention: false,
  liveUntilComplianceVerified: false,
})

export function validateBookingWindow(request: CarShareBookingRequest) {
  const start = Date.parse(request.startsAt)
  const end = Date.parse(request.endsAt)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { ok: false, reason: 'INVALID_TIME' as const }
  if (end <= start) return { ok: false, reason: 'INVALID_WINDOW' as const }
  return { ok: true as const }
}

export function calculateRentalSubtotalCents(vehicle: Pick<CarShareVehicle, 'dailyRateCents'>, request: CarShareBookingRequest) {
  const window = validateBookingWindow(request)
  if (!window.ok) throw new Error(window.reason)
  const durationMs = Date.parse(request.endsAt) - Date.parse(request.startsAt)
  const billableDays = Math.max(1, Math.ceil(durationMs / 86_400_000))
  return vehicle.dailyRateCents * billableDays
}

export function canApproveBooking(input: {
  vehicle: CarShareVehicle
  booking: CarShareBooking
  driverEligible: boolean
  ownerVehicleVerified: boolean
}) {
  return input.vehicle.status === 'AVAILABLE'
    && input.booking.identityStatus === 'VERIFIED'
    && input.booking.protectionStatus === 'VERIFIED'
    && input.driverEligible
    && input.ownerVehicleVerified
}
