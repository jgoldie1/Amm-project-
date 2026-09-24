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
const ASSET_SPLIT={sellerBasisPoints:4000,platformBasisPoints:4000,reserveBasisPoints:2000};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const chargingEnabled=()=>String(process.env.TRYAMM_LIVE_CHARGING_ENABLED||'').toLowerCase()==='true';
const sellerTransfersVerified=()=>String(process.env.TRYAMM_SELLER_TRANSFERS_VERIFIED||'').toLowerCase()==='true';
const reconciliationVerified=()=>String(process.env.TRYAMM_RECONCILIATION_VERIFIED||'').toLowerCase()==='true';
const stripeSecretConfigured=()=>Boolean(process.env.STRIPE_SECRET_KEY);
const webhookConfigured=()=>Boolean(process.env.STRIPE_WEBHOOK_SECRET);
const normalizeLines=lines=>Array.isArray(lines)?lines.slice(0,50).map(x=>({id:String(x?.id||'').trim(),qty:Math.max(1,Math.min(20,Math.trunc(Number(x?.qty)||1)))})):[];
const appUrl=()=>String(process.env.TRYAMM_APP_URL||process.env.VITE_APP_URL||'https://tryamm.online').replace(/\/$/,'');
const stripeClient=()=>new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:2});

function itemMetaFingerprint(value={}){
  return [
    String(value?.commerceKind||''),
    String(value?.listingId||''),
    String(value?.assetRegistryId||''),
    String(value?.assetKey||''),
    String(value?.licenseScope||''),
    String(value?.rightsReviewReference||'')
  ].join(':');
}
const itemFingerprint=x=>[
 String(x.product_id??x.id??''),
 String(x.seller_key??x.seller??''),
 Number(x.unit_amount_cents??x.unitAmount??0),
 Number(x.quantity??x.qty??0),
 Number(x.line_total_cents??x.amount??0),
 itemMetaFingerprint(x.metadata||{})
].join('|');

function lineSettlement(amount,split){
 const sellerNet=Math.floor(amount*split.sellerBasisPoints/10000);
 const platformFee=Math.floor(amount*split.platformBasisPoints/10000);
 const reserve=Math.max(0,amount-sellerNet-platformFee);
 return {sellerNet,platformFee,reserve};
}

function expectedAllocations(priced){
 const grouped=new Map();
 for(const x of priced){
   const settled=lineSettlement(x.amount,x.split);
   const row=grouped.get(x.seller)||{seller:x.seller,gross:0,net:0,fee:0,reserve:0};
   row.gross+=x.amount;
   row.net+=settled.sellerNet;
   row.fee+=settled.platformFee;
   row.reserve+=settled.reserve;
   grouped.set(x.seller,row);
 }
 return [...grouped.values()].sort((a,b)=>a.seller.localeCompare(b.seller));
}

async function resolveProduct(id){
 const fixed=CATALOG.get(id);
 if(fixed)return {
   id,
   ...fixed,
   kind:'catalog',
   split:{sellerBasisPoints:10000,platformBasisPoints:0,reserveBasisPoints:0},
   metadata:{commerceKind:'catalog'}
 };
 if(!UUID.test(id))return null;

 const listingRows=await adminRest('commerce_listings',{query:{id:'eq.'+id,status:'eq.published',limit:1}});
 const listing=listingRows?.[0];
 if(!listing||listing?.safety_flags?.blocked===true)return null;
 if(String(listing?.attributes?.commerceKind||'')!=='asset')return null;
 if(String(listing.currency||'').toUpperCase()!=='USD')throw new Error('asset_listing_currency_not_supported');

 const assetRegistryId=String(listing?.attributes?.assetRegistryId||'');
 if(!UUID.test(assetRegistryId))throw new Error('asset_listing_registry_missing');
 const assetRows=await adminRest('commerce_asset_registry',{query:{
   id:'eq.'+assetRegistryId,
   owner_user_id:'eq.'+String(listing.seller_user_id||''),
   provenance_status:'eq.verified',
   rights_status:'eq.verified',
   certification_status:'eq.verified',
   limit:1
 }});
 const asset=assetRows?.[0];
 if(!asset)throw new Error('asset_listing_certification_invalid');
 const unitAmount=Math.round(Number(listing.price)*100);
 if(!Number.isSafeInteger(unitAmount)||unitAmount<100||unitAmount>500000)throw new Error('asset_listing_price_invalid');

 return {
   id:String(listing.id),
   name:String(listing.title||asset.title||'TRYAMM Asset').slice(0,160),
   unitAmount,
   currency:'usd',
   seller:'user:'+String(listing.seller_user_id),
   kind:'asset',
   split:ASSET_SPLIT,
   metadata:{
     commerceKind:'asset',
     listingId:String(listing.id),
     assetRegistryId:String(asset.id),
     assetKey:String(asset.asset_key),
     licenseScope:String(listing?.attributes?.licenseScope||asset?.metadata?.licenseScope||'tryamm-worlds'),
     rightsReviewReference:String(asset.review_reference||'')
   }
 };
}

