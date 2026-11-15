import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');

const [
  governor,
  guardian,
  cast,
  volcano,
  bridge,
  network,
  speed,
  evidence,
] = await Promise.all([
  read('src/game/testing/completionGovernor.ts'),
  read('src/game/security/guardianGroup.ts'),
  read('src/game/story/streetverseCoreCast.ts'),
  read('src/game/input/volcanoGamingEngine2.ts'),
  read('src/game/input/volcanoControllerBridge2.ts'),
  read('src/game/network/quantumNetworkOptimizer.ts'),
  read('src/game/performance/quantumSpeedEngine.ts'),
  read('src/game/testing/districtEvidenceIngestion.ts'),
]);

assert.match(governor, /finish|expand|GREEN|BLOCKED/i);
assert.match(governor, /RECOVER/);

assert.match(guardian, /holoGuardian_minor_safety/);
assert.doesNotMatch(guardian, /holGuardian_minor_safety/);
assert.match(guardian, /cannot_create_money_inventory_or_paid_rewards/);
assert.match(guardian, /human_review/i);

for (const name of ['BJ', 'Al', 'Deon', 'Asia', 'Shawndell', 'Kenosha', 'Raymond J']) {
  assert.ok(cast.includes(name), `missing StreetVerse cast member: ${name}`);
}
assert.match(cast, /Meet the Stubbs/i);

assert.match(volcano, /one_hand/i);
assert.match(volcano, /panic/i);
assert.match(bridge, /bluetooth/i);
assert.match(network, /player_input/);
assert.match(network, /panic_mode/);
assert.match(speed, /mobile/i);
assert.match(speed, /xr/i);

assert.match(evidence, /evidence_must_match_exact_commit_and_build/);
assert.match(evidence, /money_security_cannot_be_overridden_by_ai_or_manual_green_flag/);

console.log('GREEN SLICE RECOVERY CONTRACT PASS');
