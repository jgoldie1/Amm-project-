import assert from 'node:assert/strict'
import {initialHoloMission,advanceHoloMission} from '../src/runtime/StreetVerseHoloDeliveryMissionRuntime.ts'
const step=(m,a)=>advanceHoloMission(m,a)
let m=initialHoloMission()
assert.equal(step(m,{type:'pickup',nearWarehouse:true,packageAvailable:true}).ok,false)
m=step(m,{type:'accept'}).mission
assert.equal(step(m,{type:'pickup',nearWarehouse:false,packageAvailable:true}).ok,false)
m=step(m,{type:'pickup',nearWarehouse:true,packageAvailable:true}).mission
assert.equal(step(m,{type:'enter-van',vehicleId:'wrong-van'}).ok,false)
m=step(m,{type:'enter-van',vehicleId:'holo-delivery-van'}).mission
assert.equal(step(m,{type:'handoff',nearStore:true,onFoot:true,npcId:'npc-creator-vendor'}).ok,false,'cannot skip arrival')
assert.equal(step(m,{type:'arrive',nearStore:false}).ok,false)
m=step(m,{type:'arrive',nearStore:true}).mission
assert.equal(m.arrived,true)
assert.equal(step(m,{type:'handoff',nearStore:true,onFoot:false,npcId:'npc-creator-vendor'}).ok,false,'must exit van')
assert.equal(step(m,{type:'handoff',nearStore:true,onFoot:true,npcId:'wrong-npc'}).ok,false)
const done=step(m,{type:'handoff',nearStore:true,onFoot:true,npcId:'npc-creator-vendor'})
assert.equal(done.ok,true)
assert.equal(done.reward,35)
assert.equal(step(done.mission,{type:'handoff',nearStore:true,onFoot:true,npcId:'npc-creator-vendor'}).reward,0)
console.log('Holo Delivery stage transitions, arrival, van exit and single completion PASS')
