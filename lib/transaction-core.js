'use strict';
const crypto=require('crypto');
const db=require('./supabase-rest');
const env=n=>String(process.env[n]||'').trim();
function configured(){return db.configured();}
function hash(v){return crypto.createHash('sha256').update(String(v??'')).digest('hex');}
async function rpc(name,args={}){
 const base=env('SUPABASE_URL').replace(/\/$/,'');const key=env('SUPABASE_SERVICE_ROLE_KEY');
 if(!base||!key){const e=new Error('transaction_store_not_configured');e.code='TRANSACTION_STORE_NOT_CONFIGURED';throw e;}
 const r=await fetch(`${base}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(args)});
 const text=await r.text();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}
 if(!r.ok){const e=new Error(body?.message||body?.hint||`${name}_${r.status}`);e.status=r.status;e.details=body;throw e;}return body;
}
async function upsertInventory({productId,stock,active=true}){return rpc('upsert_marketplace_inventory',{p_product_id:productId,p_stock:stock===null?null:Math.max(0,Math.floor(Number(stock)||0)),p_active:active!==false});}
async function createOrder({orderId,buyerId,merchantId,productId,quantity,subtotalCents,platformFeeCents,currency='usd'}){return rpc('create_marketplace_transaction_order',{p_order_id:orderId,p_buyer_id:buyerId,p_merchant_id:merchantId,p_product_id:productId,p_quantity:quantity,p_subtotal_cents:subtotalCents,p_platform_fee_cents:platformFeeCents,p_currency:currency});}
async function setCheckoutSession(orderId,sessionId){return rpc('set_marketplace_checkout_session',{p_order_id:orderId,p_session_id:sessionId});}
async function reserveInventory({productId,orderId,quantity,ttlMinutes=30}){return rpc('reserve_marketplace_inventory',{p_product_id:productId,p_order_id:orderId,p_quantity:quantity,p_expires_at:new Date(Date.now()+Math.max(5,Math.min(120,Number(ttlMinutes)||30))*60000).toISOString()});}
async function commitOrder(orderId,paymentStatus='paid'){return rpc('commit_marketplace_order',{p_order_id:orderId,p_payment_status:paymentStatus});}
async function releaseReservation(orderId,status='released'){return rpc('release_marketplace_reservation',{p_order_id:orderId,p_status:status});}
async function recordWebhook({provider,eventId,eventType,payload}){
 if(!configured())throw Object.assign(new Error('transaction_store_not_configured'),{code:'TRANSACTION_STORE_NOT_CONFIGURED'});
 let created=true,rows;
 try{rows=await db.insert('provider_webhook_events',[{provider,event_id:eventId,event_type:eventType,payload,status:'received'}]);}
 catch(e){if(e.status!==409)throw e;created=false;rows=await db.select('provider_webhook_events',`provider=eq.${encodeURIComponent(provider)}&event_id=eq.${encodeURIComponent(eventId)}&limit=1`);}
 const row=Array.isArray(rows)?rows[0]:rows;return {created,event:row};
}
async function markWebhook({provider,eventId,status='processed',lastError=null}){const patch={status,processed_at:status==='processed'||status==='ignored'?new Date().toISOString():null,last_error:lastError};return db.update('provider_webhook_events',`provider=eq.${encodeURIComponent(provider)}&event_id=eq.${encodeURIComponent(eventId)}`,patch);}
async function emitEvent({type,aggregateType,aggregateId,payload={},metadata={},idempotencyKey}){
 const key=idempotencyKey||hash(`${type}|${aggregateType}|${aggregateId}|${JSON.stringify(payload)}`);let rows;
 try{rows=await db.insert('domain_events',[{event_type:type,aggregate_type:aggregateType,aggregate_id:aggregateId,idempotency_key:key,payload,metadata}]);}
 catch(e){if(e.status!==409)throw e;rows=await db.select('domain_events',`idempotency_key=eq.${encodeURIComponent(key)}&limit=1`);}
 const event=Array.isArray(rows)?rows[0]:rows;
 if(event?.id){try{await db.insert('outbox_messages',[{event_id:event.id,topic:type,payload}]);}catch(e){if(e.status!==409)throw e;}}
 return event;
}
module.exports={configured,hash,rpc,upsertInventory,createOrder,setCheckoutSession,reserveInventory,commitOrder,releaseReservation,recordWebhook,markWebhook,emitEvent};
