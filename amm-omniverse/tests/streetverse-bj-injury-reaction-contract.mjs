import fs from 'node:fs'
import assert from 'node:assert/strict'
const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseBJInjuryReactionRuntime.ts',import.meta.url),'utf8')
const world=fs.readFileSync(new URL('../src/components/StreetVerseMobileWorld.tsx',import.meta.url),'utf8')
for(const pose of ['neutral','stagger','guard','limp','recover'])assert.ok(runtime.includes("'"+pose+"'"),'Missing reaction pose '+pose)
assert.match(runtime,/state\.health<=40&&!rescueSent/,'Medical rescue should trigger once per severe injury')
assert.match(runtime,/speedMultiplier=state\.health<=20/,'Injury must calculate reduced movement speed')
assert.match(world,/bjReaction\.onInjury\(kind,performance\.now\(\)\)/,'Damage must activate reaction')
assert.match(world,/bjReaction\.frame\(bjInjury,now\)/,'Reactions must update on animation clock')
assert.match(world,/nativeHero\.rotation\.z=activeCar\?0:reaction\.tilt/,'Injury pose must not tilt driver')
assert.match(world,/tryamm:streetverse-bj-rescue-request/,'Severe injury must signal rescue')
assert.match(world,/11\*heroBodyMovementScale\*bjReaction\.movementMultiplier\(bjInjury\)/,'Injury speed penalty must affect actual player movement')
assert.match(runtime,/movementMultiplier\(state:BJInjuryState\)/,'Movement lookup must not consume one-time rescue notification')
console.log('BJ injury reaction contract PASS')
