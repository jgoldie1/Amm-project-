import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/chicago77OpportunityFactory.ts', import.meta.url), 'utf8');
for (const term of [
  'BUSINESS DEMAND', 'JOB DEMAND', 'ACADEMY / SKILLS GAP', 'VERIFIED PASSPORT',
  'MATCH / CREATE BUSINESS', 'REAL PROVIDER / EMPLOYER GATE', 'neighborhoodCountTarget: 77',
  'configurationDoesNotEqualProductionPlayable: true', 'demandMayNotPromiseJob: true',
  'globalReplicationRequiresCountrySpecificRules: true',
]) assert.ok(source.includes(term), `Chicago 77 opportunity contract missing ${term}`);
console.log('Chicago 77 opportunity factory contract: ok');
