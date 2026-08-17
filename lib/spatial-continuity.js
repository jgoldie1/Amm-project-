'use strict';
const crypto=require('crypto');
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,24);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
function createSpatialIdentity(input={}){
 const userId=clean(input.userId,120); if(!userId) throw new Error('user_id_required');
 return {protocol:'tryamm-spatial-identity/1.0',id:input.id||hash(userId),userId,avatarId:clean(input.avatarId,120)||null,homeWorld:clean(input.homeWorld||'tryamm://home',1000),
  accessibility:{captions:!!input.captions,audioDescription:!!input.audioDescription,reducedMotion:!!input.reducedMotion,highContrast:!!input.highContrast,voiceControl:input.voiceControl!==false},
  preferences:{language:clean(input.language||'en',24),privacy:clean(input.privacy||'private',30),presence:clean(input.presence||'friends',30)},
  createdAt:new Date().toISOString()};
}
function checkpoint({identity,worldUri,sceneId,position={},orientation={},inventoryRefs=[],conversationRefs=[],permissionRefs=[]}={}){
 if(!identity?.userId) throw new Error('identity_required');
 return {protocol:'tryamm-spatial-checkpoint/1.0',id:hash(`${identity.id}|${worldUri}|${Date.now()}`),identityId:identity.id,userId:identity.userId,worldUri:clean(worldUri,1000),sceneId:clean(sceneId,120),
  position:{x:clamp(position.x,-1e6,1e6),y:clamp(position.y,-1e6,1e6),z:clamp(position.z,-1e6,1e6)},orientation:{yaw:clamp(orientation.yaw,-360,360),pitch:clamp(orientation.pitch,-180,180),roll:clamp(orientation.roll,-180,180)},
  inventoryRefs:Array.isArray(inventoryRefs)?inventoryRefs.slice(0,500):[],conversationRefs:Array.isArray(conversationRefs)?conversationRefs.slice(0,100):[],permissionRefs:Array.isArray(permissionRefs)?permissionRefs.slice(0,100):[],savedAt:new Date().toISOString()};
}
function planTeleport({checkpoint:cp,targetWorld,targetDevice,allowedWorlds=[],carry={}}={}){
 if(!cp?.userId) throw new Error('checkpoint_required'); const target=clean(targetWorld,1000); if(!target) throw new Error('target_world_required');
 const allowed=allowedWorlds.length===0||allowedWorlds.some(w=>target.startsWith(w)); if(!allowed) return {allowed:false,reason:'world_not_authorized'};
 return {allowed:true,protocol:'tryamm-teleport/1.0',from:{worldUri:cp.worldUri,sceneId:cp.sceneId},to:{worldUri:target,deviceId:clean(targetDevice,120)||null},
  preserve:{identity:true,accessibility:true,position:carry.position!==false,inventory:!!carry.inventory,conversations:!!carry.conversations,permissions:false},
  security:{revalidateTargetPermissions:true,revalidatePurchases:true,revalidatePhysicalControls:true},requestedAt:new Date().toISOString()};
}
function resumePacket(identity,cp,deviceId){return {protocol:'tryamm-spatial-resume/1.0',identityId:identity.id,userId:identity.userId,deviceId:clean(deviceId,120),worldUri:cp.worldUri,sceneId:cp.sceneId,position:cp.position,orientation:cp.orientation,accessibility:identity.accessibility,permissions:'revalidate'}}
module.exports={createSpatialIdentity,checkpoint,planTeleport,resumePacket};
