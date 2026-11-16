import test from 'node:test';
import assert from 'node:assert/strict';
import {WAREHOUSE_MISSION_STAGES,WAREHOUSE_MISSION_KEY,WAREHOUSE_MISSION_ID,initialWarehouseMission,isValidWarehouseMission,advanceWarehouseMission,readWarehouseMission,saveWarehouseMission,resetWarehouseMission} from '../public/warehouse-mission-engine.mjs';
test('all six checkpoints exist in story sequence',()=>{
 assert.deepEqual(WAREHOUSE_MISSION_STAGES.map(x=>x.id),['accept','inspect','verify','load','deliver','receipt']);
 assert.ok(WAREHOUSE_MISSION_STAGES.every(x=>x.instruction&&x.action));
});
test('new mission begins at accept',()=>{const s=initialWarehouseMission();assert.equal(s.stage,0);assert.equal(s.completed,false);assert.equal(isValidWarehouseMission(s),true);});
test('mission cannot skip checkpoints',()=>assert.throws(()=>advanceWarehouseMission(initialWarehouseMission(),'deliver'),/current checkpoint/));
test('mission completes with simulated receipt, no rewards or fulfillment',()=>{
 let s=initialWarehouseMission();
 for(const x of WAREHOUSE_MISSION_STAGES)s=advanceWarehouseMission(s,x.id);
 assert.equal(s.stage,6);assert.equal(s.completed,true);assert.equal(s.receipt.type,'SIMULATED_MISSION_RECEIPT');
 assert.equal(s.receipt.notBlockchainProof,true);assert.equal(s.receipt.notInventoryProof,true);assert.equal(s.receipt.noPayment,true);
 assert.equal(advanceWarehouseMission(s,'receipt'),s);
});
test('checkpoint progress saves and reloads from browser storage',()=>{
 const mem=new Map();const storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 let s=advanceWarehouseMission(initialWarehouseMission(),'accept');saveWarehouseMission(storage,s);
 assert.equal(JSON.parse(mem.get(WAREHOUSE_MISSION_KEY)).stage,1);
 assert.deepEqual(readWarehouseMission(storage),s);
});
test('tampered or broken storage resets only virtual mission',()=>{
 const store={getItem:()=>JSON.stringify({...initialWarehouseMission(),stage:5,history:['accept']})};
 assert.equal(readWarehouseMission(store).stage,0);
 assert.equal(readWarehouseMission({getItem:()=>'{invalid json'}).stage,0);
});
test('mission reset preserves no outside state and clears chapter',()=>{
 const mem=new Map();const storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
 storage.setItem('real-commerce-order','leave-alone');
 saveWarehouseMission(storage,advanceWarehouseMission(initialWarehouseMission(),'accept'));
 const reset=resetWarehouseMission(storage);
 assert.equal(reset.stage,0);assert.equal(storage.getItem('real-commerce-order'),'leave-alone');
});
test('episode uses canonical mission ID',()=>assert.match(WAREHOUSE_MISSION_ID,/warehouse|merch|route/));
