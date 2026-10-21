import {createHash,timingSafeEqual} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {json} from '../_lib/supabase-admin.js';
import {rest} from '../_lib/studio.js';
const hash=s=>createHash('sha256').update(s).digest();
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 if(!process.env.CRON_SECRET||!timingSafeEqual(hash(String(req.headers.authorization||'')),hash('Bearer '+process.env.CRON_SECRET)))return json(res,401,{error:'Unauthorized'});
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return json(res,503,{error:'Backup storage unavailable'});
 const object=new Date().toISOString().slice(0,10)+'.json.gz';
 try{
  const snapshot=await rest('rpc/studio_backup_snapshot',{method:'POST',body:{p_owner:null}}),body=gzipSync(JSON.stringify(snapshot));
  const upload=await fetch(url+'/storage/v1/object/studio-backups/'+object,{method:'POST',headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/gzip','x-upsert':'true'},body,signal:AbortSignal.timeout(20000)});
  if(!upload.ok)throw Error('upload_failed');
  await rest('studio_backup_runs',{method:'POST',body:{object_key:object,bytes:body.length,status:'succeeded'}});
  const old=await rest('studio_backup_runs',{query:{status:'eq.succeeded',created_at:'lt.'+new Date(Date.now()-7*86400000).toISOString(),limit:100}});
  const prefixes=[...new Set(old.map(r=>r.object_key).filter(k=>/^\d{4}-\d{2}-\d{2}\.json\.gz$/.test(k)&&k!==object))];
  if(prefixes.length){const removed=await fetch(url+'/storage/v1/object/studio-backups',{method:'DELETE',headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({prefixes}),signal:AbortSignal.timeout(10000)});if(!removed.ok)throw Error('retention_failed');await rest('studio_backup_runs',{method:'DELETE',query:{status:'eq.succeeded',created_at:'lt.'+new Date(Date.now()-7*86400000).toISOString()}})}
  return json(res,200,{saved:true,bytes:body.length});
 }catch{try{await rest('studio_backup_runs',{method:'POST',body:{status:'failed'}})}catch{}return json(res,503,{error:'Backup needs operator attention'})}
}
