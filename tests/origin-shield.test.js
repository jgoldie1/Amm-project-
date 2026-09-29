'use strict'
const assert=require('node:assert/strict')
const crypto=require('node:crypto')
process.env.TRYAMM_EDGE_ORIGIN_SECRET='test-secret'
const {verifyOriginShield}=require('../lib/tryamm-origin-shield')

const raw=Buffer.from(JSON.stringify({roomId:'x'}))
const ts=Date.now(),requestId='request-1234567890'
const path='/api/checkout'
const hash=crypto.createHash('sha256').update(raw).digest('hex')
const signature=crypto.createHmac('sha256','test-secret').update(['POST',path,String(ts),requestId,hash].join('\n')).digest('hex')
const req={method:'POST',path,rawBody:raw,headers:{
  'x-tryamm-edge-timestamp':String(ts),
  'x-tryamm-edge-request-id':requestId,
  'x-tryamm-edge-signature':signature,
}}
assert.equal(verifyOriginShield(req).ok,true)
req.headers['x-tryamm-edge-signature']='00'
assert.equal(verifyOriginShield(req).ok,false)
assert.equal(verifyOriginShield({method:'GET',path:'/api/health',rawBody:Buffer.alloc(0),headers:{}}).required,false)
console.log('TRYAMM Origin Shield contract: PASS')
