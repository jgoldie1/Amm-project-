'use strict';

const crypto=require('crypto');

module.exports=function registerHoloGPTRoutes({app,providerAdapter=null,actionGateway=null}){
  const samples=[];
  const receipts=[];
  const MAX_SAMPLES=200;
  const MAX_RECEIPTS=200;
  const now=()=>Number(process.hrtime.bigint()/1000000n);
  const pct=(values,p)=>{if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))]};
  const record=(sample)=>{samples.push(sample);if(samples.length>MAX_SAMPLES)samples.shift()};
  const recordReceipt=(receipt)=>{receipts.push(receipt);if(receipts.length>MAX_RECEIPTS)receipts.shift()};

  function authorizeActionRequest(action){
    const protectedRisks=new Set(['EXTERNAL_COMMUNICATION','PUBLICATION','FINANCIAL','PRIVILEGE_CHANGE','SELF_MODIFICATION','EXTERNAL_SYSTEM_ACCESS']);
    if(action.risk==='PRIVILEGE_CHANGE'||action.risk==='SELF_MODIFICATION'){
      if(!action.ownerApproved)return {allowed:false,code:'SELF_ESCALATION_DENIED',reason:'AI cannot grant itself authority or modify its authorization boundary.'};
    }
    if(action.risk==='EXTERNAL_SYSTEM_ACCESS'&&!action.permissionGranted){
      return {allowed:false,code:'UNAUTHORIZED_EXTERNAL_ACCESS_DENIED',reason:'Discovered access is not authorization.'};
    }
    if(protectedRisks.has(action.risk)&&!action.ownerApproved){
      return {allowed:false,code:'HUMAN_APPROVAL_REQUIRED',reason:'Protected action requires explicit human approval.'};
    }
    if(action.risk!=='READ_ONLY'&&!action.permissionGranted){
      return {allowed:false,code:'PERMISSION_REQUIRED',reason:'Action is outside the granted permission set.'};
    }
    return {allowed:true,code:'ALLOW',reason:'Action is inside the granted authority boundary.'};
  }

  app.get('/api/ai/health',(_req,res)=>{
    const ttft=samples.map(x=>x.ttftMs).filter(Number.isFinite);
    const total=samples.map(x=>x.totalMs).filter(Number.isFinite);
    res.json({
      ok:true,
      service:'TRYAMM HoloGPT AI Gateway',
      version:'1.1.0',
      inferenceConnected:Boolean(providerAdapter),
      actionGatewayConnected:Boolean(actionGateway),
      authorityBoundary:'HUMAN_AUTHORITY_REQUIRED',
      measurementMode:'gateway-observation',
      sampleCount:samples.length,
      receiptCount:receipts.length,
      ttftMs:{p50:pct(ttft,.50),p95:pct(ttft,.95)},
      totalMs:{p50:pct(total,.50),p95:pct(total,.95)},
      note:providerAdapter
        ? 'Authorized inference adapter connected. Privileged actions remain gated separately.'
        : 'Gateway instrumented. Provider inference remains disabled until an authorized adapter is connected.'
    });
  });

  app.post('/api/ai/hologpt',async(req,res)=>{
    const requestId=crypto.randomUUID(),started=now();
    const mode=String(req.body?.mode||'BALANCED').toUpperCase();
    const prompt=String(req.body?.prompt||'').trim();
    if(!prompt)return res.status(400).json({ok:false,requestId,error:'prompt is required'});
    if(!providerAdapter){
      const sample={requestId,mode,routeMs:now()-started,ttftMs:now()-started,totalMs:now()-started,provider:null,cacheHit:false,status:'PROVIDER_NOT_CONNECTED'};
      record(sample);
      return res.status(503).json({ok:false,requestId,code:'HOLOGPT_PROVIDER_NOT_CONNECTED',message:'HoloGPT gateway is instrumented, but no authorized inference provider is connected on this server yet.',telemetry:sample});
    }
    try{
      const result=await providerAdapter.infer({requestId,mode,prompt});
      const sample={requestId,mode,routeMs:0,ttftMs:Number.isFinite(result?.ttftMs)?result.ttftMs:null,totalMs:now()-started,provider:result?.provider||'authorized-adapter',cacheHit:Boolean(result?.cacheHit),status:'OK'};
      record(sample);
      return res.json({ok:true,requestId,response:result?.response??'',telemetry:sample});
    }catch(error){
      const sample={requestId,mode,routeMs:0,ttftMs:null,totalMs:now()-started,provider:null,cacheHit:false,status:'PROVIDER_ERROR'};record(sample);
      return res.status(502).json({ok:false,requestId,code:'HOLOGPT_PROVIDER_ERROR',message:'Authorized inference provider failed.',telemetry:sample});
    }
  });

  app.post('/api/ai/action',async(req,res)=>{
    const requestId=crypto.randomUUID();
    const action=req.body?.action||{};
    const authority=authorizeActionRequest(action);
    if(!authority.allowed){
      const receipt={requestId,state:'DENIED',authority,actionId:action.id||null,evidenceRefs:Array.isArray(action.evidenceRefs)?action.evidenceRefs:[],createdAt:new Date().toISOString()};
      recordReceipt(receipt);
      return res.status(403).json({ok:false,...receipt});
    }
    if(!actionGateway){
      const receipt={requestId,state:'FAILED',authority,actionId:action.id||null,evidenceRefs:Array.isArray(action.evidenceRefs)?action.evidenceRefs:[],createdAt:new Date().toISOString(),reason:'ACTION_GATEWAY_NOT_CONNECTED'};
      recordReceipt(receipt);
      return res.status(503).json({ok:false,...receipt});
    }
    try{
      const result=await actionGateway.execute(action);
      const observation=await actionGateway.observe(action,result);
      const verification=await actionGateway.verify(action,result,observation);
      const evidenceRefs=[...new Set([...(action.evidenceRefs||[]),...(result?.evidenceRefs||[]),...(observation?.evidenceRefs||[]),...(verification?.evidenceRefs||[])])];
      const receipt={requestId,state:verification?.verified?'VERIFIED':'FAILED',authority,actionId:action.id||null,observedOutcome:observation?.summary||null,evidenceRefs,createdAt:new Date().toISOString()};
      recordReceipt(receipt);
      if(verification?.verified&&typeof actionGateway.updateMemory==='function')await actionGateway.updateMemory(receipt);
      return res.status(verification?.verified?200:409).json({ok:Boolean(verification?.verified),receipt});
    }catch(error){
      const receipt={requestId,state:'FAILED',authority,actionId:action.id||null,evidenceRefs:action.evidenceRefs||[],createdAt:new Date().toISOString(),reason:'ACTION_EXECUTION_FAILED'};recordReceipt(receipt);
      return res.status(502).json({ok:false,receipt});
    }
  });
};
