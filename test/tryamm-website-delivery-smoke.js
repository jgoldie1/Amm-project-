'use strict';
const assert=require('node:assert/strict');
const delivery=require('../lib/tryamm-website-delivery');
const crypto=require('node:crypto');
const token='a'.repeat(64);
assert.equal(delivery.hash(token),crypto.createHash('sha256').update(token).digest('hex'));
assert.throws(()=>delivery.hash('short'),/Invalid/);
assert.equal(delivery.reviewURL('https://preview.example.com/tryamm/'),'https://preview.example.com/tryamm/');
for(const url of ['http://preview.example.com','https://localhost/test','https://192.168.1.1','https://foo.local','https://user:pass@foo.com','https://foo.com:443','javascript:alert(1)'])
 assert.throws(()=>delivery.reviewURL(url),/HTTPS/);
(async()=>{
 await assert.rejects(()=>delivery.finalize({orderId:'11111111-2222-4333-8444-555555555555',ownerId:'owner',reference:'handoff-proof-123'}),/not activated/);
 await assert.rejects(()=>delivery.decide(token,{approve:true}),/not activated/);
 console.log('TRYAMM preview validation, review token and disabled delivery gates PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
