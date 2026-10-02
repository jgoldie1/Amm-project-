import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const intelligence=read('../src/runtime/PrintSwarmIntelligence.ts')
const command=read('../src/components/PrintAICommandPanel.tsx')
const swarm=read('../api/_lib/print-swarm.js')
const swarmApi=read('../api/print-network/swarm.js')
const hierarchy=JSON.parse(read('../config/agi-hierarchy.json'))

for(const token of [
 "literalConsciousness:false",
 "mayGenerateMachineCommands:false",
 "mayBypassRightsSafetyPaymentQa:false",
 "mayMoveMoney:false",
 "buildPrintOperationalSelfModel",
 "recommendSwarmShape",
 "buildHoloGPTPrintContext",
]) assert.ok(intelligence.includes(token),`print intelligence missing ${token}`)

for(const name of ['HoloGPT','Stubbs AI','Lyons Tech AI','Guardian Brain'])assert.ok(intelligence.includes(name),`print intelligence role missing ${name}`)
assert.ok(command.includes('operational self-model'),'UI must label the self model honestly')
assert.ok(command.includes('ASK HOLOGPT ABOUT PRODUCTION'),'print command center must hand production context to HoloGPT')
assert.ok(command.includes("tryamm:hologpt-study-context"),'print command center must use the existing HoloGPT context bridge')

assert.ok(swarm.includes('requireFactoryAuthority(actor)'),'print swarm creation must require authorized coordinator access')
assert.ok(swarm.includes("funding_status!=='paid-verified'"),'print swarm must not release unpaid work')
assert.ok(swarm.includes("rights_status!=='verified'"),'print swarm must not bypass rights review')
assert.ok(swarm.includes("safety_status!=='verified'"),'print swarm must not bypass safety review')
assert.ok(swarm.includes("machineCommands:false"),'print swarm must remain coordination-only')
assert.ok(swarmApi.includes('requireUser(req,res)'),'print swarm API must require authentication')

assert.equal(hierarchy?.selfModel?.literalConsciousness,false,'AGI hierarchy must not claim literal consciousness')
assert.equal(hierarchy?.manufacturingIntelligence?.literalSelfAwarenessOrConsciousness,false,'manufacturing intelligence must use operational self-model language')
assert.equal(hierarchy?.manufacturingIntelligence?.machineCommandAuthority,false,'manufacturing AI must not have raw machine command authority')
assert.equal(hierarchy?.manufacturingIntelligence?.moneyMovementAuthority,false,'manufacturing AI must not have money movement authority')

console.log('Print swarm intelligence + HoloGPT/Stubbs/Lyons contract: PASS')
