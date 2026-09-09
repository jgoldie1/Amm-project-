import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/visionQaReleaseGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const capCheck = 'evidence.evidenceRefs.length > MAX_RELEASE_EVIDENCE_REFS';
const iteration = 'evidence.evidenceRefs.entries()';
const typeGuard = "typeof evidenceRef !== 'string'";
const invalidMarker = 'evidenceRefInvalid:${index}';

for (const snippet of [capCheck, iteration, typeGuard, invalidMarker]) {
  if (!source.includes(snippet)) {
    throw new Error(`Vision QA sparse evidence-ref contract missing: ${snippet}`);
  }
}

const capIndex = source.indexOf(capCheck);
const iterationIndex = source.indexOf(iteration);
const typeGuardIndex = source.indexOf(typeGuard);

if (capIndex > iterationIndex || iterationIndex > typeGuardIndex) {
  throw new Error('Vision QA evidence-ref validation order must remain cap -> indexed iteration -> type validation');
}

const sparseEvidenceRefs = new Array(1);
const firstSparseEntry = sparseEvidenceRefs.entries().next().value;

if (!firstSparseEntry || firstSparseEntry[0] !== 0 || firstSparseEntry[1] !== undefined) {
  throw new Error('Runtime assumption changed: sparse array entries must surface holes as undefined values');
}

if (typeof firstSparseEntry[1] === 'string') {
  throw new Error('Sparse Vision QA evidence refs must not satisfy the string evidence-ref contract');
}

console.log('vision-qa-evidence-refs-sparse-contract: PASS');
