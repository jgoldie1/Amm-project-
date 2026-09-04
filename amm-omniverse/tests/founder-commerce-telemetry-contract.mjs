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

const requiredEvents = [
  'rfq.created',
  'supplier.verified',
  'po.opened',
  'payment.verified',
  'inventory.received',
  'shipment.departed',
  'customs.hold.opened',
  'customs.hold.cleared',
  'live.sale.completed',
  'delivery.confirmed',
  'settlement.created',
  'refund.completed',
];

for (const eventName of requiredEvents) {
  if (!source.includes(`'${eventName}'`)) {
    throw new Error(`Missing founder telemetry event: ${eventName}`);
  }
}

const requiredProtections = [
  'processedEventIds.includes(event.id)',
  'Math.max(0, value)',
  'StreetVerse, Vision QA, and other presentation clients are intentionally not',
];

for (const protection of requiredProtections) {
  if (!source.includes(protection)) {
    throw new Error(`Missing telemetry protection: ${protection}`);
  }
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
