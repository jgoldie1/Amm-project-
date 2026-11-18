'use strict';
const crypto=require('node:crypto');
const INTERESTS=Object.freeze(['Bible Reading','Paleo-Hebrew and Strong’s','Dead Sea Scrolls and Apocrypha','Kingdoms Press Publishing','FaithVerse Experiences']);
const HASH=(x)=>crypto.createHash('sha256').update(String(x)).digest('hex');
const EXPIRY=24*60*60*1000;
function readOffers(raw=process.env.FAITHVERSE_APPROVED_OFFERS_JSON||''){
 let incoming;try{incoming=JSON.parse(raw)}catch{return[]}
 if(!Array.isArray(incoming))return[];
 return incoming.filter(x=>x&&typeof x.id==='string'&&/^[a-z0-9_-]{3,50}$/.test(x.id)&&
  typeof x.title==='string'&&x.title.length<130&&x.title.length>3&&
  typeof x.stripePriceId==='string'&&/^price_[A-Za-z0-9]+$/.test(x.stripePriceId)&&
  x.published===true&&x.ownerApproved===true&&x.rightsReviewed===true&&
  x.refundPolicyApproved===true&&typeof x.refundPolicyUrl==='string'&&/^https:\/\//.test(x.refundPolicyUrl)&&
  ['course','publication'].includes(x.kind)&&x.mode==='payment');
}
function publicOffer(offer){return{id:offer.id,title:offer.title,kind:offer.kind,mode:offer.mode,description:typeof offer.description==='string'?offer.description.slice(0,300):'',refundPolicyUrl:offer.refundPolicyUrl}}
function ensureArrays(store){if(!Array.isArray(store.faithverseEnrollments))store.faithverseEnrollments=[];if(!Array.isArray(store.faithverseOrders))store.faithverseOrders=[]}
function configured(){return process.env.FAITHVERSE_COMMERCE_ENABLED==='true'&&process.env.FAITHVERSE_DURABLE_STORE_CONFIRMED==='true'&&process.env.FAITHVERSE_LEGAL_APPROVED==='true'&&Boolean(process.env.STRIPE_SECRET_KEY&&process.env.FAITHVERSE_STRIPE_WEBHOOK_SECRET)}
function crmConfigured(){return process.env.FAITHVERSE_CRM_ENABLED==='true'&&process.env.FAITHVERSE_DURABLE_STORE_CONFIRMED==='true'&&process.env.FAITHVERSE_LEGAL_APPROVED==='true'&&Boolean(process.env.RESEND_API_KEY&&process.env.FAITHVERSE_FROM_EMAIL)}
function approvedBase(){const raw=String(process.env.APP_URL||'');try{const u=new URL(raw);if(u.protocol!=='https:'&&!(u.hostname==='localhost'&&u.protocol==='http:'))return null;return u.origin}catch{return null}}
function safeUser(user){return Boolean(user&&typeof user.id==='string'&&typeof user.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))}
function jsonError(res,status,code){return res.status(status).json({ok:false,code})}
function registerFaithVerseCommerce({app,auth,getStore,saveStore,makeStripe,sendEmail}){
 const stripeClient=makeStripe||(()=>new (require('stripe'))(process.env.STRIPE_SECRET_KEY));
 const emailSender=sendEmail||(async({to,subject,html})=>{
  const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.FAITHVERSE_FROM_EMAIL,to:[to],subject,html})});
  if(!result.ok)throw Error('EMAIL_PROVIDER_UNAVAILABLE');
 });
 app.get('/api/faithverse/readiness',(_req,res)=>res.json({ok:true,crmEnabled:crmConfigured(),checkoutEnabled:configured()&&readOffers().length>0,marketingDoubleOptIn:true,offers:readOffers().map(publicOffer),disclaimer:'No enrollment or sale is confirmed by a public-page click.'}));
 app.get('/api/faithverse/offers',(_req,res)=>res.json({ok:true,offers:configured()?readOffers().map(publicOffer):[],checkoutEnabled:configured()&&readOffers().length>0}));
 // Authenticated explicit opt-in; the existing account is reused. No email accepted from form body.
 app.post('/api/faithverse/enroll',auth,async(req,res)=>{
  if(!crmConfigured()||!approvedBase())return jsonError(res,503,'CRM_NOT_CONFIGURED');
  if(!safeUser(req.user))return jsonError(res,401,'VERIFIED_ACCOUNT_REQUIRED');
  const interest=String(req.body?.interest||'');
  if(!INTERESTS.includes(interest)||req.body?.consent!==true||req.body?.policyVersion!=='faithverse-marketing-v1')return jsonError(res,422,'CONSENT_AND_INTEREST_REQUIRED');
  const store=getStore();ensureArrays(store);
  const now=Date.now(),key=req.user.id;
  const existing=store.faithverseEnrollments.find(x=>x.userId===key);
  if(existing&&now-existing.lastSentAt<60000)return jsonError(res,429,'RATE_LIMITED');
  const token=crypto.randomBytes(32).toString('base64url'),verifyHash=HASH(token);
  const row=existing?{...existing}:{id:'fve_'+crypto.randomBytes(12).toString('hex'),userId:key,createdAt:new Date(now).toISOString()};
  Object.assign(row,{interest,status:'pending_email_confirmation',policyVersion:'faithverse-marketing-v1',consentAt:new Date(now).toISOString(),verifyHash,verifyExpiresAt:now+EXPIRY,lastSentAt:now,confirmedAt:null});
  const url=approvedBase()+'/faithverse-study?verify='+encodeURIComponent(token);
  try{await emailSender({to:req.user.email,subject:'Confirm your TRYAMM FaithVerse study email',html:'<p>Confirm your optional FaithVerse study email updates.</p><p><a href="'+url+'">Review and confirm</a></p><p>If you did not request this, you can ignore this message.</p>'})}catch{return jsonError(res,503,'EMAIL_DELIVERY_FAILED')}
  if(existing)Object.assign(existing,row);else store.faithverseEnrollments.push(row);
  await saveStore();
  return res.status(202).json({ok:true,status:'pending_email_confirmation',message:'Open the confirmation email, then confirm on FaithVerse.'});
 });
 // POST prevents automated link scanners from confirming a subscription through GET.
 app.post('/api/faithverse/confirm',async(req,res)=>{
  const token=String(req.body?.token||'');
  if(!/^[A-Za-z0-9_-]{40,80}$/.test(token))return jsonError(res,422,'INVALID_TOKEN');
  const store=getStore();ensureArrays(store);
  const row=store.faithverseEnrollments.find(x=>x.verifyHash===HASH(token)&&x.status==='pending_email_confirmation'&&x.verifyExpiresAt>Date.now());
  if(!row)return jsonError(res,400,'EXPIRED_OR_INVALID_CONFIRMATION');
  row.status='confirmed';row.confirmedAt=new Date().toISOString();delete row.verifyHash;delete row.verifyExpiresAt;
  await saveStore();res.json({ok:true,status:'confirmed'});
 });
 app.post('/api/faithverse/unsubscribe',auth,async(req,res)=>{
  const store=getStore();ensureArrays(store);
  const row=store.faithverseEnrollments.find(x=>x.userId===req.user.id);
  if(row){row.status='unsubscribed';row.unsubscribedAt=new Date().toISOString();delete row.verifyHash;delete row.verifyExpiresAt;await saveStore()}
  res.json({ok:true,status:'unsubscribed'});
 });
 app.get('/api/faithverse/my-enrollment',auth,(req,res)=>{
  const store=getStore();ensureArrays(store);const row=store.faithverseEnrollments.find(x=>x.userId===req.user.id);
  res.json({ok:true,status:row?.status||'not_enrolled',interest:row?.interest||null});
 });
 app.post('/api/faithverse/checkout',auth,async(req,res)=>{
  if(!configured()||!approvedBase())return jsonError(res,503,'CHECKOUT_NOT_CONFIGURED');
  if(!safeUser(req.user))return jsonError(res,401,'ACCOUNT_REQUIRED');
  const offer=readOffers().find(x=>x.id===req.body?.offerId);
  if(!offer)return jsonError(res,422,'OFFER_NOT_APPROVED');
  const store=getStore();ensureArrays(store);
  const orderId='fvo_'+crypto.randomBytes(12).toString('hex');
  try{
   const stripe=stripeClient(),session=await stripe.checkout.sessions.create({
    mode:offer.mode,line_items:[{price:offer.stripePriceId,quantity:1}],customer_email:req.user.email,
    client_reference_id:orderId,metadata:{tryammProduct:'faithverse',offerId:offer.id,orderId,userId:req.user.id},
    success_url:approvedBase()+'/faithverse-study?checkout=return',cancel_url:approvedBase()+'/faithverse-study?checkout=cancel',
    automatic_tax:{enabled:false}
   });
   if(!session?.id||!/^https:\/\//.test(session.url||''))return jsonError(res,502,'PAYMENT_PROVIDER_BAD_RESPONSE');
   store.faithverseOrders.push({id:orderId,userId:req.user.id,offerId:offer.id,stripePriceId:offer.stripePriceId,stripeSessionId:session.id,status:'pending_verified_payment',createdAt:new Date().toISOString(),amountMinor:null,processorEventId:null});
   await saveStore();res.status(201).json({ok:true,checkoutUrl:session.url,orderId,status:'pending_verified_payment'});
  }catch{return jsonError(res,503,'PAYMENT_PROVIDER_UNAVAILABLE')}
 });
 app.post('/api/faithverse/stripe/webhook',async(req,res)=>{
  if(!configured())return jsonError(res,503,'CHECKOUT_NOT_CONFIGURED');
  const signature=req.headers['stripe-signature'],body=req.rawBody;
  if(!body||!signature)return jsonError(res,400,'INVALID_WEBHOOK');
  let event;try{event=stripeClient().webhooks.constructEvent(body,signature,process.env.FAITHVERSE_STRIPE_WEBHOOK_SECRET)}catch{return jsonError(res,400,'INVALID_WEBHOOK_SIGNATURE')}
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return res.json({ok:true,ignored:true});
  const session=event.data?.object||{};
  if(session.metadata?.tryammProduct!=='faithverse'||session.payment_status!=='paid'||session.mode!=='payment'||session.currency!=='usd'||!Number.isSafeInteger(session.amount_total)||session.amount_total<=0)
   return res.json({ok:true,ignored:true});
  const store=getStore();ensureArrays(store);
  const order=store.faithverseOrders.find(x=>x.id===session.metadata.orderId&&x.stripeSessionId===session.id&&x.userId===session.metadata.userId&&x.offerId===session.metadata.offerId);
  if(!order)return jsonError(res,404,'ORDER_NOT_FOUND');
  if(order.status==='paid_verified')return res.json({ok:true,duplicate:true});
  const approved=readOffers().find(x=>x.id===order.offerId&&x.stripePriceId===order.stripePriceId);
  if(!approved)return jsonError(res,422,'OFFER_NO_LONGER_APPROVED');
  try{
   const lineItems=await stripeClient().checkout.sessions.listLineItems(session.id,{limit:10});
   if(!lineItems.data?.some(x=>x.price?.id===order.stripePriceId&&x.quantity===1))return jsonError(res,422,'PRICE_VERIFICATION_FAILED');
  }catch{return jsonError(res,503,'PAYMENT_VERIFICATION_UNAVAILABLE')}
  order.status='paid_verified';order.amountMinor=Number.isSafeInteger(session.amount_total)&&session.amount_total>=0?session.amount_total:null;
  order.processorEventId=event.id;order.paidAt=new Date().toISOString();
  await saveStore();res.json({ok:true,verified:true});
 });
 app.get('/api/faithverse/my-orders',auth,(req,res)=>{
  const store=getStore();ensureArrays(store);
  res.json({ok:true,orders:store.faithverseOrders.filter(x=>x.userId===req.user.id).map(x=>({id:x.id,offerId:x.offerId,status:x.status,amountMinor:x.amountMinor,createdAt:x.createdAt}))});
 });
}
module.exports={registerFaithVerseCommerce,readOffers,publicOffer,configured,crmConfigured};
