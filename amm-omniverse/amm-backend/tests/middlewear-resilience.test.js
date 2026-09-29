'use strict'
const assert=require('node:assert/strict')
const {EventEmitter}=require('node:events')
const {createMiddleWearResilience,classify}=require('../lib/middlewear-resilience')

function req(path,cls='normal'){return{path,url:path,originalUrl:path,swarmShield:{pathClass:cls}}}
function res(){
  const e=new EventEmitter()
  e.statusCode=200;e.headersSent=false;e.writableEnded=false;e.headers={}
  e.setHeader=(k,v)=>{e.headers[k]=v}
  e.status=code=>{e.statusCode=code;return e}
  e.json=body=>{e.body=body;e.headersSent=true;e.writableEnded=true;e.emit('finish');return e}
  return e
}

assert.equal(classify(req('/api/middleverse/handoffs','unknown')),'middleverse')
assert.equal(classify(req('/api/ai/answer','ai-expensive')),'ai-expensive')

let clock=1000
const shield=createMiddleWearResilience({
  now:()=>clock,
  policies:{
    normal:{maxConcurrent:1,timeoutMs:5000,failureThreshold:2,resetMs:10000,degradeable:true},
    middleverse:{maxConcurrent:1,timeoutMs:5000,failureThreshold:2,resetMs:10000,degradeable:false},
  },
})

{
  const a=req('/x');const ar=res();let nextA=false
  shield.middleware(a,ar,()=>{nextA=true})
  assert.equal(nextA,true)
  const b=req('/x');const br=res();let nextB=false
  shield.middleware(b,br,()=>{nextB=true})
  assert.equal(nextB,false)
  assert.equal(br.statusCode,503)
  ar.statusCode=200;ar.emit('finish')
}

{
  for(let i=0;i<2;i++){
    const q=req('/x');const rr=res()
    shield.middleware(q,rr,()=>{rr.statusCode=500;rr.emit('finish')})
  }
  const q=req('/x');const rr=res();let next=false
  shield.middleware(q,rr,()=>{next=true})
  assert.equal(next,false)
  assert.equal(rr.statusCode,503)
  assert.equal(rr.body.protected,true)
  clock+=10001
  const after=req('/x');const afterRes=res();let recovered=false
  shield.middleware(after,afterRes,()=>{recovered=true;afterRes.statusCode=200;afterRes.emit('finish')})
  assert.equal(recovered,true)
}

const status=shield.status()
assert.equal(status.principles.bulkheads,true)
assert.equal(status.principles.circuitBreakers,true)
assert.equal(status.principles.distributedEdgeProtectionStillRequired,true)
console.log('TRYAMM MiddleWear resilience contract: PASS')
