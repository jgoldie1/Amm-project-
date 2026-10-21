import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {rest} from '../_lib/studio.js';
import {UUID} from '../_lib/ai-cafe-executor.js';
import {createStripeCheckout,inspectExistingCheckout} from '../commerce/checkout.js';
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 try{
  const user=await requireUser(req,res);if(!user)return;
  if(!UUID.test(req.body?.id||''))return json(res,400,{error:'Invalid order'});
  const rows=await rest('studio_orders',{query:{id:`eq.${req.body.id}`,customer_id:`eq.${user.id}`,limit:1}}),work=rows[0];
  if(!work||!work.commerce_id)return json(res,409,{error:'No payable order'});
  const orders=await rest('commerce_orders',{query:{id:`eq.${work.commerce_id}`,buyer_id:`eq.${user.id}`,limit:1}}),order=orders[0];
  if(!order||order.status==='paid')return json(res,409,{error:'Payment is already recorded or order unavailable'});
  const enabled=['TRYAMM_LIVE_CHARGING_ENABLED','TRYAMM_SELLER_TRANSFERS_VERIFIED','TRYAMM_RECONCILIATION_VERIFIED'].every(k=>process.env[k]==='true')&&process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET;
  if(!enabled)return json(res,423,{error:'Order saved. Checkout activation and reconciliation are still required.'});
  const prior=await inspectExistingCheckout(order,user);
  if(prior){if(prior.state==='CHECKOUT_READY')return json(res,200,{checkoutUrl:prior.session.url});return json(res,409,{error:prior.state})}
  const session=await createStripeCheckout({order,user,priced:[{id:'studio-website',name:'Reviewed website delivery',unitAmount:order.subtotal_cents,qty:1,seller:'tryamm-platform',kind:'service'}],clientOrderId:order.client_order_id,idempotencyKey:order.idempotency_key});
  return json(res,200,{checkoutUrl:session.url});
 }catch{return json(res,503,{error:'Checkout unavailable. Reload this order before retrying.'})}
}
