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

if (!source.includes("event.source !== 'streetverse'")) {
  throw new Error('StreetVerse must not mutate authoritative commerce truth');
}

if (!source.includes('event.authoritative === true')) {
  throw new Error('Authoritative flag is required for commerce truth mutation');
}

console.log('Golden Order event bridge contract passed');
