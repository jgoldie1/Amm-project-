const express=require('express');
const supabaseService=require('./supabase');
const aniyah=require('./aniyah-crossborder');
const router=express.Router();
async function auth(req,res,next){if(!supabaseService.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}
router.get('/corridors',(req,res)=>res.json(aniyah.CORRIDORS));
router.get('/corridors/check',(req,res)=>res.json(aniyah.corridor(req.query)));
router.use(auth);
router.post('/quotes',(req,res,next)=>{try{res.status(201).json(aniyah.quote(req.body));}catch(error){next(error);}});
router.post('/recipients',async(req,res,next)=>{try{const item=aniyah.recipient({...req.body,ownerId:req.user.id});const {data,error}=await supabaseService.admin().from('crossborder_recipients').insert({owner_id:req.user.id,type:item.type,display_name:item.displayName,country:item.country,currency:item.currency,payout_method:item.payoutMethod,provider_recipient_reference:item.providerRecipientReference,status:item.status}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.post('/compliance/check',(req,res)=>res.json(aniyah.complianceGate(req.body)));
router.post('/transfers',async(req,res,next)=>{try{const gate=aniyah.complianceGate(req.body.compliance||{});if(!gate.eligible)return res.status(422).json({error:'Transfer blocked by compliance gate.',gate});const item=aniyah.transfer({...req.body,ownerId:req.user.id});const {data,error}=await supabaseService.admin().from('crossborder_transfers').insert({owner_id:req.user.id,recipient_id:item.recipientId||null,from_country:item.fromCountry,to_country:item.toCountry,source_currency:item.sourceCurrency,destination_currency:item.destinationCurrency,source_amount:item.sourceAmount,purpose:item.purpose,provider:item.provider,status:item.status,escrow_required:item.escrowRequired,travel_rule_data_required:item.travelRuleDataRequired}).select().single();if(error)throw error;res.status(201).json({...data,gate});}catch(error){next(error);}});
router.get('/transfers',async(req,res,next)=>{try{const {data,error}=await supabaseService.admin().from('crossborder_transfers').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false}).limit(200);if(error)throw error;res.json(data);}catch(error){next(error);}});
module.exports={router};