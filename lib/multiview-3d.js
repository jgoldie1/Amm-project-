'use strict';

function n(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d}
function clamp(v,min,max){return Math.max(min,Math.min(max,n(v,min)))}
function makeView({index=0,yaw=0,pitch=0,eyeX=0,eyeY=0,eyeZ=0,projection='perspective',fov=45}={}){
 return {index:Math.max(0,Math.floor(n(index))),yaw:clamp(yaw,-180,180),pitch:clamp(pitch,-90,90),eye:{x:n(eyeX),y:n(eyeY),z:n(eyeZ)},projection,fov:clamp(fov,10,140)};
}
function generateViewCone({views=8,arcDegrees=40,distance=1.5,height=0,fov=45}={}){
 const count=Math.min(Math.max(Math.floor(n(views,8)),2),64),arc=clamp(arcDegrees,2,120),out=[];
 for(let i=0;i<count;i++){const t=count===1?0:i/(count-1),yaw=-arc/2+t*arc,rad=yaw*Math.PI/180;out.push(makeView({index:i,yaw,eyeX:Math.sin(rad)*distance,eyeY:height,eyeZ:Math.cos(rad)*distance,fov}));}
 return out;
}
function selectSpatialRepresentation(cap={}){
 if(cap.lightField===true)return 'light-field';
 if(cap.autostereoscopic===true)return 'multiview';
 if((cap.webXR===true||cap.webxr===true)&&cap.vr===true)return 'stereo-xr';
 if(cap.depthMap===true)return 'rgbd';
 return 'mesh';
}
function makeSpatialPacket({sceneId='scene',representation='mesh',views=[],depthMap=null,mesh=null,gaussianSplats=null,nerf=null,video=null,audio=null,bitrateMbps=20,lod=1}={}){
 return {protocol:'tryamm-spatial-stream/1.0',sceneId:String(sceneId),representation,views:Array.isArray(views)?views.slice(0,64):[],depthMap,mesh,gaussianSplats,nerf,video,audio,stream:{bitrateMbps:clamp(bitrateMbps,1,500),lod:clamp(lod,.1,4),adaptive:true},fallbacks:['mesh','rgbd','stereo','2d']};
}
function adaptiveProfile({bandwidthMbps=25,gpuTier=2,views=8,displayMode='multiview'}={}){
 const bw=Math.max(1,n(bandwidthMbps,25)),gpu=clamp(gpuTier,0,4);let maxViews=Math.min(Math.max(Math.floor(n(views,8)),2),64);
 if(bw<15||gpu<1.5)maxViews=Math.min(maxViews,4);else if(bw<40||gpu<2.5)maxViews=Math.min(maxViews,8);else maxViews=Math.min(maxViews,16);
 return {displayMode,maxViews,prefer:displayMode==='light-field'?'gaussian-splats':displayMode==='multiview'?'mesh+depth':'mesh',targetFps:gpu>=3?90:60,adaptiveBitrate:true};
}
function planSpatialStream({mode='spatial-3d',gpuTier=2,bandwidthMbps=25,desiredViews=8,sceneId='scene'}={}){
 const representation=mode==='stereoscopic-3d'||mode==='immersive-vr'?'stereo-xr':mode==='2d'?'mesh':'multiview';
 const adaptive=adaptiveProfile({bandwidthMbps,gpuTier,views:desiredViews,displayMode:representation});
 const views=generateViewCone({views:Math.max(2,adaptive.maxViews),arcDegrees:representation==='stereo-xr'?12:40});
 const bitrateMbps=Math.max(2,Math.min(Number(bandwidthMbps)||25,adaptive.maxViews*4));
 const packet=makeSpatialPacket({sceneId,representation,views,bitrateMbps,lod:gpuTier>=3?2:gpuTier>=2?1.5:1});
 return {...packet,mode:representation,adaptive};
}
module.exports={makeView,generateViewCone,selectSpatialRepresentation,makeSpatialPacket,adaptiveProfile,planSpatialStream};
