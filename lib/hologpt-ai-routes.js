'use strict';

const crypto=require('crypto');

module.exports=function registerHoloGPTRoutes({app}){
  const samples=[];
  const MAX_SAMPLES=200;
  const now=()=>Number(process.hrtime.bigint()/1000000n);
  const pct=(values,p)=>{if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))]};

  function record(sample){samples.push(sample);if(samples.length>MAX_SAMPLES)samples.shift()}

  app.get('/api/ai/health',(_req,res)=>{
    const ttft=samples.map(x=>x.ttftMs).filter(Number.isFinite);
    const total=samples.map(x=>x.totalMs).filter(Number.isFinite);
    res.json({
      ok:true,
      service:'TRYAMM HoloGPT AI Gateway',
      version:'1.0.0',
      inferenceConnected:false,
      measurementMode:'gateway-observation',
      sampleCount:samples.length,
      ttftMs:{p50:pct(ttft,.50),p95:pct(ttft,.95)},
      totalMs:{p50:pct(total,.50),p95:pct(total,.95)},
      note:'Health and latency telemetry are live at the gateway. Provider inference remains disabled until an authorized provider adapter is connected.'
    })
  });

  app.post('/api/ai/hologpt',async(req,res)=>{
    const requestId=crypto.randomUUID(),started=now();
    const mode=String(req.body?.mode||'BALANCED').toUpperCase();
    const prompt=String(req.body?.prompt||'').trim();
    if(!prompt)return res.status(400).json({ok:false,requestId,error:'prompt is required'});
    const accepted=now();
    const sample={requestId,mode,routeMs:accepted-started,ttftMs:null,totalMs:null,provider:null,cacheHit:false,status:'PROVIDER_NOT_CONNECTED'};
    sample.ttftMs=now()-started;sample.totalMs=sample.ttftMs;record(sample);
    res.status(503).json({
      ok:false,
      requestId,
      code:'HOLOGPT_PROVIDER_NOT_CONNECTED',
      message:'HoloGPT gateway is instrumented, but no authorized inference provider is connected on this server yet.',
      telemetry:sample
    })
  });
};
