'use strict';
const crypto=require('crypto');
const clean=(v,m=2000)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,m);
const sha=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
function event(input={}){const type=clean(input.type,120);if(!type)throw new Error('event_type_required');const aggregateId=clean(input.aggregateId,200);if(!aggregateId)throw new Error('aggregate_id_required');const key=clean(input.idempotencyKey,240)||sha(`${type}|${aggregateId}|${JSON.stringify(input.payload||{})}`);return {id:input.id||`evt_${crypto.randomBytes(10).toString('hex')}`,type,aggregateType:clean(input.aggregateType,80)||'unknown',aggregateId,idempotencyKey:key,payload:input.payload&&typeof input.payload==='object'?input.payload:{},metadata:input.metadata&&typeof input.metadata==='object'?input.metadata:{},occurredAt:input.occurredAt||new Date().toISOString(),status:'pending',attempts:0};}
function append(store,input={}){store.domainEvents||=[];const e=event(input);const existing=store.domainEvents.find(x=>x.idempotencyKey===e.idempotencyKey);if(existing)return {created:false,event:existing};store.domainEvents.push(e);return {created:true,event:e};}
function markProcessed(e){return {...e,status:'processed',processedAt:new Date().toISOString()}}
function markFailed(e,error){return {...e,status:'failed',attempts:Number(e.attempts||0)+1,lastError:clean(error?.message||error,1000),lastAttemptAt:new Date().toISOString()}}
function outboxMessage(e,input={}){return {id:`out_${sha(e.id).slice(0,24)}`,eventId:e.id,topic:clean(input.topic||e.type,120),destination:clean(input.destination,200)||null,payload:input.payload||e.payload,status:'pending',attempts:0,nextAttemptAt:new Date().toISOString(),createdAt:new Date().toISOString()};}
function retryDelay(attempt){return Math.min(3600000,Math.max(1000,1000*Math.pow(2,Math.max(0,Number(attempt)||0))))}
function retryMessage(m,now=Date.now()){const attempts=Number(m.attempts||0)+1;return {...m,status:'pending',attempts,nextAttemptAt:new Date(now+retryDelay(attempts)).toISOString()}}
module.exports={sha,event,append,markProcessed,markFailed,outboxMessage,retryDelay,retryMessage};
