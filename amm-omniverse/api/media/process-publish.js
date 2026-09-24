import crypto from 'node:crypto';
import {json} from '../_lib/supabase-admin.js';
import {userRest} from '../_lib/supabase-user.js';
import {requireUser} from '../_lib/security.js';
import {verifyStoredObject} from '../_lib/media-storage.js';

const ALLOWED_DESTINATIONS=new Set(['reel','omnibox','all-american-network','servants-of-christ-network','creator-profile']);
const terminal=new Set(['delivered','failed']);

const slug=(mediaId,destination)=>`${destination}-${String(mediaId).replace(/-/g,'').slice(0,12)}-${crypto.createHash('sha256').update(`${mediaId}:${destination}`).digest('hex').slice(0,10)}`;

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const jobId=String(req.body?.jobId||'').trim();if(!jobId)return json(res,400,{error:'job_id_required'});
    const jobs=await userRest(req,'media_publish_jobs',{query:{id:`eq.${jobId}`,owner_id:`eq.${user.id}`,select:'*',limit:1}}),job=jobs?.[0];
    if(!job)return json(res,404,{error:'publish_job_not_found'});
    if(terminal.has(String(job.status||'')))return json(res,200,{ok:true,job,reused:true,next:'Publication job is already terminal.'});
    if(!['queued','processing'].includes(String(job.status||'')))return json(res,409,{error:'publish_job_not_processable',status:job.status});

    const mediaRows=await userRest(req,'media_catalog',{query:{id:`eq.${job.media_id}`,owner_id:`eq.${user.id}`,select:'*',limit:1}}),media=mediaRows?.[0];
    if(!media)return json(res,404,{error:'media_not_found'});
    const storagePath=String(media.storage_path||media.manifest?.storage_path||'').trim();
    if(media.processing_status!=='ready'||!storagePath||!await verifyStoredObject(req,storagePath)){
      const failed=await userRest(req,'media_publish_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,owner_id:`eq.${user.id}`},body:{status:'failed',error_code:'MEDIA_NOT_READY_OR_MISSING'}});
      return json(res,409,{error:'media_not_ready_or_missing',job:failed?.[0]||job});
    }

    if(!['approved','restored'].includes(String(media.moderation_status||''))){
      const blocked=await userRest(req,'media_publish_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,owner_id:`eq.${user.id}`},body:{status:'blocked',moderation_status:media.moderation_status||'pending',error_code:'MODERATION_REVIEW_REQUIRED'}});
      return json(res,202,{ok:true,job:blocked?.[0]||job,next:'Publication is waiting for an explicit moderation decision. No public delivery was created.'});
    }
    if(!['original','licensed','cleared'].includes(String(media.rights_status||''))){
      const blocked=await userRest(req,'media_publish_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,owner_id:`eq.${user.id}`},body:{status:'blocked',error_code:'RIGHTS_CLEARANCE_REQUIRED'}});
      return json(res,202,{ok:true,job:blocked?.[0]||job,next:'Publication is waiting for rights clearance. No public delivery was created.'});
    }

    await userRest(req,'media_publish_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,owner_id:`eq.${user.id}`},body:{status:'processing',error_code:null}});
    const destinations=[...new Set((Array.isArray(job.destinations)?job.destinations:[]).filter(x=>ALLOWED_DESTINATIONS.has(x)))];
    if(!destinations.length)return json(res,409,{error:'publish_job_has_no_valid_destinations'});

    const delivered=[];
    for(const destination of destinations){
      const existing=await userRest(req,'media_publications',{query:{media_id:`eq.${media.id}`,owner_id:`eq.${user.id}`,destination:`eq.${destination}`,select:'*',limit:1}});
      if(existing?.[0]?.status==='delivered'){delivered.push(existing[0]);continue}
      const rpc=await userRest(req,'rpc/release1_deliver_publication',{method:'POST',body:{p_job_id:job.id,p_destination:destination,p_public_slug:slug(media.id,destination),p_caption:String(media.manifest?.caption||'')}});
      const publication=Array.isArray(rpc)?rpc[0]:rpc;
      if(!publication||publication.status!=='delivered')throw Object.assign(new Error('trusted_publication_transition_failed'),{status:502});
      delivered.push(publication);
    }
    const done=await userRest(req,'media_publish_jobs',{method:'PATCH',query:{id:`eq.${job.id}`,owner_id:`eq.${user.id}`},body:{status:'delivered',moderation_status:media.moderation_status,error_code:null}});
    return json(res,200,{ok:true,job:done?.[0]||job,publications:delivered,next:'Destination delivery records are confirmed. Public routes may now resolve these slugs.'});
  }catch(error){return json(res,error.status||500,{error:error.message||'media_delivery_failed'})}
}
