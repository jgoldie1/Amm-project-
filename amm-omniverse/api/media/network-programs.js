import {adminRest,json} from '../_lib/supabase-admin.js';
import {isProtectedPrivateMedia} from '../_lib/private-media-workflows.js';
const CHANNELS=new Set(['all-american-network','servants-of-christ-network']);
const RIGHTS=new Set(['original','licensed','public_domain','creator_authorized','cleared']);
// No private audition or unreleased source media metadata is exposed.
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
 try{
  const destination=String(req.query?.destination||'all-american-network');
  if(!CHANNELS.has(destination))return json(res,400,{error:'unsupported_network'});
  const records=await adminRest('media_publications',{query:{
   destination:'eq.'+destination,status:'eq.delivered',moderation_status:'in.(approved,restored)',
   select:'id,media_id,owner_id,public_slug,caption,delivered_at',order:'delivered_at.desc',limit:12
  }});
  const items=[];
  for(const pub of records||[]){
   const matches=await adminRest('media_catalog',{query:{
    id:'eq.'+pub.media_id,owner_id:'eq.'+pub.owner_id,
    select:'id,title,processing_status,moderation_status,rights_status,manifest',limit:1
   }});
   const media=matches?.[0];
   if(!media||media.processing_status!=='ready'||!['approved','restored'].includes(media.moderation_status)||!RIGHTS.has(media.rights_status))continue;
   if(isProtectedPrivateMedia(media))continue;
   if(!/^[a-z0-9-]{5,180}$/.test(String(pub.public_slug)))continue;
   items.push({id:pub.id,title:String(media.title||'TRYAMM approved program').slice(0,160),
    caption:String(pub.caption||'').slice(0,300),deliveredAt:pub.delivered_at,
    destination,watchPath:'/reels/'+encodeURIComponent(pub.public_slug),status:'delivered'});
  }
  return json(res,200,{ok:true,items,kind:'verified-network-releases',playback:'public-moderated-releases'});
 }catch{return json(res,503,{ok:false,error:'verified_network_catalog_unavailable',items:[]})}
}
