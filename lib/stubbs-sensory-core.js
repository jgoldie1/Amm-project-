'use strict';
const crypto=require('node:crypto');
const TYPES=new Set(['vision','hearing','touch','smell','taste','game','device']);
const text=(v,n=1000)=>typeof v==='string'?v.trim().slice(0,n):'';
function parseEvent(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('event object required');
  if(JSON.stringify(input).length>7000)throw new TypeError('event too large');
  const type=text(input.type,32),source=text(input.source,60),observation=text(input.text,1000);
  if(!TYPES.has(type))throw new TypeError('unsupported sensory type');
  if(!/^[a-zA-Z0-9_-]{1,60}$/.test(source))throw new TypeError('invalid event source');
  if(!observation)throw new TypeError('text is required');
  return {id:'sense_'+crypto.randomBytes(12).toString('hex'),type,source,text:observation,consent:input.consent===true,at:new Date().toISOString()};
}
function interpret(event){
  const value=event.text.toLowerCase();
  const facts=[{predicate:'observed',subject:event.source,object:event.type}];
  let action='acknowledge',message='Event received. No device or world action was executed.';
  if(event.type==='game'&&/(circle park|laflin|ashland|marcus|checkpoint)/.test(value)){
    action='mission_hint';message='At Circle Park, Laflin is the residential entrance; Ashland is the office and senior building. Follow the mission marker.';
  }else if(event.type==='hearing'&&/(hello|help|talk|npc)/.test(value)){
    action='npc_dialogue';message='StreetVerse Director: Would you like the mission, directions, or a character conversation?';
  }else if(event.type==='vision'&&/(holo|clip|screen|video)/.test(value)){
    action='holo_screen';message='HoloScreen is ready for an authorized video clip; no original clip has been recovered yet.';
  }else if(event.type==='device'){
    action='device_notice';message='Device report received. Bluetooth, TV casting, and Jetson controls still require physical validation.';
  }else if(event.type==='touch'){
    action='accessibility_hint';message='Try large one-handed movement buttons, keyboard, or a compatible gamepad.';
  }
  const blocked=['smell','taste'].includes(event.type);
  return {facts,proposal:{action,message},decision:!event.consent?'BLOCK':blocked?'UNVERIFIED_HARDWARE':'PROPOSE',executed:false,modelUsed:false,selfAwarenessVerified:false};
}
module.exports={parseEvent,interpret,TYPES};
