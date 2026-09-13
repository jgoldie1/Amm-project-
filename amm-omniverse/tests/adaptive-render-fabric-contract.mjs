import fs from 'node:fs'
import assert from 'node:assert/strict'

const runtime=fs.readFileSync(new URL('../src/runtime/StreetVerseAdaptiveRenderFabric.ts',import.meta.url),'utf8')
const entry=fs.readFileSync(new URL('../src/streetverse-entry.tsx',import.meta.url),'utf8')
const hardware=fs.readFileSync(new URL('../../hardware/adaptive-render-fabric/README.md',import.meta.url),'utf8')
const backend=fs.readFileSync(new URL('../api/render/policy.js',import.meta.url),'utf8')
const schema=JSON.parse(fs.readFileSync(new URL('../../config/adaptive-render-policy.schema.json',import.meta.url),'utf8'))

for(const token of ['renderScale','targetFps','reconstruction','npcBudget','vehicleBudget','foliageBudget','particleBudget']){
 assert.ok(runtime.includes(token),`adaptive render policy missing ${token}`)
}
assert.match(runtime,/frameGeneration:false/g,'synthetic frame generation must stay disabled')
assert.match(runtime,/tryamm:adaptive-render-policy/,'policy event must be published')
assert.match(runtime,/tryamm:dynamic-resolution/,'dynamic resolution event must be published')
assert.match(runtime,/tryamm:scene-budget/,'scene budget event must be published')
assert.match(entry,/installStreetVerseAdaptiveRenderFabric/,'StreetVerse entry must install adaptive render fabric')
assert.match(hardware,/Server-authoritative gameplay stays separate from render acceleration/,'render acceleration must not become gameplay/economy authority')
assert.match(hardware,/Synthetic frame generation remains disabled/,'hardware plan must preserve no-frame-generation gate')
assert.match(backend,/renderOnly:true,gameplay:false,economy:false/,'backend render service must never become gameplay/economy authority')
assert.match(backend,/storesRawTelemetry:false/,'backend must default to no raw telemetry retention')
assert.equal(schema.properties.frameGeneration.const,false,'backend schema must lock frame generation off')
assert.deepEqual(schema.properties.tier.enum,['safe','balanced','high','ultra','cloud'])

console.log('Adaptive render fabric contract: PASS (frontend runtime + backend policy + hardware plan + privacy/authority separation, frame generation OFF)')
