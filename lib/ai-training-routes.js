'use strict';

const METHODS=['sft','lora','qlora','dpo','grpo','ppo','kto','orpo','simpo','ipo','bco','distillation','classification','pretraining','raft','radit'];
const JOB_STATES=['QUEUED','DISPATCHED','TRAINING','EVALUATING','PASSED','FAILED','CANCELLED'];
const MODEL_STATES=['STAGED','APPROVED','DEPLOYED','RETIRED'];

function ensureState(store){
  store.aiTrainingDatasets=Array.isArray(store.aiTrainingDatasets)?store.aiTrainingDatasets:[];
  store.aiTrainingJobs=Array.isArray(store.aiTrainingJobs)?store.aiTrainingJobs:[];
  store.aiModelRegistry=Array.isArray(store.aiModelRegistry)?store.aiModelRegistry:[];
  return store;
}
function clean(value,max=180){return String(value||'').trim().slice(0,max)}
function now(){return new Date().toISOString()}
function soupConfigured(){return Boolean(String(process.env.SOUP_TRAIN_API_URL||'').trim())}
function soupHeaders(){return {'content-type':'application/json',...(process.env.SOUP_TRAIN_API_KEY?{'authorization':`Bearer ${process.env.SOUP_TRAIN_API_KEY}`}:{})}}
function soupStatusUrl(externalJobId){
  const explicit=String(process.env.SOUP_TRAIN_STATUS_URL||'').trim();
  if(explicit)return `${explicit.replace(/\/$/,'')}/${encodeURIComponent(externalJobId)}`;
  const train=String(process.env.SOUP_TRAIN_API_URL||'').trim();
  if(!train)return '';
  return `${train.replace(/\/train\/?$/,'').replace(/\/$/,'')}/jobs/${encodeURIComponent(externalJobId)}`;
}
function healthSnapshot(store={}){
  const state=ensureState(store);
  return {
    service:'Stubbs AI Training Control Plane',
    architectureReady:true,
    persistenceReady:true,
    soupExecutionConfigured:soupConfigured(),
    execution:soupConfigured()?'available':'blocked',
    safeguards:{rightsGate:true,piiReviewGate:true,evaluationGate:true,approvalGate:true,rollbackMetadata:true},
    counts:{datasets:state.aiTrainingDatasets.length,jobs:state.aiTrainingJobs.length,models:state.aiModelRegistry.length},
    states:{jobs:JOB_STATES,models:MODEL_STATES},
    checkedAt:now()
  };
}
function evaluationPass(metrics={}){
  const safety=Number(metrics.safetyScore),quality=Number(metrics.qualityScore),hallucination=Number(metrics.hallucinationRate);
  if(!Number.isFinite(safety)||!Number.isFinite(quality)||!Number.isFinite(hallucination))return false;
  return safety>=0.9&&quality>=0.75&&hallucination<=0.1;
}

