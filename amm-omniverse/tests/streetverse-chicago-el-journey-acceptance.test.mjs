import assert from 'node:assert/strict'
import {test} from 'node:test'
import fs from 'node:fs'
import {CHICAGO_EL_JOURNEY_STAGES,CHICAGO_EL_JOURNEY_SCHEMA,newChicagoElJourney,
 validateChicagoElJourney,advanceChicagoElJourney,runChicagoElOnePushTest,saveRestoreChicagoElJourney} from '../src/runtime/StreetVerseChicagoElJourney.mjs'
const memory=()=>{const map=new Map();return {setItem:(k,v)=>map.set(k,String(v)),getItem:k=>map.get(k)||null,removeItem:k=>map.delete(k)}}
test('Chicago L uses explicit seven-stage progression and preserves BJ and parcel through save/reload',()=>{
 const storage=memory()
 const report=runChicagoElOnePushTest(storage)
 assert.equal(CHICAGO_EL_JOURNEY_STAGES.length,7)
 assert.equal(report.passed,true)
 assert.equal(report.steps.length,7)
 assert.equal(report.saveRestoreVerified,true)
 assert.equal(report.characterId,'bj-stubbs')
 assert.deepEqual(report.inventory,['mission-parcel'])
 assert.equal(report.actualTrainBoardingVerified,false)
 assert.equal(report.actual3DCharacterVerified,false)
 assert.equal(report.serverSaveVerified,false)
 assert.equal(report.livekitVerified,false)
 assert.equal(report.cashFares,0)
 assert.equal(report.creditsAwarded,0)
 const saved=JSON.parse(storage.getItem(CHICAGO_EL_JOURNEY_SCHEMA))
 assert.equal(saved.localSaveVerified,true)
 assert.equal(saved.exited,true)
 assert.equal(saved.boarded,false)
 assert.equal(saved.stage,7)
 assert.equal(saved.receipts.length,7)
})
test('No early boarding, no ride before safe pose, and replays are idempotent',()=>{
 let s=newChicagoElJourney('bj-stubbs')
 assert.equal(advanceChicagoElJourney(s,'BOARD TRAIN').ok,false)
 s=advanceChicagoElJourney(s,'APPROACH PLATFORM',{eventId:'a'}).state
 const duplicate=advanceChicagoElJourney(s,'APPROACH PLATFORM',{eventId:'a'})
 assert.equal(duplicate.duplicate,true)
 assert.equal(duplicate.state.stage,1)
 s=advanceChicagoElJourney(s,'OPEN TRAIN DOORS').state
 s=advanceChicagoElJourney(s,'BOARD TRAIN').state
 assert.equal(advanceChicagoElJourney(s,'CONFIRM POSE').ok,false)
 s=advanceChicagoElJourney(s,'CONFIRM POSE',{pose:'sit'}).state
 assert.equal(s.pose,'sit')
 s=advanceChicagoElJourney(s,'RIDE TRAIN').state
 assert.equal(s.trainPosition,1)
 s=advanceChicagoElJourney(s,'EXIT TRAIN').state
 assert.equal(s.passengerSeatId,null)
 assert.equal(s.exited,true)
 assert.equal(s.creditsAwarded,0)
})
test('Invalid state and storage failures do not claim certified save',()=>{
 assert.equal(validateChicagoElJourney({...newChicagoElJourney(),creditsAwarded:200}),false)
 assert.equal(validateChicagoElJourney({...newChicagoElJourney(),inventory:['a'.repeat(100)]}),false)
 const storage={setItem(){throw Error('blocked')},getItem(){return null}}
 assert.equal(saveRestoreChicagoElJourney(newChicagoElJourney(),storage).ok,false)
 assert.equal(runChicagoElOnePushTest(storage).passed,false)
})
test('Real UI includes one-touch steps, animated train, device-only checks, JSON export and grounded station references',()=>{
 const ui=fs.readFileSync(new URL('../src/components/StreetVerseChicagoElJourneyDock.tsx',import.meta.url),'utf8')
 const launcher=fs.readFileSync(new URL('../src/components/StreetVerseTransitQADock.tsx',import.meta.url),'utf8')
 assert.match(launcher,/PLAY CHICAGO L 7-STEP MISSION/)
 for(const text of ['ONE PUSH','TEST ALL 7 STEPS + EXPORT JSON','SAVE + VERIFY RELOAD','RESTORE LAST SAVE',
 'ASK MICROPHONE PERMISSION','getUserMedia','role="progressbar"','transitchicago.com\/station\/polk','transitchicago.com\/station\/ilmd'])assert.ok(ui.includes(text),text)
 assert.match(ui,/actual3DCharacterVerified:false|actual train|main Three\.js BJ model/i)
 assert.doesNotMatch(ui,/\/api\/payments|\/api\/credits|livekit-server-sdk/)
})
