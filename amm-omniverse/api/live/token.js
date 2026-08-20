import {AccessToken} from 'livekit-server-sdk';
import {requireUser} from '../_lib/security.js';

const clean=(v,max=96)=>String(v||'').trim().replace(/[^A-Za-z0-9_-]/g,'-').slice(0,max);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const user=await requireUser(req,res);if(!user)return;
 const url=process.env.LIVEKIT_URL||process.env.LIVEKIT_WS_URL||'',key=process.env.LIVEKIT_API_KEY||'',secret=process.env.LIVEKIT_API_SECRET||'';
 if(!url||!key||!secret)return res.status(503).json({error:'LIVE infrastructure is not configured'});
 const room=clean(req.body?.room,96),role=req.body?.role==='host'?'host':'viewer',displayName=String(req.body?.displayName||user.email||'Player').trim().slice(0,80);
 if(room.length<3)return res.status(400).json({error:'Valid room is required'});
 const token=new AccessToken(key,secret,{identity:user.id,name:displayName,metadata:JSON.stringify({role})});
 token.addGrant({roomJoin:true,room,canSubscribe:true,canPublish:role==='host',canPublishData:true});
 return res.status(200).json({token:await token.toJwt(),url,room,role,participant:user.id});
}
