/** Original playable acceptance simulator for West Side train mission.
 * This is NOT a certified CTA rail trip or mounted Three.js player transport.
 * Persist only to local storage; never authorize tickets, currency or rewards.
 */
export const CHICAGO_EL_JOURNEY_SCHEMA='tryamm.chicago-el-journey.v1';
export const CHICAGO_EL_JOURNEY_STAGES=Object.freeze([
 {id:'approach',title:'Approach the station',instruction:'Walk from the fictional West Side spawn toward the platform marker.',action:'APPROACH PLATFORM',pose:'walk'},
 {id:'door',title:'Open train doors',instruction:'Request the station door interaction and wait for the visual doors to open.',action:'OPEN TRAIN DOORS',pose:'reach'},
 {id:'board',title:'Board the train',instruction:'Board through the open door, keeping your saved player identity.',action:'BOARD TRAIN',pose:'step-up'},
 {id:'pose',title:'Choose a safe position',instruction:'Choose SIT or HOLD RAIL before starting the ride.',action:'CONFIRM POSE',pose:'sit-or-hold-rail'},
 {id:'ride',title:'Ride the Chicago L preview',instruction:'Watch the fictional elevated train travel to the medical district.',action:'RIDE TRAIN',pose:'seated-or-standing'},
 {id:'exit',title:'Exit at the medical district',instruction:'Open the exit doors and disembark at the fictional destination platform.',action:'EXIT TRAIN',pose:'step-down'},
 {id:'save',title:'Save and restore',instruction:'Save the character snapshot, reload it and compare its identity and inventory.',action:'SAVE & RELOAD',pose:'idle'}
]);
const strictString=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const allowedStage=n=>Number.isInteger(n)&&n>=0&&n<=CHICAGO_EL_JOURNEY_STAGES.length;
const poseChoice=new Set(['sit','hold-rail']);
export function newChicagoElJourney(characterId='bj-stubbs'){
 return {schema:CHICAGO_EL_JOURNEY_SCHEMA,characterId:strictString(characterId,90)||'bj-stubbs',
 stage:0,station:'west-side-fictional-platform',destination:'medical-district-fictional-platform',
 doorOpen:false,boarded:false,pose:null,trainPosition:0,exited:false,localSaveVerified:false,
 inventory:['mission-parcel'],passengerSeatId:null,creditsAwarded:0,paymentCreated:false,
 receipts:[],eventIds:[],lastAction:'new'}
}
export function validateChicagoElJourney(value){
 if(!value||value.schema!==CHICAGO_EL_JOURNEY_SCHEMA||!allowedStage(value.stage)||typeof value.characterId!=='string'||value.characterId.length>90)return false;
 if(!Array.isArray(value.inventory)||value.inventory.length>20||value.inventory.some(x=>typeof x!=='string'||x.length>80))return false;
 if(!Array.isArray(value.receipts)||value.receipts.length>50||!Array.isArray(value.eventIds)||value.eventIds.length>50)return false;
 return value.creditsAwarded===0&&value.paymentCreated===false&&Number.isFinite(value.trainPosition)&&value.trainPosition>=0&&value.trainPosition<=1&&
 (value.pose===null||poseChoice.has(value.pose))&&typeof value.doorOpen==='boolean'&&typeof value.boarded==='boolean'&&typeof value.exited==='boolean';
}
export function advanceChicagoElJourney(input,command,options={}){
 if(!validateChicagoElJourney(input))return {ok:false,reason:'Invalid journey state',state:input};
 const state=structuredClone(input),current=CHICAGO_EL_JOURNEY_STAGES[state.stage];
 if(!current)return {ok:false,reason:'Journey already complete',state:input,duplicate:true};
 const eventId=strictString(options.eventId,100);
 if(eventId&&state.eventIds.includes(eventId))return {ok:true,state:input,duplicate:true,reason:'Already processed; no duplicate reward'};
 if(command!==current.action)return {ok:false,reason:'Expected '+current.action,state:input};
 if(current.id==='approach')state.station='west-side-fictional-platform';
 if(current.id==='door')state.doorOpen=true;
 if(current.id==='board'){
  if(!state.doorOpen)return {ok:false,reason:'Doors must be open before boarding',state:input};
  state.boarded=true;state.passengerSeatId='passenger-1';state.doorOpen=false;
 }
 if(current.id==='pose'){
  if(!state.boarded)return {ok:false,reason:'Board first',state:input};
  if(!poseChoice.has(options.pose))return {ok:false,reason:'Choose sit or hold-rail',state:input};
  state.pose=options.pose;
 }
 if(current.id==='ride'){
  if(!state.boarded||!state.pose)return {ok:false,reason:'Boarding and safe pose required',state:input};
  state.trainPosition=1;state.station=state.destination;
 }
 if(current.id==='exit'){
  if(state.trainPosition!==1)return {ok:false,reason:'Train has not arrived',state:input};
  state.exited=true;state.boarded=false;state.doorOpen=true;state.passengerSeatId=null;state.pose=null;
 }
 if(current.id==='save'){
  if(!state.exited)return {ok:false,reason:'Exit before save verification',state:input};
  // The UI must first really persist and reload the exact snapshot; this marker
  // is NOT set in the pure engine and cannot be used as proof on its own.
 }
 state.stage++;state.lastAction=current.id;
 if(eventId)state.eventIds.push(eventId);
 state.receipts.push({step:current.id,action:command,simulated:true,playerPositionAuthority:false,
  rigAnimationPlayed:false,serverReceiptVerified:false,eventId:eventId||null,creditsAwarded:0});
 return {ok:true,state,duplicate:false,reason:current.title+' completed (local simulation only)'};
}
export function saveRestoreChicagoElJourney(state,storage){
 if(!validateChicagoElJourney(state))return {ok:false,reason:'Invalid save',state};
 const serial=JSON.stringify(state);
 try{
  storage.setItem(CHICAGO_EL_JOURNEY_SCHEMA,serial);
  const actual=storage.getItem(CHICAGO_EL_JOURNEY_SCHEMA);
  const restored=JSON.parse(actual||'null');
  const same=validateChicagoElJourney(restored)&&restored.characterId===state.characterId&&
   JSON.stringify(restored.inventory)===JSON.stringify(state.inventory)&&
   restored.stage===state.stage&&JSON.stringify(restored.receipts)===JSON.stringify(state.receipts);
  if(!same)return {ok:false,reason:'Save and reload mismatch',state};
  restored.localSaveVerified=true;
  storage.setItem(CHICAGO_EL_JOURNEY_SCHEMA,JSON.stringify(restored));
  return {ok:true,reason:'Local save/reload identity and inventory verified',state:restored};
 }catch{return {ok:false,reason:'Storage unavailable',state};}
}
export function runChicagoElOnePushTest(storage){
 let state=newChicagoElJourney();
 const commands=CHICAGO_EL_JOURNEY_STAGES.map((s,i)=>({action:s.action,eventId:'one-push-step-'+i,...(s.id==='pose'?{pose:'hold-rail'}:{})}));
 const results=[];
 for(const cmd of commands){const r=advanceChicagoElJourney(state,cmd.action,cmd);results.push({step:cmd.action,ok:r.ok,reason:r.reason});if(!r.ok)break;state=r.state}
 const saved=saveRestoreChicagoElJourney(state,storage);
 if(saved.ok)state=saved.state;
 return {schema:'tryamm.chicago-el-acceptance.v1',timestamp:new Date().toISOString(),
  passed:results.length===7&&results.every(r=>r.ok)&&saved.ok,
  steps:results,saveRestoreVerified:saved.ok,characterId:state.characterId,inventory:state.inventory,
  poseChosen:'hold-rail',receipts:state.receipts,simulatedJourney:true,
  actual3DCharacterVerified:false,actualTrainBoardingVerified:false,
  liveCTAData:false,serverSaveVerified:false,livekitVerified:false,platformCertified:false,
  cashFares:0,creditsAwarded:0,reason:'Stand-alone acceptance simulator; not an approved live train mission.'}
}