async function validatePersistedOrder(order,priced,total,fulfillment,idempotencyKey){
 if(String(order.idempotency_key||'')!==idempotencyKey||Number(order.subtotal_cents)!==total||String(order.fulfillment)!==fulfillment||String(order.currency||'').toUpperCase()!=='USD'){
   throw new Error('client_order_id_conflict');
 }
 const [items,allocations]=await Promise.all([
   adminRest('commerce_order_items',{query:{order_id:'eq.'+order.id}}),
   adminRest('commerce_seller_allocations',{query:{order_id:'eq.'+order.id}})
 ]);
 const expectedItems=priced.map(itemFingerprint).sort();
 const actualItems=(items||[]).map(itemFingerprint).sort();
 if(expectedItems.length!==actualItems.length||expectedItems.some((value,index)=>value!==actualItems[index])){
   throw new Error('persisted_order_snapshot_mismatch');
 }
 const expected=expectedAllocations(priced);
 const actual=(allocations||[]).map(x=>({
   seller:String(x.seller_key||''),
   gross:Number(x.gross_cents||0),
   fee:Number(x.platform_fee_cents||0),
   net:Number(x.seller_net_cents||0),
   reserve:Number(x.reserve_cents||0)
 })).sort((a,b)=>a.seller.localeCompare(b.seller));
 if(expected.length!==actual.length||expected.some((value,index)=>{
   const row=actual[index];
   return !row||row.seller!==value.seller||row.gross!==value.gross||row.fee!==value.fee||row.net!==value.net||row.reserve!==value.reserve;
 })){
   throw new Error('persisted_order_snapshot_mismatch');
 }
 return order;
}

async function persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey){
 const existing=await adminRest('commerce_orders',{query:{buyer_id:'eq.'+user.id,client_order_id:'eq.'+clientOrderId,limit:1}});
 if(existing?.[0])return validatePersistedOrder(existing[0],priced,total,fulfillment,idempotencyKey);
 const orderRows=await adminRest('commerce_orders',{method:'POST',body:{
   buyer_id:user.id,
   client_order_id:clientOrderId,
   currency:'USD',
   subtotal_cents:total,
   fulfillment,
   status:'pending_payment',
   idempotency_key:idempotencyKey,
   metadata:{seller_count:new Set(priced.map(x=>x.seller)).size,contains_asset:priced.some(x=>x.kind==='asset')}
 }});
 const order=orderRows?.[0];if(!order)throw new Error('order_create_failed');
 await adminRest('commerce_order_items',{method:'POST',body:priced.map(x=>({
   order_id:order.id,
   product_id:x.id,
   seller_key:x.seller,
   product_name:x.name,
   unit_amount_cents:x.unitAmount,
   quantity:x.qty,
   line_total_cents:x.amount,
   metadata:x.metadata||{}
 }))});
 await adminRest('commerce_seller_allocations',{method:'POST',body:expectedAllocations(priced).map(x=>({
   order_id:order.id,
   seller_key:x.seller,
   gross_cents:x.gross,
   platform_fee_cents:x.fee,
   seller_net_cents:x.net,
   reserve_cents:x.reserve,
   transfer_status:'blocked'
 }))});
 return validatePersistedOrder(order,priced,total,fulfillment,idempotencyKey);
}

