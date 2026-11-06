import assert from 'node:assert/strict'
import {performLifeAction,defaultLifeSettings,LIFE_MISSION_ROUTE,createLifeMissionRoute,tickLifeNeeds} from '../src/runtime/StreetVerseLifeActionsRuntime.ts'
import {buyStreetVerseFood,canDriveAfterFood} from '../src/runtime/StreetVerseFoodEconomyRuntime.ts'
import {createBJRescueMission} from '../src/runtime/StreetVerseBJRescueMissionRuntime.ts'
import {createBJInjuryReaction} from '../src/runtime/StreetVerseBJInjuryReactionRuntime.ts'
import {applyBJInjury,initialBJInjuryState} from '../src/runtime/StreetVerseBJInjuryBridgeRuntime.ts'
const needs={hunger:40,hydration:40,fatigue:20,stamina:60}
const human={id:'bj',species:'human',needs}
assert.equal(defaultLifeSettings.needsEnabled,false)
assert.equal(defaultLifeSettings.fatigueEnabled,false)
assert.deepEqual(tickLifeNeeds(human,defaultLifeSettings,60).needs,needs)
assert.equal(performLifeAction(human,'eat',defaultLifeSettings).ok,true)
assert.equal(performLifeAction(human,'insect-forage',defaultLifeSettings).ok,false)
assert.equal(performLifeAction({...human,adultVerified:true,consents:true},'partner-intimacy',defaultLifeSettings,{...human,id:'other',adultVerified:false,consents:true}).ok,false)
assert.equal(performLifeAction({...human,adultVerified:true,pregnancyStoryEligible:true},'birth',defaultLifeSettings).animation,'HospitalFamilyArrival')
assert.equal(performLifeAction({...human,adultVerified:true},'birth',defaultLifeSettings).ok,false)
const route=createLifeMissionRoute()
assert.equal(route.complete('sleep'),false)
for(const mission of LIFE_MISSION_ROUTE)assert.equal(route.complete(mission),true)
assert.equal(route.current(),null)
route.reset()
assert.equal(route.current(),'eat')
const player={wallet:30,ageVerifiedAdult:false,needs:{health:40,stamina:50,hunger:40,hydration:40,impaired:false,severeInjury:true}}
const food=buyStreetVerseFood(player,'burger')
assert.equal(food.ok,true)
assert.equal(food.player.wallet,18)
assert.equal(food.player.needs.health,40)
assert.equal(buyStreetVerseFood(player,'beer').ok,false)
assert.equal(buyStreetVerseFood({...player,wallet:1},'burger').ok,false)
const beer=buyStreetVerseFood({...player,ageVerifiedAdult:true},'beer')
assert.equal(beer.player.needs.impaired,true)
assert.equal(canDriveAfterFood(beer.player),false)
let injury=initialBJInjuryState()
const reaction=createBJInjuryReaction()
for(const kind of ['shot','shot']){injury=applyBJInjury(injury,kind).state;reaction.onInjury(kind,100)}
assert.equal(injury.health,40)
assert.equal(reaction.movementMultiplier(injury),.65)
assert.equal(reaction.frame(injury,200).requestRescue,true)
assert.equal(reaction.frame(injury,300).requestRescue,false)
const rescue=createBJRescueMission()
assert.equal(rescue.treat(10).stage,'idle')
assert.equal(rescue.request(20).stage,'requested')
assert.equal(rescue.dispatch(30).stage,'dispatched')
assert.equal(rescue.arrive(40).stage,'arrived')
assert.equal(rescue.treat(50).stage,'treatment')
assert.equal(rescue.recover(60).stage,'recovered')
injury=applyBJInjury(injury,'hospital-discharge').state
reaction.onInjury('hospital-discharge',60)
assert.equal(injury.health,100)
assert.equal(reaction.movementMultiplier(injury),1)
assert.equal(reaction.frame(injury,70).requestRescue,false)
console.log('StreetVerse executable life, food, injury and rescue regression PASS')
