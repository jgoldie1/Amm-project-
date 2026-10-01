import {json} from '../_lib/supabase-admin.js'

const SUPPORTED=new Set(['twitch','tiktok','kick','bigo','youtube','facebook'])
const seen=new Map()
const TTL=10*60*1000

function prune(){const now=Date.now();for(const [id,ts] of seen)if(now-ts>TTL)seen.delete(id)}
function clean(v,n=180){return String(v||'').trim().slice(0,n)}

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'method_not_allowed'})
 const platform=clean(req.body?.platform,32).toLowerCase()
 if(!SUPPORTED.has(platform))return json(res,400,{error:'unsupported_platform'})
 // Platform-specific adapters must set this only after signature/token verification.
 if(req.headers['x-tryamm-platform-verified']!=='1')return json(res,401,{error:'platform_event_not_verified'})
 const eventId=clean(req.body?.eventId,180)
 const channelId=clean(req.body?.channelId,180)
 if(!eventId||!channelId)return json(res,400,{error:'event_and_channel_required'})
 prune()
 const key=platform+':'+eventId
 if(seen.has(key))return json(res,200,{ok:true,deduplicated:true,eventId})
 seen.set(key,Date.now())
 return json(res,202,{ok:true,event:{
  schema:'tryamm.external-live-value.v1',platform,eventId,channelId,
  senderId:clean(req.body?.senderId),senderName:clean(req.body?.senderName),
  nativeGiftId:clean(req.body?.nativeGiftId),nativeGiftName:clean(req.body?.nativeGiftName),
  nativeAmount:Number.isFinite(Number(req.body?.nativeAmount))?Number(req.body.nativeAmount):null,
  nativeCurrency:clean(req.body?.nativeCurrency,24)||null,
  verified:true,displayOnly:true,moneyMoved:false,withdrawable:false,
  settlementAuthority:platform,receivedAt:new Date().toISOString()
 }})
}
