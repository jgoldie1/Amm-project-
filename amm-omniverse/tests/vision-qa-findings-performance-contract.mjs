import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/visionQaReleaseGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const maxRunFindingsDeclaration = 'const MAX_RUN_FINDINGS = 256;';
const capIndex = source.indexOf('run.findings.length > MAX_RUN_FINDINGS');
const filterIndex = source.indexOf('run.findings.filter(');
const criticalIdsIndex = source.indexOf('const criticalFindingIds = runFindings');
const evidenceLoopIndex = source.indexOf('for (const finding of runFindings)');

if (!source.includes(maxRunFindingsDeclaration)) {
  throw new Error('Vision QA findings performance contract must keep MAX_RUN_FINDINGS at the reviewed 256-entry limit');
}

if (capIndex === -1) {
  throw new Error('Vision QA findings performance contract missing MAX_RUN_FINDINGS enforcement');
}

for (const [label, index] of [
  ['per-finding validation', filterIndex],
  ['critical finding extraction', criticalIdsIndex],
  ['finding evidence traversal', evidenceLoopIndex],
]) {
  if (index === -1) {
    throw new Error(`Vision QA findings performance contract missing ${label}`);
  }

  if (capIndex > index) {
    throw new Error(`Vision QA findings cap must be enforced before ${label}`);
  }
}

if (!source.includes("missingEvidence.push('run.findingsTooLarge')")) {
  throw new Error('Vision QA oversized findings must fail closed');
}

if (source.includes('run.findings\n    .filter((finding) => finding.severity === \'critical\')')) {
  throw new Error('Critical finding extraction must use bounded runFindings, not raw run.findings');
}

console.log('vision-qa-findings-performance-contract: PASS');
