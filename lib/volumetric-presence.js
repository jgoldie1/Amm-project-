'use strict';
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const REPS=new Set(['flat-video','rgb-depth','mesh','point-cloud','gaussian-splat','volumetric-video']);
function captureCapabilities(input={}){return {rgb:input.rgb!==false,depth:!!input.depth,lidar:!!input.lidar,faceTracking:!!input.faceTracking,bodyTracking:!!input.bodyTracking,handTracking:!!input.handTracking,microphones:clamp(input.microphones||1,0,16),cameras:clamp(input.cameras||1,0,32),gpuTier:clamp(input.gpuTier||1,1,4)}}
function chooseRepresentation(caps={},network={}){const mbps=clamp(network.bandwidthMbps||5,.1,1000); if(caps.depth&&caps.gpuTier>=3&&mbps>=35)return 'gaussian-splat'; if(caps.depth&&caps.gpuTier>=2&&mbps>=18)return 'point-cloud'; if(caps.depth&&mbps>=8)return 'rgb-depth'; return 'flat-video'}
function planVolumetricCapture(device={},network={},prefs={}){
 const caps=captureCapabilities(device); let representation=clean(prefs.representation,40); if(!REPS.has(representation)) representation=chooseRepresentation(caps,network);
 const mbps=clamp(network.bandwidthMbps||5,.1,1000); const fps=mbps>=30?30:mbps>=10?24:15; const targetMbps=Math.min(mbps*.7,representation==='gaussian-splat'?30:representation==='point-cloud'?18:representation==='rgb-depth'?8:4);
 return {protocol:'tryamm-volumetric-capture/1.0',representation,caps,stream:{fps,targetMbps:Number(targetMbps.toFixed(2)),transport:prefs.transport==='webtransport'?'webtransport':'webrtc',adaptive:true,keyframeSeconds:2},
  tracking:{face:caps.faceTracking,body:caps.bodyTracking,hands:caps.handTracking},audio:{spatial:caps.microphones>=2,channels:Math.max(1,Math.min(8,caps.microphones))},fallback:['flat-video','audio-only'],privacy:{captureIndicator:true,explicitCameraConsent:true,explicitMicConsent:true,localPreview:true}};
}
function makeVolumetricFrame(input={}){const rep=clean(input.representation,40); if(!REPS.has(rep))throw new Error('unsupported_representation'); return {protocol:'tryamm-volumetric-frame/1.0',presenceId:clean(input.presenceId,120),representation:rep,timestampMs:Math.max(0,Number(input.timestampMs)||Date.now()),assetRef:clean(input.assetRef,2000),depthRef:clean(input.depthRef,2000)||null,trackingRef:clean(input.trackingRef,2000)||null,consentVerified:input.consentVerified===true};}
function canPublishFrame(frame={}){return !!frame.presenceId&&!!frame.assetRef&&frame.consentVerified===true}
module.exports={REPS,captureCapabilities,chooseRepresentation,planVolumetricCapture,makeVolumetricFrame,canPublishFrame};
