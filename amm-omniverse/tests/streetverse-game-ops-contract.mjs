import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const ops=read('../src/runtime/StreetVerseGameOpsRuntime.ts')
const main=read('../src/main.tsx')
const holo=read('../src/components/HoloGPTAssistant.tsx')
const repair=read('../src/runtime/HoloGPTAutonomousRepairEngine.ts')

for(const stage of ['boot','world','character','movement','mission','vehicle','reward','reel','global']){
 assert.ok(ops.includes(`'${stage}'`),`Game Ops missing flow stage ${stage}`)
}
for(const event of [
 'tryamm:streetverse-runtime-health',
 'tryamm:streetverse-native-mobile-ready',
 'tryamm:streetverse-hero-visual-authority',
 'tryamm:streetverse-checkpoint',
 'tryamm:universal-mission-start',
 'tryamm:streetverse-vehicle-controlled',
 'tryamm:streetverse-mission-complete',
 'tryamm:media-studio-output-ready',
 'tryamm:global-city-select',
 'tryamm:system-fabric-state',
 'tryamm:game-repair-request',
]) assert.ok(ops.includes(event),`Game Ops missing evidence adapter ${event}`)

assert.ok(ops.includes("model:'operational self-model'"),'Game Ops must describe AI awareness as an operational self-model')
assert.ok(ops.includes('literalConsciousness:false'),'Game Ops must not claim literal consciousness')
assert.ok(ops.includes('mayMergeOrDeployWithoutApproval:false'),'Game Ops must not merge or deploy itself')
assert.ok(ops.includes('mayClaimDeviceSuccessWithoutDeviceEvidence:false'),'Game Ops must preserve physical-device evidence boundary')
assert.ok(ops.includes('detectRepairLayer'),'Game Ops must reuse the evidence-first repair classifier')
assert.ok(ops.includes('normalizeErrorSignature'),'Game Ops must normalize repeated repair failures')
assert.ok(ops.includes("recommendedOwner:'HoloGPT'|'Stubbs AI'|'Lyons Tech AI'|'Guardian'"),'Game Ops must route repair responsibility')
assert.ok(ops.includes('__tryammGameOps'),'Game Ops must expose one diagnostic control surface')
assert.ok(ops.includes('__showGameOps'),'Game Ops must expose HoloGPT command entry')
assert.ok(main.includes("installStreetVerseGameOpsRuntime"),'main bootstrap must install Game Ops')
assert.ok(holo.includes("__showGameOps"),'HoloGPT must route game-flow/repair commands into Game Ops')
assert.ok(repair.includes("mode:'EVIDENCE_FIRST'"),'Game Ops repair foundation must remain evidence-first')

console.log('StreetVerse AI game-flow + repair orchestration contract: PASS')
