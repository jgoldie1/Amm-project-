import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import vm from 'node:vm'
import {hasFactoryAuthority} from '../api/_lib/meshy-factory.js'
const exports={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/services/meshyFactoryClient.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,AbortController,setTimeout,clearTimeout,Promise,Error})
const {factoryRequest,singleFlight}=exports
const response=(status,payload)=>({ok:status>=200&&status<300,status,json:async()=>payload})
test('signed-out requests never reach the provider',async()=>{
 let calls=0;await assert.rejects(factoryRequest('/api/meshy/factory',{}, {getToken:async()=>null,fetch:async()=>{calls++}}),/Sign in/);assert.equal(calls,0)
})
test('authenticated request keeps authorization authoritative and preserves job ID',async()=>{
 let captured;const result=await factoryRequest('/api/meshy/factory',{method:'POST',body:'{"action":"start"}',headers:{authorization:'wrong'}},{getToken:async()=>'test-session',fetch:async(url,options)=>{captured=options;return response(202,{job:{id:'saved-job'}})}})
 assert.equal(captured.headers.authorization,'Bearer test-session');assert.equal(result.job.id,'saved-job');assert.equal(captured.cache,'no-store')
})
test('expired and unauthorized sessions are actionable',async()=>{
 for(const [code,message] of [[401,/session expired/],[403,/founder or asset-admin/]])await assert.rejects(factoryRequest('/api/meshy/factory',{}, {getToken:async()=>'test-session',fetch:async()=>response(code,{})}),message)
})
test('provider and malformed-response errors are not hidden',async()=>{
 await assert.rejects(factoryRequest('/api/meshy/tasks',{}, {getToken:async()=>'test-session',fetch:async()=>response(502,{message:'provider unavailable'})}),/provider unavailable/)
 await assert.rejects(factoryRequest('/api/meshy/tasks',{}, {getToken:async()=>'test-session',fetch:async()=>response(200,null)}),/invalid response/)
})
test('timeout warns about duplicate generation and does not retry',async()=>{
 let calls=0;await assert.rejects(factoryRequest('/api/meshy/factory',{method:'POST'}, {timeoutMs:5,getToken:async()=>'test-session',fetch:async(_url,{signal})=>{calls++;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted'))))}}),/provider job may already exist/);assert.equal(calls,1)
})
test('concurrent polling coalesces, then allows another poll',async()=>{
 let release,calls=0;const poll=singleFlight(async()=>{calls++;await new Promise(resolve=>{release=resolve});return 1})
 const a=poll(),b=poll();await Promise.resolve();assert.equal(calls,1);release();await Promise.all([a,b]);const c=poll();await Promise.resolve();assert.equal(calls,2);release();await c
})
test('editable profile data cannot grant factory permission',()=>{
 assert.equal(hasFactoryAuthority({id:'test',user_metadata:{role:'founder',roles:['admin']}}),false)
 assert.equal(hasFactoryAuthority({id:'test',app_metadata:{role:'founder'}}),true)
})
test('public readiness reports missing setup without exposing credentials',async()=>{
 const {default:health}=await import('../api/meshy/health.js')
 const saved=process.env.MESHY_API_KEY;process.env.MESHY_API_KEY='test-not-a-real-key'
 let body;const res={setHeader(){},status(){return this},json(value){body=value;return this}}
 try{await health({method:'GET'},res);assert.equal(body.configured,true);assert.equal(body.keyExposed,false);assert.equal(typeof body.durableStorageConfigured,'boolean');assert.ok(!JSON.stringify(body).includes('test-not-a-real-key'))}
 finally{if(saved===undefined)delete process.env.MESHY_API_KEY;else process.env.MESHY_API_KEY=saved}
})
test('published-model preview skips V15 while ordinary entry retains it',()=>{
 const source=fs.readFileSync(new URL('../src/runtime/StreetVerseMeshyBJHeroRuntime.ts',import.meta.url),'utf8')
 const fn=source.match(/export function getBJPreviewV15Url\(\):string\|null\{[\s\S]*?\n\}/)[0]
 const js=ts.transpileModule(fn,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText
 for(const [search,expected] of [['','v15'],['?bj=published',null],['?bj=legacy',null]]){
  const out={};vm.runInNewContext(js,{exports:out,window:{location:{search}},URLSearchParams,BJ_V15_PREVIEW:{url:'v15'}})
  assert.equal(out.getBJPreviewV15Url(),expected)
 }
})
