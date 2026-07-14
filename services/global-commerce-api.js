const express=require('express');
const supabaseService=require('./supabase');
const service=require('./global-commerce');
const stripeService=require('./stripe');
const livekitService=require('./livekit');
const claudeService=require('./claude');
const meshyService=require('./meshy');
const payments=require('./payments');
const router=express.Router();
async function auth(req,res,next){if(!supabaseService.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}
router.get('/plans',(req,res)=>res.json(service.pricing(req.query.country||'US')));
router.get('/languages',(req,res)=>res.json(service.LANGUAGES));
router.post('/translate',async(req,res,next)=>{try{res.json(await service.translate(req.body));}catch(error){next(error);}});
router.get('/integrations/status',(req,res)=>res.json({
  stripe:{configured:stripeService.connected(),checkout:Boolean(process.env.STRIPE_SECRET_KEY),webhooks:Boolean(process.env.STRIPE_WEBHOOK_SECRET),portal:Boolean(process.env.STRIPE_SECRET_KEY)},
  paystack:{configured:Boolean(process.env.PAYSTACK_SECRET_KEY),webhooks:Boolean(process.env.PAYSTACK_SECRET_KEY),payouts:Boolean(process.env.PAYSTACK_SECRET_KEY)},
  flutterwave:{configured:Boolean(process.env.FLUTTERWAVE_SECRET_KEY),webhooks:Boolean(process.env.FLUTTERWAVE_WEBHOOK_SECRET),payouts:Boolean(process.env.FLUTTERWAVE_SECRET_KEY)},
  livekit:{configured:livekitService.connected(),url:Boolean(process.env.LIVEKIT_URL),tokenSigning:Boolean(process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET)},
  claude:{configured:claudeService.connected(),model:process.env.CLAUDE_MODEL||'claude-sonnet-4-5'},
  meshy:{configured:meshyService.connected()},
  supabase:{configured:supabaseService.configured()},
  productionReady:Boolean(stripeService.connected()&&process.env.STRIPE_WEBHOOK_SECRET&&process.env.PAYSTACK_SECRET_KEY&&process.env.FLUTTERWAVE_SECRET_KEY&&process.env.FLUTTERWAVE_WEBHOOK_SECRET&&livekitService.connected()&&claudeService.connected()&&meshyService.connected()&&supabaseService.configured()),
  note:'Configured means credentials are present. Production readiness also requires provider account approval, signed webhook tests, database migrations, reconciliation, monitoring and acceptance testing.'
}));
router.use(auth);
router.post('/stripe/portal',async(req,res,next)=>{try{const base=process.env.PUBLIC_APP_URL||`${req.protocol}://${req.get('host')}`;res.status(201).json(await stripeService.createCustomerPortal({customerId:req.body.customerId,returnUrl:req.body.returnUrl||`${base}/platform.html?portal=return`,idempotencyKey:req.body.idempotencyKey}));}catch(error){next(error);}});
router.post('/stripe/session/verify',async(req,res,next)=>{try{const session=await stripeService.retrieveCheckoutSession(req.body.sessionId);res.json({id:session.id,status:session.status,paymentStatus:session.payment_status,customer:session.customer,subscription:session.subscription,metadata:session.metadata||{}});}catch(error){next(error);}});
router.post('/payments/verify-webhook-shape',(req,res)=>{const provider=payments.getProvider(req.body.provider);res.json({provider,supported:['paystack','flutterwave'].includes(provider),requiredHeaders:provider==='paystack'?['x-paystack-signature']:provider==='flutterwave'?['verif-hash or flutterwave-signature']:[],note:'This route documents requirements only. Actual verification must use the raw request body on the signed webhook route.'});});
router.post('/escrow',async(req,res,next)=>{try{const client=supabaseService.admin();const item=service.escrow({...req.body,buyerId:req.user.id});const {data,error}=await client.from('escrow_accounts').insert({buyer_id:req.user.id,seller_id:item.sellerId||null,order_id:item.orderId||null,amount:item.amount,currency:item.currency,release_rule:item.releaseRule,status:item.status,tax_reserve_amount:item.taxReserveAmount,dispute_window_hours:item.disputeWindowHours}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.post('/tax/preview',(req,res)=>res.json(service.taxReserve(req.body)));
router.post('/compliance/cases',async(req,res,next)=>{try{const client=supabaseService.admin();const item=service.complianceCase(req.body);const {data,error}=await client.from('compliance_cases').insert({owner_id:req.user.id,subject_type:item.subjectType,subject_id:item.subjectId,country:item.country,checks:item.checks,status:item.status,risk_level:item.riskLevel,human_counsel_required:item.humanCounselRequired}).select().single();if(error)throw error;res.status(201).json(data);}catch(error){next(error);}});
router.get('/compliance/cases',async(req,res,next)=>{try{const {data,error}=await supabaseService.admin().from('compliance_cases').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false});if(error)throw error;res.json(data);}catch(error){next(error);}});
module.exports={router};