import crypto from 'node:crypto'
import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

const TYPES=new Set(['provider-artifact','collision','navigation','mobile-performance','accessibility','human-visual-review'])
const clean=(v,max=1200)=>String(v||'').trim().slice(0,max)
const sha=v=>crypto.createHash('sha256').update(String(v||'')).digest('hex')

function normalize(item,userId){
 const planId=clean(item?.planId,220)
 const evidenceType=clean(item?.evidenceType,80)
 const assetId=clean(item?.assetId,240)||null
 const source=clean(item?.source,160)
 const reference=clean(item?.reference,500)
 const artifactUrl=clean(item?.artifactUrl,1200)||null
 const artifactSha256=clean(item?.artifactSha256,128)||null
 const notes=clean(item?.notes,2000)
 const metrics=item?.metrics&&typeof item.metrics==='object'?item.metrics:{}
 if(!planId||!TYPES.has(evidenceType)||!source||!reference)throw new Error('invalid_evidence_item')
 if(evidenceType==='provider-artifact'&&(!assetId||!artifactUrl))throw new Error('provider_artifact_requires_asset_and_url')
 const key=clean(item?.idempotencyKey,220)||sha([userId,planId,evidenceType,assetId||'',reference,artifactUrl||''].join('|'))
 return{
  user_id:userId,plan_id:planId,release_key:clean(item?.releaseKey,240)||null,asset_id:assetId,
  evidence_type:evidenceType,state:'submitted',source,reference,artifact_url:artifactUrl,artifact_sha256:artifactSha256,
  metrics,notes,idempotency_key:key,updated_at:new Date().toISOString()
 }
}

export default async function handler(req,res){
 const user=await requireUser(req,res);if(!user)return

 if(req.method==='GET'){
  const planId=clean(req.query?.planId,220)
  if(!planId)return json(res,400,{error:'planId is required'})
  try{
   const rows=await adminRest('tryamm_bible_world_evidence',{query:{user_id:'eq.'+user.id,plan_id:'eq.'+planId,order:'created_at.desc',limit:300}})
   return json(res,200,{ok:true,planId,evidence:rows||[]})
  }catch(error){
   await audit(user.id,'bible_world_evidence_read_failed','medium',{planId,error:String(error?.message||error)})
   return json(res,500,{error:'Unable to load Bible world evidence'})
  }
 }

 if(req.method==='POST'){
  const incoming=Array.isArray(req.body?.items)?req.body.items:[req.body]
  if(!incoming.length||incoming.length>80)return json(res,400,{error:'1–80 evidence items are required'})
  try{
   const rows=[]
   for(const item of incoming){
    const normalized=normalize(item,user.id)
    const prior=await adminRest('tryamm_bible_world_evidence',{query:{idempotency_key:'eq.'+normalized.idempotency_key,user_id:'eq.'+user.id,limit:1}})
    if(prior?.[0]){rows.push(prior[0]);continue}
    const created=await adminRest('tryamm_bible_world_evidence',{method:'POST',body:normalized})
    if(created?.[0])rows.push(created[0])
   }
   await audit(user.id,'bible_world_evidence_submitted','info',{count:rows.length,planIds:[...new Set(rows.map(x=>x.plan_id))]})
   return json(res,201,{ok:true,state:'SUBMITTED_NOT_VERIFIED',evidence:rows,productionGateChanged:false})
  }catch(error){
   const code=String(error?.message||error)
   await audit(user.id,'bible_world_evidence_submit_failed','medium',{error:code})
   if(code.includes('provider_artifact_requires_asset_and_url'))return json(res,400,{error:'Provider artifact evidence requires assetId and artifactUrl'})
   return json(res,400,{error:'Unable to submit Bible world evidence safely'})
  }
 }

 return json(res,405,{error:'Method not allowed'})
}
