import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';

const DESTINATIONS=new Set(['reel','omnibox','all-american-network','servants-of-christ-network','creator-profile']);

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const mediaId=String(req.body?.mediaId||'').trim();if(!mediaId)return json(res,400,{error:'media_id_required'});
    const mediaRows=await adminRest('media_catalog',{query:{id:`eq.${mediaId}`,owner_id:`eq.${user.id}`,select:'*',limit:1}}),media=mediaRows?.[0];if(!media)return json(res,404,{error:'media_not_found'});
    const destinations=[...new Set((Array.isArray(req.body?.destinations)?req.body.destinations:[]).map(x=>String(x||'').trim()).filter(x=>DESTINATIONS.has(x)))];if(!destinations.length)return json(res,400,{error:'destination_required'});
    const ready=media.processing_status==='ready'&&Boolean(media.storage_path||media.manifest?.storage_path),status=ready?'queued':'blocked',errorCode=ready?null:'MEDIA_PROCESSING_NOT_READY';
    const rows=await adminRest('media_publish_jobs',{method:'POST',body:{media_id:media.id,owner_id:user.id,destinations,status,moderation_status:'pending',monetization_status:'gated',error_code:errorCode}}),job=rows?.[0];
    return json(res,status==='blocked'?202:201,{ok:true,job,next:status==='blocked'?'Complete production upload/processing before publishing.':'Publishing job queued for moderation and destination delivery.'});
  }catch(error){return json(res,error.status||500,{error:error.message||'media_publish_failed'})}
}
