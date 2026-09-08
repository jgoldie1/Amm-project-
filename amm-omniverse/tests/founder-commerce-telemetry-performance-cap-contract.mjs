import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const telemetryPath = path.join(root, 'src/foundation/founderCommerceTelemetry.ts');

if (!fs.existsSync(telemetryPath)) {
  throw new Error('Founder commerce telemetry foundation file is missing');
}

const source = fs.readFileSync(telemetryPath, 'utf8');

const capDeclaration = 'const MAX_TELEMETRY_STATE_LIST_LENGTH = 4096;';
const validatorStart = source.indexOf('const isCanonicalUniqueTelemetryTextList');
const validatorEnd = source.indexOf('const hasValidFounderTelemetryStateEnvelope', validatorStart);

if (!source.includes(capDeclaration)) {
  throw new Error('Founder telemetry state list cap must remain explicitly bounded at 4096');
}

if (validatorStart < 0 || validatorEnd < 0) {
  throw new Error('Founder telemetry canonical state-list validator is missing');
}

const validator = source.slice(validatorStart, validatorEnd);
const arrayCheckPosition = validator.indexOf('Array.isArray(values)');
const capCheckPosition = validator.indexOf('values.length <= MAX_TELEMETRY_STATE_LIST_LENGTH');
const denseShapePosition = validator.indexOf('hasPlainDenseTelemetryArrayShape(values)');
const itemScanPosition = validator.indexOf('values.every(isCanonicalTelemetryText)');
const dedupePosition = validator.indexOf('new Set(values).size === values.length');

if (
  arrayCheckPosition < 0 ||
  capCheckPosition < 0 ||
  denseShapePosition < 0 ||
  itemScanPosition < 0 ||
  dedupePosition < 0
) {
  throw new Error('Founder telemetry state-list validator is missing a required bounded-validation stage');
}

if (
  arrayCheckPosition > capCheckPosition ||
  capCheckPosition > denseShapePosition ||
  capCheckPosition > itemScanPosition ||
  capCheckPosition > dedupePosition
) {
  throw new Error('Founder telemetry state-list cap must be checked before structural scanning, item scanning, or deduplication');
}

for (const stateList of [
  'processedEventIds',
  'orderIds',
  'supplierIds',
  'countries',
  'corridors',
]) {
  if (!source.includes(`isCanonicalUniqueTelemetryTextList(state.${stateList})`)) {
    throw new Error(`Founder telemetry state list is not protected by the bounded validator: ${stateList}`);
  }
}

console.log('Founder commerce telemetry bounded state-list performance contract passed');
