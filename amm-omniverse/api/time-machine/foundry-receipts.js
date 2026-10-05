import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

const clean=(v,max=500)=>String(v||'').trim().slice(0,max)

export default async function handler(req,res){
 const user=await requireUser(req,res);if(!user)return
 if(req.method==='GET'){
  try{
   const rows=await adminRest('tryamm_time_machine_foundry_receipts',{query:{user_id:'eq.'+user.id,order:'updated_at.desc',limit:30}})
   return json(res,200,{ok:true,receipts:rows||[]})
  }catch(error){
   await audit(user.id,'time_machine_foundry_receipts_read_failed','medium',{error:String(error?.message||error)})
   return json(res,500,{error:'Unable to load Time Machine Foundry receipts'})
  }
 }
 if(req.method==='POST'){
  const plan=req.body?.plan
  const phase=clean(req.body?.phase,80)||'compiled'
  if(!plan?.id||!plan?.title||!plan?.mode||!plan?.truthLabel)return json(res,400,{error:'Valid foundry plan is required'})
  const row={
   id:clean(plan.id,180),user_id:user.id,title:clean(plan.title,220),era:clean(plan.era||'unspecified',180),
   mode:clean(plan.mode,40),truth_label:clean(plan.truthLabel,300),source:clean(plan.source||'manual',180),phase,
   plan,preview_only:plan.previewOnly!==false,production_mutation:Boolean(plan.productionMutation),
   publish_allowed:Boolean(plan.publishAllowed),requires_human_review:plan.requiresHumanReview!==false,
   blockers:Array.isArray(plan.blockers)?plan.blockers:[],updated_at:new Date().toISOString()
  }
  try{
   const existing=await adminRest('tryamm_time_machine_foundry_receipts',{query:{id:'eq.'+row.id,user_id:'eq.'+user.id,limit:1}})
   let rows
   if(existing?.[0]){
    rows=await adminRest('tryamm_time_machine_foundry_receipts',{method:'PATCH',query:{id:'eq.'+row.id,user_id:'eq.'+user.id},body:row})
   }else{
    rows=await adminRest('tryamm_time_machine_foundry_receipts',{method:'POST',body:row})
   }
   await audit(user.id,'time_machine_foundry_receipt_saved','info',{planId:row.id,phase,mode:row.mode,publishAllowed:row.publish_allowed})
   return json(res,200,{ok:true,receipt:rows?.[0]||row})
  }catch(error){
   await audit(user.id,'time_machine_foundry_receipt_save_failed','medium',{planId:row.id,phase,error:String(error?.message||error)})
   return json(res,500,{error:'Unable to persist Time Machine Foundry receipt'})
  }
 }
 return json(res,405,{error:'Method not allowed'})
}
