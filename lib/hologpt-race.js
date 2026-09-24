'use strict';

const warmHealth=global.__tryammHoloProviderHealth||(global.__tryammHoloProviderHealth=new Map());

const now=()=>Date.now();
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const clean=(value,n=160)=>String(value||'').trim().slice(0,n);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function classifyIntent(message=''){
  const q=String(message).toLowerCase();
  if(/\b(code|typescript|javascript|github|build|deploy|bug|error|ci|repository|api)\b/.test(q))return 'coding';
  if(/\b(image|photo|video|camera|vision|screen|visual|3d|hologram)\b/.test(q))return 'multimodal';
  if(/\b(research|latest|source|compare|evidence|fact|news|current)\b/.test(q))return 'research';
  if(/\b(create|write|story|script|music|design|idea|brainstorm)\b/.test(q))return 'creative';
  if(/\b(open|start|launch|send|publish|go live|pk|streetverse|gameverse|marketplace)\b/.test(q))return 'action';
  return 'general';
}

function baseCapabilityScore(name,intent){
  const n=String(name||'').toLowerCase();
  const table={
    coding:{'openai-responses':1,'vercel-ai-gateway':.9,'openai-compatible':.84,ollama:.74,'stubbs-gateway':.78},
    multimodal:{'openai-responses':.97,'vercel-ai-gateway':.92,'openai-compatible':.78,ollama:.62,'stubbs-gateway':.7},
    research:{'openai-responses':.97,'vercel-ai-gateway':.93,'openai-compatible':.82,ollama:.68,'stubbs-gateway':.74},
    creative:{'openai-responses':.96,'vercel-ai-gateway':.93,'openai-compatible':.84,ollama:.72,'stubbs-gateway':.7},
    action:{'stubbs-gateway':1,'openai-responses':.86,'vercel-ai-gateway':.84,'openai-compatible':.8,ollama:.76},
    general:{'openai-responses':.96,'vercel-ai-gateway':.93,'openai-compatible':.84,ollama:.74,'stubbs-gateway':.76}
  };
  return (table[intent]||table.general)[n]||.72;
}

function providerHealth(name){
  return warmHealth.get(name)||{successRate:.92,latencyMs:2200,samples:0,failures:0,successes:0,lastError:null};
}

function updateHealth(name,{ok,latencyMs,error}){
  const old=providerHealth(name);
  const samples=Math.min(80,old.samples+1);
  const alpha=samples<8?.28:.12;
  const avg=old.samples?Math.round(old.latencyMs*(1-alpha)+latencyMs*alpha):latencyMs;
  const successes=old.successes+(ok?1:0);
  const failures=old.failures+(ok?0:1);
  const observed=successes/Math.max(1,successes+failures);
  warmHealth.set(name,{
    successRate:clamp(old.successRate*.65+observed*.35,.08,.995),
    latencyMs:avg,samples,failures,successes,lastError:ok?null:clean(error,220)
  });
}

function score(provider,intent){
  const h=providerHealth(provider.name);
  const capability=baseCapabilityScore(provider.name,intent);
  const latency=1-clamp((h.latencyMs-450)/9500,0,.9);
  const locality=provider.local?.1:0;
  return capability*.55+h.successRate*.29+latency*.16+locality+Number(provider.priority||0);
}

async function raceProviders({message,memory,context,providers,hedgeDelayMs=550,width=3}){
  const intent=classifyIntent(message);
  const ranked=[...providers].map(p=>({...p,score:score(p,intent)})).sort((a,b)=>b.score-a.score);
  const startedAt=now();
  const attempts=[];
  let resolved=false;

  async function attempt(provider,index){
    if(index)await delay(hedgeDelayMs*index);
    if(resolved)throw new Error('race_already_resolved');
    const began=now();
    try{
      const result=await provider.run(message,memory,context);
      const latencyMs=now()-began;
      if(!result||!result.answer)throw new Error('provider_empty_response');
      updateHealth(provider.name,{ok:true,latencyMs});
      attempts.push({provider:provider.name,ok:true,latencyMs,score:Number(provider.score.toFixed(3))});
      resolved=true;
      return {provider,result};
    }catch(error){
      const latencyMs=now()-began;
      const msg=clean(error?.message||error,260);
      if(msg!=='race_already_resolved'){
        updateHealth(provider.name,{ok:false,latencyMs,error:msg});
        attempts.push({provider:provider.name,ok:false,latencyMs,error:msg,status:Number(error?.status)||null,score:Number(provider.score.toFixed(3))});
      }
      throw error;
    }
  }

  const primary=ranked.slice(0,Math.max(1,Math.min(width,ranked.length)));
  try{
    const winner=await Promise.any(primary.map((provider,index)=>attempt(provider,index)));
    return {
      ...winner.result,
      providerErrors:attempts.filter(x=>!x.ok),
      orchestration:{
        mode:'hedged-model-race',
        intent,
        winner:winner.provider.name,
        totalLatencyMs:now()-startedAt,
        hedgeDelayMs,
        attempts,
        progress:['UNDERSTANDING','ROUTING','RACING_MODELS','VERIFYING','COMPLETE']
      }
    };
  }catch{
    for(const provider of ranked.slice(primary.length)){
      const began=now();
      try{
        const result=await provider.run(message,memory,context);
        const latencyMs=now()-began;
        if(!result||!result.answer)throw new Error('provider_empty_response');
        updateHealth(provider.name,{ok:true,latencyMs});
        attempts.push({provider:provider.name,ok:true,latencyMs,score:Number(provider.score.toFixed(3))});
        return {
          ...result,
          providerErrors:attempts.filter(x=>!x.ok),
          orchestration:{
            mode:'recovery-failover',
            intent,
            winner:provider.name,
            totalLatencyMs:now()-startedAt,
            hedgeDelayMs,
            attempts,
            progress:['UNDERSTANDING','ROUTING','PRIMARY_RACE_FAILED','RECOVERING','VERIFYING','COMPLETE']
          }
        };
      }catch(error){
        const latencyMs=now()-began;
        const msg=clean(error?.message||error,260);
        updateHealth(provider.name,{ok:false,latencyMs,error:msg});
        attempts.push({provider:provider.name,ok:false,latencyMs,error:msg,status:Number(error?.status)||null,score:Number(provider.score.toFixed(3))});
      }
    }
  }

  const error=new Error('all_hologpt_providers_failed');
  error.intent=intent;
  error.attempts=attempts;
  throw error;
}

function healthSnapshot(){
  return [...warmHealth.entries()].map(([provider,value])=>({provider,...value}));
}

module.exports={classifyIntent,raceProviders,healthSnapshot};
