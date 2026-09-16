import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/businessJobsMetrics.ts', import.meta.url), 'utf8');
for (const term of [
  'verified_hires', 'businesses_launched', 'creator_businesses_launched',
  'simulationMayNotCountAsRealHire: true', 'sandboxBusinessMayNotCountAsRealBusinessLaunch: true',
  'providerEvidenceRequiredForRealPaymentMetric: true', 'aggregatedReportingPreferred: true',
]) assert.ok(source.includes(term), `business/jobs metrics contract missing ${term}`);
console.log('business/jobs metrics contract: ok');
