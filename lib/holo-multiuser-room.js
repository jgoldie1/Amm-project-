'use strict';
const crypto=require('crypto');
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const id=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,24);
const ROLES=new Set(['owner','admin','member','guest','child','viewer']);
const PERMS=new Set(['view','speak','move-self','move-shared','invite','moderate','share-screen','use-camera','use-mic','purchase','pay','book','dispatch','publish','sign','unlock','vehicle-control']);
function normalizeProfile(input={}){
 const role=ROLES.has(clean(input.role,30))?clean(input.role,30):'guest';
 return {userId:clean(input.userId,120)||id(Math.random()),displayName:clean(input.displayName||'Guest',120),role,
  permissions:Array.isArray(input.permissions)?input.permissions.filter(p=>PERMS.has(p)).slice(0,50):['view','move-self'],
  accessibility:{captions:input.accessibility?.captions!==false,audioDescription:!!input.accessibility?.audioDescription,screenReader:!!input.accessibility?.screenReader,reducedMotion:!!input.accessibility?.reducedMotion,highContrast:!!input.accessibility?.highContrast,voiceControl:input.accessibility?.voiceControl!==false},
  viewpoint:{x:clamp(input.viewpoint?.x,-10000,10000),y:clamp(input.viewpoint?.y,-10000,10000),z:clamp(input.viewpoint?.z,-10000,10000),yaw:clamp(input.viewpoint?.yaw,-360,360)},deviceIds:Array.isArray(input.deviceIds)?input.deviceIds.map(x=>clean(x,120)).filter(Boolean).slice(0,20):[]};
}
function createRoom({roomId,title,sceneId,owner}={}){const ownerProfile=normalizeProfile({...owner,role:'owner',permissions:[...PERMS]});return {protocol:'tryamm-holo-room/1.0',roomId:clean(roomId,120)||id(Date.now()),title:clean(title||'Holo Room',160),sceneId:clean(sceneId,120)||null,createdAt:new Date().toISOString(),members:[ownerProfile],sharedState:{focusNodeId:null,timeCursor:'now',presentationMode:'shared'},audit:[]};}
function joinRoom(room,profile){const p=normalizeProfile(profile);if(room.members.some(m=>m.userId===p.userId))return room;return {...room,members:[...room.members,p],audit:[...room.audit,{at:new Date().toISOString(),type:'join',userId:p.userId}]};}
function hasPermission(room,userId,permission){const p=room.members.find(m=>m.userId===userId);return !!p&&(p.role==='owner'||p.permissions.includes(permission));}
function applyAction(room,{userId,type,payload={}}){const map={camera:'use-camera',microphone:'use-mic',purchase:'purchase',pay:'pay',book:'book',dispatch:'dispatch',publish:'publish',sign:'sign',unlock:'unlock','vehicle-control':'vehicle-control',invite:'invite','move-shared':'move-shared'};const perm=map[type]||'view';if(!hasPermission(room,userId,perm))return {ok:false,code:'permission_denied',requiredPermission:perm};const highImpact=['purchase','pay','book','dispatch','publish','sign','unlock','vehicle-control','camera','microphone'].includes(type);return {ok:true,requiresConfirmation:highImpact,action:{userId,type,payload},audit:{at:new Date().toISOString(),type:'action_request',userId,action:type}};}
function personalizeScene(scene,profile){const p=normalizeProfile(profile);return {...scene,userView:{userId:p.userId,viewpoint:p.viewpoint,accessibility:p.accessibility},renderOverrides:{reducedMotion:p.accessibility.reducedMotion,highContrast:p.accessibility.highContrast,captions:p.accessibility.captions,audioDescription:p.accessibility.audioDescription}};}
module.exports={ROLES,PERMS,normalizeProfile,createRoom,joinRoom,hasPermission,applyAction,personalizeScene};
