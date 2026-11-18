import crypto from 'node:crypto'
import {IngressClient,IngressInput} from 'livekit-server-sdk'
import {requireUser,recentlyAuthenticated} from '../_lib/security.js'

// Provider credentials remain exclusively on the server. This endpoint cannot
// start external simulcasts or expose YouTube/TikTok/Facebook destination keys.
const on=key=>String(process.env[key]||'').trim().toLowerCase()==='true'
const host=()=>String(process.env.LIVEKIT_URL||'').replace(/^wss:/,'https:').replace(/^ws:/,'http:').trim()
const allowedHost=url=>/^https:\/\//.test(url)
function roomFor(userId,format){
  const owner=crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0,24)
  return 'tryamm-crossverse-'+owner+'-'+format
}
function respond(res,status,body){return res.status(status).json(body)}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  res.setHeader('Pragma','no-cache')
  res.setHeader('X-Content-Type-Options','nosniff')
  if(!['GET','POST'].includes(req.method)){
    res.setHeader('Allow','GET, POST')
    return respond(res,405,{error:'Method not allowed'})
  }
  const enabled=on('TRYAMM_OBS_INGRESS_ENABLED')
  const configured=Boolean(host()&&process.env.LIVEKIT_API_KEY&&process.env.LIVEKIT_API_SECRET)
  const ownerIds=String(process.env.TRYAMM_OBS_ALLOWED_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean)
  const ownersConfigured=ownerIds.length>0
  // Public readiness reports no sensitive provider values and performs no mutations.
  if(req.method==='GET')return respond(res,200,{enabled,configured,readyForOwnerSetup:enabled&&configured&&ownersConfigured,formats:['vertical','landscape'],liveVerified:false,externalRelayEnabled:false})
  if(!enabled)return respond(res,503,{error:'OBS ingest requires owner-enabled configuration'})
  if(!ownersConfigured)return respond(res,503,{error:'An OBS owner allowlist must be configured'})
  if(!configured||!allowedHost(host()))return respond(res,503,{error:'Secure LiveKit service is unavailable'})
  let user
  try{user=await requireUser(req,res)}catch{return respond(res,503,{error:'Could not validate authorization'})}
  if(!user)return
  if(!ownerIds.includes(String(user.id)))return respond(res,403,{error:'OBS provisioning is restricted to authorized operators'})
  if(!recentlyAuthenticated(user,600))return respond(res,403,{error:'Please sign in again before creating an OBS ingest'})
  let body
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return respond(res,400,{error:'Invalid request body'})}
  const format=body.format
  if(!['vertical','landscape'].includes(format)||body.confirm!=='CREATE_PRIVATE_INGEST')return respond(res,400,{error:'Format and explicit confirmation are required'})
  const roomName=roomFor(user.id,format)
  const client=new IngressClient(host(),process.env.LIVEKIT_API_KEY,process.env.LIVEKIT_API_SECRET)
  try{
    // Reuse an existing input instead of silently multiplying billable ingresses.
    const existing=await client.listIngress(roomName)
    if(existing.length)return respond(res,409,{error:'An OBS input already exists for this format. Ask the operator to rotate/reset it securely.',roomName})
    const ingress=await client.createIngress(IngressInput.RTMP_INPUT,{
      name:'TRYAMM '+format+' OBS input',
      roomName,
      participantIdentity:'obs-'+format,
      participantName:'OBS '+format,
    })
    // Only the authenticated owner receives the source ingest key once here.
    // This is NOT an external destination key. Do not persist it in localStorage.
    return respond(res,201,{
      created:true,format,roomName,ingressId:ingress.ingressId,
      obsServer:ingress.url,obsStreamKey:ingress.streamKey,
      liveVerified:false,externalRelayEnabled:false,
      caution:'Copy these source credentials into OBS privately. Do not share screenshots or put keys in a public broadcast.'
    })
  }catch{
    // Avoid returning provider errors, stream URLs, or provider details.
    return respond(res,502,{error:'Could not initialize OBS input. Check provider access and retry after confirming whether an input was already created.'})
  }
}
