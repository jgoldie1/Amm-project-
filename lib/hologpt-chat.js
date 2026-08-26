'use strict';

const crypto=require('crypto');
const {readMemory,writeMemory}=require('./stubbs-ai-runtime');
const {buildPromptPacket}=require('./prompt-engine');

const TIMEOUT=Math.max(2000,Math.min(60000,Number(process.env.HOLOGPT_TIMEOUT_MS||20000)));
const AI_GATEWAY_AUTH=String(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN||'').trim();
const AI_GATEWAY_MODEL=String(process.env.HOLOGPT_GATEWAY_MODEL||'openai/gpt-5.6-sol').trim();
const OPENAI_KEY=String(process.env.OPENAI_API_KEY||'').trim();
const OPENAI_MODEL=String(process.env.HOLOGPT_OPENAI_MODEL||process.env.OPENAI_MODEL||'gpt-5.4').trim();
const COMPAT_URL=String(process.env.HOLOGPT_API_URL||'').trim();
const COMPAT_KEY=String(process.env.HOLOGPT_API_KEY||'').trim();
const COMPAT_MODEL=String(process.env.HOLOGPT_MODEL||'').trim();
const OLLAMA_BASE=String(process.env.OLLAMA_BASE_URL||'').trim().replace(/\/$/,'');
const OLLAMA_MODEL=String(process.env.OLLAMA_MODEL||'').trim();
const EXECUTIVE_URL=String(process.env.STUBBS_EXECUTIVE_URL||'').trim();
const GATEWAY_TOKEN=String(process.env.STUBBS_MODEL_GATEWAY_TOKEN||'').trim();

function providerCandidates(){
  const providers=[];
  if(AI_GATEWAY_AUTH)providers.push({name:'vercel-ai-gateway',run:callVercelGateway});
  if(OPENAI_KEY)providers.push({name:'openai-responses',run:callOpenAI});
  if(COMPAT_URL&&COMPAT_MODEL)providers.push({name:'openai-compatible',run:callCompatible});
  if(OLLAMA_BASE&&OLLAMA_MODEL)providers.push({name:'ollama',run:callOllama});
  if(EXECUTIVE_URL)providers.push({name:'stubbs-gateway',run:callStubbsGateway});
  return providers;
}

function status(){
  const providers=providerCandidates().map(provider=>provider.name);
  const provider=providers[0]||'local-degraded';
  return {
    ok:true,
    provider,
    providers,
    intelligentProviderConfigured:providers.length>0,
    vercelGatewayConfigured:Boolean(AI_GATEWAY_AUTH),
    gatewayModel:AI_GATEWAY_AUTH?AI_GATEWAY_MODEL:null,
    openaiConfigured:Boolean(OPENAI_KEY),
    openaiModel:OPENAI_KEY?OPENAI_MODEL:null,
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
    if(!response.ok){
      const message=data?.error?.message||data.error||data.message||`AI provider failed (${response.status})`;
      const error=new Error(typeof message==='string'?message:JSON.stringify(message));
      error.status=response.status;
      error.providerResponse=data;
      throw error;
    }
    return data;
  }catch(error){
    if(error?.name==='AbortError'){
      const timeoutError=new Error(`AI provider timed out after ${TIMEOUT}ms`);
      timeoutError.status=504;
      throw timeoutError;
    }
    throw error;
  }finally{
    clearTimeout(timer);
  }
}

