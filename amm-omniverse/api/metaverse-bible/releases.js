import crypto from 'node:crypto'
import {adminRest,json} from '../_lib/supabase-admin.js'
import {requireUser,audit} from '../_lib/security.js'

const clean=(v,max=500)=>String(v||'').trim().slice(0,max)
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
const allChecksPassed=cert=>{
 const checks=cert?.checks||{}
 return ['source-label','all-preview-receipts','provider-artifacts','collision-verified','navigation-verified','mobile-performance-verified','accessibility-verified','human-visual-review'].every(k=>checks[k]===true)
}

export default async function handler(req,res){
 const user=await requireUser(req,res);if(!user)return

 if(req.method==='GET'){
  try{
   const rows=await adminRest('tryamm_bible_world_releases',{query:{user_id:'eq.'+user.id,order:'created_at.desc',limit:40}})
   return json(res,200,{ok:true,releases:rows||[]})
  }catch(error){
   await audit(user.id,'bible_world_releases_read_failed','medium',{error:String(error?.message||error)})
   return json(res,500,{error:'Unable to load Bible world releases'})
  }
 }

 if(req.method==='POST'){
  const scene=req.body?.scenePackage
  const cert=req.body?.certification
  if(scene?.schema!=='tryamm.metaverse-bible.scene-package.v1'||cert?.schema!=='tryamm.metaverse-bible.world-certification.v1'){
   return json(res,400,{error:'Valid Bible scene package and certification are required'})
  }
  if(scene.planId!==cert.planId)return json(res,409,{state:'PLAN_MISMATCH',error:'Scene package and certification plan do not match'})
  if(cert.productionPublishAllowed!==true||!allChecksPassed(cert)){
   return json(res,409,{state:'CERTIFICATION_BLOCKED',error:'All Bible-world production certification gates must pass before a release candidate can be created'})
  }
  if((scene.missingArtifacts||[]).length>0||Number(scene.providerArtifacts||0)<Number(scene.placements?.length||0)){
   return json(res,409,{state:'PROVIDER_ARTIFACTS_MISSING',error:'Release candidate requires provider artifacts for every scene placement'})
  }
  const assets=(scene.placements||[]).map((p,i)=>({
   index:i,assetId:clean(p.assetId,220),placementId:clean(p.id,220),kind:clean(p.kind,80),label:clean(p.label,220),
   artifactUrl:clean(p.artifactUrl,1200),placeholder:Boolean(p.placeholder),collisionTarget:Boolean(p.collisionTarget),
   navigationTarget:Boolean(p.navigationTarget),truthLabel:clean(p.truthLabel,320),
   passportState:'certified-world-input'
  }))
  if(assets.some(x=>!x.artifactUrl||x.placeholder))return json(res,409,{state:'PLACEHOLDER_BLOCKED',error:'Placeholder assets cannot enter a production release candidate'})
  try{
   const prior=await adminRest('tryamm_bible_world_releases',{query:{user_id:'eq.'+user.id,plan_id:'eq.'+clean(scene.planId,220),order:'version.desc',limit:1}})
   const version=Number(prior?.[0]?.version||0)+1
   const releaseKey=clean(scene.planId,150)+':v'+version
   const manifest={schema:'tryamm.metaverse-bible.release-manifest.v1',releaseKey,planId:scene.planId,version,title:scene.title,era:scene.era,truthLabel:scene.truthLabel,assets,navNodes:scene.navNodes||[],interactions:scene.interactions||[],qualityGates:cert.checks}
   const row={
    user_id:user.id,release_key:releaseKey,plan_id:clean(scene.planId,220),title:clean(scene.title,240),era:clean(scene.era,180),
    truth_label:clean(scene.truthLabel,400),version,state:'candidate',scene_package:scene,certification:cert,asset_manifest:assets,
    manifest_sha256:sha(manifest),production_publish_allowed:true,human_review_passed:cert.checks?.['human-visual-review']===true,
    updated_at:new Date().toISOString()
   }
   const rows=await adminRest('tryamm_bible_world_releases',{method:'POST',body:row})
   const release=rows?.[0]||row
   await audit(user.id,'bible_world_release_candidate_created','info',{releaseKey,planId:scene.planId,version,assets:assets.length})
   return json(res,201,{ok:true,state:'CANDIDATE',release,manifest})
  }catch(error){
   await audit(user.id,'bible_world_release_candidate_failed','high',{planId:scene.planId,error:String(error?.message||error)})
   return json(res,500,{error:'Unable to create Bible world release candidate'})
  }
 }

 if(req.method==='PATCH'){
  const releaseKey=clean(req.body?.releaseKey,240)
  const action=clean(req.body?.action,40)
  if(!releaseKey||action!=='stage')return json(res,400,{error:'releaseKey and stage action are required'})
  try{
   const prior=await adminRest('tryamm_bible_world_releases',{query:{user_id:'eq.'+user.id,release_key:'eq.'+releaseKey,limit:1}})
   const row=prior?.[0]
   if(!row)return json(res,404,{error:'Release candidate not found'})
   if(row.state!=='candidate')return json(res,409,{state:'INVALID_RELEASE_STATE',error:'Only a candidate can be staged'})
   if(row.production_publish_allowed!==true||row.human_review_passed!==true)return json(res,409,{state:'RELEASE_GATES_BLOCKED',error:'Release gates are not complete'})
   const rows=await adminRest('tryamm_bible_world_releases',{method:'PATCH',query:{id:'eq.'+row.id,user_id:'eq.'+user.id},body:{state:'staged',promoted_at:new Date().toISOString(),updated_at:new Date().toISOString()}})
   await audit(user.id,'bible_world_release_staged','info',{releaseKey})
   return json(res,200,{ok:true,state:'STAGED',release:rows?.[0]||row})
  }catch(error){
   return json(res,500,{error:'Unable to stage Bible world release'})
  }
 }

 return json(res,405,{error:'Method not allowed'})
}
