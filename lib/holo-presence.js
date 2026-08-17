'use strict';
const crypto=require('crypto');
const clean=(v,m=500)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,24);
const PRESENCE_TYPES=new Set(['real-person','avatar','recording','ai-agent']);
function makePresence(input={}){
 const type=clean(input.type,40).toLowerCase(); if(!PRESENCE_TYPES.has(type)) throw new Error('unsupported_presence_type');
 const label=clean(input.label||type,160); const id=input.id||hash(`${type}|${input.subjectId||label}`);
 return {protocol:'tryamm-holopresence/1.0',id,type,label,subjectId:clean(input.subjectId,120)||null,worldUri:clean(input.worldUri,1000)||null,
  position:{x:clamp(input.x,-1e6,1e6),y:clamp(input.y,-1e6,1e6),z:clamp(input.z,-1e6,1e6)},
  orientation:{yaw:clamp(input.yaw,-360,360),pitch:clamp(input.pitch,-180,180),roll:clamp(input.roll,-180,180)},
  media:{videoTrack:clean(input.videoTrack,500)||null,audioTrack:clean(input.audioTrack,500)||null,bodyTrack:clean(input.bodyTrack,500)||null,faceTrack:clean(input.faceTrack,500)||null,handTrack:clean(input.handTrack,500)||null},
  language:clean(input.language||'und',24),captions:input.captions!==false,translation:!!input.translation,audioDescription:!!input.audioDescription,
  identity:{badge:type,disclosure:type==='ai-agent'?'AI':type==='recording'?'RECORDED':type==='avatar'?'AVATAR':'LIVE PERSON',verified:!!input.verified},
  permissions:Array.isArray(input.permissions)?input.permissions.slice(0,100):[],safety:input.safety&&typeof input.safety==='object'?input.safety:{status:'unreviewed'}};
}
function publicPresence(input){const p=makePresence(input); if(p.safety.status!=='approved') throw new Error('presence_not_approved'); return p;}
function translationPlan(presence,targetLanguage){return {presenceId:presence.id,sourceLanguage:presence.language,targetLanguage:clean(targetLanguage||presence.language,24),captions:true,translatedAudio:presence.translation,keepOriginalAudio:true,label:presence.identity.disclosure};}
function syncPresence(presence,checkpoint){return {...presence,worldUri:checkpoint?.worldUri||presence.worldUri,position:checkpoint?.position||presence.position,orientation:checkpoint?.orientation||presence.orientation};}
function interactionPolicy(actor,target,action='speak'){const a=clean(action,60).toLowerCase(); const high=['purchase','pay','sign','unlock','dispatch','publish','delete','transfer','book']; if(high.includes(a)) return {allowed:false,requiresConfirmation:true,reason:'high_impact_action'}; if(target?.type==='ai-agent') return {allowed:true,requiresConfirmation:false,disclosureRequired:true}; return {allowed:true,requiresConfirmation:false,disclosureRequired:false};}
module.exports={PRESENCE_TYPES,makePresence,publicPresence,translationPlan,syncPresence,interactionPolicy};
