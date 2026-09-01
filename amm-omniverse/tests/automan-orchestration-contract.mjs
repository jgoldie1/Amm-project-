import fs from 'node:fs'
import assert from 'node:assert/strict'

const runtime=fs.readFileSync(new URL('../src/runtime/AutomanOrchestrationRuntime.ts',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/OmniverseCoreLoopHUD.tsx',import.meta.url),'utf8')

for(const token of [
 'streetverse.vehicle.enter','streetverse.vehicle.exit','streetverse.race.start','streetverse.drift.start',
 'streetverse.city.event','streetverse.npc.routine','gameverse.open','sportverse.open','holo.overlay','holo.benny',
 'creator.reel.capture','creator.live.open','command-nexus.status','tryamm:automan-command','tryamm:automan-ready',
 'provider-gated-money','provider-gated-hardware','moderation-cannot-be-bypassed'
]) assert.ok(runtime.includes(token),`Automan runtime missing ${token}`)

assert.ok(hud.includes('installAutomanOrchestrationRuntime()'),'Automan must install through the global Omniverse HUD')
assert.ok(hud.includes('TRYAMM AUTOMAN'),'Automan controls must be visible in the Omniverse HUD')
assert.ok(hud.includes('start a race')&&hud.includes('start drift')&&hud.includes('record Reel')&&hud.includes('show Benny'),'Automan quick actions must remain visible')

console.log('Automan orchestration contract GREEN')
