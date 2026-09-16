import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../src/foundation/opportunityCenterFoundation.ts', import.meta.url), 'utf8');

for (const term of [
  'MiddleVerse Work-From-Home Support',
  'StreetVerse Business Scout',
  'Holo FON Agent / Dealer',
  'All American Store Operator',
  'All American Beauty Operator',
  'YAHAVAH Food Seller',
  'Warehouse / Delivery',
  'CHOOSE BUSINESS',
  'SKILLS + BUSINESS PASSPORT',
  'HOLO ADS + LIVE/PK PROMOTION',
  'POST REAL JOB',
  'MATCH VERIFIED SKILLS',
  'aiMayPromiseEmployment: false',
  'clientMayMarkWorkerPaid: false',
  'authorizedProviderRequiredForRealPayment: true',
]) assert.ok(source.includes(term), `opportunity contract missing ${term}`);

console.log('opportunity center contract: ok');
