'use strict';

const crypto=require('crypto');
const {readMemory,writeMemory}=require('./stubbs-ai-runtime');

const TIMEOUT=Math.max(2000,Math.min(60000,Number(process.env.HOLOGPT_TIMEOUT_MS||20000)));
const OPENAI_KEY=String(process.env.OPENAI_API_KEY||'').trim();
const OPENAI_MODEL=String(process.env.HOLOGPT_OPENAI_MODEL||process.env.OPENAI_MODEL||'gpt-5.4').trim();
const COMPAT_URL=String(process.env.HOLOGPT_API_URL||'').trim();
const COMPAT_KEY=String(process.env.HOLOGPT_API_KEY||'').trim();
const COMPAT_MODEL=String(process.env.HOLOGPT_MODEL||'').trim();
const OLLAMA_BASE=String(process.env.OLLAMA_BASE_URL||'').trim().replace(/\/$/,'');
const OLLAMA_MODEL=String(process.env.OLLAMA_MODEL||'').trim();
const EXECUTIVE_URL=String(process.env.STUBBS_EXECUTIVE_URL||'').trim();
const GATEWAY_TOKEN=String(process.env.STUBBS_MODEL_GATEWAY_TOKEN||'').trim();

function status(){
  const provider=OPENAI_KEY?'openai-responses':COMPAT_URL&&COMPAT_MODEL?'openai-compatible':OLLAMA_BASE&&OLLAMA_MODEL?'ollama':EXECUTIVE_URL?'stubbs-gateway':'local-degraded';
  return {
    ok:true,
    provider,
    intelligentProviderConfigured:provider!=='local-degraded',
    openaiConfigured:Boolean(OPENAI_KEY),
    compatibleConfigured:Boolean(COMPAT_URL&&COMPAT_MODEL),
    ollamaConfigured:Boolean(OLLAMA_BASE&&OLLAMA_MODEL),
    stubbsGatewayConfigured:Boolean(EXECUTIVE_URL),
    persistentMemoryConfigured:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY)
  };
}

async function fetchJson(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT);
  try{
    const response=await fetch(url,{...options,signal:controller.signal});
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{data={text}}
    if(!response.ok){const error=new Error(data?.error?.message||data.error||data.message||`AI provider failed (${response.status})`);error.status=response.status;throw error}
    return data;
  }finally{clearTimeout(timer)}
}

function systemPrompt(memory=[]){
  const remembered=memory.slice(0,8).map((m,i)=>`${i+1}. ${String(m.summary||'').slice(0,900)}`).filter(Boolean).join('\n');
  return `You are HoloGPT, the conversational intelligence layer for TRYAMM and the Holoverse. Give complete, useful answers instead of short placeholder responses. Be clear about what is built, what is only planned, and what still needs verification. Never claim that code, deployment, payments, medical technology, hardware, or external actions happened unless evidence says they happened. Help the user operate TRYAMM, its creator platform, worlds, accessibility systems, business tools, and development workflow.\n${remembered?`Relevant persistent memory:\n${remembered}`:''}`;
}

function extractOpenAIText(data={}){
  if(typeof data.output_text==='string'&&data.output_text.trim())return data.output_text.trim();
  for(const item of Array.isArray(data.output)?data.output:[]){
    for(const part of Array.isArray(item.content)?item.content:[]){
      if(typeof part.text==='string'&&part.text.trim())return part.text.trim();
    }
  }
  return '';
}

async function callOpenAI(message,memory){
  const data=await fetchJson('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
    body:JSON.stringify({model:OPENAI_MODEL,instructions:systemPrompt(memory),input:message,max_output_tokens:1400,store:false})
  });
  const answer=extractOpenAIText(data);
  if(!answer)throw new Error('OpenAI returned no text');
  return {answer,provider:'openai-responses',model:data.model||OPENAI_MODEL,responseId:data.id||null};
}

async function callCompatible(message,memory){
  const data=await fetchJson(COMPAT_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(COMPAT_KEY?{'Authorization':`Bearer ${COMPAT_KEY}`}:{})},
    body:JSON.stringify({model:COMPAT_MODEL,messages:[{role:'system',content:systemPrompt(memory)},{role:'user',content:message}],temperature:.35})
  });
  const answer=String(data?.choices?.[0]?.message?.content||data.answer||data.output||'').trim();
  if(!answer)throw new Error('Compatible model returned no text');
  return {answer,provider:'openai-compatible',model:data.model||COMPAT_MODEL,responseId:data.id||null};
}

