import Stripe from 'stripe';
import {adminRest,adminRpc,json} from '../_lib/supabase-admin.js';

export const config={api:{bodyParser:false}};

async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks)}
const stripeClient=()=>new Stripe(process.env.STRIPE_SECRET_KEY);

async function ensureEventRow(event){
 const eventId=String(event?.id||'');
 const prior=await adminRest('commerce_payment_events',{query:{provider_event_id:`eq.${eventId}`,limit:1}});
 if(prior?.[0])return prior[0];
 const rows=await adminRest('commerce_payment_events',{method:'POST',body:{provider:'stripe',provider_event_id:eventId,event_type:String(event.type||'unknown'),verified:true,payload:event}});
 return rows?.[0]||null;
}

async function markEventProcessed(eventId,orderId=null){
 await adminRest('commerce_payment_events',{method:'PATCH',query:{provider_event_id:`eq.${eventId}`},body:{order_id:orderId||null,processed_at:new Date().toISOString()}});
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const secretKey=process.env.STRIPE_SECRET_KEY,webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!secretKey||!webhookSecret)return json(res,503,{error:'Stripe server configuration is incomplete'});
 const raw=await readRaw(req),signature=req.headers['stripe-signature'];
 let event;
 try{event=stripeClient().webhooks.constructEvent(raw,signature,webhookSecret)}
 catch{return json(res,400,{error:'Invalid Stripe signature'});}
 const eventId=String(event?.id||'');if(!eventId)return json(res,400,{error:'Missing event id'});
 try{
   const prior=await adminRest('commerce_payment_events',{query:{provider_event_id:`eq.${eventId}`,limit:1}});
   if(prior?.[0]?.processed_at)return json(res,200,{ok:true,duplicate:true,type:event.type});
   await ensureEventRow(event);

   const session=event?.data?.object||{};
   const orderId=String(session?.metadata?.tryamm_order_id||'');
   if(event.type==='checkout.session.async_payment_failed'){
     if(orderId)await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${orderId}`},body:{status:'payment_failed',updated_at:new Date().toISOString()}});
     await markEventProcessed(eventId,orderId||null);
     return json(res,200,{ok:true,type:event.type,matched:Boolean(orderId),state:'PAYMENT_FAILED'});
   }

   const paidEvent=event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded';
   if(!paidEvent){
     await markEventProcessed(eventId,null);
     return json(res,200,{ok:true,ignored:true,type:event.type});
   }
   if(String(session.payment_status||'')!=='paid'){
     await markEventProcessed(eventId,orderId||null);
     return json(res,200,{ok:true,type:event.type,matched:Boolean(orderId),state:'AWAITING_VERIFIED_PAYMENT'});
   }

   const buyerId=String(session?.metadata?.tryamm_buyer_id||'');
   const amountCents=Number(session?.amount_total||0);
   const currency=String(session?.currency||'').toUpperCase();
   if(!orderId||!buyerId||!Number.isSafeInteger(amountCents)||amountCents<=0||!currency)throw new Error('verified_checkout_evidence_incomplete');

   const result=await adminRpc('apply_verified_stripe_checkout',{
     p_order_id:orderId,
     p_buyer_id:buyerId,
     p_provider_event_id:eventId,
     p_provider_session_id:String(session.id||''),
     p_provider_payment_id:String(session.payment_intent||''),
     p_amount_cents:amountCents,
     p_currency:currency,
     p_verified_at:new Date().toISOString(),
     p_event_payload:{type:event.type,livemode:Boolean(event.livemode)}
   });
   return json(res,200,{ok:true,type:event.type,matched:true,authority:'verified_stripe_webhook',result});
 }catch(error){
   return json(res,500,{error:'Verified Stripe event could not be committed',code:String(error?.message||'stripe_commit_failed')});
 }
}
