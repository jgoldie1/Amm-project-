'use strict';
const assert=require('assert');

(async()=>{
  delete process.env.OPENAI_API_KEY;
  delete process.env.HOLOGPT_API_URL;
  delete process.env.HOLOGPT_API_KEY;
  delete process.env.HOLOGPT_MODEL;
  delete process.env.OLLAMA_BASE_URL;
  delete process.env.OLLAMA_MODEL;
  delete process.env.STUBBS_EXECUTIVE_URL;
  const hologpt=require('../lib/hologpt-chat');
  const state=hologpt.status();
  assert.equal(state.ok,true);
  assert.equal(state.provider,'local-degraded');
  const result=await hologpt.chat({userId:'smoke-user',message:'Why is the Holoverse not working?',context:{page:'/test'}});
  assert.equal(result.ok,true);
  assert.equal(result.degraded,true);
  assert.ok(result.answer.length>80);
  assert.ok(/Holoverse|TRYAMM|model/i.test(result.answer));
  console.log('HoloGPT chat smoke: PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
