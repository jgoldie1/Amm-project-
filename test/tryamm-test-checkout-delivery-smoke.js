'use strict';
const assert=require('node:assert/strict');
const status=require('../lib/tryamm-checkout-status');
const mail=require('../lib/tryamm-test-checkout-email');
const id='11111111-2222-4333-8444-555555555555';
const order={id,owner_id:'business-a',lead_id:'22222222-2222-4222-8222-222222222222',
 status:'payment-pending',customer_accepted_at:'2026-11-04T01:00:00Z',
 stripe_session_id:'cs_test_123abc',price_cents:49900,currency:'usd',verified_paid_at:null};
const session={id:'cs_test_123abc',livemode:false,metadata:{kind:'tryamm-website-order',orderId:id},
 mode:'payment',amount_total:49900,currency:'usd',status:'open',payment_status:'unpaid',
 customer_email:'buyer@example.com',url:'https://checkout.stripe.com/c/pay/cs_test_123abc'};
assert.equal(status.checkSession(order,session).paymentVerifiedInDatabase,false);
assert.throws(()=>status.checkSession(order,{...session,amount_total:250000}),/mismatch/);
assert.throws(()=>status.checkSession(order,{...session,livemode:true}),/test-mode/);
assert.throws(()=>status.checkSession(order,{...session,metadata:{kind:'tryamm-website-order',orderId:'22222222-2222-4222-8222-222222222222'}}),/does not belong/);
assert.equal(mail.checkoutUrl(session.url),session.url);
assert.throws(()=>mail.checkoutUrl('https://checkout.stripe.com.evil.example/pay/123'),/verified Stripe/);
(async()=>{
 const prev={...process.env};
 try{
  delete process.env.TRYAMM_CHECKOUT_EMAIL_TEST_ENABLED;
  await assert.rejects(()=>mail.emailTestCheckout({orderId:id,ownerId:'business-a'}),/disabled/);
  process.env.TRYAMM_CHECKOUT_EMAIL_TEST_ENABLED='true';
  process.env.TRYAMM_ORDERS_DURABLE_ENABLED='true';
  process.env.STRIPE_SECRET_KEY='sk_test_dummy';
  process.env.RESEND_API_KEY='test_key';
  process.env.TRYAMM_QUOTE_FROM_EMAIL='quotes@example.com';
  const calls=[];
  const db={configured:()=>true,select:async(table,query)=>{
   if(table==='tryamm_website_orders')return query.includes('business-a')?[order]:[];
   if(table==='tryamm_campaign_leads')return [{email:'buyer@example.com'}];
   return [];
  }};
  const stripe={checkout:{sessions:{retrieve:async()=>session}}};
  const send=async(_url,request)=>{calls.push(request);return {ok:true,json:async()=>({id:'test_provider_id'})}};
  const result=await mail.emailTestCheckout({orderId:id,ownerId:'business-a',dbClient:db,stripeClient:stripe,send});
  assert.equal(result.sent,true);assert.equal(result.paid,false);
  assert.equal(calls.length,1);assert.match(calls[0].body,/TEST payment/);
  await assert.rejects(()=>mail.emailTestCheckout({orderId:id,ownerId:'business-b',dbClient:db,stripeClient:stripe,send}),/Owned order/);
  await assert.rejects(()=>mail.emailTestCheckout({orderId:id,ownerId:'business-a',dbClient:db,stripeClient:{checkout:{sessions:{retrieve:async()=>({...session,customer_email:'someoneelse@example.com'})}}},send}),/intended customer/);
  console.log('TRYAMM owner-scoped test Checkout status / delivery checks PASS');
 }finally{
  for(const key of ['TRYAMM_CHECKOUT_EMAIL_TEST_ENABLED','TRYAMM_ORDERS_DURABLE_ENABLED','STRIPE_SECRET_KEY','RESEND_API_KEY','TRYAMM_QUOTE_FROM_EMAIL']){
   if(prev[key]===undefined)delete process.env[key];else process.env[key]=prev[key];
  }
 }
})().catch(e=>{console.error(e);process.exitCode=1});
