import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/foundation/youthFamilyAcademySafety.ts', import.meta.url), 'utf8');
for (const term of [
  'DJ / radio', 'coding / AI', 'entrepreneurship', 'ageAppropriateDiscovery: true',
  'familyGroupMayNotAutoEnrollAgency: true', 'agencyMayNotSeizeFunds: true',
  'commissionSplitRequiresValidAgreement: true', 'youthDataMinimizationRequired: true',
]) assert.ok(source.includes(term), `youth/family academy contract missing ${term}`);
console.log('youth/family academy safety contract: ok');
