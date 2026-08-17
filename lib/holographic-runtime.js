'use strict';
const {normalizeDisplayCapabilities,planRender}=require('./holographic-display-capabilities');
const {planSpatialStream}=require('./multiview-3d');
const {planVolumetricCapture}=require('./volumetric-presence');
const {buildAudioScene}=require('./quantum-audio-scene');
const {createSpatialIdentity}=require('./spatial-continuity');

const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const HIGH_IMPACT=new Set(['purchase','pay','book','dispatch','sign','transfer','unlock','publish','delete','camera','microphone','vehicle-control','door-control']);

function normalizeNetwork(input={}){return {bandwidthMbps:Math.max(.1,Math.min(10000,Number(input.bandwidthMbps)||10)),latencyMs:Math.max(0,Math.min(10000,Number(input.latencyMs)||50)),metered:!!input.metered,online:input.online!==false}}
function normalizePermissions(input={}){return {scopes:Array.isArray(input.scopes)?[...new Set(input.scopes.map(x=>clean(x,120)).filter(Boolean))].slice(0,200):[],role:clean(input.role||'viewer',40)}}
function canAction(permissionState,action){const a=clean(action,80); const allowed=permissionState.scopes.includes('*')||permissionState.scopes.includes(a)||permissionState.scopes.includes(`action:${a}`); return {allowed,requiresConfirmation:allowed&&HIGH_IMPACT.has(a)}}

function negotiateHolographicSession(input={}){
 if(!input.user?.userId) throw new Error('user_required');
 const identity=createSpatialIdentity({...input.user,...input.accessibility});
 const display=normalizeDisplayCapabilities(input.device||{});
 const network=normalizeNetwork(input.network||{});
 const permissions=normalizePermissions(input.permissions||{});
 const render=planRender(display,{reducedMotion:identity.accessibility.reducedMotion,preferStereo:input.preferences?.preferStereo!==false});
 const spatialStream=planSpatialStream({mode:render.mode,gpuTier:display.gpuTier,bandwidthMbps:network.bandwidthMbps,desiredViews:input.preferences?.desiredViews||16});
 const volumetric=input.presenceCapture?planVolumetricCapture(input.presenceCapture,network,input.preferences||{}):null;
 const audio=buildAudioScene({sceneId:clean(input.scene?.sceneId||'session',120),objects:input.audioObjects||[],room:input.room||{},listener:input.listener||{},output:{mode:'adaptive',channels:input.audioOutput?.channels||2,headTracking:!!input.audioOutput?.headTracking,roomCalibration:!!input.audioOutput?.roomCalibration}});
 const worldUri=clean(input.scene?.worldUri||identity.homeWorld,1000);
 const session={protocol:'tryamm-holographic-runtime/1.0',sessionId:clean(input.sessionId||`${identity.id}-${Date.now()}`,160),createdAt:new Date().toISOString(),identity,world:{uri:worldUri,sceneId:clean(input.scene?.sceneId||'home',120)},display,network,render,spatialStream,volumetric,audio,permissions,
   accessibility:identity.accessibility,services:{quantumInternet:true,holoGPT:true,holoPresence:true,spatialContinuity:true,multiUser:true},
   safety:{explicitPresenceLabels:true,highImpactConfirmation:true,revalidateOnWorldChange:true,revalidatePhysicalControls:true,untrustedContentHidden:true},
   fallback:{twoD:true,flatVideo:true,audioOnly:true,keyboard:true,screenReader:true}};
 session.authorize=(action)=>canAction(permissions,action);
 return session;
}

function sessionSummary(session){return {sessionId:session.sessionId,world:session.world,renderMode:session.render.mode,streamMode:session.spatialStream.mode||session.spatialStream.representation||'adaptive',volumetric:session.volumetric?.representation||null,audioMode:session.audio.output.mode,role:session.permissions.role,accessibility:session.accessibility,safety:session.safety}}

module.exports={HIGH_IMPACT,normalizeNetwork,normalizePermissions,canAction,negotiateHolographicSession,sessionSummary};
