import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/skillsTalentPassportFoundation.ts', import.meta.url), 'utf8');
for (const term of [
  "'self-reported'", "'issuer-verified'", 'aiMayInventEvidence: false',
  'courseCompleteIsNotExternalLicense: true', 'expiredCredentialMayNotBePresentedAsCurrent: true',
  'collectOnlyNecessaryPersonalData: true', 'MiddleVerse Jobs', 'Hire From StreetVerse', 'Create My Business',
]) assert.ok(source.includes(term), `skills passport missing ${term}`);
console.log('skills/talent passport contract: ok');
