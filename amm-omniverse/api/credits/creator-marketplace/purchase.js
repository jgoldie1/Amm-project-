import crypto from 'node:crypto'
import {adminRpc,adminRest,json} from '../../_lib/supabase-admin.js'
import {requireUser,audit} from '../../_lib/security.js'

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const listingId=String(req.body?.listingId||'').trim()
 const clientReference=String(req.body?.clientReference||'').trim().replace(/[^a-zA-Z0-9:_-]/g,'').slice(0,96)
 if(!/^[0-9a-f-]{36}$/i.test(listingId))return json(res,400,{error:'Valid listingId is required'})
 const sourceId=clientReference||('creator-credit-'+crypto.randomUUID())
 try{
  const result=await adminRpc('purchase_tryamm_creator_credit_listing',{p_user_id:user.id,p_listing_id:listingId,p_source_id:sourceId})
  const entitlements=await adminRest('tryamm_credit_entitlements',{query:{user_id:'eq.'+user.id,source_id:'eq.'+sourceId,limit:1}})
  const purchases=await adminRest('tryamm_creator_credit_purchases',{query:{buyer_user_id:'eq.'+user.id,source_id:'eq.'+sourceId,limit:1}})
  const purchase=purchases?.[0]||null
  await audit(user.id,'creator_credit_listing_purchased','info',{listingId,sourceId,holoUnits:purchase?.holo_units||0,playUnits:purchase?.play_units||0})
  return json(res,200,{ok:true,result,purchase:purchase?{
   id:purchase.id,listingId:purchase.listing_id,totalUnits:Number(purchase.total_units||0),holoUnits:Number(purchase.holo_units||0),
   playUnits:Number(purchase.play_units||0),settlementState:purchase.settlement_state,creatorCashFromHolo:false
  }:null,entitlement:entitlements?.[0]?{
   type:'creator-marketplace-asset',itemId:entitlements[0].item_id,sourceId:entitlements[0].source_id,
   metadata:entitlements[0].metadata||{},cashValueMinor:0,withdrawable:false
  }:null})
 }catch(error){
  const code=String(error?.message||error)
  await audit(user.id,'creator_credit_listing_purchase_failed','medium',{listingId,sourceId,error:code})
  if(code.includes('insufficient_tryamm_credits'))return json(res,409,{state:'INSUFFICIENT_CREDITS',error:'Not enough Holo + Play Credits.'})
  if(code.includes('creator_self_purchase_blocked'))return json(res,409,{state:'SELF_PURCHASE_BLOCKED',error:'Creators cannot buy their own credit listing.'})
  if(code.includes('credit_wallet_not_spendable'))return json(res,423,{state:'WALLET_FROZEN',error:'Credit wallet is temporarily not spendable.'})
  if(code.includes('creator_listing_unavailable')||code.includes('creator_asset_not_verified'))return json(res,409,{state:'LISTING_UNAVAILABLE',error:'Creator listing is unavailable or no longer verified.'})
  return json(res,500,{error:'Unable to complete creator credit purchase safely.'})
 }
}
