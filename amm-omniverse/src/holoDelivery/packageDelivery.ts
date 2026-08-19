import type { DeliveryMode, DeliveryTrackingEvent, GeoPoint, Money, OrderState } from './holoDeliveryCore';

export type PackageSize = 'document' | 'small' | 'medium' | 'large' | 'oversize';
export type PackageServiceLevel = 'same_hour' | 'same_day' | 'scheduled' | 'standard';

export type PackageDeliveryRequest = {
  id: string;
  senderAccountId: string;
  recipientName: string;
  pickupAddress: string;
  dropoffAddress: string;
  size: PackageSize;
  weightGrams?: number;
  fragile?: boolean;
  signatureRequired?: boolean;
  photoProofRequired?: boolean;
  serviceLevel: PackageServiceLevel;
  allowedModes: DeliveryMode[];
  declaredValue?: Money;
  notes?: string;
};

export type PackageQuote = {
  requestId: string;
  providerId: string;
  mode: DeliveryMode;
  fee: Money;
  etaPickupMinutes: number;
  etaDeliveryMinutes: number;
  available: boolean;
  unavailableReason?: string;
  legalSafetyVerified?: boolean;
};

export type PackageDelivery = {
  request: PackageDeliveryRequest;
  state: OrderState;
  selectedQuote?: PackageQuote;
  trackingEvents: DeliveryTrackingEvent[];
  courierId?: string;
  trackingCode: string;
  pickupCode?: string;
  deliveryCode?: string;
  signatureCaptured?: boolean;
  proofPhotoUrl?: string;
  deliveredAt?: string;
};

export function createTrackingCode(prefix = 'HOLO') {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${suffix}`;
}

export function addPackageTrackingEvent(delivery: PackageDelivery, event: Omit<DeliveryTrackingEvent, 'orderId'>): PackageDelivery {
  return {
    ...delivery,
    state: event.state,
    trackingEvents: [...delivery.trackingEvents, { ...event, orderId: delivery.request.id }],
    deliveredAt: event.state === 'delivered' ? event.occurredAt : delivery.deliveredAt,
  };
}

export type ArrivalSnapshot = {
  status: string;
  etaMinutes?: number;
  courierLocation?: GeoPoint;
  isArriving: boolean;
  isDelivered: boolean;
};

export function packageArrivalSnapshot(delivery: PackageDelivery): ArrivalSnapshot {
  const events = [...delivery.trackingEvents].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const latest = events.length > 0 ? events[events.length - 1] : undefined;
  const latestEta = [...events].reverse().find((e) => typeof e.etaMinutes === 'number')?.etaMinutes;
  const latestLocation = [...events].reverse().find((e) => e.location)?.location;
  const state: OrderState = latest?.state ?? delivery.state;
  return {
    status: latest?.publicMessage ?? 'Delivery created',
    etaMinutes: latestEta,
    courierLocation: latestLocation,
    isArriving: state === 'arriving',
    isDelivered: state === 'delivered',
  };
}

// Production requirements:
// - recipient contact details stay masked where possible;
// - exact location is shared only for active delivery needs;
// - declared value, signatures and proof photos require authenticated server persistence;
// - restricted/hazardous/illegal goods are rejected by policy and provider rules;
// - robot/drone use only approved providers and eligible parcels/routes.