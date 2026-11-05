'use strict';
// Phase 1 accepts simulated input; it does not read EEG or decode thoughts.
const ACTIONS=Object.freeze({focus:'Highlight an item',select:'Preview selected item',cancel:'Cancel selection'});
function classifyFrame(frame,configuration={}){
 const signal=Number(frame.signal),noise=Number(frame.noise),ts=Number(frame.timestamp);
 const thresholds={qualityMaxNoise:0.25,selectMin:0.85,focusMin:0.65,...configuration};
 if(!Number.isFinite(signal)||!Number.isFinite(noise)||!Number.isFinite(ts)||signal<0||signal>1||noise<0||noise>1)return {state:'INVALID',action:null};
 if(noise>thresholds.qualityMaxNoise)return {state:'REJECTED_NOISY',action:null};
 if(frame.control==='cancel')return {state:'PREVIEW',action:'cancel',description:ACTIONS.cancel};
 if(frame.control!=='attention')return {state:'NO_ACTION',action:null};
 const action=signal>=thresholds.selectMin?'select':signal>=thresholds.focusMin?'focus':null;
 return action?{state:'PREVIEW',action,description:ACTIONS[action]}:{state:'NO_ACTION',action:null};
}
function createSession({minIntervalMs=700}={}){
 let lastAt=-Infinity;
 return {receive(frame){
  const result=classifyFrame(frame);
  if(result.action&&Number(frame.timestamp)-lastAt<minIntervalMs)return {state:'DEBOUNCED',action:null};
  if(result.action)lastAt=Number(frame.timestamp);
  return {...result,authorized:false,executed:false};
 }};
}
module.exports={classifyFrame,createSession};
