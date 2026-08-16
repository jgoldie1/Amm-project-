'use strict';

const crypto=require('crypto');
const supabase=require('./supabase-rest');
const {createBrainResult}=require('./stubbs-ai-second-brain');
const {solarPlexusGuard,consensusGate,spiderSense}=require('./stubbs-ai-tribrain');

const EXECUTIVE_URL=String(process.env.STUBBS_EXECUTIVE_URL||'').trim();
const CRITIC_URL=String(process.env.STUBBS_SECOND_BRAIN_URL||'').trim();
const SANDBOX_URL=String(process.env.STUBBS_SANDBOX_URL||'').trim();
const MODEL_TOKEN=String(process.env.STUBBS_MODEL_GATEWAY_TOKEN||'').trim();
const REQUEST_TIMEOUT_MS=Math.max(1000,Math.min(60000,Number(process.env.STUBBS_REQUEST_TIMEOUT_MS||15000)));

function now(){return new Date().toISOString()}
function rid(prefix){return `${prefix}_${crypto.randomBytes(12).toString('hex')}`}
function uniq(xs){return [...new Set((xs||[]).filter(Boolean).map(String))]}
function clamp01(n){return Math.max(0,Math.min(1,Number(n)||0))}
function normalizeKey(value){return String(value||'').trim().toLowerCase().replace(/\s+/g,' ').slice(0,240)}

function runtimeStatus(){
  return {
    executiveConfigured:Boolean(EXECUTIVE_URL),
    secondBrainConfigured:Boolean(CRITIC_URL),
    sandboxConfigured:Boolean(SANDBOX_URL),
    persistentMemoryConfigured:supabase.configured(),
    doublePassReady:Boolean(EXECUTIVE_URL&&CRITIC_URL),
    productionActionReady:Boolean(EXECUTIVE_URL&&CRITIC_URL&&SANDBOX_URL&&supabase.configured())
  };
}

async function postJson(url,payload){
  if(!url){const e=new Error('Provider is not configured');e.code='PROVIDER_NOT_CONFIGURED';throw e}
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT_MS);
  try{
    const response=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json',...(MODEL_TOKEN?{Authorization:`Bearer ${MODEL_TOKEN}`}:{})},
      body:JSON.stringify(payload),
      signal:controller.signal
    });
    const text=await response.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{data={answer:text}}
    if(!response.ok){const e=new Error(data.error||data.message||`Provider request failed (${response.status})`);e.status=response.status;e.code='PROVIDER_REQUEST_FAILED';throw e}
    return data;
  }finally{clearTimeout(timer)}
}

function providerUrl(role){return role==='executive'?EXECUTIVE_URL:role==='critic'?CRITIC_URL:''}

async function invokeBrain(role,{objective,type='general',context={},memory=[],constraints=[]}={}){
  const raw=await postJson(providerUrl(role),{
    role,
    objective,
    type,
    constraints,
    context,
    memory:memory.map(m=>({scope:m.scope,summary:m.summary,sourceIds:m.source_ids||m.sourceIds||[],confidence:Number(m.confidence||0)})),
    rules:[
      'Return JSON with answer, confidence, evidenceIds and conclusionKey.',
      'Do not claim tool execution or deployment unless evidence for that action is supplied.',
      'Use UNKNOWN when evidence is insufficient for a factual conclusion.'
    ]
  });
  return {
    answer:String(raw.answer||raw.output||'').trim(),
    confidence:clamp01(raw.confidence),
    evidenceIds:uniq(raw.evidenceIds||raw.evidence_ids),
    conclusionKey:normalizeKey(raw.conclusionKey||raw.conclusion_key||raw.answer||raw.output),
    assumptions:uniq(raw.assumptions),
    risks:uniq(raw.risks),
    providerMeta:raw.providerMeta||raw.provider_meta||null
  };
}

async function runSandbox(payload){
  if(!SANDBOX_URL)return null;
  const raw=await postJson(SANDBOX_URL,payload);
  return {
    passed:raw.passed===true||raw.status==='pass',
    status:raw.status|| (raw.passed===true?'pass':'fail'),
    evidenceIds:uniq(raw.evidenceIds||raw.evidence_ids),
    changedState:raw.changedState===true,
    error:raw.error||null,
    checks:Array.isArray(raw.checks)?raw.checks:[]
  };
}

async function readMemory(userId,{scope,limit=12}={}){
  if(!supabase.configured())return [];
  const safeLimit=Math.max(1,Math.min(50,Number(limit)||12));
  const filters=[`user_id=eq.${encodeURIComponent(userId)}`];
  if(scope)filters.push(`scope=eq.${encodeURIComponent(scope)}`);
  filters.push('order=updated_at.desc',`limit=${safeLimit}`);
  return await supabase.select('stubbs_ai_memory',filters.join('&'))||[];
}

async function writeMemory(userId,{scope='working',summary,sourceIds=[],confidence=.5,permissions={},expiresAt=null}={}){
  if(!supabase.configured())return {saved:false,reason:'SUPABASE_NOT_CONFIGURED'};
  if(!summary)return {saved:false,reason:'EMPTY_MEMORY'};
  const row={
    id:rid('mem'),user_id:userId,scope,summary:String(summary).slice(0,6000),source_ids:uniq(sourceIds),
    confidence:clamp01(confidence),permissions:permissions||{},expires_at:expiresAt,created_at:now(),updated_at:now()
  };
  const inserted=await supabase.insert('stubbs_ai_memory',[row]);
  return {saved:true,memory:Array.isArray(inserted)?inserted[0]:inserted};
}

