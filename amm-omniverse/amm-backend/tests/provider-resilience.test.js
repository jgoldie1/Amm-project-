'use strict'
const assert=require('node:assert/strict')
const {createProviderResilience}=require('../lib/provider-resilience')

async function run(){
  let calls=0
  const okFetch=async()=>({ok:true,status:200})
  const p=createProviderResilience({provider:'demo',fetchImpl:okFetch,maxConcurrent:2,timeoutMs:1000})
  const r=await p.fetch('https://example.test',{method:'GET'})
  assert.equal(r.status,200)
  assert.equal(p.status().failures,0)

  const flaky=async()=>{calls+=1;return{ok:calls>1,status:calls>1?200:503}}
  const retry=createProviderResilience({provider:'retry',fetchImpl:flaky,maxRetries:1})
  const rr=await retry.fetch('https://example.test',{method:'GET'})
  assert.equal(rr.status,200)
  assert.equal(calls,2)

  calls=0
  const postFlaky=async()=>{calls+=1;return{ok:false,status:503}}
  const noPostRetry=createProviderResilience({provider:'post',fetchImpl:postFlaky,maxRetries:3})
  await noPostRetry.fetch('https://example.test',{method:'POST'})
  assert.equal(calls,1,'unsafe POST must not retry by default')

  let now=1000
  const failFetch=async()=>({ok:false,status:503})
  const cb=createProviderResilience({provider:'cb',fetchImpl:failFetch,failureThreshold:2,resetMs:10000,maxRetries:0,now:()=>now})
  await cb.fetch('https://x',{method:'GET'})
  await cb.fetch('https://x',{method:'GET'})
  await assert.rejects(()=>cb.fetch('https://x',{method:'GET'}),/CIRCUIT_OPEN/)
  now+=10001
  const after=cb.status()
  assert.equal(after.circuitOpen,false)

  console.log('TRYAMM provider resilience contract: PASS')
}
run().catch(e=>{console.error(e);process.exit(1)})
