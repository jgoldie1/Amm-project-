'use strict';
const assert=require('node:assert/strict');
const {settlementInput,settleVerifiedOrder}=require('../lib/tryamm-order-settlement');
const orderId='11111111-2222-4333-8444-555555555555';
const session={id:'cs_test_123abc',mode:'payment',payment_status:'paid',amount_total:49900,currency:'usd',metadata:{kind:'tryamm-website-order',orderId}};
const event={id:'evt_12345abcdef',type:'checkout.session.completed'};
assert.equal(settlementInput(session,event).amountCents,49900);
assert.equal(settlementInput({...session,metadata:{kind:'creator'}},event),null);
assert.equal(settlementInput({...session,payment_status:'unpaid'},event).reason,'PAYMENT_NOT_CONFIRMED');
assert.equal(settlementInput(session,{...event,type:'invoice.paid'}),null);
assert.throws(()=>settlementInput({...session,amount_total:4.5},event),/Invalid verified/);
assert.throws(()=>settlementInput({...session,metadata:{kind:'tryamm-website-order',orderId:'other'}},event),/Invalid website order/);
(async()=>{
 const calls=[];
 const db={configured:()=>true,rpc:async(name,values)=>{calls.push({name,values});return {applied:true,reason:'PAYMENT_VERIFIED'}}};
 const prev=process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED;
 try{
  delete process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED;
  await assert.rejects(()=>settleVerifiedOrder(session,event,{dbClient:db}),/disabled/);
  assert.equal(calls.length,0);
  process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED='true';
  const result=await settleVerifiedOrder(session,event,{dbClient:db});
  assert.equal(result.applied,true);
  assert.equal(calls[0].name,'tryamm_settle_website_order');
  assert.equal(calls[0].values.p_order_id,orderId);
  assert.equal(calls[0].values.p_amount_cents,49900);
  assert.equal(calls[0].values.p_event_id,event.id);
  const duplicateDb={configured:()=>true,rpc:async()=>({applied:false,reason:'ALREADY_SETTLED'})};
  const duplicate=await settleVerifiedOrder(session,event,{dbClient:duplicateDb});
  assert.equal(duplicate.applied,false);
  assert.equal(duplicate.reason,'ALREADY_SETTLED');
  console.log('Website order payment adapter: input validation, disabled-by-default, verified RPC and duplicate replay PASS');
 }finally{
  if(prev===undefined)delete process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED;
  else process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED=prev;
 }
})().catch(error=>{console.error(error);process.exitCode=1});
