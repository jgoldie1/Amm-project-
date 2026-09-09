'use strict';

module.exports=function registerOmniSimRoutes({app,auth,clean,id}){
  const providerEndpoint=String(process.env.OMNISIM_PROVIDER_ENDPOINT||'').trim();
  const providerName=String(process.env.OMNISIM_PROVIDER_NAME||'MiroFish').trim()||'MiroFish';
  const defaultRounds=Math.max(1,Math.min(40,Number(process.env.OMNISIM_DEFAULT_ROUNDS||12)));
  const timeoutMs=Math.max(1000,Math.min(120000,Number(process.env.OMNISIM_TIMEOUT_MS||60000)));

  function normalizedUseCase(value){
    const allowed=new Set(['founder','streetverse','business','movie','holo-ads','global-market','mission','benny']);
    const candidate=clean(value,40).toLowerCase();
    return allowed.has(candidate)?candidate:'founder';
  }

  function buildPlan(body={}){
    const question=clean(body.question,1200);
    const seed=clean(body.seed,4000);
    const useCase=normalizedUseCase(body.useCase);
    const rounds=Math.max(1,Math.min(40,Number(body.rounds||defaultRounds)));
    const actors=Array.isArray(body.actors)?body.actors.slice(0,50).map(actor=>clean(actor,120)).filter(Boolean):[];
    return {
      id:id('sim'),
      engine:'TRYAMM OmniSim',
      provider:providerName,
      providerMode:providerEndpoint?'external-adapter':'planning-only',
      status:providerEndpoint?'READY_TO_DISPATCH':'BUILDING',
      useCase,
      question,
      seed,
      rounds,
      actors,
      requestedAt:new Date().toISOString(),
      scenarioBranches:['baseline','upside','downside'],
      decisionFlow:['SIMULATE','COMPARE','RISK','OPPORTUNITY','APPROVE','DEPLOY','MEASURE'],
      guardrails:{humanApprovalRequired:true,predictionIsNotFact:true,financialOrSafetyCriticalAutoDeploy:false}
    };
  }

  app.get('/api/omnisim/status',(_req,res)=>res.json({
    service:'TRYAMM OmniSim',
    status:providerEndpoint?'READY':'BUILDING',
    provider:providerName,
    providerConfigured:Boolean(providerEndpoint),
    maxRounds:40,
    integrations:['Founder Command Center','Benny','StreetVerse','Business Digital Twins','Movie/Drama','Holo Ads','Global Market','Mission Generator']
  }));

  app.post('/api/omnisim/plan',auth,(req,res)=>{
    const plan=buildPlan(req.body);
    if(!plan.question)return res.status(400).json({error:'Simulation question is required'});
    res.status(201).json({plan});
  });

  app.post('/api/omnisim/dispatch',auth,async(req,res,next)=>{
    try{
      const plan=buildPlan(req.body);
      if(!plan.question)return res.status(400).json({error:'Simulation question is required'});
      if(!providerEndpoint)return res.status(503).json({
        error:'OmniSim provider is not configured',
        code:'OMNISIM_PROVIDER_NOT_CONFIGURED',
        status:'BUILDING',
        required:['OMNISIM_PROVIDER_ENDPOINT'],
        plan
      });
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),timeoutMs);
      let response;
      try{
        response=await fetch(providerEndpoint,{
          method:'POST',
          headers:{'content-type':'application/json','accept':'application/json'},
          body:JSON.stringify({
            prediction_requirement:plan.question,
            seed_material:plan.seed,
            rounds:plan.rounds,
            actors:plan.actors,
            metadata:{source:'TRYAMM',simulationId:plan.id,useCase:plan.useCase}
          }),
          signal:controller.signal
        });
      }finally{clearTimeout(timeout)}
      const text=await response.text();
      let providerResult;
      try{providerResult=text?JSON.parse(text):{}}catch{providerResult={raw:text.slice(0,10000)}}
      if(!response.ok)return res.status(502).json({error:'OmniSim provider rejected the simulation',providerStatus:response.status,plan,providerResult});
      res.status(202).json({plan:{...plan,status:'DISPATCHED'},providerResult});
    }catch(error){
      if(error&&error.name==='AbortError')return res.status(504).json({error:'OmniSim provider timed out'});
      next(error);
    }
  });
};
