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
  'hasDataOnlyEvidenceFields',
  'ROLLOUT_EVIDENCE_FIELDS',
  'Object.getOwnPropertyDescriptor',
  "typeof value !== 'string'",
  'Array.isArray(evidenceIds)',
  'Date.parse(verifiedAt)',
  'new Date(timestamp).toISOString()',
  'Date.now()',
  'DEFAULT_MAX_EVIDENCE_AGE_MS',
  'MAX_CANONICAL_ID_LENGTH',
  'MAX_EVIDENCE_IDS',
  'CONTROL_CHARACTER_PATTERN',
  'Object.getPrototypeOf(evidence)',
  'maxEvidenceAgeMs',
  'nowMs - timestamp <= maxEvidenceAgeMs',
  "typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)",
  "missingEvidence: ['illinoisEvidenceInvalid']",
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

const expectedBooleanEvidence = [
  'paidOrderVerified',
  'settlementReconciled',
  'inventoryReconciled',
  'shipmentReconciled',
  'founderKpisComplete',
  'streetVerseAuthorityBoundaryVerified',
  'visionQaReleaseGatePassed',
  'performanceGatePassed',
  'accessibilityGatePassed',
];

const declaredBooleanEvidence = requiredBooleanBlock?.[1]
  .match(/'([^']+)'/g)
  ?.map((value) => value.slice(1, -1));

if (
  !declaredBooleanEvidence ||
  declaredBooleanEvidence.length !== expectedBooleanEvidence.length ||
  expectedBooleanEvidence.some((key, index) => declaredBooleanEvidence[index] !== key)
) {
  throw new Error(
    `Illinois rollout gate required boolean evidence drifted: expected ${expectedBooleanEvidence.join(', ')}`,
  );
}

if (!/REQUIRED_BOOLEAN_EVIDENCE\.filter\(\s*\(key\)\s*=>\s*evidence\[key\]\s*!==\s*true,?\s*\)/.test(source)) {
  throw new Error(
    'Illinois rollout gate must require literal true for every boolean proof instead of accepting truthy values.',
  );
}

const rolloutEvidenceFieldsBlock = source.match(
  /const ROLLOUT_EVIDENCE_FIELDS[\s\S]*?= \[([\s\S]*?)\];/,
);
if (!rolloutEvidenceFieldsBlock) {
  throw new Error('Illinois rollout gate must declare its serialized evidence field allowlist.');
}

const declaredLiteralEvidenceFields = rolloutEvidenceFieldsBlock[1]
  .match(/'([^']+)'/g)
  ?.map((value) => value.slice(1, -1)) ?? [];
const expectedLiteralEvidenceFields = ['goldenOrderId', 'evidenceIds', 'verifiedAt'];
if (
  declaredLiteralEvidenceFields.length !== expectedLiteralEvidenceFields.length ||
  expectedLiteralEvidenceFields.some((key, index) => declaredLiteralEvidenceFields[index] !== key) ||
  !rolloutEvidenceFieldsBlock[1].includes('...REQUIRED_BOOLEAN_EVIDENCE')
) {
  throw new Error(
    'Illinois rollout gate serialized evidence field allowlist drifted from the reviewed Illinois proof envelope.',
  );
}

