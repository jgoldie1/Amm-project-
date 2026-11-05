'use strict';
// Email a bound, provider-verified TEST Checkout link to the recorded lead email.
// Never send arbitrary checkout URLs, never use live Stripe or infer settlement.
const db=require('./supabase-rest');
const {checkSession}=require('./tryamm-checkout-status');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
function checkoutUrl(url){
 let u;try{u=new URL(String(url||''))}catch{throw fail('No provider Checkout URL',422)}
 if(u.protocol!=='https:'||u.hostname!=='checkout.stripe.com'||u.username||u.password||u.port)
 throw fail('Checkout URL is not the verified Stripe-hosted domain',422);
 return u.href;
}
async function emailTestCheckout({orderId,ownerId,dbClient=db,stripeClient,send=globalThis.fetch}={}){
 if(process.env.TRYAMM_CHECKOUT_EMAIL_TEST_ENABLED!=='true'||process.env.TRYAMM_ORDERS_DURABLE_ENABLED!=='true'||!dbClient.configured())
 throw fail('Customer test Checkout invitations disabled',503);
 if(!UUID.test(String(orderId||'')))throw fail('Invalid order ID');
 if(!/^sk_test_/.test(String(process.env.STRIPE_SECRET_KEY||'')))throw fail('Stripe test key required',503);
 if(!process.env.RESEND_API_KEY)throw fail('Transactional email provider unavailable',503);
 const from=String(process.env.TRYAMM_QUOTE_FROM_EMAIL||'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from))throw fail('Verified sender email required',503);
 const rows=await dbClient.select('tryamm_website_orders','id=eq.'+orderId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 const order=rows?.[0];if(!order)throw fail('Owned order not found',404);
 if(order.status!=='payment-pending'||!order.customer_accepted_at||order.verified_paid_at||!order.stripe_session_id)
 throw fail('Only customer-accepted unpaid orders with a bound Checkout may be invited',409);
 const lead=await dbClient.select('tryamm_campaign_leads','id=eq.'+encodeURIComponent(order.lead_id)+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=email&limit=1');
 const to=String(lead?.[0]?.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))throw fail('Recorded customer email missing',422);
 const stripe=stripeClient||new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
 const session=await stripe.checkout.sessions.retrieve(order.stripe_session_id);
 const detail=checkSession(order,session);
 if(detail.checkoutStatus!=='open'||detail.paymentStatus!=='unpaid'||String(session.customer_email||'').toLowerCase()!==to)
 throw fail('Only the intended customer may receive an open, unpaid test session',409);
 const url=checkoutUrl(session.url);
 const response=await send('https://api.resend.com/emails',{method:'POST',
  headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json',
   'Idempotency-Key':'tryamm-test-checkout-'+order.id},
  body:JSON.stringify({from,to:[to],subject:'TRYAMM TEST payment — no real money',
   text:'This is a TRYAMM development test, not a live payment request. No real payment or production order is available. Use only Stripe-provided test card details after confirming with TRYAMM.\n\nTest link: '+url+'\n\nIf you did not request this test, ignore this message.'})});
 const responseBody=await response.json().catch(()=>({}));
 if(!response.ok||!responseBody.id)throw fail('Test invitation not confirmed by email provider',502);
 return {sent:true,providerAccepted:true,orderId:order.id,paid:false,deliveryVerified:false};
}
module.exports={checkoutUrl,emailTestCheckout};
