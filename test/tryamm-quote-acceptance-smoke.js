'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const quote=require('../lib/tryamm-quote-acceptance');
const row={id:'11111111-2222-4333-8444-555555555555',price_cents:49900,currency:'usd',package_id:'preview',description:'Landing page, one Reel and QR graphic.',terms:'Delivery in agreed timeframe with two revisions and refund terms.'};
const fingerprint=quote.fingerprint(row);
assert.equal(fingerprint.length,64);
assert.notEqual(fingerprint,quote.fingerprint({...row,price_cents:125000}));
assert.notEqual(fingerprint,quote.fingerprint({...row,terms:'Different terms'}));
assert.equal(quote.tokenHash('a'.repeat(64)),crypto.createHash('sha256').update('a'.repeat(64)).digest('hex'));
assert.throws(()=>quote.tokenHash('weak-token'),/Invalid/);
(async()=>{
 const previous={...process.env};
 try{
  delete process.env.TRYAMM_QUOTE_ACCEPTANCE_ENABLED;
  await assert.rejects(()=>quote.previewAcceptance('a'.repeat(64)),/not enabled/);
  process.env.TRYAMM_ORDERS_DURABLE_ENABLED='true';
  process.env.TRYAMM_QUOTE_ACCEPTANCE_ENABLED='true';
  // In this test, public service-role env may not exist; no real network call is made.
  // Fingerprint and token checks above are pure and can run unconditionally.
  console.log('TRYAMM customer quote fingerprint, token and fail-closed verification: PASS');
 }finally{Object.assign(process.env,previous)}
})().catch(e=>{console.error(e);process.exitCode=1});
