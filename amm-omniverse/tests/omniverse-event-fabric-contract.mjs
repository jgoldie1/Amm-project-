import fs from 'node:fs'
import assert from 'node:assert/strict'

const runtime=fs.readFileSync(new URL('../src/runtime/OmniverseEventFabricRuntime.ts',import.meta.url),'utf8')
const hud=fs.readFileSync(new URL('../src/components/OmniverseCoreLoopHUD.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')

for(const channel of ['game','mission','live','reel','creator','ads','marketplace','ledger','broadcast']){
  assert.ok(runtime.includes(`'${channel}'`),`Omniverse fabric missing ${channel} channel`)
}
for(const requirement of ['amountCents>0','actorId','currency','status:\'gated\'']){
  assert.ok(runtime.includes(requirement),`Money safety gate missing ${requirement}`)
}
assert.match(runtime,/tryamm:mission-completed/,'Mission completion must feed the event fabric')
assert.match(runtime,/tryamm:creator-publish/,'Creator publish must feed the event fabric')
assert.match(runtime,/tryamm:omniverse-submit/,'Canonical submit event must exist')
assert.match(hud,/ONE EVENT → WHOLE PLATFORM/,'Visible core-loop HUD must explain the event model')
assert.match(main,/installOmniverseEventFabricRuntime\(\)/,'Omniverse event fabric must be installed in production bootstrap')
assert.match(main,/<OmniverseCoreLoopHUD \/>/,'Core-loop HUD must be mounted')

console.log('Omniverse event fabric contract OK: one event routes across game, social, creator, ads, commerce, ledger and broadcast.')
