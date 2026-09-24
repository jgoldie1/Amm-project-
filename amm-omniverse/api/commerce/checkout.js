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
const stripeSecretConfigured=()=>Boolean(process.env.STRIPE_SECRET_KEY);
const webhookConfigured=()=>Boolean(process.env.STRIPE_WEBHOOK_SECRET);
const normalizeLines=lines=>Array.isArray(lines)?lines.slice(0,50).map(x=>({id:String(x?.id||''),qty:Math.max(1,Math.min(20,Math.trunc(Number(x?.qty)||1)))})):[];
const appUrl=()=>String(process.env.TRYAMM_APP_URL||process.env.VITE_APP_URL||'https://tryamm.online').replace(/\/$/,'');
const stripeClient=()=>new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2});

function expectedAllocations(priced){
 const grouped=new Map();
 for(const x of priced)grouped.set(x.seller,(grouped.get(x.seller)||0)+x.amount);
 return [...grouped.entries()].map(([seller,gross])=>({seller,gross}));
}

async function verifyOrderChildren(order,priced,total){
 const [items,allocations]=await Promise.all([
   adminRest('commerce_order_items',{query:{order_id:`eq.${order.id}`,order:'product_id.asc,id.asc'}}),
   adminRest('commerce_seller_allocations',{query:{order_id:`eq.${order.id}`,order:'seller_key.asc'}})
 ]);
 const expectedItems=priced.map(x=>({product_id:x.id,seller_key:x.seller,unit_amount_cents:x.unitAmount,quantity:x.qty,line_total_cents:x.amount}))
   .sort((a,b)=>a.product_id.localeCompare(b.product_id));
 const actualItems=(items||[]).map(x=>({product_id:String(x.product_id),seller_key:String(x.seller_key),unit_amount_cents:Number(x.unit_amount_cents),quantity:Number(x.quantity),line_total_cents:Number(x.line_total_cents)}))
   .sort((a,b)=>a.product_id.localeCompare(b.product_id));
 if(JSON.stringify(actualItems)!==JSON.stringify(expectedItems))throw new Error('order_items_incomplete');

 const expected=expectedAllocations(priced).sort((a,b)=>a.seller.localeCompare(b.seller));
 const actual=(allocations||[]).map(x=>({seller:String(x.seller_key),gross:Number(x.gross_cents)})).sort((a,b)=>a.seller.localeCompare(b.seller));
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('seller_allocations_incomplete');
 if(actual.reduce((sum,x)=>sum+x.gross,0)!==total)throw new Error('seller_allocation_total_mismatch');
}

async function persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey){
 const existing=await adminRest('commerce_orders',{query:{buyer_id:`eq.${user.id}`,client_order_id:`eq.${clientOrderId}`,limit:1}});
 if(existing?.[0]){
   const order=existing[0];
   if(String(order.idempotency_key)!==idempotencyKey||Number(order.subtotal_cents)!==total||String(order.fulfillment)!==fulfillment)throw new Error('client_order_id_conflict');
   await verifyOrderChildren(order,priced,total);
   return order;
 }
 const orderRows=await adminRest('commerce_orders',{method:'POST',body:{buyer_id:user.id,client_order_id:clientOrderId,currency:'USD',subtotal_cents:total,fulfillment,status:'pending_payment',idempotency_key:idempotencyKey,metadata:{seller_count:new Set(priced.map(x=>x.seller)).size}}});
 const order=orderRows?.[0];if(!order)throw new Error('order_create_failed');
 await adminRest('commerce_order_items',{method:'POST',body:priced.map(x=>({order_id:order.id,product_id:x.id,seller_key:x.seller,product_name:x.name,unit_amount_cents:x.unitAmount,quantity:x.qty,line_total_cents:x.amount}))});
 await adminRest('commerce_seller_allocations',{method:'POST',body:expectedAllocations(priced).map(({seller,gross})=>({order_id:order.id,seller_key:seller,gross_cents:gross,platform_fee_cents:0,seller_net_cents:gross,transfer_status:'blocked'}))});
 await verifyOrderChildren(order,priced,total);
 return order;
}

async function existingCheckout(order){
 if(!order?.provider_session_id)return null;
 const stripe=stripeClient();
 try{
   const session=await stripe.checkout.sessions.retrieve(String(order.provider_session_id));
   if(session.status==='open'&&session.url)return {state:'CHECKOUT_READY',session};
   if(session.status==='expired')return {state:'CHECKOUT_EXPIRED',session};
   if(session.status==='complete')return {state:'PAYMENT_PROCESSING',session};
   return {state:'PAYMENT_PROCESSING',session};
 }catch(error){
   return {state:'CHECKOUT_RETRYABLE',session:null,error:String(error?.message||error)};
 }
}

