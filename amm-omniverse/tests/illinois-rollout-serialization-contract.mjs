import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const source = fs.readFileSync(
  path.join(process.cwd(), 'src/foundation/illinoisRolloutGate.ts'),
  'utf8',
);

const helper = source.match(
  /const hasDataOnlyEvidenceFields[\s\S]*?\n};/,
)?.[0];

if (!helper) {
  throw new Error('Illinois rollout gate must retain its proof descriptor guard.');
}

if (!/Object\.getOwnPropertyDescriptor\(evidence, key\)/.test(helper)) {
  throw new Error('Illinois rollout gate must inspect each reviewed top-level proof field descriptor.');
}

if (!/descriptor\.enumerable\s*===\s*true/.test(helper)) {
  throw new Error(
    'Illinois rollout gate must reject non-enumerable reviewed proof fields that disappear during serialization.',
  );
}

const evaluateBlock = source.match(
  /export const evaluateIllinoisToUnitedStatesGate[\s\S]*?(?=\/\*\*)/,
)?.[0];

if (
  !evaluateBlock ||
  !/hasDataOnlyEvidenceFields\(evidence\)[\s\S]*?REQUIRED_BOOLEAN_EVIDENCE\.filter/.test(evaluateBlock)
) {
  throw new Error('Illinois rollout gate must validate serializable proof descriptors before reading boolean evidence.');
}

console.log('Illinois rollout serialization contract passed.');
