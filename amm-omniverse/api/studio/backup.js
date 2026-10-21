import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {hasTemplateAuthority} from '../_lib/template-listing.js';
import {rest} from '../_lib/studio.js';
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 try{const user=await requireUser(req,res);if(!user)return;if(!hasTemplateAuthority(user))return json(res,403,{error:'Owner required'});
 const backup=await rest('rpc/studio_backup_snapshot',{method:'POST',body:{p_owner:user.id}});return json(res,200,backup);
 }catch{return json(res,503,{error:'Backup unavailable or exceeds the pilot size limit. No partial backup was returned.'})}
}
