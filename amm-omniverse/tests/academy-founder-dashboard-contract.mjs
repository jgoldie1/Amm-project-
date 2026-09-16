import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyFounderDashboard.ts', import.meta.url), 'utf8');
for (const term of [
  'Streamers Academy', 'MiddleVerse Jobs', "'LIVE', 'READY', 'BUILDING', 'LOCKED', 'COMING SOON'",
  'provider/employer', 'real business launches', 'verified hires', 'statusRequiresEvidence: true',
  'previewDoesNotMeanProduction: true', 'simulatedOutcomeDoesNotMeanRealOutcome: true',
]) assert.ok(source.includes(term), `academy founder dashboard missing ${term}`);
console.log('academy founder dashboard contract: ok');
