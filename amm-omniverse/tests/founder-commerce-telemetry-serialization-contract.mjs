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

console.log('Founder commerce telemetry serialization contract passed: state and KPI fields remain enumerable data properties');
