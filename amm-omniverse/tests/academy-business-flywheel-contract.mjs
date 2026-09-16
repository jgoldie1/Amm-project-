import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/academyBusinessFlywheel.ts', import.meta.url), 'utf8');
for (const term of [
  'ASSESS SKILLS + ACCESS NEEDS', 'PRACTICE IN STREETVERSE', 'MATCH OPPORTUNITY OR CREATE BUSINESS',
  'HIRE / MENTOR NEXT PERSON', 'authorized carrier/agent commissions', 'Holo Ads / sponsorship',
  'revenueIsNotGuaranteed: true', 'jobsAreNotGuaranteed: true',
  'paymentSettlementRemainsProviderAuthoritative: true',
]) assert.ok(source.includes(term), `academy business flywheel missing ${term}`);
console.log('academy business flywheel contract: ok');
