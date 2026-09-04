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

export interface GoldenOrderEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  eventName: GoldenOrderEventName;
  occurredAt: string;
  goldenOrderId: string;
  correlationId: string;
  actorType: 'seller' | 'supplier' | 'buyer' | 'carrier' | 'warehouse' | 'customs' | 'system';
  actorId?: string;
  source: 'tryamm-commerce' | 'payment-provider' | 'logistics-provider' | 'warehouse' | 'streetverse';
  authoritative: boolean;
  payload: TPayload;
}

export const isWorldProjectionOnly = (event: GoldenOrderEvent): boolean =>
  event.source === 'streetverse' && event.authoritative === false;

export const mayMutateCommerceTruth = (event: GoldenOrderEvent): boolean =>
  event.authoritative === true && event.source !== 'streetverse';
