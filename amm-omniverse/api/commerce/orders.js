import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  try{
    const rows=await adminRest('commerce_orders',{query:{buyer_id:'eq.'+user.id,order:'created_at.desc',limit:100}})||[];
    const result=[];
    for(const order of rows){
      const items=await adminRest('commerce_order_items',{query:{order_id:'eq.'+order.id,order:'created_at.asc'}})||[];
      result.push({
        id:order.id,
        clientOrderId:order.client_order_id,
        currency:order.currency,
        subtotalCents:order.subtotal_cents,
        fulfillment:order.fulfillment,
        status:order.status,
        paymentProvider:order.payment_provider||null,
        createdAt:order.created_at,
        updatedAt:order.updated_at,
        items:items.map(item=>({
          id:item.id,
          productId:item.product_id,
          productName:item.product_name,
          quantity:item.quantity,
          unitAmountCents:item.unit_amount_cents,
          lineTotalCents:item.line_total_cents,
          metadata:item.metadata||{},
        })),
      });
    }
    return json(res,200,{ok:true,orders:result});
  }catch(error){
    await audit(user.id,'commerce_orders_read_failed','high',{error:String(error?.message||error)});
    return json(res,500,{error:'Unable to load order history'});
  }
}
