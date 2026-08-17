'use strict';
const crypto=require('crypto');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,24);
const AUDIO_TYPES=new Set(['voice','music','effect','ambience','ui','accessibility']);
function audioObject(input={}){
 const type=clean(input.type||'effect',30).toLowerCase(); if(!AUDIO_TYPES.has(type)) throw new Error('unsupported_audio_type');
 const visualNodeId=clean(input.visualNodeId,80)||null;
 return {id:input.id||hash(`${type}|${visualNodeId}|${input.label||''}`),type,label:clean(input.label||type,160),visualNodeId,
 position:{x:clamp(input.x,-10000,10000),y:clamp(input.y,-10000,10000),z:clamp(input.z,-10000,10000)},
 velocity:{x:clamp(input.vx,-1000,1000),y:clamp(input.vy,-1000,1000),z:clamp(input.vz,-1000,1000)},
 gain:clamp(input.gain??1,0,4),priority:clamp(input.priority??.5,0,1),directivity:clamp(input.directivity??.5,0,1),
 sourceUrl:clean(input.sourceUrl,2000)||null,caption:clean(input.caption,1000)||null,language:clean(input.language||'und',24),
 safety:input.safety&&typeof input.safety==='object'?input.safety:{status:'unreviewed'}};
}
function roomModel(input={}){return {widthM:clamp(input.widthM||5,1,100),heightM:clamp(input.heightM||3,1,30),depthM:clamp(input.depthM||6,1,100),reverb:clamp(input.reverb??.25,0,1),absorption:clamp(input.absorption??.4,0,1)}}
function buildAudioScene({sceneId,objects=[],room={},listener={},output={}}={}){
 const safe=objects.map(audioObject).filter(o=>o.safety.status==='approved');
 return {protocol:'tryamm-quantum-audio/1.0',sceneId:clean(sceneId||hash(Date.now()),80),objects:safe,room:roomModel(room),listener:{x:clamp(listener.x,-10000,10000),y:clamp(listener.y,-10000,10000),z:clamp(listener.z,-10000,10000),yaw:clamp(listener.yaw,-360,360)},output:{mode:clean(output.mode||'adaptive',40),channels:clamp(output.channels||2,1,64),headTracking:!!output.headTracking,roomCalibration:!!output.roomCalibration},accessibility:{captions:true,dialogEnhancement:true,monoFallback:true}};
}
function syncVisualAudio(holoScene,audioScene){const nodes=new Set((holoScene?.nodes||[]).map(n=>n.id));return {...audioScene,objects:(audioScene?.objects||[]).filter(o=>!o.visualNodeId||nodes.has(o.visualNodeId))}}
module.exports={AUDIO_TYPES,audioObject,roomModel,buildAudioScene,syncVisualAudio};
