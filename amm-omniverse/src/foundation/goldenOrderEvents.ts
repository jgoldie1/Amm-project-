export const GOLDEN_ORDER_EVENTS = [
  'golden-order.rfq.created',
  'golden-order.quote.received',
  'golden-order.quote.accepted',
  'golden-order.po.opened',
  'golden-order.funded',
  'golden-order.production.started',
  'golden-order.shipment.departed',
  'golden-order.customs.hold',
  'golden-order.customs.released',
  'golden-order.warehouse.received',
  'golden-order.inventory.reserved',
  'golden-order.live-sale.completed',
  'golden-order.delivery.confirmed',
  'golden-order.settlement.created',
  'golden-order.refund.created',
] as const;

export type GoldenOrderEventName = (typeof GOLDEN_ORDER_EVENTS)[number];

export type GoldenOrderEventSource =
  | 'tryamm-commerce'
  | 'payment-provider'
  | 'logistics-provider'
  | 'warehouse'
  | 'customs-service'
  | 'settlement-service'
  | 'streetverse';

export interface GoldenOrderEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventName: GoldenOrderEventName;
  occurredAt: string;
  goldenOrderId: string;
  correlationId: string;
  actorType: 'seller' | 'supplier' | 'buyer' | 'carrier' | 'warehouse' | 'customs' | 'system';
  actorId?: string;
  source: GoldenOrderEventSource;
  authoritative: boolean;
  payload: TPayload;
}

export const GOLDEN_ORDER_EVENT_AUTHORITIES: Record<GoldenOrderEventName, readonly GoldenOrderEventSource[]> = {
  'golden-order.rfq.created': ['tryamm-commerce'],
  'golden-order.quote.received': ['tryamm-commerce'],
  'golden-order.quote.accepted': ['tryamm-commerce'],
  'golden-order.po.opened': ['tryamm-commerce'],
  'golden-order.funded': ['payment-provider'],
  'golden-order.production.started': ['tryamm-commerce'],
  'golden-order.shipment.departed': ['logistics-provider'],
  'golden-order.customs.hold': ['customs-service'],
  'golden-order.customs.released': ['customs-service'],
  'golden-order.warehouse.received': ['warehouse'],
  'golden-order.inventory.reserved': ['warehouse'],
  'golden-order.live-sale.completed': ['tryamm-commerce'],
  'golden-order.delivery.confirmed': ['logistics-provider'],
  'golden-order.settlement.created': ['settlement-service'],
  'golden-order.refund.created': ['payment-provider', 'settlement-service'],
};

const hasNonEmptyIdentifier = (value: string): boolean => value.trim().length > 0;

/**
 * Structural integrity is a prerequisite for authority. This does not mutate,
 * verify, settle, or reconcile commerce state; it only rejects malformed event
 * envelopes before they can be treated as authoritative evidence.
 */
export const hasValidGoldenOrderEventIntegrity = (event: GoldenOrderEvent): boolean =>
  hasNonEmptyIdentifier(event.eventId) &&
  hasNonEmptyIdentifier(event.goldenOrderId) &&
  hasNonEmptyIdentifier(event.correlationId) &&
  Number.isFinite(Date.parse(event.occurredAt)) &&
  event.payload !== null &&
  typeof event.payload === 'object';

export const isWorldProjectionOnly = (event: GoldenOrderEvent): boolean =>
  event.source === 'streetverse' && event.authoritative === false;

export const isAuthorizedGoldenOrderEvent = (event: GoldenOrderEvent): boolean =>
  hasValidGoldenOrderEventIntegrity(event) &&
  event.authoritative === true &&
  GOLDEN_ORDER_EVENT_AUTHORITIES[event.eventName].includes(event.source);

export const mayMutateCommerceTruth = (event: GoldenOrderEvent): boolean =>
  event.source !== 'streetverse' && isAuthorizedGoldenOrderEvent(event);
