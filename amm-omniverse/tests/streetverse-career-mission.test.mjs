import assert from 'node:assert/strict'
import {test,beforeEach} from 'node:test'
import {
 CAREER_MISSIONS,INVESTIGATION_CHOICES,startCareerMission,loadCareerMission,
 advanceCareerMission,advanceCareerMissionForEvent,getCareerMissionProgress,
 saveInvestigationChoice,loadInvestigationChoice,resetCareerMission,getCaseJournal,getCareerEvidence,getCareerScene
} from '../src/runtime/StreetVerseCareerMissionPrototype.ts'

const store=new Map()
globalThis.localStorage={
 getItem(key){return store.has(key)?store.get(key):null},
 setItem(key,value){store.set(key,String(value))},
 removeItem(key){store.delete(key)}
}
beforeEach(()=>store.clear())

test('six distinct fictional career mission definitions',()=>{
 assert.deepEqual(Object.keys(CAREER_MISSIONS).sort(),['agent-007','cia','fbi','government','law-enforcement','mib'].sort())
 for(const mission of Object.values(CAREER_MISSIONS))assert.equal(mission.steps.length,3)
})
test('scripted mission completes three objectives and stops at completion',()=>{
 let mission=startCareerMission('fbi')
 assert.equal(loadCareerMission()?.career,'fbi')
 for(let i=1;i<=3;i++){mission=advanceCareerMission(mission);assert.equal(mission.stage,i)}
 assert.equal(getCareerMissionProgress(mission).finished,true)
 assert.equal(advanceCareerMission(mission).stage,3)
})
test('reject stale progress after mission restarts',()=>{
 const stale=startCareerMission('cia')
 const current=startCareerMission('fbi')
 assert.equal(advanceCareerMission(stale).stage,0)
 assert.equal(advanceCareerMissionForEvent(stale,'tryamm:streetverse-career-briefing-confirmed').stage,0)
 assert.equal(loadCareerMission()?.career,current.career)
})
test('confirmation events must follow mission objective order',()=>{
 let mission=startCareerMission('agent-007')
 assert.equal(advanceCareerMissionForEvent(mission,'tryamm:streetverse-career-evidence-confirmed').stage,0)
 mission=advanceCareerMissionForEvent(mission,'tryamm:streetverse-career-briefing-confirmed')
 assert.equal(mission.stage,1)
 mission=advanceCareerMissionForEvent(mission,'tryamm:streetverse-career-npc-interaction-confirmed')
 assert.equal(mission.stage,2)
})
test('choice persistence scoped to career and reset',()=>{
 startCareerMission('cia')
 saveInvestigationChoice('cia','protect-witness')
 assert.equal(loadInvestigationChoice('cia'),'protect-witness')
 assert.equal(loadInvestigationChoice('fbi'),null)
 assert.equal(Object.keys(INVESTIGATION_CHOICES).length,3)
 resetCareerMission()
 assert.equal(loadInvestigationChoice('cia'),null)
 assert.equal(loadCareerMission(),null)
})
test('corrupt saved mission and choices fail closed',()=>{
 store.set('tryamm.streetverse.career-mission.v1','{"career":"unknown","stage":1,"updatedAt":"today"}')
 store.set('tryamm.streetverse.investigation-choice.v1','{"career":"cia","choice":"invalid"}')
 assert.equal(loadCareerMission(),null)
 assert.equal(loadInvestigationChoice('cia'),null)
})

test('case journal only contains completed objectives',()=>{
 let mission=startCareerMission('cia')
 assert.equal(getCaseJournal(mission).length,0)
 mission=advanceCareerMission(mission)
 assert.equal(getCaseJournal(mission).length,1)
 assert.match(getCaseJournal(mission)[0].detail,/fictional analyst/i)
 mission=advanceCareerMission(mission)
 assert.equal(getCaseJournal(mission).length,2)
 mission=advanceCareerMission(mission)
 assert.equal(getCaseJournal(mission).length,3)
 assert.equal(getCaseJournal(mission)[2].detail,getCareerEvidence('cia').description)
})
test('each career has a distinct briefing witness and evidence scene',()=>{
 for(const career of Object.keys(CAREER_MISSIONS)){
  const scenes=[0,1,2].map(stage=>getCareerScene(career,stage))
  assert.ok(scenes.every(scene=>typeof scene==='string'&&scene.length>10))
  assert.equal(getCareerScene(career,3),null)
  assert.ok(getCareerEvidence(career).id)
 }
})
