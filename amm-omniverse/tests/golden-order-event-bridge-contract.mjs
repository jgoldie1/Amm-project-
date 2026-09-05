import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const eventPath = path.join(root, 'src/foundation/goldenOrderEvents.ts');

if (!fs.existsSync(eventPath)) throw new Error('Golden Order event bridge is missing');

const source = fs.readFileSync(eventPath, 'utf8');

const requiredEvents = [
  'golden-order.rfq.created',
  'golden-order.quote.accepted',
  'golden-order.po.opened',
  'golden-order.funded',
  'golden-order.shipment.departed',
  'golden-order.customs.hold',
  'golden-order.warehouse.received',
  'golden-order.live-sale.completed',
  'golden-order.delivery.confirmed',
  'golden-order.settlement.created',
  'golden-order.refund.created',
];

for (const event of requiredEvents) {
  if (!source.includes(`'${event}'`)) throw new Error(`Missing Golden Order event: ${event}`);
}

const requiredAuthorityPairs = [
  ["'golden-order.funded'", "['payment-provider']"],
  ["'golden-order.shipment.departed'", "['logistics-provider']"],
  ["'golden-order.customs.hold'", "['customs-service']"],
  ["'golden-order.customs.released'", "['customs-service']"],
  ["'golden-order.warehouse.received'", "['warehouse']"],
  ["'golden-order.inventory.reserved'", "['warehouse']"],
  ["'golden-order.delivery.confirmed'", "['logistics-provider']"],
  ["'golden-order.settlement.created'", "['settlement-service']"],
];

for (const [eventName, authorities] of requiredAuthorityPairs) {
  const expected = `${eventName}: ${authorities}`;
  if (!source.includes(expected)) throw new Error(`Missing Golden Order authority mapping: ${expected}`);
}

if (!source.includes('GOLDEN_ORDER_EVENT_AUTHORITIES[event.eventName].includes(event.source)')) {
  throw new Error('Golden Order mutation must enforce event-specific source ownership');
}

if (!source.includes("event.source !== 'streetverse' && isAuthorizedGoldenOrderEvent(event)")) {
  throw new Error('StreetVerse must remain projection-only and mutation must require event authorization');
}

if (!source.includes('event.authoritative === true')) {
  throw new Error('Authoritative flag is required for commerce truth mutation');
}

for (const integrityCheck of [
  'hasValidGoldenOrderEventIntegrity',
  'hasCanonicalIdentifier(event.eventId)',
  'hasCanonicalIdentifier(event.goldenOrderId)',
  'hasCanonicalIdentifier(event.correlationId)',
  'trimmed.length > 0 && trimmed === value',
  'isCanonicalIsoTimestamp(event.occurredAt)',
  'value.trim() !== value',
  'Date.parse(value)',
  'new Date(parsed).toISOString() === value',
  "event.payload !== null",
  "typeof event.payload === 'object'",
]) {
  if (!source.includes(integrityCheck)) {
    throw new Error(`Golden Order event integrity guard missing: ${integrityCheck}`);
  }
}

if (!source.includes('hasValidGoldenOrderEventIntegrity(event) &&')) {
  throw new Error('Golden Order authorization must require structural event integrity');
}

console.log('Golden Order event bridge canonical envelope and authority contract passed');
