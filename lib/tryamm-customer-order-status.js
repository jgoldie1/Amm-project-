'use strict';
// Customer order status magic links: read only, no payment authorization.
// The stored lead email is authoritative; never take an email recipient from a request.
const crypto=require('node:crypto');
const db=require('./supabase-rest');
const orders=require('./tryamm-order-lifecycle');
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const TOKEN=/^[a-f0-9]{64}$/;
function fail(message,status=400){return Object.assign(new Error(message),{status})}
function enabled(){return db.configured()&&process.env.TRYAMM_ORDERS_DURABLE_ENABLED==='true'&&process.env.TRYAMM_CUSTOMER_ORDER_STATUS_ENABLED==='true'}
function requireEnabled(){if(!enabled())throw fail('Secure customer order tracking is not enabled',503)}
function hash(token){if(!TOKEN.test(String(token||'')))throw fail('Invalid tracking link');return crypto.createHash('sha256').update(token).digest('hex')}
function host(){let u;try{u=new URL(process.env.APP_URL||'')}catch{throw fail('Configured HTTPS website required',503)}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.hostname==='localhost')throw fail('Configured HTTPS website required',503);
 return u.origin}
function sender(){const value=String(process.env.TRYAMM_QUOTE_FROM_EMAIL||'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw fail('Verified sender required',503);
 return value}
async function issue({orderId,ownerId,dbClient=db,send=globalThis.fetch,now=Date.now()}){
 requireEnabled();
 if(!UUID.test(String(orderId||'')))throw fail('Invalid order');
 if(!process.env.RESEND_API_KEY)throw fail('Email provider is not configured',503);
 const from=sender(),origin=host();
 const rows=await dbClient.select('tryamm_website_orders','id=eq.'+encodeURIComponent(orderId)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 const order=rows?.[0];if(!order)throw fail('Owned order not found',404);
 if(order.status==='quote-pending'||order.status==='cancelled')throw fail('No customer-tracked order is available',409);
 const leads=await dbClient.select('tryamm_campaign_leads','id=eq.'+encodeURIComponent(order.lead_id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=email&limit=1');
 const email=String(leads?.[0]?.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('Customer email unavailable',422);
 const recent=await dbClient.select('tryamm_order_status_tokens','order_id=eq.'+orderId+'&revoked_at=is.null&created_at=gt.'+encodeURIComponent(new Date(now-5*60*1000).toISOString())+'&select=token_hash&limit=1');
 if(recent?.length)throw fail('Tracking link recently sent; please retry later',429);
 const secret=crypto.randomBytes(32).toString('hex');
 const tokenHash=hash(secret),expiresAt=new Date(now+24*60*60*1000).toISOString();
 await dbClient.insert('tryamm_order_status_tokens',{order_id:order.id,token_hash:tokenHash,customer_email:email,expires_at:expiresAt});
 const link=origin+'/tryamm-order-status.html#token='+secret;
 const response=await send('https://api.resend.com/emails',{method:'POST',headers:{
  Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'tryamm-order-status-'+tokenHash
 },body:JSON.stringify({from,to:[email],subject:'Your TRYAMM website order status',
  text:'Your private TRYAMM website order tracking link (expires in 24 hours):\n'+link+
  '\n\nThis is a status page, not a payment link. Do not share it.'})});
 const result=await response.json().catch(()=>({}));
 if(!response.ok||!result.id){
  await dbClient.update('tryamm_order_status_tokens','token_hash=eq.'+tokenHash,{revoked_at:new Date().toISOString()});
  throw fail('Tracking email was not accepted by the provider',502);
 }
 return {sent:true,expiresAt,providerAccepted:true,deliveryVerified:false};
}
async function status(token,{dbClient=db,now=Date.now()}={}){
 requireEnabled();const tokenHash=hash(token);
 const entries=await dbClient.select('tryamm_order_status_tokens','token_hash=eq.'+tokenHash+
  '&revoked_at=is.null&expires_at=gt.'+encodeURIComponent(new Date(now).toISOString())+
  '&select=order_id,customer_email&limit=1');
 const entry=entries?.[0];if(!entry)throw fail('Tracking link expired or invalid',410);
 const ordersFound=await dbClient.select('tryamm_website_orders','id=eq.'+encodeURIComponent(entry.order_id)+
  '&select=id,lead_id,package_id,price_cents,currency,description,terms,status,customer_accepted_at,verified_paid_at,delivered_at&limit=1');
 const order=ordersFound?.[0];if(!order)throw fail('Order not found',404);
 const lead=await dbClient.select('tryamm_campaign_leads','id=eq.'+encodeURIComponent(order.lead_id)+'&select=email&limit=1');
 if(String(lead?.[0]?.email||'').toLowerCase()!==entry.customer_email)throw fail('Customer identity no longer matches the order',403);
 const view=orders.customerSummary(order);
 return {order:view,paymentVerified:!!order.verified_paid_at,deliveryVerified:!!order.delivered_at,
  notice:'Only the database settlement record proves payment. Stripe redirects do not change status.'};
}
module.exports={enabled,hash,issue,status};
