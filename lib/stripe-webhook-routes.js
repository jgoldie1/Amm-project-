'use strict';
const tx=require('./transaction-core');
module.exports=function registerStripeWebhooks({app,getStore,saveStore}){
 app.post('/api/webhooks/stripe',async(req,res)=>{
  const secret=String(process.env.STRIPE_WEBHOOK_SECRET||'').trim();
  if(!process.env.STRIPE_SECRET_KEY||!secret)return res.status(503).json({error:'Stripe webhook is not configured'});
  if(!req.rawBody)return res.status(500).json({error:'Raw webhook body unavailable'});
  let event;try{const Stripe=require('stripe'),stripe=new Stripe(process.env.STRIPE_SECRET_KEY);event=stripe.webhooks.constructEvent(req.rawBody,req.headers['stripe-signature'],secret);}catch(e){return res.status(400).json({error:'Invalid Stripe webhook signature'});}
  try{
   if(tx.configured()){
    const seen=await tx.recordWebhook({provider:'stripe',eventId:event.id,eventType:event.type,payload:event});
    if(seen.event?.status==='processed'||seen.event?.status==='ignored')return res.json({received:true,idempotent:true});
   }
   const object=event.data?.object||{},orderId=object.metadata?.orderId||null;
   if(event.type==='checkout.session.completed'&&object.payment_status==='paid'&&orderId){
    if(tx.configured()){await tx.commitOrder(orderId);await tx.emitEvent({type:'order.paid',aggregateType:'marketplace_order',aggregateId:orderId,payload:{provider:'stripe',eventId:event.id,sessionId:object.id}});}
    const s=getStore(),order=(s.marketplaceOrders||[]).find(o=>o.id===orderId);if(order){order.status='paid';order.paidAt=order.paidAt||new Date().toISOString();order.stripePaymentStatus=object.payment_status;order.updatedAt=new Date().toISOString();await saveStore();}
   }else if((event.type==='checkout.session.expired'||event.type==='checkout.session.async_payment_failed')&&orderId){
    if(tx.configured()){await tx.releaseReservation(orderId,event.type==='checkout.session.expired'?'expired':'released');await tx.emitEvent({type:'order.payment_failed',aggregateType:'marketplace_order',aggregateId:orderId,payload:{provider:'stripe',eventId:event.id,eventType:event.type}});}
    const s=getStore(),order=(s.marketplaceOrders||[]).find(o=>o.id===orderId);if(order){order.status=event.type==='checkout.session.expired'?'expired':'payment_failed';order.updatedAt=new Date().toISOString();await saveStore();}
   }else if((event.type==='charge.refunded'||event.type==='charge.dispute.created')&&object.metadata?.orderId){
    const oid=object.metadata.orderId;if(tx.configured())await tx.emitEvent({type:event.type==='charge.refunded'?'order.refunded':'order.disputed',aggregateType:'marketplace_order',aggregateId:oid,payload:{provider:'stripe',eventId:event.id,chargeId:object.id}});
   }
   if(tx.configured())await tx.markWebhook({provider:'stripe',eventId:event.id,status:orderId||event.type.startsWith('account.')?'processed':'ignored'});
   res.json({received:true});
  }catch(e){console.error('Stripe webhook processing failed',event?.id,e);if(tx.configured()&&event?.id)await tx.markWebhook({provider:'stripe',eventId:event.id,status:'failed',lastError:e.message}).catch(()=>{});res.status(500).json({error:'Webhook processing failed'});}
 });
};
