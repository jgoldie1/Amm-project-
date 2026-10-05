import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const [walletRows,ledgerRows,entitlementRows]=await Promise.all([
  adminRest('tryamm_credit_wallets',{query:{user_id:'eq.'+user.id,limit:1}}),
  adminRest('tryamm_credit_ledger',{query:{user_id:'eq.'+user.id,order:'created_at.desc',limit:50}}),
  adminRest('tryamm_credit_entitlements',{query:{user_id:'eq.'+user.id,status:'eq.active',order:'granted_at.desc',limit:100}})
 ])
 const w=walletRows?.[0]||{}
 const wallet={
  holoCredits:Number(w.holo_earned_units||0),playCredits:Number(w.play_purchased_units||0),
  refundDebtUnits:Number(w.play_refund_debt_units||0),lifetimeEarned:Number(w.lifetime_holo_earned||0),
  lifetimePurchased:Number(w.lifetime_play_purchased||0),lifetimeSpent:Number(w.lifetime_spent||0),
  status:String(w.status||'active'),withdrawable:false,cashValueMinor:0
 }
 await audit(user.id,'tryamm_credit_wallet_view','info',{status:wallet.status})
 return json(res,200,{ok:true,wallet,ledger:(ledgerRows||[]).map(x=>({id:x.id,bucket:x.bucket,eventType:x.event_type,units:Number(x.units||0),sourceType:x.source_type,sourceId:x.source_id,createdAt:x.created_at,metadata:x.metadata||{}})),entitlements:(entitlementRows||[]).map(x=>({id:x.id,itemId:x.item_id,type:x.entitlement_type,status:x.status,sourceId:x.source_id,grantedAt:x.granted_at,expiresAt:x.expires_at,metadata:x.metadata||{}}))})
}