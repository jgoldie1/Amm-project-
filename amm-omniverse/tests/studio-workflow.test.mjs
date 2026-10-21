import test from 'node:test';import assert from 'node:assert/strict';
import {financials,validateAction,summarize} from '../api/_lib/studio.js';
import {createWorkflowHandler} from '../api/studio/workflow.js';
const order={commerce_id:'c',customer_id:'u',price_cents:10000,commission_bps:1000};
const tx={id:'t',order_id:'c',buyer_id:'u',provider:'stripe',amount_cents:10000,currency:'USD',status:'paid',metadata:{livemode:true}};
test('commissions require exact verified live payment evidence',()=>{
 assert.equal(financials(order,[]).commissionAccruedCents,0);
 assert.equal(financials(order,[{...tx,metadata:{livemode:false}}]).collectedCents,0);
 assert.equal(financials(order,[{...tx,buyer_id:'other'}]).collectedCents,0);
 assert.equal(financials(order,[{...tx,status:'disputed'}]).collectedCents,0);
 assert.equal(financials(order,[tx]).commissionAccruedCents,1000);
 const result=financials(order,[tx],[{transaction_id:'t',status:'succeeded',amount_cents:2500}]);assert.equal(result.collectedCents,7500);assert.equal(result.commissionAccruedCents,750);assert.equal(result.commissionPaidCents,0);
});
test('business approval and commission agreement are mandatory',()=>{
 assert.throws(()=>validateAction({action:'business'},false),/owner_required/);
 assert.throws(()=>validateAction({action:'business',approved:true,priceCents:4900,commissionBps:1000,agentReference:''},true),/approval/);
 assert.throws(()=>validateAction({action:'publish',id:'11111111-1111-4111-8111-111111111111'},true),/invalid/);
});
test('owner dashboard distinguishes receipts, costs and unpaid accruals',()=>{const s=summarize([{financials:financials(order,[tx]),state:'received'}],[{amount_cents:500,incurred_on:new Date().toISOString().slice(0,10)}],{monthly_limit_cents:100});assert.equal(s.remainingBeforeUnrecordedCostsCents,8500);assert.equal(s.alerts[0].orderId,'budget');assert.equal(s.externalPaidExecutionEnabled,false)});
test('customer cannot submit owner-only approval action',async()=>{
 let mutated=false;const h=createWorkflowHandler({userFor:async()=>({id:'u'}),ownerFor:()=>false,mutate:async()=>{mutated=true}});
 const res={setHeader(){},status(n){this.code=n;return this},json(p){this.payload=p}};
 await h({method:'POST',body:{action:'publish',id:'11111111-1111-4111-8111-111111111111',revision:1}},res);assert.equal(res.code,403);assert.equal(mutated,false);
});
