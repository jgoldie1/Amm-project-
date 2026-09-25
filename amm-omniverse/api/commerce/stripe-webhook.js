import crypto from 'node:crypto';
import {adminRest,json} from '../_lib/supabase-admin.js';

export const config={api:{bodyParser:false}};

async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks)}
function parseSig(header){const out={t:null,v1:[]};for(const part of String(header||'').split(',')){const [k,v]=part.split('=',2);if(k==='t')out.t=Number(v);if(k==='v1'&&v)out.v1.push(v)}return out}
function safeEqualHex(a,b){try{const A=Buffer.from(String(a),'hex'),B=Buffer.from(String(b),'hex');return A.length===B.length&&A.length>0&&crypto.timingSafeEqual(A,B)}catch{return false}}
function verifyStripe(raw,header,secret,tolerance=300){const sig=parseSig(header);if(!sig.t||!sig.v1.length)return false;if(Math.abs(Math.floor(Date.now()/1000)-sig.t)>tolerance)return false;const expected=crypto.createHmac('sha256',secret).update(`${sig.t}.${raw.toString('utf8')}`).digest('hex');return sig.v1.some(v=>safeEqualHex(v,expected))}

async function markPaid(session,eventId,payload){
 const orderId=String(session?.metadata?.tryamm_order_id||'');if(!orderId)return {matched:false};
 const orders=await adminRest('commerce_orders',{query:{id:`eq.${orderId}`,limit:1}});const order=orders?.[0];if(!order)return {matched:false};
 const amount=Number(session?.amount_total||0),currency=String(session?.currency||'').toUpperCase();if(amount!==Number(order.subtotal_cents)||currency!==String(order.currency||'').toUpperCase())throw new Error('stripe_amount_mismatch');
 await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${orderId}`},body:{status:'paid',payment_provider:'stripe',provider_session_id:String(session.id||''),provider_payment_id:String(session.payment_intent||''),updated_at:new Date().toISOString(),metadata:{...(order.metadata||{}),stripe_event_id:eventId,payment_status:String(session.payment_status||'paid')}}});
 await adminRest('commerce_seller_allocations',{method:'PATCH',query:{order_id:`eq.${orderId}`,transfer_status:'eq.blocked'},body:{transfer_status:'ready',updated_at:new Date().toISOString()}});
 return {matched:true,orderId};
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret)return json(res,503,{error:'Stripe webhook secret not configured'});
 const raw=await readRaw(req);const signature=req.headers['stripe-signature'];if(!verifyStripe(raw,signature,secret))return json(res,400,{error:'Invalid Stripe signature'});
 let event;try{event=JSON.parse(raw.toString('utf8'))}catch{return json(res,400,{error:'Invalid JSON'});}
 const eventId=String(event?.id||'');if(!eventId)return json(res,400,{error:'Missing event id'});
 const prior=await adminRest('commerce_payment_events',{query:{provider_event_id:`eq.${eventId}`,limit:1}});if(prior?.[0]?.processed_at)return json(res,200,{ok:true,duplicate:true});
 let eventRow=prior?.[0];if(!eventRow){const rows=await adminRest('commerce_payment_events',{method:'POST',body:{provider:'stripe',provider_event_id:eventId,event_type:String(event.type||'unknown'),verified:true,payload:event}});eventRow=rows?.[0];}
 try{
   let result={matched:false};if(event.type==='checkout.session.completed'&&event?.data?.object?.payment_status==='paid')result=await markPaid(event.data.object,eventId,event);
   if(event.type==='checkout.session.async_payment_succeeded')result=await markPaid(event.data.object,eventId,event);
   if(event.type==='checkout.session.async_payment_failed'){const orderId=String(event?.data?.object?.metadata?.tryamm_order_id||'');if(orderId)await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${orderId}`},body:{status:'payment_failed',updated_at:new Date().toISOString()}});result={matched:Boolean(orderId),orderId};}
   if(eventRow?.id)await adminRest('commerce_payment_events',{method:'PATCH',query:{id:`eq.${eventRow.id}`},body:{order_id:result.orderId||null,processed_at:new Date().toISOString()}});
   return json(res,200,{ok:true,type:event.type,matched:result.matched});
 }catch(error){return json(res,400,{error:String(error?.message||'Webhook processing failed')});}
}
