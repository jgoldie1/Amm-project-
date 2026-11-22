import {json} from '../_lib/supabase-admin.js'

const SUPPORTED=new Set(['twitch','tiktok','kick','bigo','youtube','facebook'])
function clean(v,n=180){return String(v||'').trim().slice(0,n)}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'})
 const platform=clean(req.body?.platform,32).toLowerCase()
 if(!SUPPORTED.has(platform))return json(res,400,{error:'unsupported_platform'})
 // A client-supplied header cannot verify a streaming-provider event.
 // Keep fail-closed until signed provider adapters and durable idempotency are implemented.
 return json(res,503,{error:'external_gift_webhook_disabled_pending_signature_verification'})
}
