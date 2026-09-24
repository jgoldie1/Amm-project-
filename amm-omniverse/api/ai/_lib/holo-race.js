const warmHealth=globalThis.__tryammHoloProviderHealth||(globalThis.__tryammHoloProviderHealth=new Map());

const now=()=>Date.now();
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const clean=(value,n=120)=>String(value||'').trim().slice(0,n);

export function classifyHoloIntent(question=''){
  const q=String(question).toLowerCase();
  if(/\b(code|typescript|javascript|github|build|deploy|bug|error|ci|repository|api)\b/.test(q))return 'coding';
  if(/\b(image|photo|video|camera|vision|screen|visual|3d|hologram)\b/.test(q))return 'multimodal';
  if(/\b(research|latest|source|compare|evidence|fact|news|current)\b/.test(q))return 'research';
  if(/\b(create|write|story|script|music|design|idea|brainstorm)\b/.test(q))return 'creative';
  if(/\b(open|start|launch|send|publish|go live|pk|streetverse|gameverse|marketplace)\b/.test(q))return 'action';
  return 'general';
}

function baseCapabilityScore(name,intent){
  const n=String(name||'').toLowerCase();
  const tables={
    coding:{openai:1.0,claude:.98,glm:.86,deepseek:.9,gemini:.88,gateway:.78,selfhost:.72,backend:.72},
    multimodal:{gemini:1.0,openai:.96,gateway:.82,claude:.84,glm:.75,selfhost:.65,backend:.68,deepseek:.58},
    research:{openai:.96,gemini:.94,claude:.94,gateway:.84,glm:.8,deepseek:.78,selfhost:.7,backend:.72},
    creative:{claude:.98,openai:.96,gemini:.94,glm:.84,gateway:.82,selfhost:.72,backend:.7,deepseek:.72},
    action:{backend:1.0,selfhost:.88,openai:.86,gemini:.82,claude:.82,gateway:.8,glm:.72,deepseek:.68},
    general:{openai:.96,claude:.94,gemini:.93,gateway:.86,glm:.82,deepseek:.78,selfhost:.76,backend:.74},
  };
  const row=tables[intent]||tables.general;
  for(const [key,value] of Object.entries(row))if(n.includes(key))return value;
  return .7;
}

function providerHealth(name){
  const item=warmHealth.get(name);
  if(!item)return {successRate:.92,latencyMs:2400,samples:0,failures:0,successes:0,lastError:null};
  return item;
}

function updateHealth(name,{ok,latencyMs,error}){
  const old=providerHealth(name);
  const samples=Math.min(80,old.samples+1);
  const alpha=samples<8?.28:.12;
  const nextLatency=old.samples?Math.round(old.latencyMs*(1-alpha)+latencyMs*alpha):latencyMs;
  const successes=old.successes+(ok?1:0);
  const failures=old.failures+(ok?0:1);
  const observed=successes/Math.max(1,successes+failures);
  const successRate=clamp(old.successRate*.65+observed*.35,.08,.995);
  warmHealth.set(name,{successRate,latencyMs:nextLatency,samples,failures,successes,lastError:ok?null:clean(error,180)});
}

function scoreRunner(runner,intent){
  const health=providerHealth(runner.name);
  const capability=baseCapabilityScore(runner.name,intent);
  const reliability=health.successRate;
  const latency=1-clamp((health.latencyMs-500)/9500,0,.9);
  const privacy=runner.local?.12:0;
  return capability*.54+reliability*.3+latency*.16+privacy+Number(runner.priority||0);
}

function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

export async function raceHoloProviders({question,runners,hedgeDelayMs=650,maxParallel=3}){
  const intent=classifyHoloIntent(question);
  const ordered=[...runners]
    .map(r=>({...r,score:scoreRunner(r,intent)}))
    .sort((a,b)=>b.score-a.score);

  const startedAt=now();
  const attempts=[];
  let resolved=false;

  async function attempt(runner,index){
    if(index>0)await delay(hedgeDelayMs*index);
    if(resolved)throw new Error('race_already_resolved');
    const began=now();
    try{
      const result=await runner.run();
      const latencyMs=now()-began;
      if(!result||!result.answer)throw new Error('provider_unavailable');
      updateHealth(runner.name,{ok:true,latencyMs});
      attempts.push({provider:runner.name,ok:true,latencyMs,score:Number(runner.score.toFixed(3))});
      resolved=true;
      return {result,runner,latencyMs};
    }catch(error){
      const latencyMs=now()-began;
      const message=clean(error?.message||error,220);
      if(message!=='race_already_resolved'){
        updateHealth(runner.name,{ok:false,latencyMs,error:message});
        attempts.push({provider:runner.name,ok:false,latencyMs,error:message,score:Number(runner.score.toFixed(3))});
      }
      throw error;
    }
  }

  const primary=ordered.slice(0,Math.max(1,Math.min(maxParallel,ordered.length)));
  try{
    const winner=await Promise.any(primary.map((runner,index)=>attempt(runner,index)));
    return {
      ...winner.result,
      orchestration:{
        mode:'hedged-model-race',
        intent,
        winner:winner.runner.name,
        winnerScore:Number(winner.runner.score.toFixed(3)),
        totalLatencyMs:now()-startedAt,
        hedgeDelayMs,
        attempted:attempts,
        progress:['UNDERSTANDING','ROUTING','RACING_MODELS','VERIFYING','COMPLETE']
      }
    };
  }catch{
    for(const runner of ordered.slice(primary.length)){
      const began=now();
      try{
        const result=await runner.run();
        const latencyMs=now()-began;
        if(!result||!result.answer)throw new Error('provider_unavailable');
        updateHealth(runner.name,{ok:true,latencyMs});
        attempts.push({provider:runner.name,ok:true,latencyMs,score:Number(runner.score.toFixed(3))});
        return {
          ...result,
          orchestration:{
            mode:'recovery-failover',
            intent,
            winner:runner.name,
            winnerScore:Number(runner.score.toFixed(3)),
            totalLatencyMs:now()-startedAt,
            hedgeDelayMs,
            attempted:attempts,
            progress:['UNDERSTANDING','ROUTING','PRIMARY_RACE_FAILED','RECOVERING','VERIFYING','COMPLETE']
          }
        };
      }catch(error){
        const latencyMs=now()-began;
        const message=clean(error?.message||error,220);
        updateHealth(runner.name,{ok:false,latencyMs,error:message});
        attempts.push({provider:runner.name,ok:false,latencyMs,error:message,score:Number(runner.score.toFixed(3))});
      }
    }
  }
  const error=new Error('all_hologpt_providers_failed');
  error.attempts=attempts;
  error.intent=intent;
  throw error;
}

export function getHoloProviderHealth(){
  return [...warmHealth.entries()].map(([provider,value])=>({provider,...value}));
}
