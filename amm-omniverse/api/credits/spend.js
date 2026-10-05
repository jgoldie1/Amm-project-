import crypto from 'node:crypto'
import {adminRpc,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

const CATALOG=new Map([
 ['rp-scene-compile',{label:'RP Genii Scene Compile',costUnits:25,kind:'creator-tool'}],
 ['premium-reel-render',{label:'Premium Reel Render',costUnits:40,kind:'media-tool'}],
 ['vr-scene-render',{label:'VR / MR Scene Render',costUnits:75,kind:'media-tool'}],
 ['virtual-vehicle-rental',{label:'StreetVerse Virtual Vehicle Rental',costUnits:100,kind:'game-utility'}],
 ['holo-world-skin',{label:'Holo World Skin',costUnits:150,kind:'world-utility'}],
 ['creator-tool-pack',{label:'Creator Tool Pack',costUnits:60,kind:'creator-tool'}],
 ['omni-storage-boost',{label:'OmniBox Storage Boost',costUnits:80,kind:'creator-tool'}],
])

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 const user=await requireUser(req,res);if(!user)return
 const itemId=String(req.body?.itemId||'').trim()
 const item=CATALOG.get(itemId)
 if(!item)return json(res,400,{error:'Unknown or ineligible TRYAMM credit item'})
 const clientReference=String(req.body?.clientReference||'').trim().slice(0,96)
 const sourceId=clientReference||('credit-spend-'+crypto.randomUUID())
 try{
  const result=await adminRpc('spend_tryamm_credits',{p_user_id:user.id,p_units:item.costUnits,p_source_id:sourceId,p_metadata:{itemId,label:item.label,kind:item.kind,closedLoop:true,withdrawable:false,cashValueMinor:0}})
  await audit(user.id,'tryamm_credit_spend','info',{itemId,costUnits:item.costUnits,sourceId})
  return json(res,200,{ok:true,item:{id:itemId,...item},result,entitlement:{type:'closed-loop-digital-utility',itemId,label:item.label,sourceId}})
 }catch(error){
  const code=String(error?.message||error)
  await audit(user.id,'tryamm_credit_spend_failed','medium',{itemId,sourceId,error:code})
  if(code.includes('insufficient_tryamm_credits'))return json(res,409,{ok:false,state:'INSUFFICIENT_CREDITS',error:'Not enough Holo + Play Credits.'})
  if(code.includes('credit_wallet_not_spendable'))return json(res,423,{ok:false,state:'WALLET_FROZEN',error:'Credit wallet is temporarily not spendable.'})
  return json(res,500,{ok:false,error:'Unable to apply TRYAMM credit spend safely.'})
 }
}