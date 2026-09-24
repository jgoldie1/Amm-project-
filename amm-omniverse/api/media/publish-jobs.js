import {json} from '../_lib/supabase-admin.js';
import {userRest} from '../_lib/supabase-user.js';
import {requireUser} from '../_lib/security.js';

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'method_not_allowed'});
  try{
    const user=await requireUser(req,res);if(!user)return;
    const mediaId=String(req.query?.mediaId||'').trim();
    const id=String(req.query?.id||'').trim();
    const query={owner_id:`eq.${user.id}`,select:'*',order:'created_at.desc',limit:mediaId||id?20:100};
    if(mediaId)query.media_id=`eq.${mediaId}`;
    if(id)query.id=`eq.${id}`;
    const rows=await userRest(req,'media_publish_jobs',{query});
    return json(res,200,{ok:true,jobs:Array.isArray(rows)?rows:[]});
  }catch(error){return json(res,error.status||500,{error:error.message||'media_publish_jobs_failed'})}
}
