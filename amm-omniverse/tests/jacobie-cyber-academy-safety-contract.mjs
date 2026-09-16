import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/jacobieCyberAcademySafety.ts', import.meta.url), 'utf8');
for (const term of [
  'AUTHORIZED ISOLATED RANGE', 'DEFENSIVE CHALLENGES', 'VERIFIED SKILLS PROFILE', 'EMPLOYER INTEREST',
  'authorizedIsolatedRangeOnly: true', 'realWorldUnauthorizedTargetsProhibited: true',
  'employerInterestIsNotJobPromise: true', 'retentionAndDeletionControlsRequired: true',
]) assert.ok(source.includes(term), `Jacobie cyber academy contract missing ${term}`);
console.log('Jacobie cyber academy safety contract: ok');
