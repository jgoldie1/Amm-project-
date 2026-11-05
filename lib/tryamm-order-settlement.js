'use strict';
// Server-side adapter for Stripe sessions fetched by the existing webhook handler.
// Only verified Stripe API data may reach the atomic settlement RPC.
const db=require('./supabase-rest');
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(message,status=422)=>Object.assign(new Error(message),{status});
function settlementInput(session,event){
 if(session?.metadata?.kind!=='tryamm-website-order')return null;
 if(event?.type!=='checkout.session.completed'&&event?.type!=='checkout.session.async_payment_succeeded')return null;
 const orderId=String(session.metadata.orderId||'');
 if(!UUID.test(orderId))throw fail('Invalid website order metadata');
 if(session.mode!=='payment'||session.payment_status!=='paid')return {handled:true,applied:false,reason:'PAYMENT_NOT_CONFIRMED'};
 const eventId=String(event.id||''),sid=String(session.id||'');
 const amount=Number(session.amount_total),currency=String(session.currency||'').toLowerCase();
 if(!/^evt_[a-zA-Z0-9]+$/.test(eventId)||!/^cs_(test_|live_)[a-zA-Z0-9_]+$/.test(sid)||
  !Number.isSafeInteger(amount)||amount<50||currency!=='usd')
 throw fail('Invalid verified Stripe order session');
 return {orderId,eventId,sessionId:sid,amountCents:amount,currency};
}
async function settleVerifiedOrder(session,event,{dbClient=db}={}){
 const input=settlementInput(session,event);
 if(input===null)return {handled:false};
 if(input.handled)return input;
 if(process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED!=='true'||!dbClient.configured())
 throw fail('Durable order settlement is disabled',503);
 const result=await dbClient.rpc('tryamm_settle_website_order',{
  p_order_id:input.orderId,p_session_id:input.sessionId,p_event_id:input.eventId,
  p_amount_cents:input.amountCents,p_currency:input.currency
 });
 if(!result||typeof result!=='object'||typeof result.applied!=='boolean')throw fail('Unrecognized settlement receipt',502);
 return {handled:true,applied:result.applied,reason:result.reason,orderId:input.orderId};
}
module.exports={settlementInput,settleVerifiedOrder};
