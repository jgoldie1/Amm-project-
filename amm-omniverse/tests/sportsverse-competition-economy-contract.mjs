import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const file = path.resolve('src/gameplay/competitionEconomy.ts');
assert.ok(fs.existsSync(file), 'competition economy module must exist');
const source = fs.readFileSync(file, 'utf8');

for (const token of [
  'STREET_CREDIT',
  'REWARD',
  'PAYABLE',
  'spectatorBettingEnabled: false',
  'streetCreditCashConvertible: false',
  'playerFundedCashDefaultEnabled: false',
  'canEnterCompetition',
  'calculateVerifiedPrizes',
  'quoteStreetVerseExchange',
  'jurisdictionAllowList',
  'antiCheatEligible',
]) {
  assert.ok(source.includes(token), `missing contract token: ${token}`);
}

console.log('sportsverse competition economy contract: PASS');
