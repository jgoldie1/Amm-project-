'use strict';

const {runtimeStatus,readMemory,runStubbsTask}=require('./stubbs-ai-runtime');
const hologpt=require('./hologpt-chat');
const recursiveImprovement=require('./recursive-improvement-engine');

function cleanText(value,max){return String(value||'').trim().slice(0,max)}

module.exports=function registerStubbsAiRoutes({app,auth}){
  app.get('/api/hologpt/health',async(_req,res)=>{
    res.json({ok:true,service:'HoloGPT',...hologpt.status(),triBrain:runtimeStatus(),recursiveImprovement:recursiveImprovement.status(),time:new Date().toISOString()});
  });

  app.post('/api/hologpt/chat',auth,async(req,res,next)=>{
    try{
      const message=cleanText(req.body?.message,12000);
      if(!message)return res.status(400).json({error:'message is required'});
      const result=await hologpt.chat({userId:req.user.id,message,context:{page:cleanText(req.body?.page,300),sessionId:cleanText(req.body?.sessionId,200)}});
      res.json(result);
    }catch(error){next(error)}
  });

  app.get('/api/stubbs/health',auth,async(req,res)=>{
    const status=runtimeStatus();
    res.json({ok:true,service:'Stubbs AI Tri-Brain Runtime',status,recursiveImprovement:recursiveImprovement.status(),userId:req.user.id,time:new Date().toISOString()});
  });

  app.get('/api/stubbs/power-ups',auth,async(_req,res)=>{
    res.json({powerUps:recursiveImprovement.powerUps(),policy:recursiveImprovement.improvementPolicy()});
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

  app.post('/api/stubbs/improve',auth,async(req,res,next)=>{
    try{
      const body=req.body||{};
      const objective=cleanText(body.objective,6000);
      if(!objective)return res.status(400).json({error:'objective is required'});
      const agent=['stubbs_ai','hologpt','middleverse_ai'].includes(body.agent)?body.agent:'stubbs_ai';
      const result=await recursiveImprovement.runImprovementCycle({
        userId:req.user.id,
        objective,
        agent,
        telemetry:body.telemetry&&typeof body.telemetry==='object'?body.telemetry:{},
        baseline:body.baseline&&typeof body.baseline==='object'?body.baseline:{},
        candidate:body.candidate&&typeof body.candidate==='object'?body.candidate:{},
        targets:Array.isArray(body.targets)?body.targets.map(x=>cleanText(x,120)).filter(Boolean).slice(0,100):[],
        changesCode:body.changesCode===true,
        highImpact:body.highImpact===true,
        evidenceIds:Array.isArray(body.evidenceIds)?body.evidenceIds.map(x=>cleanText(x,300)).filter(Boolean).slice(0,100):[]
      });
      const blocked=result.status==='HUMAN_APPROVAL_REQUIRED'||result.status==='BLOCKED';
      res.status(blocked?202:200).json(result);
    }catch(error){next(error)}
  });
};
