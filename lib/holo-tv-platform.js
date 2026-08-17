'use strict';
const {normalizeDisplayCapabilities,planRender}=require('./holographic-display-capabilities');
const {planSpatialStream}=require('./multiview-spatial-stream');
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
function normalizeHoloTv(input={}){
 const display=normalizeDisplayCapabilities({...input,deviceType:'tv'});
 return {display,screenInches:Math.max(24,Math.min(200,Number(input.screenInches)||65)),speakers:Math.max(2,Math.min(64,Number(input.speakers)||2)),
  camera:!!input.camera,microphones:Math.max(0,Math.min(16,Number(input.microphones)||0)),ambientSensors:!!input.ambientSensors,controller:input.controller!==false,
  cast:input.cast!==false,webRtc:input.webRtc!==false,localAI:!!input.localAI,privacyShutter:input.privacyShutter!==false};
}
function planHoloTvExperience(device={},network={},preferences={}){
 const tv=normalizeHoloTv(device); const render=planRender(tv.display,{reducedMotion:!!preferences.reducedMotion,preferStereo:preferences.preferStereo!==false});
 const stream=planSpatialStream({mode:render.mode,gpuTier:tv.display.gpuTier,bandwidthMbps:network.bandwidthMbps||20,desiredViews:preferences.desiredViews||16});
 const audioMode=tv.speakers>=8?'spatial-array':tv.speakers>=4?'surround':'stereo';
 return {protocol:'tryamm-holotv/1.0',tv,render,stream,audio:{mode:audioMode,roomCalibration:tv.microphones>0,dialogEnhancement:true,nightMode:true},
  input:{voice:tv.microphones>0,gesture:tv.camera,controller:tv.controller,phoneRemote:true},
  services:['Quantum Internet','HoloGPT','OmniBox','TRYAMM TV','Free TV','LIVE','SportsVerse','Living Worlds','OmniX','OmniRide'],
  privacy:{cameraIndicator:tv.camera,micIndicator:tv.microphones>0,hardwareShutterRecommended:tv.camera,localWakeWordPreferred:true},
  accessibility:{captions:true,audioDescription:true,screenReader:true,voiceControl:true,switchControl:true,reducedMotion:true,highContrast:true},
  fallback:{flatVideo:true,standardApps:true,hdmi:true,casting:tv.cast}};
}
function holoTvCommand(command=''){const c=clean(command,1000).toLowerCase(); if(!c)return {intent:'none'}; if(c.includes('search'))return {intent:'quantum-search'}; if(c.includes('watch')||c.includes('play'))return {intent:'media'}; if(c.includes('world'))return {intent:'living-world'}; if(c.includes('shop')||c.includes('buy'))return {intent:'commerce',requiresConfirmation:true}; return {intent:'holos-assistant'};}
module.exports={normalizeHoloTv,planHoloTvExperience,holoTvCommand};
