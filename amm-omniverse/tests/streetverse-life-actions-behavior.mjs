import assert from 'node:assert/strict'
import {LIFE_MISSION_ROUTE,createLifeMissionRoute,performLifeAction,tickLifeNeeds,defaultLifeSettings} from '../src/runtime/StreetVerseLifeActionsRuntime.ts'
const actor={id:'bj',species:'human',needs:{hunger:40,hydration:40,fatigue:70,stamina:50}}
const route=createLifeMissionRoute()
assert.equal(defaultLifeSettings.needsEnabled,false)
assert.equal(defaultLifeSettings.fatigueEnabled,false)
assert.deepEqual(tickLifeNeeds(actor,defaultLifeSettings,60).needs,actor.needs)
assert.equal(performLifeAction(actor,'eat',defaultLifeSettings).actor.needs.hunger,40)
const enabled={...defaultLifeSettings,needsEnabled:true,fatigueEnabled:true}
assert.equal(performLifeAction(actor,'eat',enabled).actor.needs.hunger,70)
assert.equal(performLifeAction(actor,'drink',enabled).actor.needs.hydration,75)
assert.equal(performLifeAction(actor,'sleep',enabled).actor.needs.fatigue,20)
assert.equal(performLifeAction(actor,'birth',enabled).ok,false)
assert.equal(performLifeAction(actor,'partner-intimacy',enabled,{...actor,id:'other'}).ok,false)
assert.equal(performLifeAction({...actor,species:'insect'},'cook',enabled).ok,false)
assert.equal(performLifeAction({...actor,species:'animal'},'animal-feed',enabled).ok,true)
assert.equal(performLifeAction({...actor,species:'insect'},'insect-forage',enabled).ok,true)
assert.equal(route.complete('drink'),false,'Out of order mission must not advance')
for(const mission of LIFE_MISSION_ROUTE){assert.equal(route.current(),mission);assert.equal(route.complete(mission),true)}
assert.equal(route.current(),null)
route.reset();assert.equal(route.current(),'eat')
console.log('StreetVerse life actions behavior PASS')
