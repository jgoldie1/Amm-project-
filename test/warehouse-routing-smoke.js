'use strict';
const assert=require('assert');
const {allocateInventory,ownershipTrigger}=require('../lib/warehouse-routing');
const warehouses=[
 {id:'chi',name:'Chicago Partner',country:'US',region:'Midwest',verified:true,capabilities:['storage','pick-pack','b2c','returns'],storagePerUnitMonth:.45,pickPackPerOrder:2.4,receivingPerUnit:.15,accuracyPct:99.7,shipHours:18},
 {id:'la',name:'LA Partner',country:'US',region:'West',verified:true,capabilities:['storage','pick-pack','b2c','returns'],storagePerUnitMonth:.5,pickPackPerOrder:2.2,receivingPerUnit:.16,accuracyPct:99.5,shipHours:20},
 {id:'bad',name:'Unverified',country:'US',verified:false,capabilities:['storage','pick-pack','b2c']}
];
const plan=allocateInventory({warehouses,demand:[{region:'Midwest',country:'US',share:.6},{region:'West',country:'US',share:.4}],units:1000,requirements:{country:'US',capabilities:['storage','pick-pack','b2c']},platformFeeBps:400});
assert.equal(plan.unallocated,0);assert.equal(plan.allocations.reduce((s,x)=>s+x.units,0),1000);assert(plan.allocations.every(x=>x.estimatedFirstMonth.platformFeeBps===400));
const trigger=ownershipTrigger({annualPartnerSpend:2000000,annualVolumeUnits:250000,estimatedOwnedAnnualCost:1500000});assert(trigger.considerOwnedFacility);assert.equal(trigger.estimatedSavingsPct,25);
console.log('warehouse routing smoke: PASS');