async function callOllama(message,memory){
  const data=await fetchJson(`${OLLAMA_BASE}/api/chat`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:OLLAMA_MODEL,stream:false,messages:[{role:'system',content:systemPrompt(memory)},{role:'user',content:message}]})
  });
  const answer=String(data?.message?.content||data.response||'').trim();
  if(!answer)throw new Error('Ollama returned no text');
  return {answer,provider:'ollama',model:data.model||OLLAMA_MODEL,responseId:null};
}

async function callStubbsGateway(message,memory){
  const data=await fetchJson(EXECUTIVE_URL,{
    method:'POST',headers:{'Content-Type':'application/json',...(GATEWAY_TOKEN?{'Authorization':`Bearer ${GATEWAY_TOKEN}`}:{})},
    body:JSON.stringify({role:'executive',objective:message,type:'conversation',context:{channel:'hologpt'},memory:memory.map(m=>({scope:m.scope,summary:m.summary})),rules:['Return a complete conversational answer in answer.','Do not claim unverified actions occurred.']})
  });
  const answer=String(data.answer||data.output||'').trim();
  if(!answer)throw new Error('Stubbs gateway returned no text');
  return {answer,provider:'stubbs-gateway',model:data.model||null,responseId:data.id||null};
}

function localFallback(message){
  const q=String(message||'').trim();
  const lower=q.toLowerCase();
  let body='I am running in local degraded mode because no external language-model provider is configured on this deployment. I can still diagnose TRYAMM and explain platform state, but full generative HoloGPT intelligence requires an authorized model provider.';
  if(/not working|broken|holo|holoverse|response/.test(lower))body+=' The highest-priority repair chain is: route health → authentication → HoloGPT provider → memory → service-worker cache → deployed smoke test. The app should not be marked GREEN until each gate is verified.';
  if(/deploy|render|green|proof|test/.test(lower))body+=' Deployment proof must come from live `/api/health`, `/api/hologpt/health`, route checks, authenticated chat, persistence checks, and a clean client cache.';
  if(/game|world|spaceverse|metaverse|holoverse/.test(lower))body+=' The Holoverse should use one shared identity, avatar, world state, inventory, checkpoints, accessibility profile and route registry rather than disconnected pages.';
  return `${body}\n\nYour request: ${q.slice(0,900)}`;
}

async function chat({userId,message,context={}}={}){
  const clean=String(message||'').trim().slice(0,12000);
  if(!clean)throw Object.assign(new Error('message is required'),{status:400});
  const memory=userId?await readMemory(userId,{limit:10}):[];
  let result;
  try{
    result=OPENAI_KEY?await callOpenAI(clean,memory):COMPAT_URL&&COMPAT_MODEL?await callCompatible(clean,memory):OLLAMA_BASE&&OLLAMA_MODEL?await callOllama(clean,memory):EXECUTIVE_URL?await callStubbsGateway(clean,memory):{answer:localFallback(clean),provider:'local-degraded',model:null,responseId:null};
  }catch(error){
    result={answer:`HoloGPT provider error: ${error.message}. I switched to diagnostic mode.\n\n${localFallback(clean)}`,provider:'provider-error-fallback',model:null,responseId:null,providerError:error.message};
  }
  let memorySaved=false;
  if(userId&&result.answer){
    const saved=await writeMemory(userId,{scope:'working',summary:`USER: ${clean.slice(0,2000)}\nHOLOGPT: ${result.answer.slice(0,3500)}`,sourceIds:[`hologpt:${result.provider}:${crypto.createHash('sha1').update(clean).digest('hex').slice(0,12)}`],confidence:result.provider.includes('local')||result.provider.includes('fallback')?.35:.8,permissions:{owner:userId,context}});
    memorySaved=saved.saved===true;
  }
  return {ok:true,answer:result.answer,provider:result.provider,model:result.model,responseId:result.responseId,degraded:result.provider.includes('local')||result.provider.includes('fallback'),providerError:result.providerError||null,memorySaved,status:status()};
}

module.exports={status,chat};
