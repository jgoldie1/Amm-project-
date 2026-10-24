import {WebhookReceiver} from 'livekit-server-sdk'
import {adminRest,adminReady} from '../_lib/supabase-admin.js'
import {liveKitServerReady} from '../_lib/livekit-room-guard.js'

// Preserve the raw signed request body: parsed JSON breaks LiveKit signature
// verification. This endpoint must also be registered in LiveKit Cloud.
export const config={api:{bodyParser:false}}
const MAX_WEBHOOK_BYTES=256*1024
async function rawBody(req){
 let size=0;const chunks=[]
 for await(const part of req){
  const data=Buffer.isBuffer(part)?part:Buffer.from(part)
  size+=data.length
  if(size>MAX_WEBHOOK_BYTES)throw new Error('webhook_payload_too_large')
  chunks.push(data)
 }
 return Buffer.concat(chunks).toString('utf8')
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store')
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
 if(!liveKitServerReady()||!adminReady())return res.status(503).json({error:'LIVE webhook not configured'})
 let event
 try{
  const raw=await rawBody(req)
  const key=String(process.env.LIVEKIT_API_KEY||'')
  const secret=String(process.env.LIVEKIT_API_SECRET||'')
  // Never skip JWT payload signature verification, even for probes.
  event=await new WebhookReceiver(key,secret).receive(raw,req.headers.authorization)
 }catch{return res.status(401).json({error:'Unauthorized webhook'})}
 if(!['participant_left','room_finished'].includes(event.event))return res.status(200).json({accepted:true,action:'ignored'})
 const room=String(event.room?.name||'')
 if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(room))return res.status(200).json({accepted:true,action:'invalid-room-ignored'})
 try{
  const rows=await adminRest('live_rooms',{query:{room_name:'eq.'+room,limit:1}})
  const current=rows?.[0]
  if(!current || current.status!=='live')return res.status(200).json({accepted:true,action:'not-live'})
  if(event.event==='participant_left'&&String(event.participant?.identity||'')!==current.host_user_id+':host'){
   return res.status(200).json({accepted:true,action:'not-host'})
  }
  const timestamp=Number(event.createdAt||0)
  const started=Date.parse(String(current.started_at||''))/1000
  // Avoid old delayed webhook events closing a newer broadcast.
  if(timestamp&&Number.isFinite(started)&&timestamp+2<started){
   return res.status(200).json({accepted:true,action:'stale-event'})
  }
  const now=new Date().toISOString()
  await adminRest('live_rooms',{method:'PATCH',
   query:{room_name:'eq.'+room,status:'eq.live',started_at:'eq.'+current.started_at},
   body:{status:'ended',ended_at:now,updated_at:now}})
  return res.status(200).json({accepted:true,action:'room-ended'})
 }catch{
  // Valid events may be retried by LiveKit if our DB is temporarily down.
  return res.status(503).json({error:'LIVE webhook database temporarily unavailable'})
 }
}
