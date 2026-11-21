import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
const load=async entry=>{const out=await build({entryPoints:[new URL(entry,import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))}
const {initialShoppingLedger,awardDeliveryOnce,buyGameProduct,serializeShoppingLedger,readShoppingLedger}=await load('../src/runtime/StreetVerseShoppingLedger.ts')
const {initialHoloMission,advanceHoloMission}=await load('../src/runtime/StreetVerseHoloDeliveryMissionRuntime.ts')
test('shopping checkout deducts credits, records receipt, reduces inventory',()=>{
 const initial=initialShoppingLedger(),before=initial.world.stores[0]
 const result=buyGameProduct(initial,before.id,before.sku,2)
 assert.equal(result.ok,true);assert.equal(result.ledger.world.credits,250-2*before.priceCredits)
 assert.equal(result.ledger.world.stores[0].stock,before.stock-2)
 assert.equal(result.ledger.receipts.length,1)
 assert.equal(readShoppingLedger(serializeShoppingLedger(result.ledger)).receipts.length,1)
})
test('overspending, bad quantities, wrong SKU and out-of-stock fail without mutation',()=>{
 const s=initialShoppingLedger()
 for(const [sku,qty] of [['wrong',1],['creator-shirt',0],['creator-shirt',100],['creator-shirt',9]]){
  const result=buyGameProduct(s,'creator',sku,qty)
  assert.equal(result.ok,false);assert.equal(result.ledger,s)
 }
})
test('delivery reward and inventory applied only once',()=>{
 const s=initialShoppingLedger()
 const next=awardDeliveryOnce(s,'MISSION-1','creator','creator-shirt',3,35)
 assert.equal(next.world.credits,285);assert.equal(next.world.stores[0].stock,11)
 assert.equal(awardDeliveryOnce(next,'MISSION-1','creator','creator-shirt',3,35),next)
 assert.equal(awardDeliveryOnce(next,'MISSION-2','unknown','creator-shirt',3,35),next)
})
test('NPC handoff requires exit from vehicle and correct destination',()=>{
 let m=initialHoloMission()
 m=advanceHoloMission(m,{type:'accept'}).mission
 m=advanceHoloMission(m,{type:'pickup',nearWarehouse:true,packageAvailable:true}).mission
 m=advanceHoloMission(m,{type:'enter-van',vehicleId:'holo-delivery-van'}).mission
 assert.equal(advanceHoloMission(m,{type:'handoff',nearStore:true,npcId:'npc-creator-vendor',onFoot:false}).ok,false)
 assert.equal(advanceHoloMission(m,{type:'handoff',nearStore:false,npcId:'npc-creator-vendor',onFoot:true}).ok,false)
 // Reaching the store is a separate verified mission step; proximity alone
 // must never release the package or fictional reward.
 assert.equal(advanceHoloMission(m,{type:'handoff',nearStore:true,npcId:'npc-creator-vendor',onFoot:true}).ok,false)
 assert.equal(advanceHoloMission(m,{type:'arrive',nearStore:false}).ok,false)
 m=advanceHoloMission(m,{type:'arrive',nearStore:true}).mission
 assert.equal(m.arrived,true)
 const result=advanceHoloMission(m,{type:'handoff',nearStore:true,npcId:'npc-creator-vendor',onFoot:true})
 assert.equal(result.ok,true)
 assert.equal(result.mission.stage,'complete');assert.equal(result.reward,35)
 assert.equal(advanceHoloMission(result.mission,{type:'handoff',nearStore:true,npcId:'npc-creator-vendor',onFoot:true}).reward,0)
})
