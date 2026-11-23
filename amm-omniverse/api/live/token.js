import { AccessToken } from 'livekit-server-sdk';
import { requireUser } from '../_lib/security.js';
import { adminReady, adminRest } from '../_lib/supabase-admin.js';

const LIVEKIT_URL=()=>String(process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||'').trim();
const API_KEY=()=>String(process.env.LIVEKIT_API_KEY||'').trim();
const API_SECRET=()=>String(process.env.LIVEKIT_API_SECRET||'').trim();

function cleanRoom(value){
  const room=String(value||'').toLowerCase().replace(/[^a-z0-9-_]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,80);
  return room||'tryamm-live';
}

function cleanName(value,fallback){
  return String(value||fallback||'Creator').replace(/[\r\n<>]/g,'').trim().slice(0,80)||'Creator';
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});

  if(!LIVEKIT_URL()||!API_KEY()||!API_SECRET()){
    return res.status(503).json({error:'LIVE provider is not configured'});
  }

  const user=await requireUser(req,res);
  if(!user)return;

  if(!adminReady())return res.status(503).json({error:'LIVE room authorization unavailable'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{}}catch{return res.status(400).json({error:'Invalid LIVE request'})}
  const role=body.role==='viewer'?'viewer':'host';
  const room=cleanRoom(body.room);
  if(role==='host' && room==='jacobie-greenville' && user.id!==process.env.TRYAMM_JACOBIE_HOST_ID)return res.status(403).json({error:'This Greenville stage is reserved for Jacobie.'});
  let roomRecord;
  try{
    const records=await adminRest('live_rooms',{query:{room_name:`eq.${room}`,limit:1}});
    roomRecord=records?.[0];
  }catch{return res.status(503).json({error:'Could not authorize LIVE room'})}
  if(!roomRecord)return res.status(404).json({error:'LIVE room not found. Create a room before hosting.'});
  if(role==='host' && (roomRecord.host_user_id!==user.id || roomRecord.status!=='open'))return res.status(403).json({error:'Only the active room owner can broadcast'});
  if(role==='viewer' && roomRecord.status!=='open')return res.status(403).json({error:'LIVE room is not open'});
  // Unlisted/private LIVE sessions are owner-only until a server-verified guest grant exists.
  // Never treat possession of a room name as an invitation.
  if(role==='viewer' && roomRecord.host_user_id!==user.id && (roomRecord.visibility==='private'||roomRecord.visibility==='unlisted'))return res.status(403).json({error:'Private LIVE room requires verified invitation'});
  const displayName=cleanName(body.displayName,user.user_metadata?.display_name||user.email?.split('@')[0]);
  const identity=`${user.id}:${role}`;

  const token=new AccessToken(API_KEY(),API_SECRET(),{
    identity,
    name:displayName,
    ttl:'20m',
    metadata:JSON.stringify({tryammUserId:user.id,role})
  });
  token.addGrant({
    roomJoin:true,
    room,
    canSubscribe:true,
    canPublish:role==='host',
    canPublishData:role==='host'
  });

  const jwt=await token.toJwt();
  return res.status(200).json({token:jwt,url:LIVEKIT_URL(),room,role,participant:identity});
}
