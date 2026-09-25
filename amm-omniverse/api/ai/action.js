import crypto from 'node:crypto';
import {requireUser,consumeStepUp,recentlyAuthenticated,audit} from '../_lib/security.js';

const RISKS=new Set(['READ_ONLY','REVERSIBLE_WRITE','EXTERNAL_COMMUNICATION','PUBLICATION','FINANCIAL','PRIVILEGE_CHANGE','SELF_MODIFICATION','EXTERNAL_SYSTEM_ACCESS']);
const STEP_UP_RISKS=new Set(['EXTERNAL_COMMUNICATION','PUBLICATION','EXTERNAL_SYSTEM_ACCESS']);
const clean=(value,max=1000)=>String(value||'').trim().slice(0,max);
const actionScope=(id,risk)=>`hologpt-action:${id}:${risk}`;

async function authorize(action,user,stepUpToken){
  const id=clean(action?.id,120);
  const risk=clean(action?.risk,64).toUpperCase();
  if(!id)return {allowed:false,code:'ACTION_ID_REQUIRED',reason:'A stable action id is required.'};
  if(!RISKS.has(risk))return {allowed:false,code:'INVALID_RISK',reason:'A recognized action risk is required.'};
  if(risk==='PRIVILEGE_CHANGE'||risk==='SELF_MODIFICATION'){
    return {allowed:false,code:'SELF_ESCALATION_DENIED',reason:'HoloGPT cannot grant itself privileges or modify its own authorization boundary.'};
  }
  if(risk==='FINANCIAL'){
    return {allowed:false,code:'DEDICATED_FINANCIAL_FLOW_REQUIRED',reason:'HoloGPT cannot directly move money. Use the dedicated server-authoritative commerce/payment flow.'};
  }
  if(risk!=='READ_ONLY'&&!action?.permissionGranted){
    return {allowed:false,code:'PERMISSION_REQUIRED',reason:'Action is outside the granted permission set.'};
  }
  if(risk==='REVERSIBLE_WRITE'&&!recentlyAuthenticated(user,600)){
    return {allowed:false,code:'RECENT_AUTH_REQUIRED',reason:'Sign in again before a write action.'};
  }
  if(STEP_UP_RISKS.has(risk)){
    const scope=actionScope(id,risk);
    const approved=await consumeStepUp(user.id,stepUpToken,scope);
    if(!approved)return {allowed:false,code:'STEP_UP_REQUIRED',reason:'Passkey step-up is required for this protected action.',stepUpAction:scope};
    return {allowed:true,code:'ALLOW',reason:'Protected action has a valid one-time passkey step-up.',stepUpMethod:approved.method||'passkey'};
  }
  return {allowed:true,code:'ALLOW',reason:'Action is inside the authenticated user authority boundary.'};
}

async function invokeExecutor({requestId,userId,action}){
  const endpoint=clean(process.env.HOLOGPT_ACTION_EXECUTOR_URL,2000);
  const secret=clean(process.env.HOLOGPT_ACTION_EXECUTOR_SECRET,2000);
  if(!endpoint||!secret||!/^https:\/\//i.test(endpoint))return {connected:false};
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),Math.max(3000,Math.min(45000,Number(process.env.HOLOGPT_ACTION_TIMEOUT_MS||20000))));
  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'content-type':'application/json',authorization:`Bearer ${secret}`,'x-tryamm-action-request':requestId},
      body:JSON.stringify({requestId,userId,action}),
      signal:controller.signal
    });
    const body=await response.json().catch(()=>({}));
    if(!response.ok)return {connected:true,ok:false,status:response.status,body};
    return {connected:true,ok:true,status:response.status,body};
  }finally{clearTimeout(timer)}
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  const requestId=crypto.randomUUID();
  const action=req.body?.action||{};
  const stepUpToken=String(req.headers['x-step-up-token']||req.body?.stepUpToken||'');
  const decision=await authorize(action,user,stepUpToken);

  if(!decision.allowed){
    await audit(user.id,'hologpt_action_denied','info',{requestId,actionId:clean(action?.id,120)||null,risk:clean(action?.risk,64),code:decision.code});
    return res.status(403).json({ok:false,requestId,state:'DENIED',authority:decision});
  }

  const executor=await invokeExecutor({requestId,userId:user.id,action});
  if(!executor.connected){
    await audit(user.id,'hologpt_action_executor_unavailable','info',{requestId,actionId:clean(action?.id,120)||null,risk:clean(action?.risk,64)});
    return res.status(503).json({
      ok:false,requestId,state:'AUTHORIZED_NOT_EXECUTED',authority:decision,
      code:'ACTION_EXECUTOR_NOT_CONNECTED',
      message:'Authority passed, but no approved server-side action executor is configured. No external action was performed.'
    });
  }

  if(!executor.ok){
    await audit(user.id,'hologpt_action_execution_failed','high',{requestId,actionId:clean(action?.id,120)||null,status:executor.status});
    return res.status(502).json({ok:false,requestId,state:'FAILED',authority:decision,code:'ACTION_EXECUTOR_FAILED'});
  }

  const result=executor.body||{};
  const executionEvidence=Array.isArray(result.executionEvidence)?result.executionEvidence:[];
  const observationEvidence=Array.isArray(result.observationEvidence)?result.observationEvidence:[];
  const verificationEvidence=Array.isArray(result.verificationEvidence)?result.verificationEvidence:[];
  const evidence=[...executionEvidence,...observationEvidence,...verificationEvidence].map(x=>clean(x,500)).filter(Boolean);
  const verified=result.verified===true&&result.observed===true&&executionEvidence.length>0&&observationEvidence.length>0&&verificationEvidence.length>0;
  const receipt={
    requestId,
    actionId:clean(action?.id,120)||null,
    state:verified?'VERIFIED':'FAILED',
    authority:decision,
    observed:Boolean(result.observed),
    verified:Boolean(result.verified),
    evidenceRefs:[...new Set(evidence)].slice(0,100),
    createdAt:new Date().toISOString()
  };
  await audit(user.id,verified?'hologpt_action_verified':'hologpt_action_unverified',verified?'info':'high',receipt);
  return res.status(verified?200:409).json({ok:verified,receipt});
}
