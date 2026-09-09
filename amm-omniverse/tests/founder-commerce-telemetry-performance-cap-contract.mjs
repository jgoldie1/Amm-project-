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
  denseShapePosition > itemScanPosition ||
  denseShapePosition > dedupePosition
) {
  throw new Error('Founder telemetry state-list validation must stay ordered: array check, cap, dense-shape scan, then item scan/deduplication');
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

const reducerStart = source.indexOf('export const reduceFounderCommerceTelemetry');
const reducerEnd = source.indexOf('export const telemetryFromGoldenOrder', reducerStart);
if (reducerStart < 0 || reducerEnd < 0) {
  throw new Error('Founder commerce telemetry reducer is missing');
}

const reducer = source.slice(reducerStart, reducerEnd);
const duplicateCheckPosition = reducer.indexOf('state.processedEventIds.includes(event.id)');
const appendCapCheckPosition = reducer.indexOf(
  'state.processedEventIds.length >= MAX_TELEMETRY_STATE_LIST_LENGTH',
);
const appendPosition = reducer.indexOf('processedEventIds: [...state.processedEventIds, event.id]');

if (duplicateCheckPosition < 0 || appendCapCheckPosition < 0 || appendPosition < 0) {
  throw new Error('Founder telemetry reducer is missing processed-event append cap protection');
}

if (duplicateCheckPosition > appendCapCheckPosition || appendCapCheckPosition > appendPosition) {
  throw new Error(
    'Founder telemetry reducer must dedupe first, reject new events at the processed-event cap, then append',
  );
}

console.log('Founder commerce telemetry bounded state-list performance and append-cap contract passed');