async function createStripeCheckout({order,user,priced,clientOrderId,idempotencyKey}){
 const stripe=stripeClient();
 const session=await stripe.checkout.sessions.create({
   mode:'payment',
   client_reference_id:String(order.id),
   line_items:priced.map(x=>({quantity:x.qty,price_data:{currency:'usd',unit_amount:x.unitAmount,product_data:{name:x.name,metadata:{tryamm_product_id:x.id,tryamm_seller_key:x.seller}}}})),
   metadata:{tryamm_order_id:String(order.id),tryamm_buyer_id:String(user.id),tryamm_client_order_id:clientOrderId},
   payment_intent_data:{metadata:{tryamm_order_id:String(order.id),tryamm_buyer_id:String(user.id)}},
   success_url:`${appUrl()}/?checkout=success&order_id=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
   cancel_url:`${appUrl()}/?checkout=cancelled&order_id=${encodeURIComponent(order.id)}`
 },{idempotencyKey:`tryamm_checkout_${idempotencyKey}`});
 if(!session?.id||!session?.url)throw new Error('stripe_checkout_session_missing');
 const bound=await adminRest('commerce_orders',{method:'PATCH',query:{id:`eq.${order.id}`,provider_session_id:'is.null'},body:{payment_provider:'stripe',provider_session_id:session.id,updated_at:new Date().toISOString(),metadata:{...(order.metadata||{}),checkout_authority:'stripe_webhook_only'}}});
 if(!bound?.[0]||String(bound[0].provider_session_id)!==session.id)throw new Error('stripe_session_binding_failed');
 return session;
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

 let order;
 try{order=await persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey)}
 catch(error){
   const code=String(error?.message||error);
   await audit(user.id,'commerce_order_persist_failed','high',{clientOrderId,error:code});
   const conflict=code==='client_order_id_conflict';
   const incomplete=code==='order_items_incomplete'||code==='seller_allocations_incomplete'||code==='seller_allocation_total_mismatch';
   return json(res,conflict?409:incomplete?409:500,{ok:false,state:incomplete?'ORDER_REQUIRES_REPAIR':'ORDER_CREATE_FAILED',error:conflict?'clientOrderId already belongs to a different cart':incomplete?'Order persistence is incomplete; charging is blocked until the order is repaired.':'Unable to create order record'});
 }

 const readiness={authenticated:true,catalogValidated:true,serverPriced:true,orderPersisted:true,stripeConfigured:stripeSecretConfigured(),webhookConfigured:webhookConfigured(),liveChargingEnabled:chargingEnabled(),sellerTransfersVerified:sellerTransfersVerified(),reconciliationVerified:reconciliationVerified()};
 await audit(user.id,'commerce_checkout_attempt','info',{orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,readiness});
 if(!readiness.liveChargingEnabled||!readiness.stripeConfigured||!readiness.webhookConfigured||!readiness.sellerTransfersVerified||!readiness.reconciliationVerified){
   return json(res,423,{ok:false,state:'PAYMENT_GATED',orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,readiness,message:'Order saved. Live charging remains disabled until Stripe webhooks, connected-seller transfer readiness, reconciliation, and release approval are verified.'});
 }

 if(order.status==='paid')return json(res,409,{ok:false,state:'ALREADY_PAID',orderId:order.id,clientOrderId});

 if(order.provider_session_id){
   const prior=await existingCheckout(order);
   if(prior.state==='CHECKOUT_READY')return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:prior.session.id,checkoutUrl:prior.session.url,total,currency:'usd',authority:'stripe_webhook_only'});
   if(prior.state==='PAYMENT_PROCESSING')return json(res,202,{ok:true,state:'PAYMENT_PROCESSING',orderId:order.id,clientOrderId,sessionId:prior.session?.id||order.provider_session_id,message:'The Stripe session is complete or unresolved; TRYAMM will wait for the verified webhook and will not create a second charge.'});
   if(prior.state==='CHECKOUT_RETRYABLE')return json(res,503,{ok:false,state:'CHECKOUT_RETRYABLE',orderId:order.id,clientOrderId,message:'TRYAMM could not confirm the existing Stripe session. Retry this same checkout later; do not create a new order.'});
   return json(res,409,{ok:false,state:'CHECKOUT_EXPIRED',orderId:order.id,clientOrderId,message:'Stripe explicitly reports this session expired. Start a new checkout with a new clientOrderId.'});
 }

 try{
   const session=await createStripeCheckout({order,user,priced,clientOrderId,idempotencyKey});
   await audit(user.id,'commerce_checkout_session_created','info',{orderId:order.id,sessionId:session.id,total,currency:'usd',authority:'stripe_webhook_only'});
   return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:session.id,checkoutUrl:session.url,total,currency:'usd',authority:'stripe_webhook_only',message:'Payment is granted only after a verified Stripe webhook posts the transaction, entitlement, and ledger.'});
 }catch(error){
   await audit(user.id,'commerce_checkout_session_failed','high',{orderId:order.id,clientOrderId,error:String(error?.message||error)});
   return json(res,502,{ok:false,state:'CHECKOUT_PROVIDER_ERROR',orderId:order.id,clientOrderId,error:'Unable to create Stripe Checkout session'});
 }
}
