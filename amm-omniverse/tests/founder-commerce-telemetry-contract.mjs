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
  'hasValidFounderTelemetryStateEnvelope(state)',
  "Boolean(state) &&",
  "typeof state === 'object'",
  '!Array.isArray(state)',
  'Boolean(state.kpis)',
  "typeof state.kpis === 'object'",
  '!Array.isArray(state.kpis)',
  'FOUNDER_TELEMETRY_STATE_KEYS',
  'hasPlainFounderTelemetryStateShape(state)',
  'Object.getPrototypeOf(state) !== Object.prototype',
  'const stateKeys = Reflect.ownKeys(state)',
  'stateKeys.length !== FOUNDER_TELEMETRY_STATE_KEYS.length',
  'Object.getOwnPropertyDescriptor(state, key)',
  'COMMERCE_KPIS',
  'hasExactFiniteKpiShape(state.kpis)',
  'Object.getPrototypeOf(kpis) !== Object.prototype',
  'const kpiKeys = Reflect.ownKeys(kpis)',
  'kpiKeys.length !== COMMERCE_KPIS.length',
  'COMMERCE_KPIS.every',
  'const descriptor = Object.getOwnPropertyDescriptor(kpis, kpi)',
  "'value' in descriptor!",
  "typeof descriptor!.value === 'number'",
  'Number.isFinite(descriptor!.value)',
  'isCanonicalUniqueTelemetryTextList',
  'MAX_TELEMETRY_STATE_LIST_LENGTH = 4096',
  'hasPlainDenseTelemetryArrayShape(values)',
  'Object.getPrototypeOf(values) !== Array.prototype',
  'const ownKeys = Reflect.ownKeys(values)',
  'Object.getOwnPropertyDescriptor(values, String(index))',
  'values.every(isCanonicalTelemetryText)',
  'new Set(values).size === values.length',
  'isCanonicalUniqueTelemetryTextList(state.processedEventIds)',
  'isCanonicalUniqueTelemetryTextList(state.orderIds)',
  'isCanonicalUniqueTelemetryTextList(state.supplierIds)',
  'isCanonicalUniqueTelemetryTextList(state.countries)',
  'isCanonicalUniqueTelemetryTextList(state.corridors)',
  'processedEventIds.includes(event.id)',
  'Math.max(0, value)',
  'StreetVerse, Vision QA, and other presentation clients are intentionally not',
  'isAuthorizedFounderTelemetryEvent(event)',
  'const allowedAuthorities = eventAuthorities[event.type]',
  'Array.isArray(allowedAuthorities)',
  'allowedAuthorities.includes(event.authority)',
  'hasValidFounderTelemetryEnvelope(event)',
  'isTelemetryEventObject(event)',
  "Boolean(event) && typeof event === 'object' && !Array.isArray(event)",
  'MAX_TELEMETRY_TEXT_LENGTH = 256',
  'TELEMETRY_CONTROL_CHARACTER_PATTERN',
  '/[\\u0000-\\u001F\\u007F-\\u009F]/',
  '!TELEMETRY_CONTROL_CHARACTER_PATTERN.test(value)',
  'isCanonicalTelemetryText',
  "typeof value === 'string'",
  'value.length > 0',
  'value.length <= MAX_TELEMETRY_TEXT_LENGTH',
  'value.trim() === value',
  'isCanonicalTelemetryText(event.id)',
  "typeof event.occurredAt === 'string'",
  "typeof value !== 'string'",
  'Date.parse(value)',
  'new Date(parsed).toISOString() === value',
  'numericTelemetryFields',
  'hasOnlyFiniteNumericTelemetry(event)',
  'Number.isFinite(value)',
  'textTelemetryFields',
  'hasOnlyCanonicalOptionalTelemetryText(event)',
  'value === undefined || isCanonicalTelemetryText(value)',
];

for (const protection of requiredProtections) {
  if (!source.includes(protection)) {
    throw new Error(`Missing telemetry protection: ${protection}`);
  }
}

for (const numericField of [
  'amount',
  'platformRevenue',
  'inventoryValue',
  'sellerPayable',
  'grossMargin',
  'supplierRisk',
]) {
  if (!source.includes(`'${numericField}'`)) {
    throw new Error(`Numeric telemetry field is not covered by finite-value validation: ${numericField}`);
  }
}

for (const textField of ['orderId', 'supplierId', 'country', 'corridor']) {
  if (!source.includes(`'${textField}'`)) {
    throw new Error(`Telemetry identifier field is not covered by canonical text validation: ${textField}`);
  }
}

const stateEnvelopeCheckPosition = source.indexOf('if (!hasValidFounderTelemetryStateEnvelope(state)) return state;');
const envelopeCheckPosition = source.indexOf('if (!hasValidFounderTelemetryEnvelope(event)) return state;');
const authorityCheckPosition = source.indexOf('if (!isAuthorizedFounderTelemetryEvent(event)) return state;');
const processedIdPosition = source.indexOf('if (state.processedEventIds.includes(event.id)) return state;');
if (
  stateEnvelopeCheckPosition < 0 ||
  envelopeCheckPosition < 0 ||
  authorityCheckPosition < 0 ||
  processedIdPosition < 0 ||
  stateEnvelopeCheckPosition > envelopeCheckPosition ||
  envelopeCheckPosition > authorityCheckPosition ||
  authorityCheckPosition > processedIdPosition
) {
  throw new Error('State, event envelope, and authority validation must happen before an event is recorded as processed');
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

const goldenOrderAdapterMatch = source.match(
  /export const telemetryFromGoldenOrder = \([\s\S]*?\n\}\);/,
)?.[0];

