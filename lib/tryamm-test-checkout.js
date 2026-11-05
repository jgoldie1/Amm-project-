'use strict';
// Test-mode only. Never create checkout without customer-accepted terms and
// an atomically reserved database attempt. Does not email or charge automatically.
const db=require('./supabase-rest');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(msg,status=400)=>Object.assign(new Error(msg),{status});
function enabled(){return db.configured()&&process.env.TRYAMM_ORDERS_DURABLE_ENABLED==='true'&&process.env.TRYAMM_CHECKOUT_TEST_ENABLED==='true'}
function verifiedBase(){const raw=String(process.env.APP_URL||'');let u;try{u=new URL(raw)}catch{throw fail('Verified HTTPS APP_URL required',503)}
 if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.hostname==='localhost')throw fail('Verified HTTPS APP_URL required',503);return u.origin}
function buildSession(order,email,base){
 if(!UUID.test(String(order?.id||''))||order.status!=='customer-accepted'||!order.customer_accepted_at)throw fail('Customer-accepted order required',409);
 if(!Number.isSafeInteger(order.price_cents)||order.price_cents<50||order.currency!=='usd'||!String(order.description||'').trim())throw fail('Invalid order price or description',422);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'')))throw fail('Verified inquiry email missing',422);
 return {mode:'payment',customer_email:email,client_reference_id:order.id,
  line_items:[{quantity:1,price_data:{currency:'usd',unit_amount:order.price_cents,product_data:{name:'TRYAMM website package: '+order.package_id,description:String(order.description).slice(0,400)}}}],
  metadata:{kind:'tryamm-website-order',orderId:order.id,leadId:order.lead_id},
  payment_method_types:['card'],success_url:base+'/website-command-center.html?checkout=return',cancel_url:base+'/website-command-center.html?checkout=cancel'};
}
async function prepare({orderId,ownerId,dbClient=db,stripeClient}){
 if(!enabled())throw fail('Test checkout has not been enabled',503);
 if(!UUID.test(String(orderId||'')))throw fail('Invalid order ID');
 if(!/^sk_test_/.test(String(process.env.STRIPE_SECRET_KEY||'')))throw fail('Stripe TEST secret key required',503);
 const base=verifiedBase();
 const records=await dbClient.select('tryamm_website_orders','id=eq.'+orderId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 const order=records?.[0];if(!order)throw fail('Owned website order not found',404);
 const leadRows=await dbClient.select('tryamm_campaign_leads','id=eq.'+order.lead_id+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=email&limit=1');
 const params=buildSession(order,leadRows?.[0]?.email,base);
 const reserved=await dbClient.rpc('tryamm_reserve_order_checkout',{p_order_id:order.id,p_owner_id:ownerId});
 if(!UUID.test(String(reserved?.attemptId||'')))throw fail('Checkout reservation unavailable',502);
 if(reserved.sessionId)throw fail('Checkout already created for this order; reconcile existing session',409);
 if(!reserved.reserved)throw fail('Existing pending checkout attempt must be reconciled; no second Checkout will be created',409);
 const stripe=stripeClient||new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
 // The reservation is permanent until manually reconciled. Never clear on timeout.
 const session=await stripe.checkout.sessions.create(params,{idempotencyKey:'tryamm-website-'+reserved.attemptId});
 if(!/^cs_test_/.test(String(session?.id||''))||!/^https:\/\//.test(String(session?.url||'')))throw fail('Provider did not return a verified test Checkout',502);
 const binding=await dbClient.rpc('tryamm_bind_order_checkout',{p_order_id:order.id,p_owner_id:ownerId,p_attempt_id:reserved.attemptId,p_session_id:session.id});
 if(binding?.bound!==true)throw fail('Payment link generated but could not be durably linked; contact support',502);
 return {orderId:order.id,sessionId:session.id,checkoutUrl:session.url,status:'TEST_CHECKOUT_CREATED',paid:false};
}
module.exports={enabled,buildSession,prepare};
