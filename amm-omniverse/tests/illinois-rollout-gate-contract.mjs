import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourcePath = path.join(root, 'src/foundation/illinoisRolloutGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const requiredSignals = [
  'paidOrderVerified',
  'settlementReconciled',
  'inventoryReconciled',
  'shipmentReconciled',
  'founderKpisComplete',
  'streetVerseAuthorityBoundaryVerified',
  'performanceGatePassed',
  'accessibilityGatePassed',
  'goldenOrderId',
  'evidenceIds',
  'verifiedAt',
  "nextScope: missingEvidence.length === 0 ? 'united-states' : undefined",
  "'national-expansion-evidence-not-yet-defined'",
  "'world-is-terminal-rollout-scope'",
];

for (const signal of requiredSignals) {
  if (!source.includes(signal)) {
    throw new Error(`Illinois rollout gate contract missing required signal: ${signal}`);
  }
}

if (/source\s*===?\s*['\"]streetverse['\"]\s*&&\s*authoritative\s*===?\s*true/.test(source)) {
  throw new Error('Illinois rollout gate must not grant StreetVerse authoritative commerce mutation rights.');
}

console.log('Illinois rollout gate contract passed.');
