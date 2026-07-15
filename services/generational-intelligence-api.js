const express=require('express');
const intelligence=require('./generational-intelligence');
const supabaseService=require('./supabase');
const router=express.Router();

async function auth(req,res,next){if(!supabaseService.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}

router.get('/generations',(req,res)=>res.json({generations:intelligence.GENERATIONS,capabilities:intelligence.CAPABILITIES,claim:'adaptive multi-agent intelligence; not human-level AGI'}));
router.post('/preview',(req,res)=>{const userProfile=intelligence.profile(req.body||{});res.json({profile:userProfile,instructions:intelligence.systemInstructions(userProfile,req.body.context||{}),routing:intelligence.routeTask(req.body)});});
router.post('/evaluate',(req,res)=>res.json(intelligence.evaluateResponse(req.body||{})));
router.use(auth);
router.get('/profile',async(req,res,next)=>{try{const{data,error}=await supabaseService.admin().from('ai_generation_profiles').select('*').eq('owner_id',req.user.id).maybeSingle();if(error)throw error;res.json(data||{owner_id:req.user.id,...intelligence.profile({generation:'genx'})});}catch(error){next(error);}});
router.put('/profile',async(req,res,next)=>{try{const p=intelligence.profile(req.body||{});const row={owner_id:req.user.id,generation:p.generation,language:p.language,response_length:p.responseLength,interests:p.interests,accessibility:p.accessibility,personalization_consent:p.personalizationConsent,parental_consent:p.parentalConsent,is_minor:p.minor,updated_at:new Date().toISOString()};const{data,error}=await supabaseService.admin().from('ai_generation_profiles').upsert(row,{onConflict:'owner_id'}).select().single();if(error)throw error;res.json(data);}catch(error){next(error);}});
router.post('/sessions',async(req,res,next)=>{try{const p=intelligence.profile(req.body.profile||req.body);const routing=intelligence.routeTask(req.body);const evaluation=intelligence.evaluateResponse({answer:req.body.answer||'',profile:p,requiredFacts:req.body.requiredFacts||[],forbiddenClaims:req.body.forbiddenClaims||[]});const{data,error}=await supabaseService.admin().from('ai_adaptation_sessions').insert({owner_id:req.user.id,generation:p.generation,task:String(req.body.task||'general').slice(0,500),routes:routing.routes,requires_confirmation:routing.requiresConfirmation,response_evaluation:evaluation,metadata:req.body.metadata||{}}).select().single();if(error)throw error;res.status(201).json({...data,profile:p,instructions:intelligence.systemInstructions(p,req.body.context||{})});}catch(error){next(error);}});
module.exports={router};
