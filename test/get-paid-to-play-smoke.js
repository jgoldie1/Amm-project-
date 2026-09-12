'use strict';

const assert = require('assert');
const {
  PROGRAMS,
  STREETVERSE_ALPHA_MISSION,
  completedMissionStatus,
  validateStreetVerseAlphaCompletion,
} = require('../lib/get-paid-to-play-routes');

assert(PROGRAMS.streetverse_first_drop, 'StreetVerse reward program must exist');
assert.strictEqual(PROGRAMS.streetverse_first_drop.reward.holoCredits, 500);
assert.strictEqual(PROGRAMS.streetverse_first_drop.reward.xp, 200);
assert.strictEqual(PROGRAMS.streetverse_first_drop.reward.cashCents, 0, 'Normal mission must not create cash payout');
assert.strictEqual(PROGRAMS.streetverse_first_drop.cashEligible, false);
assert.strictEqual(PROGRAMS.streetverse_first_drop.evidence, 'streetverse_mission_run');
assert.strictEqual(STREETVERSE_ALPHA_MISSION.programMissionId, PROGRAMS.streetverse_first_drop.missionId);
assert.deepStrictEqual(STREETVERSE_ALPHA_MISSION.requiredCheckpoints, ['studio','market','river','stage']);
assert.strictEqual(completedMissionStatus('complete'), true, 'DB mission completion status must be accepted');
assert.strictEqual(completedMissionStatus('completed'), true, 'Legacy completed status remains compatible');
assert.strictEqual(completedMissionStatus('active'), false);

const alphaProof = validateStreetVerseAlphaCompletion({
  id: 'district-01-mobile-safe',
  source: 'streetverse-mobile-safe',
  visited: ['studio','market','river','stage'],
  total: 4,
});
assert.strictEqual(alphaProof.ok, true, 'Founder Alpha Chicago district should satisfy the mission proof contract');
assert.strictEqual(validateStreetVerseAlphaCompletion({
  id: 'district-01-mobile-safe',
  source: 'streetverse-mobile-safe',
  visited: ['studio','market','river'],
  total: 4,
}).ok, false, 'Incomplete checkpoint evidence must not become reward evidence');
assert.strictEqual(validateStreetVerseAlphaCompletion({
  id: 'district-01-mobile-safe',
  source: 'browser-forged-source',
  visited: ['studio','market','river','stage'],
  total: 4,
}).ok, false, 'Unexpected mission sources must be rejected');

assert(PROGRAMS.sponsored_mission_pool.cashEligible, 'Sponsored missions may be cash-eligible when separately funded');
assert.strictEqual(PROGRAMS.sponsored_mission_pool.funded, false, 'Cash program must ship unfunded by default');
assert.strictEqual(PROGRAMS.verified_skill_tournament.chanceBased, false);
assert(!PROGRAMS.verified_skill_tournament.allowedGames.includes('poker'), 'Poker must not be an allowed cash skill-tournament game');
assert(!PROGRAMS.verified_skill_tournament.allowedGames.includes('crown-poker-night'), 'Crown Poker Night must not be cash eligible');

for (const program of Object.values(PROGRAMS)) {
  assert(program.id && program.type && program.evidence, `Program ${program.id || 'unknown'} needs server contract metadata`);
  assert(Number(program.reward.xp) >= 0);
  assert(Number(program.reward.holoCredits) >= 0);
  assert(Number(program.reward.cashCents) >= 0);
  assert.strictEqual(program.chanceBased, false, `${program.id} must not be chance-based for this reward engine`);
}

console.log('Get Paid to Play authoritative mission contract smoke: PASS');
