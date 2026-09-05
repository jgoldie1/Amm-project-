import type { CommerceKpi, GoldenOrderSnapshot } from './aaaCommerceFoundation';

export type CommerceAuthority =
  | 'commerce-api'
  | 'payment-provider'
  | 'inventory-service'
  | 'logistics-service'
  | 'customs-service'
  | 'settlement-service';

export type FounderCommerceTelemetryEventType =
  | 'rfq.created'
  | 'supplier.verified'
  | 'po.opened'
  | 'payment.verified'
  | 'inventory.received'
  | 'shipment.departed'
  | 'customs.hold.opened'
  | 'customs.hold.cleared'
  | 'live.sale.completed'
  | 'delivery.confirmed'
  | 'settlement.created'
  | 'refund.completed';

export interface FounderCommerceTelemetryEvent {
  id: string;
  occurredAt: string;
  authority: CommerceAuthority;
  type: FounderCommerceTelemetryEventType;
  orderId?: string;
  supplierId?: string;
  country?: string;
  corridor?: string;
  amount?: number;
  platformRevenue?: number;
  inventoryValue?: number;
  sellerPayable?: number;
  grossMargin?: number;
  supplierRisk?: number;
}

export interface FounderCommerceTelemetryState {
  kpis: Record<CommerceKpi, number>;
  processedEventIds: string[];
  orderIds: string[];
  supplierIds: string[];
  countries: string[];
  corridors: string[];
}

const eventAuthorities: Record<FounderCommerceTelemetryEventType, readonly CommerceAuthority[]> = {
  'rfq.created': ['commerce-api'],
  'supplier.verified': ['commerce-api'],
  'po.opened': ['commerce-api'],
  'payment.verified': ['payment-provider'],
  'inventory.received': ['inventory-service'],
  'shipment.departed': ['logistics-service'],
  'customs.hold.opened': ['customs-service'],
  'customs.hold.cleared': ['customs-service'],
  'live.sale.completed': ['commerce-api'],
  'delivery.confirmed': ['logistics-service'],
  'settlement.created': ['settlement-service'],
  'refund.completed': ['payment-provider', 'settlement-service'],
};

const isTelemetryEventObject = (event: FounderCommerceTelemetryEvent): boolean =>
  Boolean(event) && typeof event === 'object' && !Array.isArray(event);

export const isAuthorizedFounderTelemetryEvent = (
  event: FounderCommerceTelemetryEvent,
): boolean => {
  if (!isTelemetryEventObject(event)) return false;
  const allowedAuthorities = eventAuthorities[event.type];
  return Array.isArray(allowedAuthorities) && allowedAuthorities.includes(event.authority);
};

const isIsoTimestamp = (value: string): boolean => {
  if (typeof value !== 'string' || !value || value.trim() !== value) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
};

const numericTelemetryFields: readonly (keyof FounderCommerceTelemetryEvent)[] = [
  'amount',
  'platformRevenue',
  'inventoryValue',
  'sellerPayable',
  'grossMargin',
  'supplierRisk',
];

const hasOnlyFiniteNumericTelemetry = (
  event: FounderCommerceTelemetryEvent,
): boolean =>
  numericTelemetryFields.every((field) => {
    const value = event[field];
    return value === undefined || (typeof value === 'number' && Number.isFinite(value));
  });

const textTelemetryFields: readonly (keyof FounderCommerceTelemetryEvent)[] = [
  'orderId',
  'supplierId',
  'country',
  'corridor',
];

const hasOnlyCanonicalOptionalTelemetryText = (
  event: FounderCommerceTelemetryEvent,
): boolean =>
  textTelemetryFields.every((field) => {
    const value = event[field];
    return (
      value === undefined ||
      (typeof value === 'string' && value.length > 0 && value.trim() === value)
    );
  });

export const hasValidFounderTelemetryEnvelope = (
  event: FounderCommerceTelemetryEvent,
): boolean =>
  isTelemetryEventObject(event) &&
  typeof event.id === 'string' &&
  event.id.trim().length > 0 &&
  event.id.trim() === event.id &&
  typeof event.occurredAt === 'string' &&
  isIsoTimestamp(event.occurredAt) &&
  hasOnlyFiniteNumericTelemetry(event) &&
  hasOnlyCanonicalOptionalTelemetryText(event);

const zeroKpis = (): Record<CommerceKpi, number> => ({
  gmv: 0,
  tryammRevenue: 0,
  orders: 0,
  suppliers: 0,
  rfqs: 0,
  openPurchaseOrders: 0,
  inventoryValue: 0,
  shipmentsInTransit: 0,
  customsHolds: 0,
  warehouseStock: 0,
  liveSales: 0,
  sellerPayableBalance: 0,
  refunds: 0,
  supplierRisk: 0,
  grossMargin: 0,
  countries: 0,
  tradeCorridors: 0,
});

