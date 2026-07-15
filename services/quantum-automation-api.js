const express=require('express');
const automation=require('./quantum-automation');
const supabase=require('./supabase');
const router=express.Router();
async function auth(req,res,next){if(!supabase.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabase.requireUser(req,res,next);}
router.get('/status',(req,res)=>res.json(automation.status()));
router.use(auth);
router.post('/dispatch',async(req,res,next)=>{try{const result=await automation.dispatch({...req.body,ownerId:req.user.id});const {error}=await supabase.admin().from('automation_events').insert({owner_id:req.user.id,event_id:result.event.id,event_type:result.event.type,source:result.event.source,payload:result.event.data,zapier_status:result.results.zapier?.delivered?'delivered':result.results.zapier?.mode||'skipped',discord_status:result.results.discord?.delivered?'delivered':result.results.discord?.mode||'skipped'});if(error)throw error;res.status(201).json(result);}catch(error){next(error);}});
router.get('/events',async(req,res,next)=>{try{const {data,error}=await supabase.admin().from('automation_events').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false}).limit(250);if(error)throw error;res.json(data);}catch(error){next(error);}});
router.post('/discord/test',async(req,res,next)=>{try{res.json(await automation.sendDiscord({content:req.body.content||'TryAMM Discord integration test successful.'}));}catch(error){next(error);}});
router.post('/zapier/test',async(req,res,next)=>{try{res.json(await automation.sendZapier(automation.event({type:'user.created',ownerId:req.user.id,data:{test:true}})));}catch(error){next(error);}});
module.exports={router};