'use strict';

const {runtimeStatus,readMemory,runStubbsTask}=require('./stubbs-ai-runtime');
const hologpt=require('./hologpt-chat');
const {rememberWorldFact,recallWorldFacts}=require('./hologpt-world-memory');
const {CAPABILITIES,fuseSensoryFrame,rememberSensoryFrame,sensePromptContext}=require('./hologpt-sensory-fusion');

function cleanText(value,max){return String(value||'').trim().slice(0,max)}

module.exports=function registerStubbsAiRoutes({app,auth}){
  app.get('/api/hologpt/health',async(_req,res)=>{
    res.json({ok:true,service:'HoloGPT',...hologpt.status(),triBrain:runtimeStatus(),time:new Date().toISOString()});
  });

  app.post('/api/hologpt/chat',auth,async(req,res,next)=>{
    try{
      const message=cleanText(req.body?.message,12000);
      if(!message)return res.status(400).json({error:'message is required'});
      let sensory=null;
      if(Array.isArray(req.body?.observations)&&req.body.observations.length){
        const frame=fuseSensoryFrame(req.body.observations.slice(0,100));
        sensory=sensePromptContext(frame);
        if(req.body?.rememberSensory===true){
          await rememberSensoryFrame(req.user.id,frame,{
            world:cleanText(req.body?.world,120)||'TRYAMM',
            ttlDays:Math.max(1,Math.min(30,Number(req.body?.sensoryTtlDays)||7))
          });
        }
      }
      const result=await hologpt.chat({userId:req.user.id,message,context:{
        page:cleanText(req.body?.page,300),
        sessionId:cleanText(req.body?.sessionId,200),
        checkpointId:cleanText(req.body?.checkpointId,200),
        resume:req.body?.resume===true,
        sensory
      }});
      res.json({...result,sensoryAccepted:Boolean(sensory)});
    }catch(error){next(error)}
  });

  app.get('/api/hologpt/world-memory',auth,async(req,res,next)=>{
    try{
      const facts=await recallWorldFacts(req.user.id,{
        subject:cleanText(req.query.subject,240),
        predicate:cleanText(req.query.predicate,160),
        scope:['semantic','project','episodic','working'].includes(req.query.scope)?req.query.scope:'semantic',
        limit:Math.max(1,Math.min(50,Number(req.query.limit)||24))
      });
      res.json({ok:true,facts,count:facts.length});
    }catch(error){next(error)}
  });

  app.post('/api/hologpt/world-memory',auth,async(req,res,next)=>{
    try{
      const body=req.body||{};
      const result=await rememberWorldFact(req.user.id,{
        subject:cleanText(body.subject,240),
        predicate:cleanText(body.predicate,160),
        object:cleanText(body.object,1600),
        scope:['semantic','project','episodic','working'].includes(body.scope)?body.scope:'semantic',
        confidence:Math.max(0,Math.min(1,Number(body.confidence)||.75)),
        sourceIds:Array.isArray(body.sourceIds)?body.sourceIds.map(x=>cleanText(x,300)).filter(Boolean).slice(0,50):[],
        ttlDays:Math.max(1,Math.min(365,Number(body.ttlDays)||30)),
        context:body.context&&typeof body.context==='object'?body.context:{}
      });
      res.status(result.saved?201:200).json({ok:true,...result});
    }catch(error){next(error)}
  });

  app.get('/api/hologpt/senses',auth,async(req,res)=>{
    res.json({ok:true,version:'hologpt.sense.v1',capabilities:CAPABILITIES});
  });

  app.post('/api/hologpt/senses/fuse',auth,async(req,res,next)=>{
    try{
      const observations=Array.isArray(req.body?.observations)?req.body.observations.slice(0,100):[];
      const frame=fuseSensoryFrame(observations);
      let memory=null;
      if(req.body?.remember===true){
        memory=await rememberSensoryFrame(req.user.id,frame,{
          world:cleanText(req.body?.world,120)||'TRYAMM',
          ttlDays:Math.max(1,Math.min(30,Number(req.body?.ttlDays)||7))
        });
      }
      res.json({ok:true,frame,promptContext:sensePromptContext(frame),memory});
    }catch(error){next(error)}
  });

  app.get('/api/stubbs/health',auth,async(req,res)=>{
    const status=runtimeStatus();
    res.json({ok:true,service:'Stubbs AI Tri-Brain Runtime',status,userId:req.user.id,time:new Date().toISOString()});
  });

  app.get('/api/stubbs/memory',auth,async(req,res,next)=>{
    try{
      const scope=cleanText(req.query.scope,40)||undefined;
      const limit=Math.max(1,Math.min(50,Number(req.query.limit)||12));
      const memory=await readMemory(req.user.id,{scope,limit});
      res.json({memory,count:memory.length});
    }catch(error){next(error)}
  });

  app.post('/api/stubbs/run',auth,async(req,res,next)=>{
    try{
      const body=req.body||{};
      const task={
        id:cleanText(body.id,120)||undefined,
        objective:cleanText(body.objective,6000),
        type:cleanText(body.type,40)||'general',
        constraints:Array.isArray(body.constraints)?body.constraints.map(x=>cleanText(x,500)).filter(Boolean).slice(0,30):[],
        context:body.context&&typeof body.context==='object'?body.context:{},
        evidenceIds:Array.isArray(body.evidenceIds)?body.evidenceIds.map(x=>cleanText(x,300)).filter(Boolean).slice(0,100):[],
        timeSensitive:body.timeSensitive===true,
        fresh:body.fresh!==false,
        requiresTool:body.requiresTool===true,
        toolPlan:body.toolPlan&&typeof body.toolPlan==='object'?body.toolPlan:null,
        highImpact:body.highImpact===true,
        approvalPlan:body.approvalPlan&&typeof body.approvalPlan==='object'?body.approvalPlan:null,
        reversible:body.reversible!==false,
        actionRisk:['low','medium','high','critical'].includes(body.actionRisk)?body.actionRisk:'low',
        telemetry:body.telemetry&&typeof body.telemetry==='object'?body.telemetry:{},
        sandboxChecks:Array.isArray(body.sandboxChecks)?body.sandboxChecks.map(x=>cleanText(x,300)).filter(Boolean).slice(0,50):[],
        memoryScope:['working','episodic','semantic','project'].includes(body.memoryScope)?body.memoryScope:'episodic'
      };
      if(!task.objective)return res.status(400).json({error:'objective is required'});
      const result=await runStubbsTask({userId:req.user.id,task});
      const httpStatus=result.verified?200:result.reason==='MODEL_PROVIDERS_NOT_CONFIGURED'?503:202;
      res.status(httpStatus).json(result);
    }catch(error){next(error)}
  });
};
