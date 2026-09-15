import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const telemetryPath = path.join(root, 'src/foundation/founderCommerceTelemetry.ts');

if (!fs.existsSync(telemetryPath)) {
  throw new Error('Founder commerce telemetry foundation file is missing');
}

const source = fs.readFileSync(telemetryPath, 'utf8');

const stateShapeMatch = source.match(
  /const hasPlainFounderTelemetryStateShape = \([\s\S]*?\n\};/,
)?.[0];

if (!stateShapeMatch) {
  throw new Error('Founder telemetry state-shape guard is missing');
}

for (const protection of [
  'Object.getOwnPropertyDescriptor(state, key)',
  "'value' in descriptor!",
  'descriptor!.enumerable === true',
]) {
  if (!stateShapeMatch.includes(protection)) {
    throw new Error(`Founder telemetry state fields must remain enumerable data properties: ${protection}`);
  }
}

const kpiShapeMatch = source.match(
  /const hasExactFiniteKpiShape = \([\s\S]*?\n\};/,
)?.[0];

if (!kpiShapeMatch) {
  throw new Error('Founder telemetry KPI-shape guard is missing');
}

for (const protection of [
  'Object.getOwnPropertyDescriptor(kpis, kpi)',
  "'value' in descriptor!",
  'descriptor!.enumerable === true',
  "typeof descriptor!.value === 'number'",
  'Number.isFinite(descriptor!.value)',
]) {
  if (!kpiShapeMatch.includes(protection)) {
    throw new Error(`Founder telemetry KPI fields must remain enumerable finite data properties: ${protection}`);
  }
}

const listShapeMatch = source.match(
  /const hasPlainDenseTelemetryArrayShape = \([\s\S]*?\n\};/,
)?.[0];

if (!listShapeMatch) {
  throw new Error('Founder telemetry list-shape guard is missing');
}

for (const protection of [
  'Object.getPrototypeOf(values) !== Array.prototype',
  'const ownKeys = Reflect.ownKeys(values)',
  'ownKeys.length !== values.length + 1',
  "ownKeys[ownKeys.length - 1] !== 'length'",
  'ownKeys[index] !== String(index)',
  "Object.getOwnPropertyDescriptor(values, String(index))",
  "!('value' in descriptor)",
]) {
  if (!listShapeMatch.includes(protection)) {
    throw new Error(`Founder telemetry lists must remain plain, dense data-property arrays: ${protection}`);
  }
}

console.log('Founder commerce telemetry serialization contract passed: state, KPI, and list fields remain plain enumerable data properties');
