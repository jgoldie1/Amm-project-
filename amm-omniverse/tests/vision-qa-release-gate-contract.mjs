import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/visionQaReleaseGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const requiredSnippets = [
  'ILLINOIS_VISION_QA_REQUIRED_AREAS',
  "'vehicle-orientation-and-physics'",
  "'crowd-density-and-behavior'",
  "'traffic-flow'",
  "'accessibility-contrast-and-legibility'",
  "'collision-and-clipping'",
  "'world-population-gaps'",
  'expectedBuildSha',
  'buildShaMismatch',
  'evidenceRefs',
  'verifiedAt',
  'criticalFindingIds',
  'findingEvidenceRef:',
  'allowed: missingEvidence.length === 0 && criticalFindingIds.length === 0',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`Vision QA release gate contract missing: ${snippet}`);
  }
}

if (!source.includes('cannot mutate') || !source.includes('authoritative commerce')) {
  throw new Error('Vision QA release gate must preserve commerce authority separation');
}

console.log('vision-qa-release-gate-contract: PASS');
