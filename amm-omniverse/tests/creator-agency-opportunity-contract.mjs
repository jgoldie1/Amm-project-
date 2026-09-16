import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/creatorAgencyOpportunityRules.ts', import.meta.url), 'utf8');
for (const term of [
  'creator commerce', 'validAgreementRequired: true', 'agencyMayNotSeizeCreatorFunds: true',
  'agencyMayNotSilentlyAlterCommission: true', 'settlementProviderAuthoritative: true',
  'clientMaySettleRealMoney: false', 'familyGroupMayNotAutoEnrollAgency: true',
]) assert.ok(source.includes(term), `creator agency contract missing ${term}`);
console.log('creator agency opportunity contract: ok');
