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
  'BUILD_SHA_PATTERN',
  '/^[0-9a-f]{7,64}$/i',
  "typeof evidence !== 'object' || evidence === null || Array.isArray(evidence)",
  "missingEvidence: ['evidenceInvalid']",
  'expectedBuildSha',
  "typeof evidence.expectedBuildSha === 'string'",
  "typeof evidence.expectedBuildSha !== 'string'",
  'expectedBuildShaInvalid',
  'runBuildShaValue',
  "typeof runBuildShaValue === 'string'",
  "typeof runBuildShaValue !== 'string'",
  'run.buildShaInvalid',
  'buildShaMismatch',
  'Array.isArray(evidence.inspectedAreas)',
  'inspectedAreasInvalid',
  'inspectedArea:${area}',
  'evidenceRefs',
  'Array.isArray(evidence.evidenceRefs)',
  'evidenceRefsInvalid',
  "typeof evidenceRef !== 'string'",
  'evidenceRef:${index}',
  'evidenceRefInvalid:${index}',
  'normalizedEvidenceRef !== evidenceRef',
  'verifiedAt',
  "typeof evidence.verifiedAt !== 'string'",
  'verifiedAtInvalid',
  'Date.parse(verifiedAt)',
  'new Date(verifiedAtMs).toISOString() !== verifiedAt',
  'verifiedAt !== evidence.verifiedAt',
  'runFindings',
  'Array.isArray(evidence.run?.findings)',
  'run.findingsInvalid',
  'criticalFindingIds',
  "finding.evidenceRef != null && typeof finding.evidenceRef !== 'string'",
  'findingEvidenceRef:',
  'findingEvidenceRefInvalid:',
  'normalizedFindingEvidenceRef !== finding.evidenceRef',
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
