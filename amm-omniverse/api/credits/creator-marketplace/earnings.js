import {adminRest,json} from '../../_lib/supabase-admin.js'
import {requireUser,audit} from '../../_lib/security.js'

export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 try{
  const [purchases,ledger,listings]=await Promise.all([
   adminRest('tryamm_creator_credit_purchases',{query:{creator_user_id:'eq.'+user.id,order:'created_at.desc',limit:100}}),
   adminRest('tryamm_creator_credit_settlement_ledger',{query:{beneficiary_user_id:'eq.'+user.id,beneficiary_kind:'eq.CREATOR_COMMISSION',order:'created_at.desc',limit:100}}),
   adminRest('tryamm_creator_credit_listings',{query:{creator_user_id:'eq.'+user.id,order:'created_at.desc',limit:100}})
  ])
  const rows=ledger||[]
  const total=(state)=>rows.filter(x=>x.state===state).reduce((s,x)=>s+Number(x.amount_minor||0),0)
  const summary={
   verifiedMinor:total('VERIFIED'),heldMinor:total('HELD'),payableMinor:total('PAYABLE'),paidMinor:total('PAID'),reversedMinor:total('REVERSED'),
   engagementPurchases:(purchases||[]).filter(x=>Number(x.holo_units||0)>0).length,
   purchasedCreditPurchases:(purchases||[]).filter(x=>Number(x.play_units||0)>0).length
  }
  await audit(user.id,'creator_credit_earnings_view','info',{listingCount:(listings||[]).length,purchaseCount:(purchases||[]).length})
  return json(res,200,{ok:true,summary,listings:listings||[],purchases:purchases||[],ledger:rows,policy:{
   creatorBasisPoints:4000,tryammBasisPoints:4000,reserveBasisPoints:2000,
   earnedHoloCreatesCash:false,purchasedPlayRequiresReconciliation:true,payoutRequiresEligibilityAndRiskRelease:true
  }})
 }catch(error){
  return json(res,500,{error:'Unable to load creator credit earnings'})
 }
}
