import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourcePath = path.join(root, 'src/foundation/illinoisRolloutGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const capMatch = source.match(/const MAX_EVIDENCE_IDS\s*=\s*(\d+)\s*;/);
if (!capMatch) {
  throw new Error('Illinois rollout gate must declare a numeric MAX_EVIDENCE_IDS performance cap.');
}

const cap = Number(capMatch[1]);
if (!Number.isSafeInteger(cap) || cap < 1 || cap > 128) {
  throw new Error(`Illinois rollout evidence ID cap must stay within the reviewed 1..128 range; received ${cap}.`);
}

const validatorBlock = source.match(/const hasValidEvidenceIds[\s\S]*?(?=\n};\n\nconst hasValidVerificationTimestamp)/)?.[0];
if (!validatorBlock) {
  throw new Error('Illinois rollout gate evidence ID validator was not found.');
}

const capCheckIndex = validatorBlock.indexOf('lengthDescriptor.value > MAX_EVIDENCE_IDS');
const iterationIndex = validatorBlock.indexOf('for (let index = 0; index < lengthDescriptor.value; index += 1)');
if (capCheckIndex < 0 || iterationIndex < 0 || capCheckIndex > iterationIndex) {
  throw new Error('Illinois rollout gate must enforce the evidence ID cap before iterating reviewed IDs.');
}

console.log('Illinois rollout performance cap contract passed.');
