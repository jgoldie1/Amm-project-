import crypto from 'node:crypto';
import { adminRest, json } from '../_lib/supabase-admin.js';
import { requireUser, audit } from '../_lib/security.js';

const stripeKey=()=>process.env.STRIPE_RESTRICTED_KEY||process.env.STRIPE_SECRET_KEY||'';
const baseUrl=()=>String(process.env.PUBLIC_APP_URL||process.env.WEBAUTHN_ORIGIN||'https://tryamm.online').replace(/\/$/,'');
const feeBps=()=>Math.max(0,Math.min(2500,Number(process.env.MARKETPLACE_FEE_BPS||500)));
const integrationId=()=>`tryamm_market_${crypto.randomBytes(6).toString('base64url').replace(/[^a-zA-Z]/g,'').slice(0,8).padEnd(8,'x')}`;

function add(params,key,value){if(value!==undefined&&value!==null)params.append(key,String(value))}

async function stripePost(path,params){
  const key=stripeKey();
  if(!key) throw new Error('stripe_not_configured');
  const response=await fetch(`https://api.stripe.com${path}`,{
    method:'POST',
    headers:{authorization:`Bearer ${key}`,'Stripe-Version':'2026-06-24.dahlia','content-type':'application/x-www-form-urlencoded'},
    body:params.toString()
  });
  const payload=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(payload?.error?.message||`stripe_${response.status}`);
  return payload;
}

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const user=await requireUser(req,res); if(!user) return;
  const {storefrontId,orderType='service',amountCents,description='All American Marketplace order'}=req.body||{};
  const amount=Number(amountCents);
  if(!storefrontId||!['goods','service','booking'].includes(orderType)) return json(res,400,{error:'Valid storefrontId and marketplace orderType required'});
  if(!Number.isInteger(amount)||amount<100||amount>10000000) return json(res,400,{error:'amountCents must be an integer between 100 and 10000000'});

  try{
    const stores=await adminRest('streetverse_storefronts',{query:{id:`eq.${storefrontId}`,status:'eq.open',limit:1}});
    const store=stores?.[0];
    if(!store) return json(res,404,{error:'Open storefront not found'});
    if(store.owner_user_id===user.id) return json(res,409,{error:'Self-purchase is not allowed'});
    if(store.payout_status!=='ready'||!store.stripe_transfers_enabled||!store.stripe_connected_account_id) return json(res,409,{error:'Seller payout account is not ready'});

    const claims=await adminRest('streetverse_business_claims',{query:{id:`eq.${store.claim_id}`,status:'eq.verified',limit:1}});
    if(!claims?.[0]) return json(res,409,{error:'Storefront business claim is not verified'});

    const platformFee=Math.round(amount*feeBps()/10000);
    const sellerAmount=amount-platformFee;
    const orders=await adminRest('marketplace_orders',{method:'POST',body:{
      buyer_user_id:user.id,
      storefront_id:store.id,
      seller_user_id:store.owner_user_id,
      order_type:orderType,
      currency:'USD',
      gross_amount_cents:amount,
      platform_fee_cents:platformFee,
      seller_amount_cents:sellerAmount,
      status:'created',
      metadata:{description:String(description).slice(0,300),fee_bps:feeBps()}
    }});
    const order=orders?.[0];
    if(!order) throw new Error('order_create_failed');

    const params=new URLSearchParams();
    add(params,'mode','payment');
    add(params,'success_url',`${baseUrl()}/?marketplace=success&order=${encodeURIComponent(order.id)}`);
    add(params,'cancel_url',`${baseUrl()}/?marketplace=cancelled&order=${encodeURIComponent(order.id)}`);
    add(params,'integration_identifier',integrationId());
    add(params,'client_reference_id',order.id);
    add(params,'metadata[order_id]',order.id);
    add(params,'metadata[storefront_id]',store.id);
    add(params,'line_items[0][quantity]',1);
    add(params,'line_items[0][price_data][currency]','usd');
    add(params,'line_items[0][price_data][unit_amount]',amount);
    add(params,'line_items[0][price_data][product_data][name]',String(store.display_name||'All American Marketplace').slice(0,120));
    add(params,'line_items[0][price_data][product_data][description]',String(description).slice(0,300));
    add(params,'payment_intent_data[application_fee_amount]',platformFee);
    add(params,'payment_intent_data[transfer_data][destination]',store.stripe_connected_account_id);
    add(params,'payment_intent_data[metadata][order_id]',order.id);

    const session=await stripePost('/v1/checkout/sessions',params);
    await adminRest('marketplace_orders',{method:'PATCH',query:{id:`eq.${order.id}`},body:{stripe_checkout_session_id:session.id,status:'checkout-open',updated_at:new Date().toISOString()}});
    await audit(user.id,'marketplace_checkout_created','info',{orderId:order.id,storefrontId:store.id,amount,platformFee});
    return json(res,200,{ok:true,orderId:order.id,checkoutUrl:session.url,platformFeeCents:platformFee});
  }catch(error){
    await audit(user.id,'marketplace_checkout_failed','high',{error:String(error?.message||error)});
    const message=String(error?.message||'Checkout failed');
    return json(res,message==='stripe_not_configured'?503:400,{error:message});
  }
}
