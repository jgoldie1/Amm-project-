'use strict';
const sales=require('./ai-cafe-sales');
const LIMIT=20,WINDOW_MS=60*60*1000;
module.exports=function registerAiCafeRoutes({app,auth,getStore,saveStore}){
  const attempts=new Map();
  function owner(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Owner approval required'});next()}
  function scrub(lead){return {id:lead.id,locale:lead.locale,status:lead.status,createdAt:lead.createdAt}}
  app.post('/api/ai-cafe/leads',async(req,res,next)=>{
    try{
      const key=String(req.ip||'unknown');const now=Date.now();const prior=(attempts.get(key)||[]).filter(t=>now-t<WINDOW_MS);
      if(prior.length>=LIMIT)return res.status(429).json({error:'Lead submission rate limit exceeded'});
      prior.push(now);attempts.set(key,prior);
      const lead=sales.createLead(getStore(),req.body||{});await saveStore();res.status(201).json({ok:true,lead:scrub(lead)});
    }catch(e){next(e)}
  });
  app.get('/api/ai-cafe/status',(_req,res)=>res.json({ok:true,service:'TRYAMM AI Cafe',paidAiEnabled:process.env.TRYAMM_PAID_AI_ENABLED==='true',checkoutConfigured:Boolean(process.env.STRIPE_SECRET_KEY),localeSupport:['en','es','fr','pt'],chainAnchorMode:'pending-independent-audit'}));
  app.get('/api/ai-cafe/dashboard',auth,owner,(req,res)=>res.json({ok:true,...sales.summary(getStore()),leads:sales.ensure(getStore()).aiCafeLeads,quotes:getStore().aiCafeQuotes,sales:getStore().aiCafeSales,chainOutbox:getStore().aiCafeChainOutbox}));
  app.post('/api/ai-cafe/leads/:leadId/approve',auth,owner,async(req,res,next)=>{
    try{const quote=sales.approveQuote(getStore(),{leadId:req.params.leadId,priceCents:req.body?.priceCents,currency:req.body?.currency,description:req.body?.description,approvedBy:req.user.id});await saveStore();res.status(201).json({ok:true,quote})}catch(e){next(e)}
  });
  app.post('/api/ai-cafe/quotes/:quoteId/checkout-link',auth,owner,async(req,res,next)=>{
    try{
      const store=sales.ensure(getStore()),quote=store.aiCafeQuotes.find(x=>x.id===req.params.quoteId&&x.status==='approved');
      if(!quote)return res.status(404).json({error:'Approved quote not found'});
      const lead=store.aiCafeLeads.find(x=>x.id===quote.leadId);
      if(!lead)return res.status(422).json({error:'Lead missing'});
      if(quote.stripeSessionId)return res.status(409).json({error:'Checkout already created for this quote'});
      if(!process.env.STRIPE_SECRET_KEY)return res.status(503).json({error:'Stripe is not configured'});
      const base=String(process.env.APP_URL||'').replace(/\/$/,'');
      if(!/^https:\/\//.test(base))return res.status(503).json({error:'Verified HTTPS APP_URL required'});
      const Stripe=require('stripe'),stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
      const checkout=await stripe.checkout.sessions.create({mode:'payment',customer_email:lead.email,client_reference_id:quote.id,line_items:[{quantity:1,price_data:{currency:quote.currency,unit_amount:quote.priceCents,product_data:{name:quote.description}}}],metadata:{kind:'ai-cafe-service',leadId:lead.id,quoteId:quote.id},success_url:base+'/?ai_cafe=success',cancel_url:base+'/?ai_cafe=cancel',payment_method_types:['card']},{idempotencyKey:'ai-cafe-quote-'+quote.id});
      quote.stripeSessionId=checkout.id;await saveStore();res.status(201).json({ok:true,quoteId:quote.id,checkoutUrl:checkout.url});
    }catch(e){next(e)}
  });
};
