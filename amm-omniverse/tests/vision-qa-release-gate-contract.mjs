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
  'VISION_QA_AREAS',
  'VISION_QA_AREA_SET',
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
  'evidence.inspectedAreas.entries()',
  "typeof inspectedArea !== 'string' || !VISION_QA_AREA_SET.has(inspectedArea)",
  'inspectedAreaInvalid:${index}',
  'inspectedArea:${area}',
  'evidenceRefs',
  'evidenceRefSet',
  'new Set<string>()',
  'evidenceRefSet.has(evidenceRef)',
  'evidenceRefDuplicate:${evidenceRef}',
  'evidenceRefSet.add(evidenceRef)',
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
  'VisionQaFinding',
  'findingIdSet',
  'findingIdSet.has(finding.id)',
  'findingIdSet.add(finding.id)',
  'run.findingIdDuplicate:${finding.id}',
  'runFindings',
  'Array.isArray(evidence.run?.findings)',
  "typeof finding !== 'object' || finding === null || Array.isArray(finding)",
  'run.findingInvalid:${index}',
  "typeof finding.id !== 'string' || !finding.id.trim() || finding.id.trim() !== finding.id",
  'run.findingIdInvalid:${index}',
  'VISION_QA_AREA_SET.has(finding.area)',
  'run.findingAreaInvalid:${index}',
  "finding.severity !== 'info' && finding.severity !== 'warning' && finding.severity !== 'critical'",
  'run.findingSeverityInvalid:${index}',
  'run.findingsInvalid',
  'criticalFindingIds',
  "finding.evidenceRef != null && typeof finding.evidenceRef !== 'string'",
  'findingEvidenceRef:',
  'findingEvidenceRefInvalid:',
  'evidenceRefSet.has(normalizedFindingEvidenceRef)',
  'findingEvidenceRefUnlinked:',
  'normalizedFindingEvidenceRef !== finding.evidenceRef',
  'allowed: missingEvidence.length === 0 && criticalFindingIds.length === 0',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`Vision QA release gate contract missing: ${snippet}`);
  }
}

const requiredAreasBlock = source.match(
  /ILLINOIS_VISION_QA_REQUIRED_AREAS[^=]*=\s*\[([\s\S]*?)\]\s*as const/,
)?.[1];

if (!requiredAreasBlock) {
  throw new Error('Vision QA release gate contract could not parse Illinois required areas');
}

const requiredAreaEntries = [...requiredAreasBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
const duplicateRequiredAreas = requiredAreaEntries.filter(
  (area, index) => requiredAreaEntries.indexOf(area) !== index,
);

if (duplicateRequiredAreas.length > 0) {
  throw new Error(
    `Vision QA release gate contains duplicate Illinois required areas: ${[...new Set(duplicateRequiredAreas)].join(', ')}`,
  );
}

if (!source.includes('cannot mutate') || !source.includes('authoritative commerce')) {
  throw new Error('Vision QA release gate must preserve commerce authority separation');
}

console.log('vision-qa-release-gate-contract: PASS');
