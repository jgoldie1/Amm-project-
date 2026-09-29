'use strict'

const assert=require('node:assert/strict')
const {createJacobieSwarmShield,pathClass}=require('../lib/jacobie-swarm-shield')

function request(path,{ip='203.0.113.10',method='GET',auth='',contentLength=0}={}){
  return{path,url:path,method,ip,headers:{authorization:auth,'content-length':String(contentLength)}}
}
function response(){
  const headers={}
  return{
    headers,statusCode:200,body:null,
    setHeader:(k,v)=>{headers[k]=v},
    status(code){this.statusCode=code;return this},
    json(body){this.body=body;return this},
  }
}

assert.equal(pathClass(request('/api/ai/answer')),'ai-expensive')
assert.equal(pathClass(request('/api/asset-forge/text-to-3d/preview')),'asset-expensive')
assert.equal(pathClass(request('/api/treasury/summary')),'financial-sensitive')
assert.equal(pathClass(request('/api/stripe/webhook')),'provider-webhook')

let clock=1000
const shield=createJacobieSwarmShield({now:()=>clock})

{
  const req=request('/api/marketplace/products')
  const res=response();let next=false
  shield.middleware(req,res,()=>{next=true})
  assert.equal(next,true)
  assert.equal(res.headers['X-TRYAMM-Swarm-Shield'],'active')
  assert.ok(req.swarmShield.sourceHash)
  assert.equal(req.swarmShield.principalHash,null)
}

{
  const req=request('/api/ai/answer',{method:'POST',contentLength:2_000_001})
  const res=response();let next=false
  shield.middleware(req,res,()=>{next=true})
  assert.equal(next,false)
  assert.equal(res.statusCode,413)
}

{
  let blocked=false
  for(let i=0;i<10;i++){
    const req=request('/api/asset-forge/text-to-3d/preview',{method:'POST',ip:'203.0.113.99',auth:'Bearer synthetic-test-token'})
    const res=response()
    shield.middleware(req,res,()=>{})
    if(res.statusCode===429)blocked=true
  }
  assert.equal(blocked,true,'expensive endpoint burst should be throttled')
}

{
  clock+=120_000
  const req=request('/api/asset-forge/text-to-3d/preview',{method:'POST',ip:'203.0.113.99',auth:'Bearer synthetic-test-token'})
  const res=response();let next=false
  shield.middleware(req,res,()=>{next=true})
  assert.equal(next,true,'bucket should recover after refill window')
}

assert.equal(shield.policy.rawIpStored,false)
assert.equal(shield.policy.rawAuthorizationStored,false)
assert.equal(shield.policy.edgeDdosProviderStillRequired,true)

console.log('Jacobie Swarm Shield contract: PASS')
