import {json,adminRest} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {createSignedPlaybackApprovedMedia} from '../_lib/media-storage.js';
import {isProtectedPrivateMedia} from '../_lib/private-media-workflows.js';

const RIGHTS=new Set(['original','licensed','public_domain','creator_authorized','cleared']);
const APPROVED=new Set(['approved','restored']);
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
 try{
  const slug=String(req.query?.slug||'').trim(),id=String(req.query?.id||'').trim();
  if(!slug&&!id)return json(res,400,{error:'publication_slug_or_id_required'});
  if(slug&&!/^[a-z0-9-]{5,180}$/.test(slug))return json(res,400,{error:'invalid_publication_slug'});
  if(!slug&&!/^[a-f0-9-]{36}$/i.test(id))return json(res,400,{error:'invalid_publication_id'});
  // Approved, delivered share slugs are public. A raw database ID is an
  // owner-only lookup and must never provide an enumeration side channel.
  let lookupOwner=null;
  if(!slug){
    const user=await requireUser(req,res);if(!user)return;
    lookupOwner=user.id;
  }
  const query={select:'id,media_id,owner_id,destination,status,public_slug,caption,moderation_status,monetization_status,delivered_at',limit:1,status:'eq.delivered',moderation_status:'in.(approved,restored)'};
  if(slug)query.public_slug='eq.'+slug;else query.id='eq.'+id;
  const rows=await adminRest('media_publications',{query}),publication=rows?.[0];
  if(!publication||publication.status!=='delivered'||!APPROVED.has(publication.moderation_status))return json(res,404,{error:'public_reel_not_found'});
  if(lookupOwner&&publication.owner_id!==lookupOwner)return json(res,404,{error:'public_reel_not_found'});
  const mediaRows=await adminRest('media_catalog',{query:{id:'eq.'+publication.media_id,owner_id:'eq.'+publication.owner_id,select:'id,title,media_type,storage_path,manifest,processing_status,rights_status,moderation_status',limit:1}}),media=mediaRows?.[0];
  if(!media||media.processing_status!=='ready'||!APPROVED.has(media.moderation_status)||!RIGHTS.has(media.rights_status))return json(res,404,{error:'public_reel_media_not_ready'});
  // Private auditions cannot become programs through ordinary media approval.
  // An authenticated casting decision system is still required.
  if(isProtectedPrivateMedia(media))return json(res,404,{error:'private_media_distribution_not_authorized'});
  const path=String(media.storage_path||media.manifest?.storage_path||'');
  const playbackUrl=await createSignedPlaybackApprovedMedia(path,600);
  res.setHeader('Cache-Control','no-store');
  // Explicitly allowlisted response: never leak owner ID, unpublished jobs,
  // storage paths, evidence, API credentials, or internal moderation notes.
  const publicPublication={
    public_slug:publication.public_slug,
    caption:publication.caption,
    destination:publication.destination,
    delivered_at:publication.delivered_at,
    status:'delivered'
  };
  return json(res,200,{ok:true,publication:publicPublication,media:{id:media.id,title:media.title,mediaType:media.media_type,playbackUrl},share:{slug:publication.public_slug,path:'/reels/'+encodeURIComponent(publication.public_slug)}});
 }catch(error){return json(res,error.status||503,{error:error.message||'public_reel_lookup_failed'})}
}