module.exports=function registerAiTrainingRoutes({app,auth,admin,getStore,saveStore,id}){
  const requireAdmin=admin||((req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({error:'Admin access required'}));
  const makeId=typeof id==='function'?id:(prefix)=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  const state=()=>ensureState(getStore());

  app.get('/api/ai-training/health',(_req,res)=>res.json(healthSnapshot(state())));

  app.get('/api/ai-training/datasets',auth,requireAdmin,(_req,res)=>res.json({datasets:state().aiTrainingDatasets}));
  app.post('/api/ai-training/datasets',auth,requireAdmin,async(req,res)=>{
    const name=clean(req.body?.name,120),source=clean(req.body?.source,1000),purpose=clean(req.body?.purpose,240);
    const rightsConfirmed=req.body?.rightsConfirmed===true,piiReviewed=req.body?.piiReviewed===true;
    if(!name||!source)return res.status(400).json({error:'name and source are required'});
    if(!rightsConfirmed||!piiReviewed)return res.status(400).json({error:'rightsConfirmed and piiReviewed must both be true before a dataset can enter the training vault'});
    const dataset={id:makeId('ds'),name,source,purpose,status:'READY',rightsConfirmed,piiReviewed,recordCount:Number(req.body?.recordCount||0)||null,contentHash:clean(req.body?.contentHash,128)||null,createdBy:req.user.id,createdAt:now()};
    state().aiTrainingDatasets.push(dataset);await saveStore();res.status(201).json({dataset});
  });

  app.get('/api/ai-training/jobs',auth,requireAdmin,(_req,res)=>res.json({jobs:state().aiTrainingJobs}));
  app.post('/api/ai-training/jobs',auth,requireAdmin,async(req,res)=>{
    const dataset=state().aiTrainingDatasets.find(item=>item.id===clean(req.body?.datasetId,120));
    if(!dataset||dataset.status!=='READY')return res.status(400).json({error:'A READY dataset is required'});
    const method=clean(req.body?.method,40).toLowerCase();
    if(!METHODS.includes(method))return res.status(400).json({error:'Unsupported training method',methods:METHODS});
    const job={id:makeId('train'),datasetId:dataset.id,baseModel:clean(req.body?.baseModel,160),method,status:'QUEUED',provider:'soup',hyperparameters:req.body?.hyperparameters&&typeof req.body.hyperparameters==='object'?req.body.hyperparameters:{},requestedBy:req.user.id,createdAt:now(),updatedAt:now(),externalJobId:null,artifactUri:null,evaluation:null};
    if(!job.baseModel)return res.status(400).json({error:'baseModel is required'});
    state().aiTrainingJobs.push(job);await saveStore();res.status(201).json({job,executionReady:soupConfigured()});
  });

  app.post('/api/ai-training/jobs/:jobId/dispatch',auth,requireAdmin,async(req,res,next)=>{
    const job=state().aiTrainingJobs.find(item=>item.id===req.params.jobId);
    if(!job)return res.status(404).json({error:'Training job not found'});
    if(job.status!=='QUEUED')return res.status(409).json({error:'Only QUEUED jobs may be dispatched',status:job.status});
    if(!soupConfigured())return res.status(503).json({error:'Soup training execution is not configured',code:'SOUP_NOT_CONFIGURED',required:['SOUP_TRAIN_API_URL'],job});
    const dataset=state().aiTrainingDatasets.find(item=>item.id===job.datasetId);
    if(!dataset||dataset.status!=='READY'||!dataset.rightsConfirmed||!dataset.piiReviewed)return res.status(409).json({error:'Dataset failed training dispatch gate'});
    try{
      const response=await fetch(process.env.SOUP_TRAIN_API_URL,{method:'POST',headers:soupHeaders(),body:JSON.stringify({jobId:job.id,datasetId:job.datasetId,datasetSource:dataset.source,datasetHash:dataset.contentHash,baseModel:job.baseModel,method:job.method,hyperparameters:job.hyperparameters})});
      if(!response.ok){const detail=await response.text().catch(()=> '');return res.status(502).json({error:'Soup trainer rejected dispatch',status:response.status,detail:clean(detail,1000)});}
      const result=await response.json().catch(()=>({}));job.status='DISPATCHED';job.externalJobId=clean(result.id||result.jobId,180)||job.id;job.updatedAt=now();await saveStore();res.json({ok:true,job,trainerStatus:result.status||null});
    }catch(error){next(error)}
  });

  app.post('/api/ai-training/jobs/:jobId/refresh',auth,requireAdmin,async(req,res,next)=>{
    const job=state().aiTrainingJobs.find(item=>item.id===req.params.jobId);
    if(!job)return res.status(404).json({error:'Training job not found'});
    if(!job.externalJobId)return res.status(409).json({error:'Job has not been dispatched to Soup'});
    const url=soupStatusUrl(job.externalJobId);
    if(!url)return res.status(503).json({error:'Soup status endpoint is not configured'});
    try{
      const response=await fetch(url,{headers:soupHeaders()});
      if(!response.ok)return res.status(502).json({error:'Soup status request failed',status:response.status});
      const remote=await response.json();
      const remoteStatus=clean(remote.status,40).toUpperCase();
      if(remoteStatus==='TRAINING')job.status='TRAINING';
      else if(remoteStatus==='SUCCEEDED'){job.status='EVALUATING';job.artifactUri=clean(remote.artifactUri,500)||job.artifactUri||null;}
      else if(remoteStatus==='FAILED')job.status='FAILED';
      job.trainerStatus=remoteStatus||null;job.trainerExitCode=Number.isFinite(Number(remote.exitCode))?Number(remote.exitCode):null;job.updatedAt=now();await saveStore();res.json({job,trainer:remote});
    }catch(error){next(error)}
  });

  app.post('/api/ai-training/jobs/:jobId/status',auth,requireAdmin,async(req,res)=>{
    const job=state().aiTrainingJobs.find(item=>item.id===req.params.jobId);
    if(!job)return res.status(404).json({error:'Training job not found'});
    const nextState=clean(req.body?.status,40).toUpperCase();
    if(!['TRAINING','EVALUATING','FAILED','CANCELLED'].includes(nextState))return res.status(400).json({error:'Invalid operator status transition'});
    job.status=nextState;job.updatedAt=now();job.note=clean(req.body?.note,500)||job.note||null;await saveStore();res.json({job});
  });

  app.post('/api/ai-training/jobs/:jobId/evaluate',auth,requireAdmin,async(req,res)=>{
    const job=state().aiTrainingJobs.find(item=>item.id===req.params.jobId);
    if(!job)return res.status(404).json({error:'Training job not found'});
    if(!['DISPATCHED','TRAINING','EVALUATING'].includes(job.status))return res.status(409).json({error:'Job is not ready for evaluation',status:job.status});
    const metrics={safetyScore:Number(req.body?.safetyScore),qualityScore:Number(req.body?.qualityScore),hallucinationRate:Number(req.body?.hallucinationRate)};
    const passed=evaluationPass(metrics);job.status=passed?'PASSED':'FAILED';job.evaluation={...metrics,passed,reviewedBy:req.user.id,reviewedAt:now(),notes:clean(req.body?.notes,1000)||null};job.updatedAt=now();await saveStore();res.json({job,gate:passed?'PASSED':'FAILED'});
  });

  app.get('/api/ai-training/models',auth,requireAdmin,(_req,res)=>res.json({models:state().aiModelRegistry}));
  app.post('/api/ai-training/models',auth,requireAdmin,async(req,res)=>{
    const job=state().aiTrainingJobs.find(item=>item.id===clean(req.body?.jobId,120));
    if(!job||job.status!=='PASSED'||!job.evaluation?.passed)return res.status(400).json({error:'Only an evaluation-PASSED training job can enter the model registry'});
    const model={id:makeId('mdl'),name:clean(req.body?.name,140)||`${job.baseModel}-${job.method}`,version:clean(req.body?.version,80)||'1.0.0',jobId:job.id,datasetId:job.datasetId,baseModel:job.baseModel,method:job.method,status:'STAGED',artifactUri:clean(req.body?.artifactUri,500)||job.artifactUri||null,artifactHash:clean(req.body?.artifactHash,180)||null,evaluation:job.evaluation,createdBy:req.user.id,createdAt:now(),approvedBy:null,approvedAt:null,deployedTargets:[],rollbackModelId:clean(req.body?.rollbackModelId,120)||null};
    state().aiModelRegistry.push(model);await saveStore();res.status(201).json({model});
  });

  app.post('/api/ai-training/models/:modelId/approve',auth,requireAdmin,async(req,res)=>{
    const model=state().aiModelRegistry.find(item=>item.id===req.params.modelId);
    if(!model)return res.status(404).json({error:'Model not found'});
    if(model.status!=='STAGED')return res.status(409).json({error:'Only STAGED models can be approved',status:model.status});
    model.status='APPROVED';model.approvedBy=req.user.id;model.approvedAt=now();await saveStore();res.json({model});
  });

  app.post('/api/ai-training/models/:modelId/deploy',auth,requireAdmin,async(req,res)=>{
    const model=state().aiModelRegistry.find(item=>item.id===req.params.modelId);
    if(!model)return res.status(404).json({error:'Model not found'});
    if(!['APPROVED','DEPLOYED'].includes(model.status))return res.status(409).json({error:'Model must be APPROVED before deployment',status:model.status});
    const target=clean(req.body?.target,120);if(!target)return res.status(400).json({error:'Deployment target is required'});
    if(!model.deployedTargets.includes(target))model.deployedTargets.push(target);model.status='DEPLOYED';model.lastDeployedAt=now();await saveStore();res.json({model,note:'Registry deployment approval recorded. This does not prove the target runtime pulled or loaded the artifact.'});
  });
};

module.exports.healthSnapshot=healthSnapshot;
module.exports.evaluationPass=evaluationPass;
module.exports.METHODS=METHODS;
