import { requireUser } from '../_lib/security.js';
import { adminRest, adminReady } from '../_lib/supabase-admin.js';

const cleanRoom=v=>String(v||'').toLowerCase().replace(/[^a-z0-9-_]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'tryamm-live';
const cleanId=v=>String(v||'').replace(/[^a-zA-Z0-9-_]/g,'').slice(0,120);

async function roomByName(room){
  const rows=await adminRest('live_rooms',{query:{room_name:`eq.${room}`,limit:1}});
  return rows?.[0]||null;
}

async function requestById(id){
  const rows=await adminRest('live_panel_requests',{query:{id:`eq.${id}`,limit:1}});
  return rows?.[0]||null;
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
  if(!adminReady()) return res.status(503).json({error:'Panel service unavailable'});
  const user=await requireUser(req,res); if(!user)return;

  if(req.method==='GET'){
    const room=cleanRoom(req.query?.room);
    const current=await roomByName(room);
    if(!current) return res.status(200).json({room:null,requests:[]});
    const canManage=current.host_user_id===user.id;
    const query=canManage
      ? {room_name:`eq.${room}`,order:'created_at.asc',limit:50}
      : {room_name:`eq.${room}`,requester_user_id:`eq.${user.id}`,order:'created_at.desc',limit:5};
    const requests=await adminRest('live_panel_requests',{query});
    return res.status(200).json({room:current,requests:requests||[],canManage});
  }

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};
  const action=String(body.action||'');
  const room=cleanRoom(body.room);

  if(action==='create_room'){
    const maxPanel=Math.max(3,Math.min(20,Number(body.maxPanel)||8));
    const existing=await roomByName(room);
    if(existing&&existing.host_user_id!==user.id) return res.status(409).json({error:'Room name is owned by another host'});
    const payload={room_name:room,host_user_id:user.id,title:String(body.title||room).slice(0,120),status:'open',max_panel:maxPanel,stage_mode:'talk',updated_at:new Date().toISOString()};
    const rows=await adminRest('live_rooms',{method:existing?'PATCH':'POST',query:existing?{room_name:`eq.${room}`}:{},body:payload});
    return res.status(200).json({room:rows?.[0]||payload});
  }

  const current=await roomByName(room);
  if(!current) return res.status(404).json({error:'LIVE room not found'});

  if(action==='request_panel'){
    const controls=await adminRest('guardian_controls',{query:{child_user_id:`eq.${user.id}`,limit:1}}).catch(()=>[]);
    const control=controls?.[0]||null;
    if(control&&control.panel_join_allowed===false) return res.status(403).json({error:'Panel joining is disabled by guardian controls'});
    const guardianRequired=Boolean(control);
    const rows=await adminRest('live_panel_requests',{method:'POST',body:{room_name:room,requester_user_id:user.id,host_user_id:current.host_user_id,status:'waiting',camera_ready:Boolean(body.cameraReady),mic_ready:Boolean(body.micReady),requested_role:'guest',guardian_approval_required:guardianRequired}});
    return res.status(201).json({request:rows?.[0]||null});
  }

  if(current.host_user_id!==user.id) return res.status(403).json({error:'Host permission required'});

  if(action==='stage_mode'){
    const allowed=new Set(['talk','video','movie','music','game','shop','gift_pk']);
    const mode=allowed.has(body.mode)?body.mode:'talk';
    const media={title:String(body.title||'').slice(0,160),source:String(body.source||'').slice(0,500),rightsStatus:String(body.rightsStatus||'unverified').slice(0,40),commerceRef:cleanId(body.commerceRef),gameRef:cleanId(body.gameRef)};
    const rows=await adminRest('live_rooms',{method:'PATCH',query:{room_name:`eq.${room}`,host_user_id:`eq.${user.id}`},body:{stage_mode:mode,stage_payload:media,updated_at:new Date().toISOString()}});
    return res.status(200).json({room:rows?.[0]||null,monetizationEligible:media.rightsStatus==='verified'});
  }

  if(['approve','reject','remove'].includes(action)){
    const requestId=cleanId(body.requestId); const request=await requestById(requestId);
    if(!request||request.room_name!==room||request.host_user_id!==user.id) return res.status(404).json({error:'Panel request not found'});
    if(action==='approve'){
      if(request.guardian_approval_required&&!request.guardian_approved_at) return res.status(409).json({error:'Guardian approval is still required'});
      const active=await adminRest('live_panel_requests',{query:{room_name:`eq.${room}`,status:'eq.on_stage',limit:25}});
      if((active?.length||0)>=current.max_panel-1) return res.status(409).json({error:'Panel is full'});
      const used=new Set((active||[]).map(x=>Number(x.stage_position)).filter(Boolean)); let pos=2; while(used.has(pos)&&pos<=current.max_panel)pos++;
      const rows=await adminRest('live_panel_requests',{method:'PATCH',query:{id:`eq.${requestId}`},body:{status:'on_stage',stage_position:pos,approved_at:new Date().toISOString(),joined_at:new Date().toISOString(),updated_at:new Date().toISOString()}});
      return res.status(200).json({request:rows?.[0]||null});
    }
    const next=action==='reject'?{status:'rejected',rejected_at:new Date().toISOString()}:{status:'removed',removed_at:new Date().toISOString(),stage_position:null};
    const rows=await adminRest('live_panel_requests',{method:'PATCH',query:{id:`eq.${requestId}`},body:{...next,updated_at:new Date().toISOString()}});
    return res.status(200).json({request:rows?.[0]||null});
  }

  return res.status(400).json({error:'Unsupported panel action'});
}
