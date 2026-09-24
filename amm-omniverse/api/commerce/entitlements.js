import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  const user=await requireUser(req,res);if(!user)return;
  try{
    const rows=await adminRest('commerce_entitlements',{query:{buyer_id:'eq.'+user.id,order:'granted_at.desc',limit:200}})||[];
    return json(res,200,{ok:true,entitlements:rows.map(row=>({
      id:row.id,
      transactionId:row.transaction_id,
      orderId:row.order_id,
      productId:row.product_id,
      entitlementType:row.entitlement_type,
      quantity:row.quantity,
      status:row.status,
      metadata:row.metadata||{},
      grantedAt:row.granted_at,
    }))});
  }catch(error){
    await audit(user.id,'commerce_entitlements_read_failed','high',{error:String(error?.message||error)});
    return json(res,500,{error:'Unable to load entitlements'});
  }
}
