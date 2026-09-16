import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyReleaseChecklist.ts', import.meta.url), 'utf8');
for (const term of [
  'production UI wired', 'persistent backend wired', 'accessibility QA passes', 'mobile QA passes',
  'contractsAloneDoNotMeanLive: true', 'realJobsRequireEmployerEvidence: true',
  'realPaymentsRequireProviderEvidence: true', 'thirdPartyCredentialsRequireIssuerEvidence: true',
]) assert.ok(source.includes(term), `academy release checklist missing ${term}`);
console.log('academy release checklist contract: ok');
