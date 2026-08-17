'use strict';
const tx=require('./transaction-core');

module.exports=function registerMarketplace({app,auth,admin,clean,id,getStore,saveStore}){
  const feeBps=Math.max(0,Math.min(5000,Number(process.env.PLATFORM_FEE_BPS||2500)));
  const appUrl=String(process.env.APP_URL||'http://localhost:10000').replace(/\/$/,'');
  const statuses=new Set(['pending','approved','rejected','suspended']);
  const productTypes=new Set(['product','service','digital']);
  const transactionalRequired=process.env.NODE_ENV==='production'||process.env.REQUIRE_TRANSACTIONAL_COMMERCE==='true';

  function ensure(){const s=getStore();s.marketplaceMerchants||=[];s.marketplaceProducts||=[];s.marketplaceOrders||=[];return s;}
  function slug(v){return clean(v,80).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}
  function merchantForUser(userId){return ensure().marketplaceMerchants.find(x=>x.userId===userId)}
  function publicMerchant(m){return m&&({id:m.id,storeName:m.storeName,slug:m.slug,description:m.description||'',categories:m.categories||[],country:m.country,status:m.status,logoUrl:m.logoUrl||'',bannerUrl:m.bannerUrl||'',createdAt:m.createdAt})}
  function publicProduct(p){return {id:p.id,merchantId:p.merchantId,storeSlug:p.storeSlug,name:p.name,description:p.description,productType:p.productType,priceCents:p.priceCents,currency:p.currency,imageUrl:p.imageUrl||'',stock:p.stock,active:p.active,createdAt:p.createdAt}}
  async function stripeClient(){if(!process.env.STRIPE_SECRET_KEY){const e=new Error('Stripe is not configured yet');e.status=503;throw e}const Stripe=require('stripe');return new Stripe(process.env.STRIPE_SECRET_KEY)}
  function requireTransactionStore(res){if(transactionalRequired&&!tx.configured()){res.status(503).json({error:'Transactional commerce is not configured',code:'TRANSACTION_STORE_REQUIRED'});return false}return true}

  app.post('/api/marketplace/merchant/apply',auth,async(req,res)=>{
    const s=ensure();if(merchantForUser(req.user.id))return res.status(409).json({error:'Merchant application already exists'});
    const storeName=clean(req.body.storeName,100),baseSlug=slug(req.body.slug||storeName),country=clean(req.body.country||'US',2).toUpperCase();
    if(storeName.length<2||!baseSlug)return res.status(400).json({error:'Store name is required'});
    let storeSlug=baseSlug,n=2;while(s.marketplaceMerchants.some(x=>x.slug===storeSlug))storeSlug=`${baseSlug}-${n++}`.slice(0,60);
    const merchant={id:id('mrc'),userId:req.user.id,storeName,slug:storeSlug,legalBusinessName:clean(req.body.legalBusinessName,140),description:clean(req.body.description,1000),country,categories:Array.isArray(req.body.categories)?req.body.categories.map(x=>clean(x,50)).filter(Boolean).slice(0,12):[],logoUrl:clean(req.body.logoUrl,500),bannerUrl:clean(req.body.bannerUrl,500),status:'pending',stripeAccountId:null,stripeOnboardingComplete:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    s.marketplaceMerchants.push(merchant);await saveStore();res.status(201).json({merchant:publicMerchant(merchant),message:'Application submitted for review. Tax and identity verification are handled through the payment provider, not stored in the TRYAMM marketplace profile.'});
  });

  app.get('/api/marketplace/merchant/me',auth,(req,res)=>{const m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'No merchant application found'});res.json({merchant:{...publicMerchant(m),stripeConnected:Boolean(m.stripeAccountId),stripeOnboardingComplete:Boolean(m.stripeOnboardingComplete)}})});

  app.patch('/api/marketplace/merchant/me',auth,async(req,res)=>{
    const m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'No merchant application found'});
    if(req.body.storeName)m.storeName=clean(req.body.storeName,100)||m.storeName;
    if(req.body.description!==undefined)m.description=clean(req.body.description,1000);
    if(Array.isArray(req.body.categories))m.categories=req.body.categories.map(x=>clean(x,50)).filter(Boolean).slice(0,12);
    if(req.body.logoUrl!==undefined)m.logoUrl=clean(req.body.logoUrl,500);
    if(req.body.bannerUrl!==undefined)m.bannerUrl=clean(req.body.bannerUrl,500);
    m.updatedAt=new Date().toISOString();await saveStore();res.json({merchant:publicMerchant(m)});
  });

  app.post('/api/marketplace/merchant/connect',auth,async(req,res,next)=>{
    try{
      const m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'No merchant application found'});if(m.status!=='approved')return res.status(403).json({error:'Merchant must be approved before payment onboarding'});
      const stripe=await stripeClient();
      if(!m.stripeAccountId){const account=await stripe.accounts.create({type:'express',country:m.country||'US',email:req.user.email,business_profile:{name:m.storeName}});m.stripeAccountId=account.id;await saveStore()}
      const link=await stripe.accountLinks.create({account:m.stripeAccountId,refresh_url:`${appUrl}/merchant-studio.html?connect=refresh`,return_url:`${appUrl}/merchant-studio.html?connect=return`,type:'account_onboarding'});
      res.json({url:link.url});
    }catch(e){next(e)}
  });

  app.post('/api/marketplace/merchant/connect/status',auth,async(req,res,next)=>{
    try{const m=merchantForUser(req.user.id);if(!m?.stripeAccountId)return res.status(404).json({error:'Payment account not started'});const stripe=await stripeClient();const account=await stripe.accounts.retrieve(m.stripeAccountId);m.stripeOnboardingComplete=Boolean(account.details_submitted);m.updatedAt=new Date().toISOString();await saveStore();res.json({detailsSubmitted:Boolean(account.details_submitted),chargesEnabled:Boolean(account.charges_enabled),payoutsEnabled:Boolean(account.payouts_enabled)})}catch(e){next(e)}
  });

  app.post('/api/marketplace/products',auth,async(req,res,next)=>{
    try{
      const s=ensure(),m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'Merchant application required'});if(m.status!=='approved')return res.status(403).json({error:'Merchant approval required before publishing products'});
      const name=clean(req.body.name,140),productType=clean(req.body.productType||'product',20).toLowerCase(),priceCents=Math.round(Number(req.body.priceCents));
      if(name.length<2||!productTypes.has(productType)||!Number.isInteger(priceCents)||priceCents<50||priceCents>100000000)return res.status(400).json({error:'Valid name, type and price are required'});
      const p={id:id('prd'),merchantId:m.id,storeSlug:m.slug,name,description:clean(req.body.description,2000),productType,priceCents,currency:clean(req.body.currency||'usd',3).toLowerCase(),imageUrl:clean(req.body.imageUrl,500),stock:productType==='digital'?null:Math.max(0,Math.min(1000000,Math.floor(Number(req.body.stock)||0))),active:req.body.active!==false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      if(tx.configured())await tx.upsertInventory({productId:p.id,stock:p.stock,active:p.active});else if(transactionalRequired)return res.status(503).json({error:'Transactional commerce is required before publishing sellable inventory'});
      s.marketplaceProducts.push(p);await saveStore();res.status(201).json({product:publicProduct(p)});
    }catch(e){next(e)}
  });

  app.get('/api/marketplace/merchant/products',auth,(req,res)=>{const m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'Merchant application required'});res.json({products:ensure().marketplaceProducts.filter(p=>p.merchantId===m.id).map(publicProduct)})});

  app.patch('/api/marketplace/products/:productId',auth,async(req,res,next)=>{
    try{
      const s=ensure(),m=merchantForUser(req.user.id);if(!m)return res.status(404).json({error:'Merchant application required'});const p=s.marketplaceProducts.find(x=>x.id===req.params.productId&&x.merchantId===m.id);if(!p)return res.status(404).json({error:'Product not found'});
      if(req.body.name!==undefined)p.name=clean(req.body.name,140)||p.name;if(req.body.description!==undefined)p.description=clean(req.body.description,2000);if(req.body.imageUrl!==undefined)p.imageUrl=clean(req.body.imageUrl,500);if(req.body.active!==undefined)p.active=Boolean(req.body.active);
      if(req.body.stock!==undefined&&p.productType!=='digital')p.stock=Math.max(0,Math.min(1000000,Math.floor(Number(req.body.stock)||0)));
      if(req.body.priceCents!==undefined){const cents=Math.round(Number(req.body.priceCents));if(!Number.isInteger(cents)||cents<50||cents>100000000)return res.status(400).json({error:'Invalid price'});p.priceCents=cents}
      if(tx.configured())await tx.upsertInventory({productId:p.id,stock:p.stock,active:p.active});else if(transactionalRequired)return res.status(503).json({error:'Transactional commerce is required before changing sellable inventory'});
      p.updatedAt=new Date().toISOString();await saveStore();res.json({product:publicProduct(p)});
    }catch(e){next(e)}
  });

  app.get('/api/marketplace/products',(req,res)=>{
    const s=ensure(),q=clean(req.query.q,100).toLowerCase(),type=clean(req.query.type,20).toLowerCase();const approved=new Set(s.marketplaceMerchants.filter(m=>m.status==='approved').map(m=>m.id));
    let rows=s.marketplaceProducts.filter(p=>p.active&&approved.has(p.merchantId));if(type&&productTypes.has(type))rows=rows.filter(p=>p.productType===type);if(q)rows=rows.filter(p=>`${p.name} ${p.description}`.toLowerCase().includes(q));res.json({products:rows.slice(-200).reverse().map(publicProduct)});
  });

  app.get('/api/marketplace/stores/:slug',(req,res)=>{const s=ensure(),m=s.marketplaceMerchants.find(x=>x.slug===req.params.slug&&x.status==='approved');if(!m)return res.status(404).json({error:'Store not found'});res.json({merchant:publicMerchant(m),products:s.marketplaceProducts.filter(p=>p.merchantId===m.id&&p.active).map(publicProduct)})});

  app.post('/api/marketplace/checkout',auth,async(req,res,next)=>{
    let order=null,reserved=false;
    try{
      if(!requireTransactionStore(res))return;
      const s=ensure(),p=s.marketplaceProducts.find(x=>x.id===clean(req.body.productId,100)&&x.active);if(!p)return res.status(404).json({error:'Product not found'});const m=s.marketplaceMerchants.find(x=>x.id===p.merchantId&&x.status==='approved');if(!m)return res.status(409).json({error:'Merchant is not available'});if(!m.stripeAccountId)return res.status(409).json({error:'Merchant payment onboarding is incomplete'});
      const quantity=Math.max(1,Math.min(99,Math.floor(Number(req.body.quantity)||1)));if(!tx.configured()&&p.stock!==null&&p.stock<quantity)return res.status(409).json({error:'Insufficient stock'});
      const stripe=await stripeClient(),account=await stripe.accounts.retrieve(m.stripeAccountId);if(!account.charges_enabled)return res.status(409).json({error:'Merchant cannot accept payments yet'});
      const subtotal=p.priceCents*quantity,applicationFee=Math.round(subtotal*feeBps/10000);
      order={id:id('ord'),buyerId:req.user.id,merchantId:m.id,productId:p.id,quantity,subtotalCents:subtotal,platformFeeCents:applicationFee,status:'creating_checkout',stripeSessionId:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
      if(tx.configured()){
        await tx.upsertInventory({productId:p.id,stock:p.stock,active:p.active});
        await tx.createOrder({orderId:order.id,buyerId:req.user.id,merchantId:m.id,productId:p.id,quantity,subtotalCents:subtotal,platformFeeCents:applicationFee,currency:p.currency});
        const reservation=await tx.reserveInventory({productId:p.id,orderId:order.id,quantity,ttlMinutes:30});
        if(reservation?.reserved===false)return res.status(409).json({error:'Insufficient stock',available:reservation.available});
        reserved=true;order.inventoryReservation='reserved';
      }
      const checkout=await stripe.checkout.sessions.create({mode:'payment',customer_email:req.user.email,line_items:[{quantity,price_data:{currency:p.currency,unit_amount:p.priceCents,product_data:{name:p.name,description:p.description||undefined}}}],payment_intent_data:{application_fee_amount:applicationFee,transfer_data:{destination:m.stripeAccountId},metadata:{orderId:order.id}},metadata:{orderId:order.id,merchantId:m.id,productId:p.id,buyerId:req.user.id},expires_at:Math.floor(Date.now()/1000)+30*60,success_url:`${appUrl}/?marketplace=success&session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${appUrl}/?marketplace=cancelled`});
      order.stripeSessionId=checkout.id;order.status='checkout_created';order.updatedAt=new Date().toISOString();if(tx.configured())await tx.setCheckoutSession(order.id,checkout.id);
      s.marketplaceOrders.push(order);await saveStore();if(tx.configured())await tx.emitEvent({type:'order.checkout_created',aggregateType:'marketplace_order',aggregateId:order.id,payload:{merchantId:m.id,productId:p.id,quantity,subtotalCents:subtotal}});
      res.status(201).json({order:{...order,stripeSessionId:undefined},url:checkout.url});
    }catch(e){if(reserved&&order?.id&&tx.configured())await tx.releaseReservation(order.id,'released').catch(()=>{});next(e)}
  });

  app.get('/api/marketplace/orders',auth,(req,res)=>{const m=merchantForUser(req.user.id);const rows=ensure().marketplaceOrders.filter(o=>o.buyerId===req.user.id||(m&&o.merchantId===m.id)).slice(-200).reverse().map(o=>({...o,stripeSessionId:undefined}));res.json({orders:rows})});

  app.get('/api/admin/marketplace/merchants',auth,admin,(_req,res)=>res.json({merchants:ensure().marketplaceMerchants.map(m=>({...publicMerchant(m),userId:m.userId,stripeConnected:Boolean(m.stripeAccountId),stripeOnboardingComplete:Boolean(m.stripeOnboardingComplete)}))}));
  app.post('/api/admin/marketplace/merchants/:merchantId/status',auth,admin,async(req,res)=>{const s=ensure(),m=s.marketplaceMerchants.find(x=>x.id===req.params.merchantId),status=clean(req.body.status,20).toLowerCase();if(!m)return res.status(404).json({error:'Merchant not found'});if(!statuses.has(status))return res.status(400).json({error:'Invalid merchant status'});m.status=status;m.reviewedAt=new Date().toISOString();m.updatedAt=m.reviewedAt;await saveStore();res.json({merchant:publicMerchant(m)})});
};
