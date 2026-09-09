import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/visionQaReleaseGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const capSnippet = 'evidence.inspectedAreas.length > MAX_INSPECTED_AREAS';
const iterationSnippet = 'evidence.inspectedAreas.entries()';
const invalidEntrySnippet = "typeof inspectedArea !== 'string' || !VISION_QA_AREA_SET.has(inspectedArea)";
const invalidEvidenceSnippet = 'inspectedAreaInvalid:${index}';

for (const snippet of [capSnippet, iterationSnippet, invalidEntrySnippet, invalidEvidenceSnippet]) {
  if (!source.includes(snippet)) {
    throw new Error(`Vision QA inspected-area sparse contract missing: ${snippet}`);
  }
}

const capIndex = source.indexOf(capSnippet);
const iterationIndex = source.indexOf(iterationSnippet);
const invalidEntryIndex = source.indexOf(invalidEntrySnippet);

if (capIndex > iterationIndex || iterationIndex > invalidEntryIndex) {
  throw new Error('Vision QA inspected-area validation must remain cap -> indexed iteration -> entry validation');
}

// Array.prototype.entries() yields undefined for a sparse slot. The required
// string/registry check therefore rejects holes instead of treating them as
// evidence that an Illinois QA area was inspected.
console.log('vision-qa-inspected-area-sparse-contract: PASS');
