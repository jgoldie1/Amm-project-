'use strict';
// One-time, high-entropy customer quote acceptance. No checkout or billing occurs here.
const crypto=require('node:crypto');
const db=require('./supabase-rest');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN=/^[a-f0-9]{64}$/;
function fail(message,status=400){return Object.assign(new Error(message),{status})}
function termsSnapshot(row){
 if(!row||!UUID.test(String(row.id||'')))throw fail('Invalid quote');
 return [row.id,row.price_cents,row.currency,row.package_id,row.description,row.terms].join('\n');
}
function fingerprint(row){return crypto.createHash('sha256').update(termsSnapshot(row)).digest('hex')}
function tokenHash(token){if(!TOKEN.test(String(token||'')))throw fail('Invalid or expired acceptance link');return crypto.createHash('sha256').update(token).digest('hex')}
function acceptanceEnabled(){return db.configured()&&process.env.TRYAMM_ORDERS_DURABLE_ENABLED==='true'&&process.env.TRYAMM_QUOTE_ACCEPTANCE_ENABLED==='true'}
function requireEnabled(){if(!acceptanceEnabled())throw fail('Verified customer quote acceptance is not enabled',503)}
function sender(){const value=String(process.env.TRYAMM_QUOTE_FROM_EMAIL||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw fail('Verified sender identity not configured',503);return value}
function origin(){let u;try{u=new URL(String(process.env.APP_URL||''))}catch{throw fail('Public HTTPS site is not configured',503)}if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw fail('Public HTTPS site is not configured',503);return u.origin}
async function issueAcceptance({orderId,ownerId,dbClient=db,send=globalThis.fetch,now=Date.now()}){
 requireEnabled();if(!UUID.test(String(orderId||'')))throw fail('Invalid order');
 if(!process.env.RESEND_API_KEY)throw fail('Mail delivery provider is not configured',503);
 const from=sender(),host=origin();
 const found=await dbClient.select('tryamm_website_orders','id=eq.'+orderId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&status=eq.quote-approved&select=*&limit=1');
 const order=found?.[0];if(!order)throw fail('Approved quote not found',404);
 const leads=await dbClient.select('tryamm_campaign_leads','id=eq.'+order.lead_id+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=email&limit=1');
 const to=String(leads?.[0]?.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))throw fail('Customer email missing',422);
 const token=crypto.randomBytes(32).toString('hex');
 const deadline=new Date(now+30*60*1000).toISOString();
 const record={order_id:order.id,token_hash:tokenHash(token),quote_fingerprint:fingerprint(order),email:to,expires_at:deadline};
 await dbClient.insert('tryamm_order_acceptance_tokens',record);
 const link=host+'/tryamm-quote-accept.html?token='+token;
 const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'tryamm-quote-'+record.token_hash},
 body:JSON.stringify({from,to:[to],subject:'TRYAMM website quote — review and accept',text:
  'Your TRYAMM website quote is ready for review. The quote is not a charge.\n\nVisit this private, one-use link to review the price, terms and either accept or leave it unsigned:\n'+link+'\n\nThe link expires in 30 minutes. If you did not request this, ignore it.'})});
 const outcome=await response.json().catch(()=>({}));
 if(!response.ok||!outcome.id){
  await dbClient.update('tryamm_order_acceptance_tokens','token_hash=eq.'+record.token_hash,{revoked_at:new Date().toISOString()});
  throw fail('Quote delivery failed; no customer acceptance or payment was recorded',502);
 }
 return {sent:true,expiresAt:deadline,deliveryStatus:'PROVIDER_ACCEPTED_NOT_INBOX_VERIFIED'};
}
async function previewAcceptance(token,{dbClient=db}={}){
 requireEnabled();const hash=tokenHash(token);
 const rows=await dbClient.select('tryamm_order_acceptance_tokens','token_hash=eq.'+hash+'&consumed_at=is.null&revoked_at=is.null&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=order_id,quote_fingerprint&limit=1');
 if(!rows?.length)throw fail('Acceptance link expired or already used',410);
 const order=await dbClient.select('tryamm_website_orders','id=eq.'+rows[0].order_id+'&status=eq.quote-approved&select=id,price_cents,currency,package_id,description,terms&limit=1');
 if(!order?.length||fingerprint(order[0])!==rows[0].quote_fingerprint)throw fail('Quote changed; request a new link',409);
 return {id:order[0].id,priceCents:order[0].price_cents,currency:order[0].currency,packageId:order[0].package_id,description:order[0].description,terms:order[0].terms};
}
async function accept(token,{confirm=false,dbClient=db}={}){
 requireEnabled();if(confirm!==true)throw fail('Customer must explicitly accept price and terms');
 const hash=tokenHash(token);
 const result=await dbClient.rpc('tryamm_accept_quote',{p_token_hash:hash});
 if(!result||result.accepted!==true)throw fail('Quote acceptance failed; no payment was initiated',409);
 return {accepted:true,orderId:result.orderId,status:'customer-accepted',paymentStarted:false};
}
module.exports={fingerprint,tokenHash,acceptanceEnabled,issueAcceptance,previewAcceptance,accept};
