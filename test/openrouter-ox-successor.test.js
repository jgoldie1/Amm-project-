'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const provider=require('../lib/openrouter-ox-successor');

test('Ox Alpha legacy slug maps to current OpenRouter model with opt-in only',()=>{
 assert.equal(provider.MODEL,'z-ai/glm-5.3-flash');
 assert.equal(provider.configured({OPENROUTER_API_KEY:'test-key'}),false);
 assert.equal(provider.configured({HOLOGPT_OPENROUTER_ENABLED:'true'}),false);
 assert.equal(provider.configured({HOLOGPT_OPENROUTER_ENABLED:'true',OPENROUTER_API_KEY:'test-key'}),true);
 assert.equal(provider.status({HOLOGPT_OPENROUTER_ENABLED:'false'}).configured,false);
});
test('disabled route never calls provider or bills',async()=>{
 let calls=0;
 await assert.rejects(provider.complete({message:'hi',env:{},fetchImpl:async()=>{calls++;return {}}}),/not enabled/);
 assert.equal(calls,0);
});
test('enabled route uses capped OpenAI-compatible request without exposing token in status',async()=>{
 let request;
 const env={HOLOGPT_OPENROUTER_ENABLED:'true',OPENROUTER_API_KEY:'dummy-local-test-key'};
 const fetchImpl=async(url,options)=>{
  request={url,options};
  return {ok:true,json:async()=>({id:'mock-1',model:provider.MODEL,choices:[{message:{content:'Safe test answer'}}]})};
 };
 const result=await provider.complete({env,message:'Help test StreetVerse',instructions:'Do not authorize payments',fetchImpl});
 assert.equal(result.answer,'Safe test answer');
 assert.equal(request.url,'https://openrouter.ai/api/v1/chat/completions');
 const body=JSON.parse(request.options.body);
 assert.equal(body.model,provider.MODEL);
 assert.equal(body.max_tokens,1024);
 assert.equal(body.messages[1].content,'Help test StreetVerse');
 assert.equal(request.options.headers.Authorization,'Bearer dummy-local-test-key');
 assert.ok(!JSON.stringify(provider.status(env)).includes('dummy-local-test-key'));
});
test('provider 402 propagates for existing HoloGPT fallback',async()=>{
 await assert.rejects(provider.complete({
  env:{HOLOGPT_OPENROUTER_ENABLED:'true',OPENROUTER_API_KEY:'dummy'},
  message:'hello',fetchImpl:async()=>({ok:false,status:402})
 }),error=>error.status===402);
});
