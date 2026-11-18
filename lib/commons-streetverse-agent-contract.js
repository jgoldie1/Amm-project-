'use strict'
const ROLES=new Set(['shopkeeper','guide','dispatcher','teacher','performer','student','historical-narrator'])
const WORLDS=new Set(['streetverse','campusverse','faithverse','showcase'])
const BANNED=/\b(real money|guaranteed returns|prescribe|diagnose|admin password|bank account|medical record|impersonate|secret system prompt)\b/i
function validateCharacter(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))return{ok:false,code:'INVALID'}
 const name=String(input.name||'').trim(),role=String(input.role||''),world=String(input.world||''),bio=String(input.bio||'').trim()
 if(name.length<2||name.length>40||!/[a-z]/i.test(name)||/[<>]/.test(name))return{ok:false,code:'NAME_INVALID'}
 if(!ROLES.has(role)||!WORLDS.has(world)||bio.length>400||BANNED.test(bio))return{ok:false,code:'SCOPE_INVALID'}
 if(input.representsRealPerson||input.pretendsToBeHuman||input.canTakeRealPayments||input.canAccessHealthRecords)return{ok:false,code:'IDENTITY_OR_PRIVILEGE_BLOCKED'}
 if(input.minAge!==undefined&&(!Number.isInteger(input.minAge)||input.minAge<0||input.minAge>18))return{ok:false,code:'AGE_INVALID'}
 return{ok:true,character:{id:'npc_'+require('node:crypto').createHash('sha256').update(name+'|'+role+'|'+world).digest('hex').slice(0,14),name,role,world,bio,minAge:input.minAge??13,isAI:true,disclosure:'AI-operated fictional NPC',approvedForProduction:false,voiceEnabled:false,realWorldActions:false,requiresHumanPublishApproval:true,networkSpawnVerified:false,assetRigVerified:false}}
}
function actionAllowed(character,request={}){
 if(!character?.isAI)return{allowed:false,reason:'NOT_AI_CHARACTER'}
 if(!['greet','talk','guide','show_quest','open_approved_business_preview'].includes(request.type))return{allowed:false,reason:'ACTION_NOT_ALLOWED'}
 if(request.containsSensitiveData||request.requiresPayment||request.affectsInventory||request.changesAccounts)return{allowed:false,reason:'APPROVED_SYSTEM_REQUIRED'}
 if(request.world&&request.world!==character.world)return{allowed:false,reason:'WORLD_SCOPE_MISMATCH'}
 return{allowed:true,reason:'SAFE_FICTIONAL_ROLEPLAY_ONLY'}
}
module.exports={ROLES,WORLDS,validateCharacter,actionAllowed}
