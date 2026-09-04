import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const telemetryPath = path.join(root, 'src/foundation/founderCommerceTelemetry.ts');

if (!fs.existsSync(telemetryPath)) {
  throw new Error('Founder commerce telemetry foundation file is missing');
}

const source = fs.readFileSync(telemetryPath, 'utf8');

const requiredAuthorities = [
  'commerce-api',
  'payment-provider',
  'inventory-service',
  'logistics-service',
  'customs-service',
  'settlement-service',
];

for (const authority of requiredAuthorities) {
  if (!source.includes(`'${authority}'`)) {
    throw new Error(`Missing authoritative telemetry source: ${authority}`);
  }
}

for (const forbiddenAuthority of ['streetverse', 'vision-qa', 'game-client']) {
  const authorityPattern = new RegExp(`\\|\\s*'${forbiddenAuthority}'`);
  if (authorityPattern.test(source)) {
    throw new Error(`Presentation client must not be a commerce authority: ${forbiddenAuthority}`);
  }
}

const requiredEventOwners = new Map([
  ['rfq.created', "['commerce-api']"],
  ['supplier.verified', "['commerce-api']"],
  ['po.opened', "['commerce-api']"],
  ['payment.verified', "['payment-provider']"],
  ['inventory.received', "['inventory-service']"],
  ['shipment.departed', "['logistics-service']"],
  ['customs.hold.opened', "['customs-service']"],
  ['customs.hold.cleared', "['customs-service']"],
  ['live.sale.completed', "['commerce-api']"],
  ['delivery.confirmed', "['logistics-service']"],
  ['settlement.created', "['settlement-service']"],
  ['refund.completed', "['payment-provider', 'settlement-service']"],
]);

for (const [eventName, owners] of requiredEventOwners) {
  const mapping = `'${eventName}': ${owners}`;
  if (!source.includes(mapping)) {
    throw new Error(`Missing or incorrect telemetry authority mapping: ${mapping}`);
  }
}

const requiredProtections = [
  'processedEventIds.includes(event.id)',
  'Math.max(0, value)',
  'StreetVerse, Vision QA, and other presentation clients are intentionally not',
  'isAuthorizedFounderTelemetryEvent(event)',
  'eventAuthorities[event.type].includes(event.authority)',
];

for (const protection of requiredProtections) {
  if (!source.includes(protection)) {
    throw new Error(`Missing telemetry protection: ${protection}`);
  }
}

const authorityCheckPosition = source.indexOf('if (!isAuthorizedFounderTelemetryEvent(event)) return state;');
const processedIdPosition = source.indexOf('if (state.processedEventIds.includes(event.id)) return state;');
if (authorityCheckPosition < 0 || processedIdPosition < 0 || authorityCheckPosition > processedIdPosition) {
  throw new Error('Authority validation must happen before an event is recorded as processed');
}

const requiredKpis = [
  'gmv',
  'tryammRevenue',
  'orders',
  'suppliers',
  'rfqs',
  'openPurchaseOrders',
  'inventoryValue',
  'shipmentsInTransit',
  'customsHolds',
  'warehouseStock',
  'liveSales',
  'sellerPayableBalance',
  'refunds',
  'supplierRisk',
  'grossMargin',
  'countries',
  'tradeCorridors',
];

for (const kpi of requiredKpis) {
  if (!source.includes(kpi)) {
    throw new Error(`Founder telemetry does not expose KPI: ${kpi}`);
  }
}

console.log('Founder commerce telemetry authority contract passed');
