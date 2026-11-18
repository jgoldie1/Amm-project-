'use strict';
const {parseEvent,interpret}=require('./stubbs-sensory-core');
const {readMemory,writeMemory,runtimeStatus}=require('./stubbs-ai-runtime');
const {powerUps}=require('./recursive-improvement-engine');

function registerStubbsSensoryRoutes({app,auth}){
  app.get('/api/stubbs/sensory/health',auth,(_req,res)=>{
    res.setHeader('Cache-Control','no-store');
    res.json({ok:true,service:'Stubbs AI Sensory Bridge',types:['vision','hearing','touch','smell','taste','game','device'],cloudMemoryConfigured:runtimeStatus().persistentMemoryConfigured,agents:Object.keys(powerUps()),realSensorsVerified:false,liveVisionAudioModelsVerified:false,deviceActionsEnabled:false});
  });
  app.post('/api/stubbs/sensory/events',auth,async(req,res,next)=>{
    try{
      let event;
      try{event=parseEvent(req.body);}catch(error){return res.status(400).json({error:error.message});}
      if(!event.consent)return res.status(403).json({error:'SENSORY_CONSENT_REQUIRED'});
      const result=interpret(event);
      // No silent fallback to an ephemeral JSONL journal: cloud failures are explicitly reported.
      if(!runtimeStatus().persistentMemoryConfigured)return res.status(503).json({error:'CLOUD_MEMORY_NOT_CONFIGURED',receipt:{eventId:event.id,...result,persisted:false}});
      const stored=await writeMemory(req.user.id,{scope:'episodic',summary:JSON.stringify({kind:'sensory',eventId:event.id,type:event.type,source:event.source,observation:event.text,at:event.at}).slice(0,6000),sourceIds:[event.id],confidence:1,permissions:{owner:req.user.id,consent:true,kind:'sensory'}});
      if(!stored.saved)return res.status(503).json({error:stored.reason||'CLOUD_MEMORY_WRITE_FAILED'});
      return res.status(201).json({eventId:event.id,...result,persisted:true,owner:req.user.id});
    }catch(error){next(error)}
  });
  app.get('/api/stubbs/sensory/memory',auth,async(req,res,next)=>{
    try{
      if(!runtimeStatus().persistentMemoryConfigured)return res.status(503).json({error:'CLOUD_MEMORY_NOT_CONFIGURED'});
      const n=Math.max(1,Math.min(50,Number(req.query.limit)||20));
      // Fetch only the authenticated user's records, never accept a userId query parameter.
      const rows=await readMemory(req.user.id,{scope:'episodic',limit:n});
      const events=rows.filter(x=>{try{return JSON.parse(x.summary||'').kind==='sensory'}catch{return false}}).map(x=>({id:x.id,created_at:x.created_at,event:JSON.parse(x.summary)}));
      return res.json({count:events.length,events});
    }catch(error){next(error)}
  });
}
module.exports=registerStubbsSensoryRoutes;
