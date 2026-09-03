import { AccessToken } from 'livekit-server-sdk';
import { requireUser } from '../_lib/security.js';

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

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
  const role=body.role==='viewer'?'viewer':'host';
  const room=cleanRoom(body.room);
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
    canPublishData:true
  });

  const jwt=await token.toJwt();
  return res.status(200).json({token:jwt,url:LIVEKIT_URL(),room,role,participant:identity});
}
