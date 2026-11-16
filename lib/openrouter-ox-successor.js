'use strict';

/**
 * Server-side, explicitly opt-in successor to OpenRouter's former Ox Alpha route.
 * No key in browser bundles, no autonomous tool execution, no purchase/publish calls.
 */
const ENDPOINT='https://openrouter.ai/api/v1/chat/completions';
const MODEL='z-ai/glm-5.3-flash';

function configured(env=process.env){
  return env.HOLOGPT_OPENROUTER_ENABLED==='true' && Boolean(String(env.OPENROUTER_API_KEY||'').trim());
}
function status(env=process.env){
  return {enabled:env.HOLOGPT_OPENROUTER_ENABLED==='true',configured:configured(env),model:MODEL,
    provider:'openrouter',purpose:'opt-in HoloGPT coding/reasoning fallback',
    makesLiveRequests:false,paidProvider:true,serverSideOnly:true};
}
async function complete({message,instructions,fetchImpl=globalThis.fetch,env=process.env}){
  if(!configured(env))throw Object.assign(new Error('OpenRouter model is not enabled/configured'),{status:503});
  if(typeof fetchImpl!=='function')throw new Error('fetch unavailable');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetchImpl(ENDPOINT,{
      method:'POST',signal:controller.signal,
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.OPENROUTER_API_KEY},
      body:JSON.stringify({model:MODEL,messages:[
        {role:'system',content:String(instructions||'').slice(0,12000)},
        {role:'user',content:String(message||'').slice(0,16000)}
      ],max_tokens:1024,temperature:0.2})
    });
    if(!response.ok)throw Object.assign(new Error('OpenRouter HTTP '+response.status),{status:response.status});
    const result=await response.json();
    const answer=result?.choices?.[0]?.message?.content;
    if(typeof answer!=='string'||!answer.trim())throw new Error('OpenRouter returned empty answer');
    return {answer:answer.trim(),model:result.model||MODEL,responseId:result.id||null};
  }finally{clearTimeout(timer)}
}
module.exports={configured,status,complete,MODEL,ENDPOINT};
