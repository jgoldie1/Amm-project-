import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {ALLOWED_MEDIA_TYPES,createSignedPlayback,verifyStoredObject} from '../_lib/media-storage.js';

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const mediaId=String(req.body?.mediaId||'').trim();if(!mediaId)return json(res,400,{error:'media_id_required'});
    const rows=await adminRest('media_catalog',{query:{id:`eq.${mediaId}`,owner_id:`eq.${user.id}`,select:'*',limit:1}}),media=rows?.[0];
    if(!media)return json(res,404,{error:'media_not_found'});
    const storagePath=String(media.storage_path||media.manifest?.storage_path||'').trim();if(!storagePath)return json(res,409,{error:'media_storage_path_missing'});
    if(!await verifyStoredObject(storagePath))return json(res,409,{error:'upload_not_found'});
    const contentType=String(media.content_type||media.manifest?.content_type||'').toLowerCase(),webNative=ALLOWED_MEDIA_TYPES.has(contentType);
    const manifest={...(media.manifest||{}),upload_status:'uploaded',storage_path:storagePath,transcode_status:webNative?'not-required-web-native':'required'};
    const updated=await adminRest('media_catalog',{method:'PATCH',query:{id:`eq.${media.id}`,owner_id:`eq.${user.id}`},body:{manifest,processing_status:webNative?'ready':'processing',processing_error:null,updated_at:new Date().toISOString()}});
    const playbackUrl=await createSignedPlayback(storagePath,3600);
    return json(res,200,{ok:true,media:updated?.[0]||media,processing:webNative?'ready':'processing',playbackUrl,notice:webNative?'Web-native media verified. No server transcoding is required.':'A dedicated transcoding worker is required for this format.'});
  }catch(error){return json(res,error.status||500,{error:error.message||'media_upload_complete_failed'})}
}
