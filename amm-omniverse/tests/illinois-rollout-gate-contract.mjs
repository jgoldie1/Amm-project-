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
  'visionQaReleaseGatePassed',
  'performanceGatePassed',
  'accessibilityGatePassed',
  'goldenOrderId',
  'evidenceIds',
  'verifiedAt',
  'hasCanonicalId',
  'hasValidEvidenceIds',
  'hasValidVerificationTimestamp',
  'Date.parse(verifiedAt)',
  'Date.now()',
  'DEFAULT_MAX_EVIDENCE_AGE_MS',
  'maxEvidenceAgeMs',
  'nowMs - timestamp <= maxEvidenceAgeMs',
  "nextScope: missingEvidence.length === 0 ? 'united-states' : undefined",
  "'national-expansion-evidence-not-yet-defined'",
  "'world-is-terminal-rollout-scope'",
];

for (const signal of requiredSignals) {
  if (!source.includes(signal)) {
    throw new Error(`Illinois rollout gate contract missing required signal: ${signal}`);
  }
}

const requiredBooleanBlock = source.match(/const REQUIRED_BOOLEAN_EVIDENCE[\s\S]*?= \[([\s\S]*?)\];/);
if (!requiredBooleanBlock || !requiredBooleanBlock[1].includes("'visionQaReleaseGatePassed'")) {
  throw new Error('Illinois rollout gate must require a passing Vision-assisted AAA release gate.');
}

if (!/trimmed\.length\s*>\s*0\s*&&\s*trimmed\s*===\s*value/.test(source)) {
  throw new Error('Illinois rollout gate must require canonical non-whitespace-padded identifiers.');
}

if (!/evidenceIds\.some\(\(id\) => !hasCanonicalId\(id\)\)/.test(source)) {
  throw new Error('Illinois rollout gate must apply canonical identifier validation to every evidence ID.');
}

if (!/hasCanonicalId\(evidence\.goldenOrderId\)/.test(source)) {
  throw new Error('Illinois rollout gate must require a canonical Golden Order identifier.');
}

if (!/new Set\(evidenceIds\)\.size === evidenceIds\.length/.test(source)) {
  throw new Error('Illinois rollout gate must reject duplicate evidence identifiers.');
}

if (!/Number\.isFinite\(timestamp\)/.test(source)) {
  throw new Error('Illinois rollout gate must require a parseable verification timestamp.');
}

if (!/timestamp\s*>\s*nowMs/.test(source)) {
  throw new Error('Illinois rollout gate must reject future-dated verification evidence.');
}

if (!/nowMs\s*-\s*timestamp\s*<=\s*maxEvidenceAgeMs/.test(source)) {
  throw new Error('Illinois rollout gate must reject stale verification evidence.');
}

if (!/maxEvidenceAgeMs\s*<\s*0/.test(source)) {
  throw new Error('Illinois rollout gate must reject invalid negative freshness windows.');
}

if (/source\s*===?\s*['\"]streetverse['\"]\s*&&\s*authoritative\s*===?\s*true/.test(source)) {
  throw new Error('Illinois rollout gate must not grant StreetVerse authoritative commerce mutation rights.');
}

console.log('Illinois rollout gate contract passed.');
