'use strict';

const {rememberWorldFact}=require('./hologpt-world-memory');

const SENSES=['vision','hearing','touch','smell','taste'];
const clean=(v,n=1600)=>String(v??'').trim().slice(0,n);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));

const CAPABILITIES={
  vision:{mode:'native-or-provider',sources:['camera','image','video','screen','xr'],hardwareRequired:false},
  hearing:{mode:'native-or-provider',sources:['microphone','audio','speech','environment'],hardwareRequired:false},
  touch:{mode:'device-sensor',sources:['touch','pointer','haptic','controller','pressure-if-supported'],hardwareRequired:false},
  smell:{mode:'external-chemical-sensor',sources:['e-nose','voc-array','gas-sensor'],hardwareRequired:true},
  taste:{mode:'external-chemical-sensor',sources:['e-tongue','electrochemical-array','spectral-sensor'],hardwareRequired:true}
};

function normalizeObservation(input={}){
  const sense=clean(input.sense,40).toLowerCase();
  if(!SENSES.includes(sense))throw new Error('unsupported_sense');
  const capability=CAPABILITIES[sense];
  if(capability.hardwareRequired && input.sourceType==='camera')throw new Error(`${sense}_cannot_be_inferred_from_camera`);
  const observation={
    sense,
    sourceType:clean(input.sourceType,80)||'unknown',
    value:clean(input.value,2400),
    units:clean(input.units,80),
    confidence:clamp(input.confidence||.5),
    timestamp:clean(input.timestamp,80)||new Date().toISOString(),
    sourceId:clean(input.sourceId,240),
    hardwareRequired:capability.hardwareRequired,
    capabilityMode:capability.mode,
    simulated:input.simulated===true,
    meta:input.meta&&typeof input.meta==='object'?input.meta:{}
  };
  if(!observation.value)throw new Error('observation_value_required');
  return observation;
}

function fuseSensoryFrame(observations=[]){
  const normalized=observations.map(normalizeObservation);
  const bySense=Object.fromEntries(SENSES.map(s=>[s,[]]));
  for(const item of normalized)bySense[item.sense].push(item);
  const present=SENSES.filter(s=>bySense[s].length);
  const missing=SENSES.filter(s=>!bySense[s].length);
  const externalSensorNeeded=missing.filter(s=>CAPABILITIES[s].hardwareRequired);
  return {
    version:'hologpt.sense.v1',
    createdAt:new Date().toISOString(),
    present,
    missing,
    externalSensorNeeded,
    observations:normalized,
    summary:SENSES.map(s=>`${s}:${bySense[s].length}`).join(' | '),
    readiness:{
      vision:bySense.vision.length>0,
      hearing:bySense.hearing.length>0,
      touch:bySense.touch.length>0,
      smell:bySense.smell.length>0,
      taste:bySense.taste.length>0,
      fullFiveSense:present.length===5
    }
  };
}

async function rememberSensoryFrame(userId,frame,{world='TRYAMM',ttlDays=7}={}){
  if(!userId)throw new Error('userId is required');
  const facts=[];
  for(const obs of frame.observations){
    const result=await rememberWorldFact(userId,{
      subject:`${world}:${obs.sense}`,
      predicate:'observed',
      object:JSON.stringify({value:obs.value,units:obs.units,sourceType:obs.sourceType,timestamp:obs.timestamp,simulated:obs.simulated}),
      scope:'working',
      confidence:obs.confidence,
      sourceIds:obs.sourceId?[obs.sourceId]:[],
      ttlDays,
      context:{world,entityType:'sensory-observation',source:'hologpt-five-sense'}
    });
    facts.push(result.fact);
  }
  return {saved:true,count:facts.length,facts};
}

function sensePromptContext(frame){
  return {
    sensoryVersion:frame.version,
    presentSenses:frame.present,
    missingSenses:frame.missing,
    externalSensorNeeded:frame.externalSensorNeeded,
    observations:frame.observations.map(o=>({sense:o.sense,value:o.value,units:o.units,confidence:o.confidence,sourceType:o.sourceType,simulated:o.simulated}))
  };
}

module.exports={SENSES,CAPABILITIES,normalizeObservation,fuseSensoryFrame,rememberSensoryFrame,sensePromptContext};
