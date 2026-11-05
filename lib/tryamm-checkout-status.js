'use strict';
// Owner-scoped Stripe TEST session status. Read-only: never marks order paid.
const db=require('./supabase-rest');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
function checkSession(order,session){
 if(!order||!session)throw fail('Order or Checkout unavailable',404);
 if(session.livemode!==false||!/^cs_test_/.test(String(session.id||'')))throw fail('Only Stripe test-mode sessions supported',403);
 if(session.id!==order.stripe_session_id||session.metadata?.kind!=='tryamm-website-order'||session.metadata?.orderId!==order.id||session.mode!=='payment')
 throw fail('Checkout does not belong to this website order',403);
 if(session.amount_total!==order.price_cents||session.currency!==order.currency)throw fail('Checkout amount/currency mismatch',422);
 return {orderId:order.id,orderStatus:order.status,checkoutStatus:session.status,paymentStatus:session.payment_status,
  paymentVerifiedInDatabase:!!order.verified_paid_at,notice:'Stripe reports a session status only. A paid website order requires verified webhook database settlement.'};
}
async function inspect({orderId,ownerId,dbClient=db,stripeClient}={}){
 if(process.env.TRYAMM_ORDERS_DURABLE_ENABLED!=='true'||!dbClient.configured())throw fail('Orders not activated',503);
 if(!UUID.test(String(orderId||'')))throw fail('Invalid order ID');
 if(!/^sk_test_/.test(String(process.env.STRIPE_SECRET_KEY||'')))throw fail('Stripe test secret required',503);
 const rows=await dbClient.select('tryamm_website_orders','id=eq.'+orderId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&select=*&limit=1');
 const order=rows?.[0];if(!order)throw fail('Owned order not found',404);
 if(!order.stripe_session_id)return {orderId,status:'NO_BOUND_SESSION',orderStatus:order.status,checkoutStatus:null,paymentVerifiedInDatabase:!!order.verified_paid_at};
 const stripe=stripeClient||new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
 const session=await stripe.checkout.sessions.retrieve(order.stripe_session_id);
 return checkSession(order,session);
}
module.exports={checkSession,inspect};
