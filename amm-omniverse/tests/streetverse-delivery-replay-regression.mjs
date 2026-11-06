import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
const load=async entry=>{const out=await build({entryPoints:[new URL(entry,import.meta.url).pathname],bundle:true,platform:'node',format:'esm',write:false,logLevel:'silent'});return import('data:text/javascript;base64,'+Buffer.from(out.outputFiles[0].text).toString('base64'))}
const {initialShoppingLedger,awardDeliveryOnce,buyGameProduct,serializeShoppingLedger,readShoppingLedger}=await load('../src/runtime/StreetVerseShoppingLedger.ts')
const {initialHoloMission,advanceHoloMission}=await load('../src/runtime/StreetVerseHoloDeliveryMissionRuntime.ts')
const finish=()=>{let m=initialHoloMission();for(const a of [{type:'accept'},{type:'pickup',nearWarehouse:true,packageAvailable:true},{type:'enter-van',vehicleId:'holo-delivery-van'},{type:'arrive',nearStore:true},{type:'handoff',nearStore:true,onFoot:true,npcId:'npc-creator-vendor'}]){const r=advanceHoloMission(m,a);assert.equal(r.ok,true);m=r.mission}return m}
test('replay retains receipts and inventory but never awards same mission twice',()=>{
 let ledger=initialShoppingLedger()
 const purchase=buyGameProduct(ledger,'creator','creator-shirt',1);assert.equal(purchase.ok,true);ledger=purchase.ledger
 const completed=finish();assert.equal(completed.stage,'complete')
 ledger=awardDeliveryOnce(ledger,completed.id,'creator','creator-shirt',3,35)
 const saved=readShoppingLedger(serializeShoppingLedger(ledger))
 assert.equal(saved.receipts.length,1);assert.equal(saved.completedMissionIds.length,1)
 assert.equal(initialHoloMission().id,completed.id,'replay must preserve mission identity for idempotency')
 const replayed=finish()
 assert.equal(awardDeliveryOnce(saved,replayed.id,'creator','creator-shirt',3,35),saved)
 assert.equal(saved.world.credits,ledger.world.credits)
 assert.equal(saved.world.stores[0].stock,ledger.world.stores[0].stock)
})
