import crypto from 'node:crypto';
import Stripe from 'stripe';
import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const CATALOG=new Map([
['loop-tee',{name:'Chicago StreetVerse Tee',unitAmount:2800,currency:'usd',seller:'loop-courier'}],
['loop-bag',{name:'Creator Transit Bag',unitAmount:4200,currency:'usd',seller:'loop-courier'}],
['river-kit',{name:'Creator Reel Kit',unitAmount:3500,currency:'usd',seller:'riverwalk-creator'}],
['park-print',{name:'Chicago World Art Print',unitAmount:2400,currency:'usd',seller:'millennium-event'}],
['south-meal',{name:'South Side Meal Pack',unitAmount:1800,currency:'usd',seller:'south-market'}],
['west-maker',{name:'Maker Starter Pack',unitAmount:3900,currency:'usd',seller:'west-maker'}],
['north-merch',{name:'North Side Creator Merch',unitAmount:3200,currency:'usd',seller:'north-night'}]
]);

const chargingEnabled=()=>String(process.env.TRYAMM_LIVE_CHARGING_ENABLED||'').toLowerCase()==='true';
const sellerTransfersVerified=()=>String(process.env.TRYAMM_SELLER_TRANSFERS_VERIFIED||'').toLowerCase()==='true';
const reconciliationVerified=()=>String(process.env.TRYAMM_RECONCILIATION_VERIFIED||'').toLowerCase()==='true';
const stripeConfigured=()=>Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET);
const appBaseUrl=()=>String(process.env.TRYAMM_APP_URL||process.env.VITE_APP_URL||'').trim().replace(/\/$/,'');
const normalizeLines=lines=>Array.isArray(lines)?lines.map(x=>({id:String(x?.id||''),qty:Math.max(1,Math.min(20,Math.trunc(Number(x?.qty)||1)))})):[];
const stripeClient=()=>new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2});

async function persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey){
 const existing=await adminRest('commerce_orders',{query:{buyer_id:`eq.${user.id}`,client_order_id:`eq.${clientOrderId}`,limit:1}});
 if(existing?.[0]){
   const order=existing[0];
   if(order.idempotency_key!==idempotencyKey||Number(order.subtotal_cents)!==total||String(order.fulfillment)!==fulfillment){
     throw new Error('client_order_id_conflict');
   }
   return order;
 }
 const orderRows=await adminRest('commerce_orders',{method:'POST',body:{buyer_id:user.id,client_order_id:clientOrderId,currency:'USD',subtotal_cents:total,fulfillment,status:'pending_payment',idempotency_key:idempotencyKey,metadata:{seller_count:new Set(priced.map(x=>x.seller)).size}}});
 const order=orderRows?.[0];if(!order)throw new Error('order_create_failed');
 await adminRest('commerce_order_items',{method:'POST',body:priced.map(x=>({order_id:order.id,product_id:x.id,seller_key:x.seller,product_name:x.name,unit_amount_cents:x.unitAmount,quantity:x.qty,line_total_cents:x.amount}))});
 const grouped=new Map();for(const x of priced)grouped.set(x.seller,(grouped.get(x.seller)||0)+x.amount);
 await adminRest('commerce_seller_allocations',{method:'POST',body:[...grouped.entries()].map(([seller,gross])=>({order_id:order.id,seller_key:seller,gross_cents:gross,platform_fee_cents:0,seller_net_cents:gross,transfer_status:'blocked'}))});
 return order;
}

