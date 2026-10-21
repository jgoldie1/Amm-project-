import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDraft,normalizeDraft,executeOne} from '../api/_lib/ai-cafe-executor.js';
import {createJobsHandler} from '../api/agents/jobs.js';
const input={name:'Freight <script>alert(1)</script>',headline:'Move equipment',description:'Public details',services:'Hauling\nDispatch'};
test('renderer escapes markup and produces repeatable evidence',()=>{
 const r=buildDraft(input);assert.ok(r.html.includes('&lt;script&gt;'));assert.ok(!r.html.includes('<script>'));
 assert.equal(r.sha256,buildDraft(input).sha256);assert.equal(r.modelCalls,0);
 assert.throws(()=>normalizeDraft({...input,services:'a'.repeat(2001)}));assert.throws(()=>normalizeDraft({...input,name:''}));
});
test('executor records results under claimed lease and owner',async()=>{
 const calls=[];const result=await executeOne({userId:'owner',jobId:'job',rpc:async(n,b)=>{calls.push([n,b]);return n==='ai_cafe_claim'?[{id:'job',lease_token:'lease',input}]:true}});
 assert.equal(result.completed,true);assert.equal(calls[0][1].p_user,'owner');assert.equal(calls[1][1].p_token,'lease');assert.ok(calls[1][1].p_output.sha256);
});
test('failed render is sanitized; lost lease never reports success',async()=>{
 const rpc=async n=>n==='ai_cafe_claim'?[{id:'job',lease_token:'lease',input}]:false;
 assert.equal((await executeOne({rpc})).completed,false);
 let error;await executeOne({render:()=>{throw Error('private')},rpc:async(n,b)=>{if(n==='ai_cafe_claim')return [{id:'job',lease_token:'lease',input}];error=b.p_error;return true}});assert.equal(error,'draft_render_failed');
});
function response(){return {code:0,setHeader(){},status(c){this.code=c;return this},json(p){this.payload=p;return this}}}
test('unauthorized caller cannot reach persistence',async()=>{
 let called=false;const handler=createJobsHandler({userFor:async()=>({id:'user'}),allowed:()=>false,rest:async()=>{called=true}});
 const res=response();await handler({method:'GET'},res);assert.equal(res.code,403);assert.equal(called,false);
});
test('list and execution ignore caller-supplied owner',async()=>{
 let query,execution;const handler=createJobsHandler({userFor:async()=>({id:'owner'}),allowed:()=>true,rest:async(_,o)=>{query=o.query;return []},execute:async o=>{execution=o;return {executed:false}}});
 await handler({method:'GET',query:{user_id:'victim'}},response());assert.equal(query.user_id,'eq.owner');
 await handler({method:'PATCH',body:{id:'11111111-1111-4111-8111-111111111111',userId:'victim'}},response());assert.equal(execution.userId,'owner');
});
test('unsupported jobs never reach queue',async()=>{
 let called=false;const handler=createJobsHandler({userFor:async()=>({id:'owner'}),allowed:()=>true,rpc:async()=>{called=true}});
 const res=response();await handler({method:'POST',body:{kind:'shell',requestKey:'11111111-1111-4111-8111-111111111111',input}},res);assert.equal(res.code,400);assert.equal(called,false);
});
