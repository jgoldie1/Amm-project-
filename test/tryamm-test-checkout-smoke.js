'use strict';
const assert=require('node:assert/strict');
const checkout=require('../lib/tryamm-test-checkout');
const order={id:'11111111-2222-4333-8444-555555555555',lead_id:'22222222-2222-4222-8222-222222222222',
 status:'customer-accepted',customer_accepted_at:'2026-11-04T00:00:00Z',price_cents:49900,
 currency:'usd',description:'Business preview, logo and one promotional Reel',package_id:'preview'};
const args=checkout.buildSession(order,'buyer@example.com','https://tryamm.online');
assert.equal(args.line_items[0].price_data.unit_amount,49900);
assert.equal(args.metadata.orderId,order.id);
assert.equal(args.mode,'payment');
assert.throws(()=>checkout.buildSession({...order,status:'quote-approved'},'buyer@example.com','https://tryamm.online'),/Customer-accepted/);
assert.throws(()=>checkout.buildSession({...order,price_cents:125000,currency:'eur'},'buyer@example.com','https://tryamm.online'),/price/);
assert.throws(()=>checkout.buildSession(order,'invalid-email','https://tryamm.online'),/email/);
(async()=>{
 const prior={...process.env};
 try{
  delete process.env.TRYAMM_CHECKOUT_TEST_ENABLED;
  await assert.rejects(()=>checkout.prepare({orderId:order.id,ownerId:'owner'}),/not been enabled/);
  // No live Stripe or database request is made in this smoke.
  console.log('TRYAMM Checkout session parameter, owner acceptance and disabled-by-default guards: PASS');
 }finally{for(const k of ['TRYAMM_CHECKOUT_TEST_ENABLED']){if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k]}}
})().catch(e=>{console.error(e);process.exitCode=1});