async function inspectExistingCheckout(order,user){
 if(!order?.provider_session_id)return null;
 const stripe=stripeClient();
 let session;
 try{session=await stripe.checkout.sessions.retrieve(String(order.provider_session_id))}
 catch{return {state:'CHECKOUT_STATUS_UNAVAILABLE',session:null};}
 if(String(session?.metadata?.tryamm_order_id||'')!==String(order.id)||String(session?.metadata?.tryamm_buyer_id||'')!==String(user.id)||String(session?.client_reference_id||'')!==String(order.id)){
   throw new Error('stripe_session_binding_mismatch');
 }
 if(String(session.payment_status||'')==='paid'||String(session.status||'')==='complete')return {state:'PAYMENT_PROCESSING',session};
 if(String(session.status||'')==='open'&&session.url)return {state:'CHECKOUT_READY',session};
 if(String(session.status||'')==='expired')return {state:'CHECKOUT_EXPIRED',session};
 return {state:'CHECKOUT_STATUS_UNAVAILABLE',session};
}

async function createStripeCheckout({order,user,priced,clientOrderId,idempotencyKey}){
 const stripe=stripeClient();
 const session=await stripe.checkout.sessions.create({
   mode:'payment',
   client_reference_id:String(order.id),
   line_items:priced.map(x=>({
     quantity:x.qty,
     price_data:{
       currency:'usd',
       unit_amount:x.unitAmount,
       product_data:{name:x.name,metadata:{tryamm_product_id:x.id,tryamm_seller_key:x.seller,tryamm_commerce_kind:x.kind}}
     }
   })),
   metadata:{tryamm_order_id:String(order.id),tryamm_buyer_id:String(user.id),tryamm_client_order_id:clientOrderId},
   payment_intent_data:{metadata:{tryamm_order_id:String(order.id),tryamm_buyer_id:String(user.id)}},
   success_url:appUrl()+'/?checkout=success&order_id='+encodeURIComponent(order.id)+'&session_id={CHECKOUT_SESSION_ID}',
   cancel_url:appUrl()+'/?checkout=cancelled&order_id='+encodeURIComponent(order.id)
 },{idempotencyKey:'tryamm_checkout_'+idempotencyKey});
 if(!session?.id||!session?.url)throw new Error('stripe_checkout_session_missing');
 const bound=await adminRest('commerce_orders',{method:'PATCH',query:{id:'eq.'+order.id,provider_session_id:'is.null'},body:{payment_provider:'stripe',provider_session_id:session.id,updated_at:new Date().toISOString(),metadata:{...(order.metadata||{}),checkout_authority:'stripe_webhook_only'}}});
 if(bound?.[0]?.provider_session_id===session.id)return session;
 const refreshed=await adminRest('commerce_orders',{query:{id:'eq.'+order.id,limit:1}});
 if(refreshed?.[0]?.provider_session_id===session.id)return session;
 throw new Error('stripe_session_binding_failed');
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const user=await requireUser(req,res);if(!user)return;
 const lines=normalizeLines(req.body?.lines);
 if(!lines.length)return json(res,400,{error:'Cart is empty'});

 const priced=[];let total=0;
 try{
   for(const line of lines){
     const product=await resolveProduct(line.id);
     if(!product)return json(res,400,{error:'Unknown or unavailable product: '+line.id});
     const amount=product.unitAmount*line.qty;
     if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('invalid_line_amount');
     total+=amount;
     priced.push({...line,...product,amount});
   }
 }catch(error){
   const code=String(error?.message||error);
   await audit(user.id,'commerce_catalog_resolution_failed','high',{error:code,productIds:lines.map(x=>x.id)});
   if(code.startsWith('asset_listing_'))return json(res,423,{ok:false,state:'ASSET_LISTING_GATED',error:'This asset listing is no longer eligible for purchase.'});
   return json(res,500,{error:'Unable to verify server catalog'});
 }

 if(total<50||total>500000)return json(res,400,{error:'Cart total outside allowed range'});
 const kinds=new Set(priced.map(x=>x.kind));
 if(kinds.has('asset')&&kinds.size>1)return json(res,400,{error:'Digital assets and physical products must be checked out separately'});
 const fulfillment=kinds.has('asset')?'digital':(req.body?.fulfillment==='delivery'?'delivery':'pickup');
 const sellers=[...new Set(priced.map(x=>x.seller))];
 const clientOrderId=String(req.body?.clientOrderId||('AMM-'+Date.now().toString(36).toUpperCase())).slice(0,96);
 const idempotencyKey=crypto.createHash('sha256').update(user.id+'|'+clientOrderId+'|'+priced.map(x=>x.id+':'+x.qty).join(',')+'|'+fulfillment).digest('hex');

 let order;
 try{order=await persistOrder(user,priced,total,fulfillment,clientOrderId,idempotencyKey)}
 catch(error){
   const code=String(error?.message||error);
   await audit(user.id,'commerce_order_persist_failed','high',{clientOrderId,error:code});
   if(code==='client_order_id_conflict'||code==='persisted_order_snapshot_mismatch')return json(res,409,{ok:false,state:'ORDER_SNAPSHOT_CONFLICT',clientOrderId,error:'This checkout reference is incomplete or belongs to a different cart. Start a new checkout with a new clientOrderId.'});
   return json(res,500,{error:'Unable to create complete order record'});
 }
 if(order.status==='paid')return json(res,409,{ok:false,state:'ALREADY_PAID',orderId:order.id,clientOrderId});
 if(order.status==='payment_failed')return json(res,409,{ok:false,state:'PAYMENT_FAILED',orderId:order.id,clientOrderId,message:'This payment attempt failed. Start a new checkout with a new clientOrderId.'});

 const readiness={authenticated:true,catalogValidated:true,serverPriced:true,orderPersisted:true,stripeConfigured:stripeSecretConfigured(),webhookConfigured:webhookConfigured(),liveChargingEnabled:chargingEnabled(),sellerTransfersVerified:sellerTransfersVerified(),reconciliationVerified:reconciliationVerified()};
 await audit(user.id,'commerce_checkout_attempt','info',{orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,kinds:[...kinds],readiness});
 if(!readiness.liveChargingEnabled||!readiness.stripeConfigured||!readiness.webhookConfigured||!readiness.sellerTransfersVerified||!readiness.reconciliationVerified){
   return json(res,423,{ok:false,state:'PAYMENT_GATED',orderId:order.id,clientOrderId,total,currency:'usd',fulfillment,sellers,readiness,message:'Order saved. Live charging remains disabled until Stripe webhooks, connected-seller transfer readiness, reconciliation, and release approval are verified.'});
 }
 try{
   const prior=await inspectExistingCheckout(order,user);
   if(prior?.state==='CHECKOUT_READY')return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:prior.session.id,checkoutUrl:prior.session.url,total,currency:'usd',authority:'stripe_webhook_only'});
   if(prior?.state==='PAYMENT_PROCESSING')return json(res,202,{ok:true,state:'PAYMENT_PROCESSING',orderId:order.id,clientOrderId,sessionId:prior.session?.id||order.provider_session_id,authority:'stripe_webhook_only',message:'Stripe has completed or accepted this Checkout Session. TRYAMM is waiting for the verified payment event; do not create a second charge.'});
   if(prior?.state==='CHECKOUT_EXPIRED')return json(res,409,{ok:false,state:'CHECKOUT_EXPIRED',orderId:order.id,clientOrderId,message:'This Stripe Checkout Session expired. Start a new checkout with a new clientOrderId.'});
   if(prior?.state==='CHECKOUT_STATUS_UNAVAILABLE')return json(res,503,{ok:false,state:'CHECKOUT_STATUS_UNAVAILABLE',orderId:order.id,clientOrderId,message:'TRYAMM could not safely verify the existing Stripe Checkout Session. Retry this checkout; do not create a duplicate order.'});

   const session=await createStripeCheckout({order,user,priced,clientOrderId,idempotencyKey});
   await audit(user.id,'commerce_checkout_session_created','info',{orderId:order.id,sessionId:session.id,total,currency:'usd',authority:'stripe_webhook_only'});
   return json(res,200,{ok:true,state:'CHECKOUT_READY',orderId:order.id,clientOrderId,sessionId:session.id,checkoutUrl:session.url,total,currency:'usd',authority:'stripe_webhook_only',message:'Payment is granted only after a verified Stripe webhook posts the transaction, entitlement, and ledger.'});
 }catch(error){
   await audit(user.id,'commerce_checkout_session_failed','high',{orderId:order.id,clientOrderId,error:String(error?.message||error)});
   return json(res,502,{ok:false,state:'CHECKOUT_PROVIDER_ERROR',orderId:order.id,clientOrderId,error:'Unable to safely create or recover Stripe Checkout session'});
 }
}
