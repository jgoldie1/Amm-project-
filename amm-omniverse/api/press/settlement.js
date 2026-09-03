import { adminRest, json } from '../_lib/supabase-admin.js'
import { requireUser, recentlyAuthenticated } from '../_lib/security.js'

async function ownedEdition(userId, editionId){
  const rows=await adminRest('print_editions',{query:{id:`eq.${editionId}`,owner_id:`eq.${userId}`,limit:1}})
  return rows?.[0]||null
}
async function ownedSale(userId, saleId){
  const rows=await adminRest('press_sales',{query:{id:`eq.${saleId}`,creator_id:`eq.${userId}`,limit:1}})
  return rows?.[0]||null
}

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
  const user=await requireUser(req,res);if(!user)return
  const {action,commerceOrderId,editionId,printJobId,pressSaleId}=req.body||{}
  try{
    if(action==='reconcile'){
      if(!commerceOrderId||!editionId||!printJobId)return json(res,400,{error:'commerceOrderId, editionId and printJobId are required'})
      const edition=await ownedEdition(user.id,editionId);if(!edition)return json(res,403,{error:'Edition not owned by authenticated creator'})
      const jobs=await adminRest('print_jobs',{query:{id:`eq.${printJobId}`,edition_id:`eq.${editionId}`,owner_id:`eq.${user.id}`,limit:1}})
      if(!jobs?.[0])return json(res,403,{error:'Print job not owned by authenticated creator'})
      const data=await adminRest('rpc/reconcile_press_sale',{method:'POST',body:{p_commerce_order_id:commerceOrderId,p_edition_id:editionId,p_print_job_id:printJobId,p_platform_fee_bps:1000}})
      return json(res,200,{ok:true,sale:data})
    }
    if(action==='release'){
      if(!pressSaleId)return json(res,400,{error:'pressSaleId is required'})
      if(!recentlyAuthenticated(user,900))return json(res,403,{error:'Recent authentication required to release royalty'})
      const sale=await ownedSale(user.id,pressSaleId);if(!sale)return json(res,403,{error:'Sale not owned by authenticated creator'})
      const data=await adminRest('rpc/release_press_royalty_to_omni_cash',{method:'POST',body:{p_press_sale_id:pressSaleId}})
      return json(res,200,{ok:true,sale:data})
    }
    return json(res,400,{error:'Unsupported action'})
  }catch(error){
    return json(res,400,{error:error instanceof Error?error.message:String(error)})
  }
}
