import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const foundationPath = path.join(root, 'src/foundation/aaaCommerceFoundation.ts');

if (!fs.existsSync(foundationPath)) {
  throw new Error('AAA commerce foundation file is missing');
}

const source = fs.readFileSync(foundationPath, 'utf8');

const requiredAaaPillars = [
  'environment-assets',
  'characters-facial-animation',
  'vehicle-physics',
  'motion-capture-animation',
  'materials-lighting',
  'vfx',
  'sound-design',
  'crowd-ai',
  'traffic-ai',
  'combat-gameplay',
  'multiplayer-netcode',
  'cinematic-direction',
  'optimization',
  'qa',
];

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

for (const pillar of requiredAaaPillars) {
  if (!source.includes(`'${pillar}'`)) {
    throw new Error(`Missing AAA pillar: ${pillar}`);
  }
}

for (const kpi of requiredKpis) {
  if (!source.includes(kpi)) {
    throw new Error(`Missing commerce KPI: ${kpi}`);
  }
}

const rolloutOrder = ["id: 'illinois'", "id: 'united-states'", "id: 'world'"];
let cursor = -1;
for (const marker of rolloutOrder) {
  const next = source.indexOf(marker);
  if (next < 0) throw new Error(`Missing rollout stage: ${marker}`);
  if (next <= cursor) throw new Error('Rollout order must be Illinois -> United States -> world');
  cursor = next;
}

if (!source.includes('Golden Order paid pilot is verified end-to-end')) {
  throw new Error('Illinois stage must be gated by a verified Golden Order paid pilot');
}

if (!source.includes('StreetVerse visual state never overrides authoritative money or inventory state')) {
  throw new Error('Foundation must preserve authoritative commerce state outside the game client');
}

console.log('AAA commerce foundation contract passed');