if (!/typeof evidence\s*!==\s*['\"]object['\"]\s*\|\|\s*evidence\s*===\s*null\s*\|\|\s*Array\.isArray\(evidence\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject malformed evidence envelopes before field access.');
}

if (!/Object\.getPrototypeOf\(evidence\)/.test(source)) {
  throw new Error('Illinois rollout gate must inspect the evidence prototype before reading proof fields.');
}

if (!/evidencePrototype\s*!==\s*Object\.prototype\s*&&\s*evidencePrototype\s*!==\s*null/.test(source)) {
  throw new Error('Illinois rollout gate must reject custom-prototype evidence envelopes.');
}

if (!/Object\.getOwnPropertyDescriptor\(evidence, key\)/.test(source)) {
  throw new Error('Illinois rollout gate must inspect own property descriptors before reading proof fields.');
}

if (!/descriptor\s*===\s*undefined\s*\|\|\s*\(['\"]value['\"]\s+in\s+descriptor/.test(source)) {
  throw new Error('Illinois rollout gate must allow only data descriptors for serialized evidence fields.');
}

if (!/if\s*\(!hasDataOnlyEvidenceFields\(evidence\)\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject accessor-backed evidence before proof field access.');
}

const evaluateGateBlock = source.match(
  /export const evaluateIllinoisToUnitedStatesGate[\s\S]*?(?=\/\*\*)/,
)?.[0];
if (
  !evaluateGateBlock ||
  !/if\s*\(!hasDataOnlyEvidenceFields\(evidence\)\)[\s\S]*?REQUIRED_BOOLEAN_EVIDENCE\.filter\([\s\S]*?evidence\[key\]/.test(
    evaluateGateBlock,
  )
) {
  throw new Error(
    'Illinois rollout gate must validate data-only descriptors before reading boolean proof fields.',
  );
}

if (!/missingEvidence:\s*\[['\"]illinoisEvidenceInvalid['\"]\]/.test(source)) {
  throw new Error('Illinois rollout gate must fail closed with an explicit invalid-envelope signal.');
}

if (!/typeof value\s*!==\s*['\"]string['\"]/.test(source)) {
  throw new Error('Illinois rollout gate must reject non-string identifiers before trimming them.');
}

if (!/trimmed\.length\s*>\s*0/.test(source) || !/trimmed\s*===\s*value/.test(source)) {
  throw new Error('Illinois rollout gate must require canonical non-whitespace-padded identifiers.');
}

if (!/trimmed\.length\s*<=\s*MAX_CANONICAL_ID_LENGTH/.test(source)) {
  throw new Error('Illinois rollout gate must bound canonical identifier length.');
}

if (!/CONTROL_CHARACTER_PATTERN\.test\(value\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject control characters in canonical identifiers.');
}

if (!/Array\.isArray\(evidenceIds\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject non-array evidence ID collections.');
}

if (!/Object\.getPrototypeOf\(evidenceIds\)\s*!==\s*Array\.prototype/.test(source)) {
  throw new Error('Illinois rollout gate must reject custom-prototype evidence ID arrays.');
}

if (!/Object\.getOwnPropertyDescriptor\(evidenceIds, ['\"]length['\"]\)/.test(source)) {
  throw new Error('Illinois rollout gate must inspect the evidence ID array length descriptor.');
}

if (!/lengthDescriptor\.value\s*>\s*MAX_EVIDENCE_IDS/.test(source)) {
  throw new Error('Illinois rollout gate must enforce a bounded evidence ID count.');
}

if (!/Object\.getOwnPropertyDescriptor\(evidenceIds, String\(index\)\)/.test(source)) {
  throw new Error('Illinois rollout gate must inspect each evidence ID element descriptor before reading it.');
}

if (!/descriptor\.enumerable\s*!==\s*true/.test(source)) {
  throw new Error('Illinois rollout gate must reject non-enumerable evidence IDs that would disappear during serialization.');
}

if (!/hasCanonicalId\(descriptor\.value\)/.test(source)) {
  throw new Error('Illinois rollout gate must apply canonical identifier validation to every evidence ID data value.');
}

if (!/Reflect\.ownKeys\(evidenceIds\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject hidden or unexpected evidence ID array properties.');
}

if (!/hasCanonicalId\(evidence\.goldenOrderId\)/.test(source)) {
  throw new Error('Illinois rollout gate must require a canonical Golden Order identifier.');
}

if (!/new Set\(reviewedIds\)\.size === reviewedIds\.length/.test(source)) {
  throw new Error('Illinois rollout gate must reject duplicate reviewed evidence identifiers.');
}

if (!/Number\.isFinite\(timestamp\)/.test(source)) {
  throw new Error('Illinois rollout gate must require a parseable verification timestamp.');
}

if (!/verifiedAt\s*!==\s*verifiedAt\.trim\(\)/.test(source)) {
  throw new Error('Illinois rollout gate must reject whitespace-padded verification timestamps.');
}

if (!/new Date\(timestamp\)\.toISOString\(\)\s*!==\s*verifiedAt/.test(source)) {
  throw new Error('Illinois rollout gate must require canonical ISO-8601 UTC verification timestamps.');
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
