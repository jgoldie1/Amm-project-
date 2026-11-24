import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {BRIDGES,TRYAMM_MISSION_EVENT,makeLocalMissionReceipt,validateMissionReceipt,buildMissionIntegrationReport,readLocalArcadeSummary,LOCAL_ARCADE_KEY} from '../src/foundation/streetverseIntegrationRegistry.js'
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8')
test('all ten TRYAMM product bridges are unique and have grounded launch routes and acceptance gaps',()=>{
 assert.equal(BRIDGES.length,10)
 assert.equal(new Set(BRIDGES.map(x=>x.id)).size,10)
 for(const x of BRIDGES){assert.match(x.path,/^\//);assert.ok(x.acceptance.length>20)}
})
test('local mission receipt is validated, tamper-resistant by schema and explicitly not ledger authoritative',()=>{
 assert.equal(TRYAMM_MISSION_EVENT,'tryamm:mission-local-completed')
 const receipt=makeLocalMissionReceipt('fire','fr1',new Date('2026-11-22T00:00:00Z'))
 assert.equal(receipt.authoritative,false)
 assert.equal(receipt.xp,75)
 assert.equal(Object.isFrozen(receipt),true)
 assert.ok(validateMissionReceipt(receipt))
 assert.equal(validateMissionReceipt({...receipt,mode:'er'}),false)
 assert.equal(validateMissionReceipt({...receipt,credits:900}),false)
 assert.equal(validateMissionReceipt({...receipt,authoritative:true}),false)
 assert.throws(()=>makeLocalMissionReceipt('shadow','hm3'))
})
test('readiness report does not pretend to verify LIVE, device, money or ledger',()=>{
 const r=buildMissionIntegrationReport({now:new Date('2026-11-22T00:00:00Z'),hasLocalStorage:true,hasDownload:true})
 assert.equal(r.authoritativeLedgerConnected,false)
 assert.equal(r.liveIntegrationVerified,false)
 assert.equal(r.deviceAcceptanceVerified,false)
 assert.equal(r.prototypeCapabilities.scriptedStages,51)
 assert.equal(r.systems.length,10)
 assert.ok(r.systems.every(x=>!x.liveVerified))
})
test('real UI route, home launcher, audit export and receipt emissions are wired',()=>{
 const main=read('../src/main.tsx')
 const home=read('../src/components/TryAMMHome.tsx')
 const ui=read('../src/components/StreetVerseIntegrationCenter.tsx')
 const arcade=read('../src/components/StreetVerseMissionArcade.tsx')
 assert.match(main,/isStreetVerseIntegrationCenter/)
 assert.match(main,/StreetVerseIntegrationCenter/)
 assert.match(home,/INTEGRATION & ONE-PUSH AUDIT/)
 assert.match(ui,/DOWNLOAD JSON REPORT/)
 assert.match(ui,/URL\.createObjectURL/)
 assert.match(arcade,/new CustomEvent\(TRYAMM_MISSION_EVENT/)
 assert.match(arcade,/makeLocalMissionReceipt\(mode,id\)/)
})

test('integration audit reads local arcade progress across routes but never elevates it to ledger authority',()=>{
 const mock={getItem:k=>k===LOCAL_ARCADE_KEY?JSON.stringify({completed:['ad1','ad1','fr2','evil3'],xp:9999,credits:500}):null}
 const summary=readLocalArcadeSummary(mock)
 assert.equal(summary.available,true)
 assert.equal(summary.completedMissions,2)
 assert.equal(summary.fictionalXp,150)
 assert.equal(summary.fictionalCredits,500)
 assert.equal(readLocalArcadeSummary({getItem:()=>'{broken'}).available,false)
 const report=buildMissionIntegrationReport({arcadeSummary:summary})
 assert.equal(report.prototypeCapabilities.localArcadeSummary.completedMissions,2)
 assert.equal(report.authoritativeLedgerConnected,false)
})