async function existingCheckout(stripe,order){
 if(!order?.provider_session_id)return null;
 try{
   const session=await stripe.checkout.sessions.retrieve(order.provider_session_id);
   if(session.status==='open'&&session.url)return {state:'CHECKOUT_READY',session};
   if(session.status==='complete'&&session.payment_status==='paid')return {state:'PAYMENT_PROCESSING',session};
   return {state:'CHECKOUT_EXPIRED',session};
 }catch{
   return {state:'CHECKOUT_UNAVAILABLE',session:null};
 }
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const user=await requireUser(req,res);if(!user)return;
 const lines=normalizeLines(req.body?.lines),fulfillment=req.body?.fulfillment==='delivery'?'delivery':'pickup';
 if(!lines.length)return json(res,400,{error:'Cart is empty'});
 const priced=[];let total=0;
 for(const line of lines){const p=CATALOG.get(line.id);if(!p)return json(res,400,{error:`Unknown product: ${line.id}`});const amount=p.unitAmount*line.qty;total+=amount;priced.push({...line,...p,amount});}
 if(total<50||total>500000)return json(res,400,{error:'Cart total outside allowed range'});
 const sellers=[...new Set(priced.map(x=>x.seller))];
 const clientOrderId=String(req.body?.clientOrderId||`AMM-${Date.now().toString(36).toUpperCase()}`).slice(0,96);
 const idempotencyKey=crypto.createHash('sha256').update(`${user.id}|${clientOrderId}|${priced.map(x=>`${x.id}:${x.qty}`).join(',')}|${fulfillment}`).digest('hex');
 let order;try{order=await persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey)}catch(error){await audit(user.id,'commerce_order_persist_failed','high',{clientOrderId,error:String(error?.message||error)});return json(res,error?.message==='client_order_id_conflict'?409:500,{error:error?.message==='client_order_id_conflict'?'clientOrderId already belongs to a different cart':'Unable to create order record'});}
 if(order.status==='paid')return json(res,409,{ok:false,state:'ALREADY_PAID',orderId:order.id,clientOrderId});
 const baseUrl=appBaseUrl();
 const readiness={authenticated:true,catalogValidated:true,serverPriced:true,orderPersisted:true,stripeConfigured:stripeConfigured(),webhookConfigured:Boolean(process.env.STRIPE_WEBHOOK_SECRET),appUrlConfigured:Boolean(baseUrl),liveChargingEnabled:chargingEnabled(),sellerTransfersVerified:sellerTransfersVerified(),reconciliationVerified:reconciliationVerified()};
 await audit(user.id,'commerce_checkout_attempt','info',{orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,readiness});
 if(!readiness.liveChargingEnabled||!readiness.stripeConfigured||!readiness.appUrlConfigured||!readiness.sellerTransfersVerified||!readiness.reconciliationVerified){
   return json(res,423,{ok:false,state:'PAYMENT_GATED',orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,readiness,message:'Order saved. Live charging remains disabled until Stripe, app URL, webhooks, connected-seller transfer readiness, reconciliation, and release approval are verified.'});
 }

 const stripe=stripeClient();
 const prior=await existingCheckout(stripe,order);
 if(prior?.state==='CHECKOUT_READY'){
   return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:prior.session.id,checkoutUrl:prior.session.url});
 }
 if(prior?.state==='PAYMENT_PROCESSING'){
   return json(res,202,{ok:true,state:'PAYMENT_PROCESSING',orderId:order.id,clientOrderId,sessionId:prior.session.id,message:'Payment was accepted by Stripe and is waiting for the verified webhook to finalize TRYAMM records.'});
 }
 if(prior?.state==='CHECKOUT_EXPIRED'||prior?.state==='CHECKOUT_UNAVAILABLE'){
   return json(res,409,{ok:false,state:prior.state,orderId:order.id,clientOrderId,message:'This checkout attempt can no longer be reused. Start a new checkout with a new clientOrderId.'});
 }

 try{
   const session=await stripe.checkout.sessions.create({
     mode:'payment',
     client_reference_id:order.id,
     customer_email:user.email||undefined,
     line_items:priced.map(x=>({
       quantity:x.qty,
       price_data:{
         currency:x.currency,
         unit_amount:x.unitAmount,
         product_data:{name:x.name,metadata:{tryamm_product_id:x.id,tryamm_seller_key:x.seller}}
       }
     })),
     metadata:{tryamm_order_id:order.id,tryamm_buyer_id:user.id,tryamm_client_order_id:clientOrderId},
     payment_intent_data:{metadata:{tryamm_order_id:order.id,tryamm_buyer_id:user.id}},
     success_url:`${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
     cancel_url:`${baseUrl}/?checkout=cancelled&order_id=${encodeURIComponent(order.id)}`
   },{idempotencyKey:`tryamm_checkout_${order.id}`});
   if(!session?.id||!session?.url)throw new Error('stripe_session_missing_url');
   const bound=await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${order.id}`,status:'in.(pending_payment,payment_processing)'},body:{status:'payment_processing',payment_provider:'stripe',provider_session_id:session.id,updated_at:new Date().toISOString()}});
   if(!bound?.[0]||bound[0].provider_session_id!==session.id)throw new Error('stripe_session_binding_failed');
   await audit(user.id,'commerce_checkout_session_created','info',{orderId:order.id,sessionId:session.id,total,currency:'usd'});
   return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:session.id,checkoutUrl:session.url});
 }catch(error){
   await audit(user.id,'commerce_checkout_session_failed','high',{orderId:order.id,error:String(error?.message||error)});
   return json(res,502,{ok:false,state:'STRIPE_CHECKOUT_FAILED',orderId:order.id,clientOrderId,error:'Unable to create Stripe checkout session'});
 }
}
