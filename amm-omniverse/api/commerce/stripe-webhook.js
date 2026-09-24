import Stripe from 'stripe';
import {adminRest,json} from '../_lib/supabase-admin.js';

export const config={api:{bodyParser:false}};

async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks)}
const paymentIntentId=session=>typeof session?.payment_intent==='string'?session.payment_intent:String(session?.payment_intent?.id||'');
const minimalPayload=event=>{
 const session=event?.data?.object||{};
 return {
   id:String(event?.id||''),
   type:String(event?.type||''),
   created:Number(event?.created||0),
   livemode:Boolean(event?.livemode),
   object:{
     id:String(session?.id||''),
     client_reference_id:String(session?.client_reference_id||''),
     metadata:session?.metadata||{},
     amount_total:Number(session?.amount_total||0),
     currency:String(session?.currency||''),
     payment_status:String(session?.payment_status||''),
     payment_intent:paymentIntentId(session)
   }
 };
};

async function finalizePaidCheckout(event){
 const session=event?.data?.object||{};
 const orderId=String(session?.metadata?.tryamm_order_id||'');
 const buyerId=String(session?.metadata?.tryamm_buyer_id||'');
 if(!orderId||!buyerId)return {matched:false,reason:'not_tryamm_checkout'};
 if(String(session.client_reference_id||'')!==orderId)throw new Error('stripe_client_reference_mismatch');
 const result=await adminRest('rpc/commerce_finalize_stripe_checkout',{method:'POST',body:{
   p_order_id:orderId,
   p_buyer_id:buyerId,
   p_client_reference_id:String(session.client_reference_id||''),
   p_provider_event_id:String(event.id||''),
   p_event_type:String(event.type||''),
   p_provider_session_id:String(session.id||''),
   p_provider_payment_id:paymentIntentId(session),
   p_amount_cents:Number(session.amount_total||0),
   p_currency:String(session.currency||'').toUpperCase(),
   p_payment_status:String(session.payment_status||''),
   p_event_payload:minimalPayload(event)
 }});
 return Array.isArray(result)?result[0]:result;
}

async function recordFailedCheckout(event){
 const session=event?.data?.object||{};
 const orderId=String(session?.metadata?.tryamm_order_id||'');
 const buyerId=String(session?.metadata?.tryamm_buyer_id||'');
 if(!orderId||!buyerId)return {matched:false,reason:'not_tryamm_checkout'};
 const prior=await adminRest('commerce_payment_events',{query:{provider_event_id:`eq.${String(event.id||'')}`,limit:1}});
 let eventRow=prior?.[0];
 if(!eventRow){
   const rows=await adminRest('commerce_payment_events',{method:'POST',body:{provider:'stripe',provider_event_id:String(event.id||''),event_type:String(event.type||'unknown'),verified:true,order_id:orderId,payload:minimalPayload(event)}});
   eventRow=rows?.[0];
 }
 await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${orderId}`,buyer_id:`eq.${buyerId}`,status:'in.(pending_payment,payment_processing)'},body:{status:'payment_failed',updated_at:new Date().toISOString()}});
 if(eventRow?.id)await adminRest('commerce_payment_events',{method:'PATCH',query:{id:`eq.${eventRow.id}`},body:{processed_at:new Date().toISOString()}});
 return {matched:true,orderId};
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const secretKey=process.env.STRIPE_SECRET_KEY,webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!secretKey||!webhookSecret)return json(res,503,{error:'Stripe webhook is not configured'});
 const raw=await readRaw(req),signature=req.headers['stripe-signature'];
 if(!signature)return json(res,400,{error:'Missing Stripe signature'});
 const stripe=new Stripe(secretKey,{maxNetworkRetries:2});
 let event;try{event=stripe.webhooks.constructEvent(raw,signature,webhookSecret)}catch{return json(res,400,{error:'Invalid Stripe signature'});}
 if(!event?.id)return json(res,400,{error:'Missing event id'});
 try{
   if(event.type==='checkout.session.completed'){
     if(event?.data?.object?.payment_status!=='paid')return json(res,200,{ok:true,type:event.type,matched:false,state:'AWAITING_PAYMENT'});
     const result=await finalizePaidCheckout(event);
     return json(res,200,{ok:true,type:event.type,matched:Boolean(result?.matched??result?.transaction_id),result});
   }
   if(event.type==='checkout.session.async_payment_succeeded'){
     const result=await finalizePaidCheckout(event);
     return json(res,200,{ok:true,type:event.type,matched:Boolean(result?.matched??result?.transaction_id),result});
   }
   if(event.type==='checkout.session.async_payment_failed'){
     const result=await recordFailedCheckout(event);
     return json(res,200,{ok:true,type:event.type,matched:Boolean(result?.matched),result});
   }
   return json(res,200,{ok:true,type:event.type,matched:false,ignored:true});
 }catch(error){
   return json(res,500,{error:'Verified Stripe event could not be finalized',code:String(error?.message||'stripe_finalize_failed').slice(0,160)});
 }
}
