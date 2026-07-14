const express=require('express');
const supabase=require('./supabase');
const service=require('./production-integrations');
const meshy=require('./meshy');
const router=express.Router();
async function auth(req,res,next){if(!supabase.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabase.requireUser(req,res,next);}
router.get('/status',(req,res)=>res.json(service.integrationStatus()));
router.use(auth);
router.post('/livekit/token',async(req,res,next)=>{try{if(!req.body.room)return res.status(400).json({error:'Room is required.'});res.status(201).json(await service.createLivekitToken({...req.body,identity:req.user.id,name:req.body.name||req.user.email}));}catch(error){next(error);}});
router.post('/claude/budget-check',(req,res)=>res.json(service.aiBudgetGuard(req.body||{})));
router.post('/meshy/jobs',async(req,res,next)=>{try{const job=await service.createMeshyJob({...req.body,ownerId:req.user.id});const {data,error}=await supabase.admin().from('meshy_jobs').insert({id:job.jobId,owner_id:req.user.id,provider_task_id:job.providerTaskId,status:job.status,asset_type:job.assetType,prompt:job.prompt,provider:job.provider}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.get('/meshy/jobs',async(req,res,next)=>{try{const {data,error}=await supabase.admin().from('meshy_jobs').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false});if(error)throw error;res.json(data);}catch(error){next(error);}});
router.post('/meshy/jobs/:id/refresh',async(req,res,next)=>{try{const client=supabase.admin();const {data:job,error:readError}=await client.from('meshy_jobs').select('*').eq('id',req.params.id).eq('owner_id',req.user.id).single();if(readError)throw readError;const task=await meshy.getTask(job.provider_task_id);const status=task.status||job.status;const modelUrls=task.model_urls||{};const {data,error}=await client.from('meshy_jobs').update({status,model_urls:modelUrls,thumbnail_url:task.thumbnail_url||null,updated_at:new Date().toISOString(),error_message:task.error||null}).eq('id',job.id).eq('owner_id',req.user.id).select().single();if(error)throw error;res.json(data);}catch(error){next(error);}});
router.get('/entitlements',async(req,res,next)=>{try{const {data,error}=await supabase.admin().from('user_entitlements').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false});if(error)throw error;res.json(data);}catch(error){next(error);}});
module.exports={router};