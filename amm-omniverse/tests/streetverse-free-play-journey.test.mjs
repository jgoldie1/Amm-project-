import assert from 'node:assert/strict'
import fs from 'node:fs'
import {startFreePlayJourney,advanceFreePlayJourney,JOURNEY_STEPS,JOURNEY_REAL_MONEY_ENABLED} from '../src/runtime/StreetVerseFreePlayJourney.ts'
const hub=fs.readFileSync(new URL('../src/components/StreetVerseFreePlayHub.tsx',import.meta.url),'utf8')
assert.match(hub,/StreetVerseFreePlayJourneyTest/)
assert.equal(JOURNEY_REAL_MONEY_ENABLED,false)
let state=startFreePlayJourney()
assert.equal(state.player.credits,0)
assert.throws(()=>advanceFreePlayJourney(state,'earn-credits'),/current journey/)
for(const step of JOURNEY_STEPS.slice(0,-1)){
 assert.equal(state.step,step)
 state=advanceFreePlayJourney(state,step,step==='customize-jacket'?'#ff69b4':undefined)
 if(step==='earn-credits'){
  assert.equal(state.player.credits,100)
  assert.equal(state.player.completedMissionIds.length,1)
  assert.equal(state.player.ledger.filter(e=>e.kind==='mission').length,1)
 }
 if(step==='submit-review')assert.equal(state.submission?.status,'pending')
 if(step==='approve-demo')assert.equal(state.submission?.status,'approved')
 if(step==='find-approved')assert.equal(state.listed,true)
}
assert.equal(state.step,'complete')
assert.equal(state.player.credits,75)
assert.equal(state.creator.credits,17)
assert.equal(state.player.ownedMods.length,1)
assert.equal(state.player.ledger.filter(e=>e.kind==='mod-purchase').length,1)
assert.equal(state.creator.ledger.filter(e=>e.kind==='creator-royalty').length,1)
assert.throws(()=>advanceFreePlayJourney(state,'buy-cosmetic'),/current journey/)
assert.throws(()=>advanceFreePlayJourney(startFreePlayJourney(),'customize-jacket','#123456'),/current journey/)
let customization=startFreePlayJourney()
for(const step of JOURNEY_STEPS.slice(0,5))customization=advanceFreePlayJourney(customization,step)
assert.throws(()=>advanceFreePlayJourney(customization,'customize-jacket','#123456'),/approved jacket color/)
console.log('StreetVerse Chicago BJ mission → fictional credits → jacket → independent demo approval → marketplace → purchase PASS')
