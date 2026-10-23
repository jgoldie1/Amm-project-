import { AccessToken } from 'livekit-server-sdk';
import { requireUser } from '../_lib/security.js';
import {adminReady,adminRest} from '../_lib/supabase-admin.js';

const LIVEKIT_URL=()=>String(process.env.LIVEKIT_URL||'').trim();
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

  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};}catch{return res.status(400).json({error:'Invalid JSON body'});}
  const role=body.role;
  if(!['viewer','host','guest'].includes(role))return res.status(400).json({error:'Unsupported LIVE role'});

  const room=cleanRoom(body.room);
  const displayName=cleanName(body.displayName,user.user_metadata?.display_name||user.email?.split('@')[0]);
  // A browser must never be able to upgrade itself from viewer to room host.
  // Host room ownership is persisted by the authenticated panel API.
  if(!adminReady())return res.status(503).json({error:'LIVE room authorization unavailable'});
  let ownedRoom;
  try{
    const rows=await adminRest('live_rooms',{query:{room_name:`eq.${room}`,limit:1}});
    ownedRoom=rows?.[0]||null;
  }catch{return res.status(503).json({error:'Could not verify LIVE room authorization'})}
  if(!ownedRoom||!['planned','live'].includes(ownedRoom.status))return res.status(409).json({error:'LIVE room is not open'});
  if(role==='viewer'&&ownedRoom.status!=='live')return res.status(409).json({error:'Host has not started the live broadcast yet'});
  if(role==='host'&&ownedRoom.host_user_id!==user.id)return res.status(403).json({error:'Only the verified room owner can publish LIVE'});
  if(role==='guest'){
    if(ownedRoom.status!=='live')return res.status(409).json({error:'The host has not started LIVE'});
    let requests;
    try{requests=await adminRest('live_panel_requests',{query:{room_name:`eq.${room}`,requester_user_id:`eq.${user.id}`,status:'eq.on_stage',limit:1}})}
    catch{return res.status(503).json({error:'Could not verify guest stage authorization'})}
    const approved=requests?.[0];
    if(!approved || approved.host_user_id!==ownedRoom.host_user_id || !approved.approved_at ||
      (approved.guardian_approval_required&&!approved.guardian_approved_at)){
      return res.status(403).json({error:'Host and guardian approval required before publishing as a guest'});
    }
  }
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
    canPublish:role==='host'||role==='guest',
    canPublishData:true
  });

  const jwt=await token.toJwt();
  return res.status(200).json({token:jwt,url:LIVEKIT_URL(),room,role,participant:identity});
}
