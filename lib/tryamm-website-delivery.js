'use strict';
// Website delivery requires provider-verified payment, reviewed preview and customer approval.
const crypto=require('node:crypto');
const db=require('./supabase-rest');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN=/^[a-f0-9]{64}$/;
const fail=(msg,status=400)=>Object.assign(new Error(msg),{status});
function enabled(){return db.configured()&&process.env.TRYAMM_ORDERS_DURABLE_ENABLED==='true'&&process.env.TRYAMM_DELIVERY_REVIEW_ENABLED==='true'}
function on(){if(!enabled())throw fail('Customer website delivery review is not activated',503)}
function hash(token){if(!TOKEN.test(String(token||'')))throw fail('Invalid review link');return crypto.createHash('sha256').update(token).digest('hex')}
function reviewURL(raw){
 let u;try{u=new URL(String(raw||''))}catch{throw fail('Public HTTPS preview URL required')}
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.search||u.hash||u.href.length>500||!u.hostname.includes('.')||/^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.test|.*\.invalid)$/i.test(u.hostname)||/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)||u.hostname.includes(':'))
 throw fail('Public HTTPS preview URL required');
 return u.href;
}
function origin(){let u;try{u=new URL(process.env.APP_URL||'')}catch{throw fail('Verified public HTTPS APP_URL required',503)}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw fail('Verified public HTTPS APP_URL required',503);
 return u.origin}
function sender(){const email=String(process.env.TRYAMM_QUOTE_FROM_EMAIL||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('Verified sender missing',503);return email}
async function getOwned(orderId,ownerId,client=db){
 if(!UUID.test(String(orderId||'')))throw fail('Valid order required');
 const rows=await client.select('tryamm_website_orders','id=eq.'+encodeURIComponent(orderId)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 if(!rows?.[0])throw fail('Owned order not found',404);return rows[0]
}
async function submitReview({orderId,ownerId,previewUrl,client=db}){
 on();const url=reviewURL(previewUrl),order=await getOwned(orderId,ownerId,client);
 if(!order.verified_paid_at||!['paid-verified','building','review-ready'].includes(order.status))throw fail('Verified payment required',409);
 const result=await client.rpc('tryamm_owner_prepare_review',{p_order_id:order.id,p_owner_id:ownerId,p_review_url:url});
 if(result?.prepared!==true)throw fail('Review submission not confirmed',502);
 return {prepared:true,alreadyPrepared:result.alreadyPrepared===true,previewUrl:url,paymentVerified:true};
}
async function issueReview({orderId,ownerId,client=db,send=globalThis.fetch,now=Date.now()}){
 on();if(!process.env.RESEND_API_KEY)throw fail('Transactional mail not configured',503);
 const order=await getOwned(orderId,ownerId,client),from=sender(),base=origin();
 if(order.status!=='review-ready'||!order.verified_paid_at||!order.review_url||!UUID.test(String(order.review_nonce||'')))throw fail('No verified website review is ready',409);
 const leads=await client.select('tryamm_campaign_leads','id=eq.'+encodeURIComponent(order.lead_id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=email&limit=1');
 const email=String(leads?.[0]?.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('Recorded customer email unavailable',422);
 const recent=await client.select('tryamm_order_review_tokens','order_id=eq.'+order.id+'&review_nonce=eq.'+order.review_nonce+'&revoked_at=is.null&created_at=gt.'+encodeURIComponent(new Date(now-5*60*1000).toISOString())+'&select=token_hash&limit=1');
 if(recent?.length)throw fail('Preview invitation recently sent; try again later',429);
 const token=crypto.randomBytes(32).toString('hex'),token_hash=hash(token),expiresAt=new Date(now+24*60*60*1000).toISOString();
 await client.insert('tryamm_order_review_tokens',{order_id:order.id,review_nonce:order.review_nonce,customer_email:email,token_hash,expires_at:expiresAt});
 const link=base+'/tryamm-website-review.html#token='+token;
 const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'tryamm-review-'+token_hash},
 body:JSON.stringify({from,to:[email],subject:'Review your TRYAMM website preview',
 text:'Your website preview is ready for review. This link does not collect payment.\n\n'+link+'\n\nExpires in 24 hours. Review and approve or request changes.'})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok||!payload.id){
  await client.update('tryamm_order_review_tokens','token_hash=eq.'+token_hash,{revoked_at:new Date().toISOString()});
  throw fail('Preview invitation delivery was not confirmed by provider',502);
 }
 return {sent:true,expiresAt,providerAccepted:true,mailboxDeliveryVerified:false};
}
async function preview(token,{client=db,now=Date.now()}={}){
 on();const h=hash(token),rows=await client.select('tryamm_order_review_tokens','token_hash=eq.'+h+'&revoked_at=is.null&consumed_at=is.null&expires_at=gt.'+encodeURIComponent(new Date(now).toISOString())+'&select=order_id,review_nonce,customer_email&limit=1');
 const t=rows?.[0];if(!t)throw fail('Review link invalid or expired',410);
 const os=await client.select('tryamm_website_orders','id=eq.'+encodeURIComponent(t.order_id)+'&select=id,lead_id,review_url,review_nonce,status,verified_paid_at&limit=1');
 const order=os?.[0];if(!order||order.review_nonce!==t.review_nonce||order.status!=='review-ready'||!order.verified_paid_at)throw fail('Website preview changed or is not ready',409);
 const leads=await client.select('tryamm_campaign_leads','id=eq.'+encodeURIComponent(order.lead_id)+'&select=email&limit=1');
 if(String(leads?.[0]?.email||'').toLowerCase()!==t.customer_email)throw fail('Review recipient no longer matches customer',403);
 return {orderId:order.id,previewUrl:reviewURL(order.review_url),status:'review-ready',paymentVerified:true};
}
async function decide(token,{approve,notes,client=db}={}){
 on();if(typeof approve!=='boolean')throw fail('Approval choice required');
 const comment=String(notes||'').trim();if(comment.length>1000)throw fail('Review comment is too long');
 if(!approve&&comment.length<10)throw fail('Explain the requested changes');
 const result=await client.rpc('tryamm_customer_approve_review',{p_token_hash:hash(token),p_approve:approve,p_notes:comment});
 if(result?.recorded!==true)throw fail('Customer review was not recorded',409);
 return {recorded:true,approved:result.approved===true,orderId:result.orderId,delivered:false};
}
async function finalize({orderId,ownerId,reference,client=db}){
 on();const order=await getOwned(orderId,ownerId,client);
 if(order.status!=='review-ready'||!order.verified_paid_at||!order.customer_review_approved_at)throw fail('Verified payment and customer approval required',409);
 const ref=String(reference||'').trim();if(ref.length<12||ref.length>500)throw fail('Delivery evidence reference required');
 const result=await client.rpc('tryamm_owner_finalize_delivery',{p_order_id:order.id,p_owner_id:ownerId,p_delivery_reference:ref});
 if(result?.delivered!==true)throw fail('Final delivery was not confirmed',502);
 return {delivered:true,orderId:order.id};
}
module.exports={enabled,reviewURL,hash,submitReview,issueReview,preview,decide,finalize};
