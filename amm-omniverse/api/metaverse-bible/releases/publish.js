import crypto from 'node:crypto'
import {adminRest,json} from '../../_lib/supabase-admin.js'

function internalAuthorized(req){
 const expected=String(process.env.TRYAMM_WORLD_PUBLISH_SECRET||process.env.TRYAMM_INTERNAL_COMPLIANCE_SECRET||'')
 const supplied=String(req.headers['x-tryamm-world-secret']||req.headers['x-tryamm-compliance-secret']||'')
 if(!expected||!supplied)return false
 const a=Buffer.from(expected),b=Buffer.from(supplied)
 return a.length===b.length&&crypto.timingSafeEqual(a,b)
}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 if(!internalAuthorized(req))return json(res,403,{error:'Internal world-publish authorization required'})
 const releaseKey=String(req.body?.releaseKey||'').trim()
 const action=String(req.body?.action||'publish').trim()
 const reference=String(req.body?.reference||'').trim().slice(0,240)
 if(!releaseKey||!reference||!['publish','rollback'].includes(action))return json(res,400,{error:'releaseKey, reference and publish/rollback action are required'})
 try{
  const rows=await adminRest('tryamm_bible_world_releases',{query:{release_key:'eq.'+releaseKey,limit:1}})
  const release=rows?.[0]
  if(!release)return json(res,404,{error:'Release not found'})
  if(action==='publish'){
   if(release.state!=='staged')return json(res,409,{state:'NOT_STAGED',error:'Only a staged Bible world release can be published'})
   if(release.production_publish_allowed!==true||release.human_review_passed!==true)return json(res,409,{state:'PUBLISH_GATES_BLOCKED',error:'Production publication gates are incomplete'})
   const updated=await adminRest('tryamm_bible_world_releases',{method:'PATCH',query:{id:'eq.'+release.id},body:{state:'published',published_at:new Date().toISOString(),updated_at:new Date().toISOString()}})
   return json(res,200,{ok:true,state:'PUBLISHED',reference,release:updated?.[0]||release})
  }
  if(release.state!=='published')return json(res,409,{state:'NOT_PUBLISHED',error:'Only a published release can be rolled back'})
  const prior=await adminRest('tryamm_bible_world_releases',{query:{plan_id:'eq.'+release.plan_id,state:'eq.published',order:'version.desc',limit:20}})
  const fallback=(prior||[]).find(x=>x.id!==release.id&&Number(x.version)<Number(release.version))
  if(!fallback)return json(res,409,{state:'NO_ROLLBACK_TARGET',error:'No earlier published version is available for rollback'})
  await adminRest('tryamm_bible_world_releases',{method:'PATCH',query:{id:'eq.'+release.id},body:{state:'rolled-back',updated_at:new Date().toISOString()}})
  const restored=await adminRest('tryamm_bible_world_releases',{method:'PATCH',query:{id:'eq.'+fallback.id},body:{state:'published',rollback_of:release.id,updated_at:new Date().toISOString()}})
  return json(res,200,{ok:true,state:'ROLLED_BACK',reference,release:restored?.[0]||fallback})
 }catch(error){
  return json(res,500,{error:String(error?.message||'Unable to publish or roll back Bible world release')})
 }
}
