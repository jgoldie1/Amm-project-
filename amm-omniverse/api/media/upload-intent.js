import {adminRest,json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {ALLOWED_MEDIA_TYPES,MAX_MEDIA_BYTES,MEDIA_BUCKET,createSignedUpload,objectPath,safeFileName} from '../_lib/media-storage.js';

export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const fileName=safeFileName(req.body?.fileName),contentType=String(req.body?.contentType||'').trim().toLowerCase(),sizeBytes=Math.max(0,Number(req.body?.sizeBytes||0)),title=String(req.body?.title||'TRYAMM Reel').trim().slice(0,160),caption=String(req.body?.caption||'').trim().slice(0,2000);
    if(!ALLOWED_MEDIA_TYPES.has(contentType))return json(res,415,{error:'unsupported_creator_media_type',allowed:[...ALLOWED_MEDIA_TYPES]});
    if(!sizeBytes||sizeBytes>MAX_MEDIA_BYTES)return json(res,413,{error:'media_size_out_of_range',maxBytes:MAX_MEDIA_BYTES});
    const storagePath=objectPath(user.id,fileName),signed=await createSignedUpload(storagePath),mediaType=contentType==='image/gif'?'gif':contentType.startsWith('image/')?'image':'reel';
    const manifest={caption,destinations:[],source:'tryamm-media-studio',upload_status:'signed-upload-issued',storage_bucket:MEDIA_BUCKET,storage_path:storagePath,content_type:contentType,size_bytes:sizeBytes,transcode_status:'pending-verification',composition:req.body?.composition&&typeof req.body.composition==='object'?req.body.composition:{}};
    const rows=await adminRest('media_catalog',{method:'POST',body:{owner_id:user.id,brand:'TRYAMM',title,media_type:mediaType,rights_status:'original',visibility:'private',manifest,moderation_status:'pending',processing_status:'uploading',storage_bucket:MEDIA_BUCKET,storage_path:storagePath,content_type:contentType,size_bytes:sizeBytes}}),media=rows?.[0];
    return json(res,201,{ok:true,media,upload:{url:signed.signedUrl,token:signed.token,path:storagePath,bucket:MEDIA_BUCKET,method:'PUT',expiresInSeconds:7200}});
  }catch(error){return json(res,error.status||500,{error:error.message||'media_upload_intent_failed'})}
}