if (!goldenOrderAdapterMatch) {
  throw new Error('Founder telemetry Golden Order adapter is missing');
}

for (const authoritativeField of ['id', 'occurredAt', 'authority', 'type']) {
  const pickPattern = new RegExp(`Pick<FounderCommerceTelemetryEvent,[^>]*'${authoritativeField}'`);
  if (pickPattern.test(goldenOrderAdapterMatch)) {
    throw new Error(`Golden Order adapter must not mint authoritative telemetry field: ${authoritativeField}`);
  }

  const returnedFieldPattern = new RegExp(`(?:^|\\n)\\s*${authoritativeField}\\s*:`);
  if (returnedFieldPattern.test(goldenOrderAdapterMatch)) {
    throw new Error(`Golden Order adapter return body must not mint authoritative telemetry field: ${authoritativeField}`);
  }
}

const goldenOrderPickFieldsBlock = goldenOrderAdapterMatch.match(
  /Pick<FounderCommerceTelemetryEvent,\s*([^>]+)>/,
)?.[1];

if (!goldenOrderPickFieldsBlock) {
  throw new Error('Golden Order telemetry adapter must declare an explicit Pick projection');
}

const goldenOrderPickFields = [...goldenOrderPickFieldsBlock.matchAll(/'([^']+)'/g)].map(
  (match) => match[1],
);
const expectedGoldenOrderProjectionFields = [
  'orderId',
  'corridor',
  'amount',
  'platformRevenue',
  'inventoryValue',
  'sellerPayable',
  'grossMargin',
];
const duplicateGoldenOrderProjectionFields = goldenOrderPickFields.filter(
  (field, index) => goldenOrderPickFields.indexOf(field) !== index,
);
const missingGoldenOrderProjectionFields = expectedGoldenOrderProjectionFields.filter(
  (field) => !goldenOrderPickFields.includes(field),
);
const unexpectedGoldenOrderProjectionFields = goldenOrderPickFields.filter(
  (field) => !expectedGoldenOrderProjectionFields.includes(field),
);

if (
  duplicateGoldenOrderProjectionFields.length > 0 ||
  missingGoldenOrderProjectionFields.length > 0 ||
  unexpectedGoldenOrderProjectionFields.length > 0 ||
  goldenOrderPickFields.length !== expectedGoldenOrderProjectionFields.length
) {
  throw new Error(
    `Golden Order telemetry projection drifted; duplicate: ${[...new Set(duplicateGoldenOrderProjectionFields)].join(', ') || 'none'}; missing: ${missingGoldenOrderProjectionFields.join(', ') || 'none'}; unexpected: ${unexpectedGoldenOrderProjectionFields.join(', ') || 'none'}`,
  );
}

const requiredGoldenOrderMappings = [
  'orderId: order.id',
  'corridor: order.corridor',
  'amount: order.gmv',
  'platformRevenue: order.tryammRevenue',
  'inventoryValue: order.inventoryValue',
  'sellerPayable: order.sellerPayableBalance',
  'grossMargin: order.grossMargin',
];

for (const mapping of requiredGoldenOrderMappings) {
  if (!goldenOrderAdapterMatch.includes(mapping)) {
    throw new Error(`Golden Order telemetry adapter mapping missing: ${mapping}`);
  }
}

const goldenOrderReturnBody = goldenOrderAdapterMatch.match(/=>\s*\(\{([\s\S]*?)\}\);/)?.[1];

if (!goldenOrderReturnBody) {
  throw new Error('Golden Order telemetry adapter must return an explicit object projection');
}

if (goldenOrderReturnBody.includes('...') || goldenOrderReturnBody.includes('[')) {
  throw new Error('Golden Order telemetry adapter return body must not use spreads or computed keys');
}

const returnedGoldenOrderFields = [
  ...goldenOrderReturnBody.matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm),
].map((match) => match[1]);
const duplicateReturnedGoldenOrderFields = returnedGoldenOrderFields.filter(
  (field, index) => returnedGoldenOrderFields.indexOf(field) !== index,
);
const missingReturnedGoldenOrderFields = expectedGoldenOrderProjectionFields.filter(
  (field) => !returnedGoldenOrderFields.includes(field),
);
const unexpectedReturnedGoldenOrderFields = returnedGoldenOrderFields.filter(
  (field) => !expectedGoldenOrderProjectionFields.includes(field),
);

if (
  duplicateReturnedGoldenOrderFields.length > 0 ||
  missingReturnedGoldenOrderFields.length > 0 ||
  unexpectedReturnedGoldenOrderFields.length > 0 ||
  returnedGoldenOrderFields.length !== expectedGoldenOrderProjectionFields.length
) {
  throw new Error(
    `Golden Order telemetry return body drifted; duplicate: ${[...new Set(duplicateReturnedGoldenOrderFields)].join(', ') || 'none'}; missing: ${missingReturnedGoldenOrderFields.join(', ') || 'none'}; unexpected: ${unexpectedReturnedGoldenOrderFields.join(', ') || 'none'}`,
  );
}

console.log('Founder commerce telemetry authority, descriptor-based exact state/KPI envelope, dense bounded unique state-list, fail-closed lookup, bounded canonical identifier, C0/C1 control-character, finite numeric, and exact Golden Order adapter projection/return-body/authority boundary contract passed');
