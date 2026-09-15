import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/visionQaReleaseGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const maxRunFindingsDeclaration = 'const MAX_RUN_FINDINGS = 256;';
const capIndex = source.indexOf('run.findings.length > MAX_RUN_FINDINGS');
const sparseScanIndex = source.indexOf('for (let index = 0; index < run.findings.length; index += 1)');
const sparseOwnPropertyIndex = source.indexOf('Object.prototype.hasOwnProperty.call(run.findings, index)');
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
  ['allocation-free sparse findings scan', sparseScanIndex],
  ['sparse findings ownership check', sparseOwnPropertyIndex],
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

if (sparseScanIndex > filterIndex || sparseOwnPropertyIndex > filterIndex) {
  throw new Error('Sparse findings validation must run before per-finding filtering');
}

if (source.includes('Array.from(run.findings)')) {
  throw new Error('Sparse findings validation must not allocate a temporary Array.from copy');
}

if (!source.includes("missingEvidence.push('run.findingsTooLarge')")) {
  throw new Error('Vision QA oversized findings must fail closed');
}

if (!source.includes("missingEvidence.push('run.findingsSparse')")) {
  throw new Error('Vision QA sparse findings must fail closed');
}

if (source.includes('run.findings\n    .filter((finding) => finding.severity === \'critical\')')) {
  throw new Error('Critical finding extraction must use bounded runFindings, not raw run.findings');
}

console.log('vision-qa-findings-performance-contract: PASS');
