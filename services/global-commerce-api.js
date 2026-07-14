const express=require('express');
const supabaseService=require('./supabase');
const service=require('./global-commerce');
const router=express.Router();
async function auth(req,res,next){if(!supabaseService.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}
router.get('/plans',(req,res)=>res.json(service.pricing(req.query.country||'US')));
router.get('/languages',(req,res)=>res.json(service.LANGUAGES));
router.post('/translate',async(req,res,next)=>{try{res.json(await service.translate(req.body));}catch(error){next(error);}});
router.use(auth);
router.post('/escrow',async(req,res,next)=>{try{const client=supabaseService.admin();const item=service.escrow({...req.body,buyerId:req.user.id});const {data,error}=await client.from('escrow_accounts').insert({buyer_id:req.user.id,seller_id:item.sellerId||null,order_id:item.orderId||null,amount:item.amount,currency:item.currency,release_rule:item.releaseRule,status:item.status,tax_reserve_amount:item.taxReserveAmount,dispute_window_hours:item.disputeWindowHours}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.post('/tax/preview',(req,res)=>res.json(service.taxReserve(req.body)));
router.post('/compliance/cases',async(req,res,next)=>{try{const client=supabaseService.admin();const item=service.complianceCase(req.body);const {data,error}=await client.from('compliance_cases').insert({owner_id:req.user.id,subject_type:item.subjectType,subject_id:item.subjectId,country:item.country,checks:item.checks,status:item.status,risk_level:item.riskLevel,human_counsel_required:item.humanCounselRequired}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.get('/compliance/cases',async(req,res,next)=>{try{const {data,error}=await supabaseService.admin().from('compliance_cases').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false});if(error)throw error;res.json(data);}catch(error){next(error);}});
module.exports={router};