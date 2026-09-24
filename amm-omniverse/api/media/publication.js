import {json} from '../_lib/supabase-admin.js';
import {userRest} from '../_lib/supabase-user.js';
import {requireUser} from '../_lib/security.js';
import {createSignedPlayback} from '../_lib/media-storage.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const slug=String(req.query?.slug||'').trim();
    const id=String(req.query?.id||'').trim();
    if(!slug&&!id)return json(res,400,{error:'publication_slug_or_id_required'});
    const query={select:'id,media_id,owner_id,destination,status,public_slug,caption,moderation_status,monetization_status,delivered_at,created_at',limit:1};
    if(slug)query.public_slug=`eq.${slug}`;else query.id=`eq.${id}`;
    const rows=await userRest(req,'media_publications',{query}),publication=rows?.[0];
    if(!publication||publication.status!=='delivered'||!['approved','restored'].includes(String(publication.moderation_status||'')))return json(res,404,{error:'public_reel_not_found'});
    const mediaRows=await userRest(req,'media_catalog',{query:{id:`eq.${publication.media_id}`,select:'id,title,media_type,storage_path,manifest,processing_status',limit:1}}),media=mediaRows?.[0];
    if(!media||media.processing_status!=='ready')return json(res,404,{error:'public_reel_media_not_ready'});
    const playbackUrl=await createSignedPlayback(req,String(media.storage_path||media.manifest?.storage_path||''));
    return json(res,200,{ok:true,publication,media:{id:media.id,title:media.title,mediaType:media.media_type,playbackUrl},share:{slug:publication.public_slug,path:`/reels/${encodeURIComponent(publication.public_slug)}`}});
  }catch(error){return json(res,error.status||500,{error:error.message||'public_reel_lookup_failed'})}
}