function promptPacket(message,memory=[],context={}){
  return buildPromptPacket({message,memory,context});
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

async function callVercelGateway(message,memory,context){
  const packet=promptPacket(message,memory,context);
  const data=await fetchJson('https://ai-gateway.vercel.sh/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${AI_GATEWAY_AUTH}`},
    body:JSON.stringify({model:AI_GATEWAY_MODEL,instructions:packet.instructions,input:packet.message,max_output_tokens:1800,store:false})
  });
  const answer=extractOpenAIText(data);
  if(!answer)throw new Error('Vercel AI Gateway returned no text');
  return {answer,provider:'vercel-ai-gateway',model:data.model||AI_GATEWAY_MODEL,responseId:data.id||null,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

async function callOpenAI(message,memory,context){
  const packet=promptPacket(message,memory,context);
  const data=await fetchJson('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
    body:JSON.stringify({model:OPENAI_MODEL,instructions:packet.instructions,input:packet.message,max_output_tokens:1800,store:false})
  });
  const answer=extractOpenAIText(data);
  if(!answer)throw new Error('OpenAI returned no text');
  return {answer,provider:'openai-responses',model:data.model||OPENAI_MODEL,responseId:data.id||null,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

async function callCompatible(message,memory,context){
  const packet=promptPacket(message,memory,context);
  const data=await fetchJson(COMPAT_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(COMPAT_KEY?{'Authorization':`Bearer ${COMPAT_KEY}`}:{})},
    body:JSON.stringify({model:COMPAT_MODEL,messages:[{role:'system',content:packet.instructions},{role:'user',content:packet.message}],temperature:.25})
  });
  const answer=String(data?.choices?.[0]?.message?.content||data.answer||data.output||'').trim();
  if(!answer)throw new Error('Compatible model returned no text');
  return {answer,provider:'openai-compatible',model:data.model||COMPAT_MODEL,responseId:data.id||null,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

async function callOllama(message,memory,context){
  const packet=promptPacket(message,memory,context);
  const data=await fetchJson(`${OLLAMA_BASE}/api/chat`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:OLLAMA_MODEL,stream:false,messages:[{role:'system',content:packet.instructions},{role:'user',content:packet.message}]})
  });
  const answer=String(data?.message?.content||data.response||'').trim();
  if(!answer)throw new Error('Ollama returned no text');
  return {answer,provider:'ollama',model:data.model||OLLAMA_MODEL,responseId:null,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

async function callStubbsGateway(message,memory,context){
  const packet=promptPacket(message,memory,context);
  const data=await fetchJson(EXECUTIVE_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(GATEWAY_TOKEN?{'Authorization':`Bearer ${GATEWAY_TOKEN}`}:{})},
    body:JSON.stringify({role:'executive',objective:packet.message,type:'conversation',context:{channel:'hologpt',promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk,...context},memory:memory.map(m=>({scope:m.scope,summary:m.summary})),rules:[packet.instructions]})
  });
  const answer=String(data.answer||data.output||'').trim();
  if(!answer)throw new Error('Stubbs gateway returned no text');
  return {answer,provider:'stubbs-gateway',model:data.model||null,responseId:data.id||null,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

function localFallback(message,memory=[],context={}){
  const packet=promptPacket(message,memory,context);
  const q=packet.message;
  const lower=q.toLowerCase();
  let body='I am running in local degraded mode because no external language-model provider completed successfully on this deployment. I can still diagnose TRYAMM and explain platform state, but full generative HoloGPT intelligence requires at least one authorized model provider.';
  if(/not working|broken|holo|holoverse|response/.test(lower))body+=' The highest-priority repair chain is: route health → authentication → HoloGPT provider → memory → service-worker cache → deployed smoke test. The app should not be marked GREEN until each gate is verified.';
  if(/deploy|render|green|proof|test/.test(lower))body+=' Deployment proof must come from live `/api/health`, `/api/hologpt/health`, route checks, authenticated chat, persistence checks, and a clean client cache.';
  if(/game|world|spaceverse|metaverse|holoverse/.test(lower))body+=' The Holoverse should use one shared identity, avatar, world state, inventory, checkpoints, accessibility profile and route registry rather than disconnected pages.';
  return {answer:`${body}\n\nYour request: ${q.slice(0,900)}`,promptVersion:packet.version,promptMode:packet.mode,injectionRisk:packet.injectionRisk};
}

async function runProviders(message,memory,context){
  const failures=[];
  for(const provider of providerCandidates()){
    try{
      const result=await provider.run(message,memory,context);
      if(failures.length)result.providerErrors=failures;
      return result;
    }catch(error){
      failures.push({provider:provider.name,status:Number(error?.status)||null,message:String(error?.message||'provider failed').slice(0,500)});
    }
  }
  const fallback=localFallback(message,memory,context);
  return {
    ...fallback,
    provider:failures.length?'provider-error-fallback':'local-degraded',
    model:null,
    responseId:null,
    providerErrors:failures,
    providerError:failures.map(item=>`${item.provider}: ${item.message}`).join(' | ')||null
  };
}

async function chat({userId,message,context={}}={}){
  const seed=promptPacket(message,[],context);
  const clean=seed.message;
  if(!clean)throw Object.assign(new Error('message is required'),{status:400});

  let memory=[];
  try{
    memory=userId?await readMemory(userId,{limit:10}):[];
  }catch(error){
    memory=[];
  }

  const result=await runProviders(clean,memory,context);

  let memorySaved=false;
  let memoryError=null;
  if(userId&&result.answer){
    try{
      const isDegraded=result.provider.includes('local')||result.provider.includes('fallback');
      const saved=await writeMemory(userId,{
        scope:'working',
        summary:`USER: ${clean.slice(0,2000)}\nHOLOGPT: ${result.answer.slice(0,3500)}`,
        sourceIds:[`hologpt:${result.provider}:${crypto.createHash('sha1').update(clean).digest('hex').slice(0,12)}`],
        confidence:isDegraded?0.35:0.8,
        permissions:{owner:userId,context}
      });
      memorySaved=saved.saved===true;
    }catch(error){
      memoryError=String(error?.message||'memory save failed').slice(0,500);
    }
  }

  return {
    ok:true,
    answer:result.answer,
    provider:result.provider,
    model:result.model,
    responseId:result.responseId,
    degraded:result.provider.includes('local')||result.provider.includes('fallback'),
    providerError:result.providerError||null,
    providerErrors:result.providerErrors||[],
    memorySaved,
    memoryError,
    promptVersion:result.promptVersion||null,
    promptMode:result.promptMode||null,
    injectionRisk:Boolean(result.injectionRisk),
    status:status()
  };
}

module.exports={status,chat};