'use strict'
const assert=require('node:assert/strict')
const crypto=require('node:crypto')
process.env.TRYAMM_EDGE_ORIGIN_SECRET='test-secret'
const {verifyOriginShield,requireTryammEdge}=require('../lib/tryamm-origin-shield')

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

delete process.env.TRYAMM_EDGE_ORIGIN_SECRET
delete process.env.TRYAMM_EDGE_ORIGIN_SHIELD_ENFORCE
{
  const req={method:'POST',path:'/api/checkout',rawBody:Buffer.alloc(0),headers:{}}
  const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}}
  let next=false
  requireTryammEdge(req,res,()=>{next=true})
  assert.equal(next,true,'monitor mode must not break rollout before secret is configured')
  assert.equal(res.headers['X-TRYAMM-Origin-Shield'],'monitor')
}
process.env.TRYAMM_EDGE_ORIGIN_SHIELD_ENFORCE='true'
{
  const req={method:'POST',path:'/api/checkout',rawBody:Buffer.alloc(0),headers:{}}
  const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}}
  let next=false
  requireTryammEdge(req,res,()=>{next=true})
  assert.equal(next,false,'enforced mode must block unsigned direct origin calls')
  assert.equal(res.statusCode,403)
}
console.log('TRYAMM Origin Shield staged enforcement contract: PASS')

// With enforcement enabled, an otherwise valid signed request cannot be replayed
// within the same process. A different unique ID still succeeds.
process.env.TRYAMM_EDGE_ORIGIN_SECRET='test-secret'
{
  const stamp=Date.now()
  const signed=(id)=>{
    const payload=Buffer.from('{"action":"read"}')
    const hash=crypto.createHash('sha256').update(payload).digest('hex')
    const sig=crypto.createHmac('sha256','test-secret').update(['POST','/api/checkout',String(stamp),id,hash].join('\\n')).digest('hex')
    return {method:'POST',path:'/api/checkout',rawBody:payload,headers:{
      'x-tryamm-edge-timestamp':String(stamp),'x-tryamm-edge-request-id':id,'x-tryamm-edge-signature':sig
    }}
  }
  const first=signed('replay-test-unique-01')
  assert.equal(verifyOriginShield(first).ok,true)
  assert.equal(verifyOriginShield(first).reason,'replayed-or-overloaded-request')
  assert.equal(verifyOriginShield(signed('replay-test-unique-02')).ok,true)
}
delete process.env.TRYAMM_EDGE_ORIGIN_SECRET
console.log('TRYAMM Origin Shield local signed-request replay guard: PASS')

