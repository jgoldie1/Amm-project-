'use strict';

function n(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d}
function b(v){return v===true||v==='true'}
function profile(input={}){
 const p={
  displayType:String(input.displayType||'unknown').toLowerCase(),width:n(input.width),height:n(input.height),pixelRatio:n(input.pixelRatio,1),refreshHz:n(input.refreshHz,60),hdr:b(input.hdr),
  oled:b(input.oled)||String(input.displayType||'').toLowerCase().includes('oled'),transparent:b(input.transparent),stereo:b(input.stereo),webxr:b(input.webxr),ar:b(input.ar),vr:b(input.vr),
  eyeTracking:b(input.eyeTracking),controller:b(input.controller),touch:b(input.touch),gpuTier:Math.max(0,Math.min(3,n(input.gpuTier,1))),prefersReducedMotion:b(input.prefersReducedMotion)
 };
 p.largeScreen=p.width>=1920&&p.height>=1080;
 p.highRefresh=p.refreshHz>=90;
 return p;
}
function renderPlan(input={}){
 const p=profile(input);let mode='2d';
 if(p.vr&&p.webxr)mode='immersive-vr'; else if(p.ar&&p.webxr)mode='immersive-ar'; else if(p.stereo)mode='stereoscopic-3d'; else if(p.gpuTier>=2)mode='spatial-3d';
 const plan={mode,stereoLayout:p.stereo?'side-by-side':'mono',targetFps:p.highRefresh?Math.min(p.refreshHz,120):60,hdr:p.hdr,oledOptimizations:p.oled?['true-black-background','high-contrast-ui','pixel-shift-safe-static-ui','brightness-limiter-aware','dark-scene-detail']:[],transparentDisplay:p.transparent,
  quality:p.gpuTier>=3?'ultra':p.gpuTier===2?'high':p.gpuTier===1?'balanced':'low',dynamicResolution:p.gpuTier<3,antiAlias:p.gpuTier>=2?'msaa':'fxaa',reducedMotion:p.prefersReducedMotion,
  fallbacks:['webgl2','canvas-2d'],accessibility:{'2dEquivalent':true,keyboard:true,screenReaderLabels:true,voiceNavigation:true}};
 if(p.prefersReducedMotion){plan.targetFps=Math.min(plan.targetFps,60);plan.mode=mode==='2d'?'2d':'spatial-3d';}
 return {profile:p,plan};
}
function oledSceneGuidance(){return {background:'#000000',avoidLargeStaticMaxBrightness:true,adaptiveLuminance:true,nearBlackDetail:true,staticHudMitigation:['auto-dim','micro-shift','hide-when-idle'],notes:'OLED improves contrast and perceived depth but is not by itself a holographic or stereoscopic display. True binocular 3D requires stereo-capable hardware or XR/display optics.'};}
module.exports={profile,renderPlan,oledSceneGuidance};