async function writeAudit(userId,{taskId,eventType,status,riskBand,evidenceIds=[],details={}}={}){
  if(!supabase.configured())return {saved:false,reason:'SUPABASE_NOT_CONFIGURED'};
  const row={id:rid('aud'),user_id:userId,task_id:taskId||null,event_type:eventType||'runtime',status:status||'unknown',risk_band:riskBand||null,evidence_ids:uniq(evidenceIds),details:details||{},created_at:now()};
  await supabase.insert('stubbs_ai_audit',[row]);
  return {saved:true,id:row.id};
}

function needsSandbox(task={},riskBand='GREEN'){
  return task.type==='coding'||task.requiresTool===true||task.highImpact===true||['high','critical'].includes(task.actionRisk)||['YELLOW','ORANGE','RED'].includes(riskBand);
}

async function runStubbsTask({userId,task={}}={}){
  if(!userId)throw new Error('userId is required');
  const taskId=task.id||rid('task');
  const objective=String(task.objective||'').trim().slice(0,6000);
  if(!objective)return {taskId,status:'BLOCKED',verified:false,reason:'missing-objective'};

  const status=runtimeStatus();
  if(!status.doublePassReady){
    await writeAudit(userId,{taskId,eventType:'runtime-block',status:'blocked',details:{reason:'MODEL_PROVIDERS_NOT_CONFIGURED',runtimeStatus:status}});
    return {taskId,status:'BLOCKED',verified:false,reason:'MODEL_PROVIDERS_NOT_CONFIGURED',runtimeStatus:status};
  }

  const memory=await readMemory(userId,{limit:12});
  const base={objective,type:task.type||'general',constraints:Array.isArray(task.constraints)?task.constraints:[],context:task.context||{},memory};

  // Deliberately independent: the critic is not shown the Executive Brain output.
  const [primaryRaw,secondaryRaw]=await Promise.all([invokeBrain('executive',base),invokeBrain('critic',base)]);
  if(!primaryRaw.answer||!secondaryRaw.answer){
    return {taskId,status:'BLOCKED',verified:false,reason:'EMPTY_BRAIN_OUTPUT'};
  }

  const primary={...createBrainResult({brainId:'executive',...primaryRaw}),conclusionKey:primaryRaw.conclusionKey,decision:primaryRaw.conclusionKey};
  const secondary={...createBrainResult({brainId:'second-brain',...secondaryRaw}),conclusionKey:secondaryRaw.conclusionKey,decision:secondaryRaw.conclusionKey};
  const evidenceIds=uniq([...primary.evidenceIds,...secondary.evidenceIds,...(task.evidenceIds||[])]);
  const signals={...(task.telemetry||{})};
  if(primary.conclusionKey!==secondary.conclusionKey)signals.conflictingEvidence=Math.max(Number(signals.conflictingEvidence)||0,.5);
  if(Math.abs(primary.confidence-secondary.confidence)>.3)signals.confidenceDrop=Math.max(Number(signals.confidenceDrop)||0,.5);
  const sense=spiderSense(signals);

  const proposal={
    objective,type:task.type||'general',evidenceIds,timeSensitive:task.timeSensitive===true,fresh:task.fresh!==false,
    conflict:signals.conflictingEvidence>=1,reconciled:primary.conclusionKey===secondary.conclusionKey,
    requiresTool:task.requiresTool===true,toolPlan:task.toolPlan||null,highImpact:task.highImpact===true,
    approvalPlan:task.approvalPlan||null,reversible:task.reversible!==false
  };
  const guardian=solarPlexusGuard({proposal,signals});
  if(needsSandbox(task,sense.band)&&!guardian.blocked){guardian.sandboxRequired=true;guardian.decision='VERIFY'}

  let sandboxResult=null;
  if(guardian.sandboxRequired){
    sandboxResult=await runSandbox({taskId,objective,type:task.type||'general',primary,secondary,evidenceIds,checks:task.sandboxChecks||[]});
  }

  const gate=consensusGate({primary,secondary,guardian,sandboxResult});
  const verified=gate.accepted===true;
  const finalStatus=verified?'VERIFIED':gate.status||guardian.decision||'BLOCKED';

  if(verified){
    await writeMemory(userId,{scope:task.memoryScope||'episodic',summary:primary.answer,sourceIds:evidenceIds,confidence:Math.min(primary.confidence,secondary.confidence),permissions:{owner:userId}});
  }
  await writeAudit(userId,{taskId,eventType:'tri-brain-result',status:finalStatus.toLowerCase(),riskBand:sense.band,evidenceIds,details:{gate,guardian:{decision:guardian.decision,blocked:guardian.blocked,sandboxRequired:guardian.sandboxRequired},runtimeStatus:status}});

  return {
    taskId,status:finalStatus,verified,
    answer:verified?primary.answer:null,
    primary:{answer:primary.answer,confidence:primary.confidence,evidenceIds:primary.evidenceIds,conclusionKey:primary.conclusionKey},
    secondBrain:{answer:secondary.answer,confidence:secondary.confidence,evidenceIds:secondary.evidenceIds,conclusionKey:secondary.conclusionKey},
    spiderSense:sense,guardian,gate,sandboxResult,evidenceIds,runtimeStatus:status
  };
}

module.exports={runtimeStatus,invokeBrain,runSandbox,readMemory,writeMemory,writeAudit,needsSandbox,runStubbsTask};
