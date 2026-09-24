import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const trim=(value,max=1000)=>String(value||'').trim().slice(0,max);

export default async function handler(req,res){
  const user=await requireUser(req,res);if(!user)return;

  if(req.method==='GET'){
    try{
      const rows=await adminRest('commerce_disputes',{query:{opened_by_user_id:'eq.'+user.id,order:'created_at.desc',limit:100}})||[];
      return json(res,200,{ok:true,requests:rows.map(row=>({
        id:row.id,
        orderRef:row.order_ref,
        reason:row.reason,
        details:row.details||'',
        status:row.status,
        createdAt:row.created_at,
        updatedAt:row.updated_at,
      }))});
    }catch{
      return json(res,500,{error:'Unable to load refund requests'});
    }
  }

  if(req.method==='POST'){
    const orderId=trim(req.body?.orderId,80);
    const reason=trim(req.body?.reason,160)||'buyer_refund_request';
    const details=trim(req.body?.details,2000);
    if(!orderId)return json(res,400,{error:'orderId is required'});
    try{
      const orders=await adminRest('commerce_orders',{query:{id:'eq.'+orderId,buyer_id:'eq.'+user.id,limit:1}});
      const order=orders?.[0];
      if(!order)return json(res,404,{error:'Order not found'});
      if(order.status!=='paid')return json(res,409,{error:'Only paid orders can enter refund review'});
      const prior=await adminRest('commerce_disputes',{query:{order_ref:'eq.'+orderId,opened_by_user_id:'eq.'+user.id,reason:'eq.refund_request',status:'eq.open',limit:1}});
      if(prior?.[0])return json(res,200,{ok:true,state:'REFUND_REVIEW_OPEN',requestId:prior[0].id,duplicate:true});
      const tx=await adminRest('commerce_payment_transactions',{query:{order_id:'eq.'+orderId,status:'eq.paid',limit:1}});
      const rows=await adminRest('commerce_disputes',{method:'POST',body:{
        order_ref:orderId,
        opened_by_user_id:user.id,
        seller_user_id:null,
        reason:'refund_request',
        details:reason+(details?': '+details:''),
        evidence:{
          transactionId:tx?.[0]?.id||null,
          providerPaymentId:tx?.[0]?.provider_payment_id||null,
          amountCents:tx?.[0]?.amount_cents||order.subtotal_cents,
          currency:tx?.[0]?.currency||order.currency,
        },
        status:'open',
      }});
      const request=rows?.[0];
      await audit(user.id,'commerce_refund_requested','info',{orderId,requestId:request?.id||null});
      return json(res,201,{ok:true,state:'REFUND_REVIEW_OPEN',requestId:request?.id||null,message:'Refund requested. Money is not moved until the provider refund and reversal are verified server-side.'});
    }catch(error){
      await audit(user.id,'commerce_refund_request_failed','high',{orderId,error:String(error?.message||error)});
      return json(res,500,{error:'Unable to create refund request'});
    }
  }

  return json(res,405,{error:'Method not allowed'});
}
