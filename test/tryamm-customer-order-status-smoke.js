'use strict';
const assert=require('node:assert/strict');
const tracker=require('../lib/tryamm-customer-order-status');
const crypto=require('node:crypto');
const token='a'.repeat(64),id='11111111-2222-4333-8444-555555555555';
assert.equal(tracker.hash(token),crypto.createHash('sha256').update(token).digest('hex'));
assert.throws(()=>tracker.hash('invalid'),/Invalid/);
(async()=>{
 const prev=Object.fromEntries(['TRYAMM_CUSTOMER_ORDER_STATUS_ENABLED','TRYAMM_ORDERS_DURABLE_ENABLED','RESEND_API_KEY','TRYAMM_QUOTE_FROM_EMAIL','APP_URL'].map(k=>[k,process.env[k]]));
 try{
  delete process.env.TRYAMM_CUSTOMER_ORDER_STATUS_ENABLED;
  await assert.rejects(()=>tracker.status(token),/not enabled/);
  // Storage is deliberately unconfigured in the default smoke environment. Test
  // the pure crypto contract and disabled-by-default policy without changing DB.
  console.log('Customer status: token hashing, invalid-token and disabled-by-default safeguards PASS');
 }finally{
  for(const [k,v] of Object.entries(prev)){if(v===undefined)delete process.env[k];else process.env[k]=v}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