export const createEmptyFounderTelemetryState = (): FounderCommerceTelemetryState => ({
  kpis: zeroKpis(),
  processedEventIds: [],
  orderIds: [],
  supplierIds: [],
  countries: [],
  corridors: [],
});

const addUnique = (values: string[], value?: string): string[] =>
  value && !values.includes(value) ? [...values, value] : values;

const nonNegative = (value: number): number => Math.max(0, value);

/**
 * Reduces only server/provider-authoritative commerce events into founder KPIs.
 * StreetVerse, Vision QA, and other presentation clients are intentionally not
 * accepted authorities and therefore cannot mutate money, inventory, customs,
 * logistics, or settlement truth through this reducer.
 * Each accepted event type is additionally bound to its owning authority, and
 * malformed event envelopes are rejected before deduplication or state changes.
 */
export const reduceFounderCommerceTelemetry = (
  state: FounderCommerceTelemetryState,
  event: FounderCommerceTelemetryEvent,
): FounderCommerceTelemetryState => {
  if (!hasValidFounderTelemetryEnvelope(event)) return state;
  if (!isAuthorizedFounderTelemetryEvent(event)) return state;
  if (state.processedEventIds.includes(event.id)) return state;

  const next: FounderCommerceTelemetryState = {
    ...state,
    kpis: { ...state.kpis },
    processedEventIds: [...state.processedEventIds, event.id],
    orderIds: addUnique(state.orderIds, event.orderId),
    supplierIds: addUnique(state.supplierIds, event.supplierId),
    countries: addUnique(state.countries, event.country),
    corridors: addUnique(state.corridors, event.corridor),
  };

  switch (event.type) {
    case 'rfq.created':
      next.kpis.rfqs += 1;
      break;
    case 'supplier.verified':
      break;
    case 'po.opened':
      next.kpis.openPurchaseOrders += 1;
      break;
    case 'payment.verified':
      next.kpis.orders = next.orderIds.length;
      next.kpis.gmv += nonNegative(event.amount ?? 0);
      next.kpis.tryammRevenue += nonNegative(event.platformRevenue ?? 0);
      if (typeof event.sellerPayable === 'number') {
        next.kpis.sellerPayableBalance += nonNegative(event.sellerPayable);
      }
      if (typeof event.grossMargin === 'number') next.kpis.grossMargin = event.grossMargin;
      break;
    case 'inventory.received':
      next.kpis.inventoryValue += nonNegative(event.inventoryValue ?? 0);
      next.kpis.warehouseStock += 1;
      break;
    case 'shipment.departed':
      next.kpis.shipmentsInTransit += 1;
      break;
    case 'customs.hold.opened':
      next.kpis.customsHolds += 1;
      break;
    case 'customs.hold.cleared':
      next.kpis.customsHolds = nonNegative(next.kpis.customsHolds - 1);
      break;
    case 'live.sale.completed':
      next.kpis.liveSales += 1;
      break;
    case 'delivery.confirmed':
      next.kpis.shipmentsInTransit = nonNegative(next.kpis.shipmentsInTransit - 1);
      break;
    case 'settlement.created':
      if (typeof event.sellerPayable === 'number') {
        next.kpis.sellerPayableBalance = nonNegative(
          next.kpis.sellerPayableBalance - nonNegative(event.sellerPayable),
        );
      }
      next.kpis.openPurchaseOrders = nonNegative(next.kpis.openPurchaseOrders - 1);
      break;
    case 'refund.completed':
      next.kpis.refunds += nonNegative(event.amount ?? 0);
      break;
  }

  next.kpis.orders = next.orderIds.length;
  next.kpis.suppliers = next.supplierIds.length;
  next.kpis.countries = next.countries.length;
  next.kpis.tradeCorridors = next.corridors.length;
  if (typeof event.supplierRisk === 'number') next.kpis.supplierRisk = event.supplierRisk;

  return next;
};

export const telemetryFromGoldenOrder = (
  order: GoldenOrderSnapshot,
): Pick<FounderCommerceTelemetryEvent, 'orderId' | 'corridor' | 'amount' | 'platformRevenue' | 'inventoryValue' | 'sellerPayable' | 'grossMargin'> => ({
  orderId: order.id,
  corridor: order.corridor,
  amount: order.gmv,
  platformRevenue: order.tryammRevenue,
  inventoryValue: order.inventoryValue,
  sellerPayable: order.sellerPayableBalance,
  grossMargin: order.grossMargin,
});
