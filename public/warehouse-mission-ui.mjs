import {WAREHOUSE_MISSION_STAGES,WAREHOUSE_MISSION_ID,readWarehouseMission,saveWarehouseMission,resetWarehouseMission,advanceWarehouseMission} from './warehouse-mission-engine.mjs';
import {installWarehouseMyceliumBridge} from './warehouse-mycelium-bridge.mjs';
installWarehouseMyceliumBridge(window);
const $=id=>document.getElementById(id);
let state=readWarehouseMission(localStorage);
function emit(name,detail){dispatchEvent(new CustomEvent(name,{detail:{...detail,source:'tryamm-warehouse-demo',authoritative:false,realMoney:false}}));}
function render(message=''){
 const finished=state.completed;
 const step=WAREHOUSE_MISSION_STAGES[Math.min(state.stage,WAREHOUSE_MISSION_STAGES.length-1)];
 $('counter').textContent=finished?'SIX-MISSION CHAPTER COMPLETE':`Checkpoint ${state.stage+1} of ${WAREHOUSE_MISSION_STAGES.length}`;
 $('progress').style.width=`${state.stage/WAREHOUSE_MISSION_STAGES.length*100}%`;
 $('missionTitle').textContent=finished?'Delivery complete — Chicago checkpoint reached':step.title;
 $('instruction').textContent=finished?'Your fictional customer has received the package. You may replay safely without duplicate rewards.':step.instruction;
 $('next').hidden=finished;$('next').textContent=step.action;
 $('message').textContent=message||(finished?'SIMULATED RECEIPT SAVED — NO MONEY OR XP AWARDED':'Ready for your next action.');
 $('receipt').textContent=finished?`Demo receipt: ${state.receipt.reference} · Fictional mission only; not proof of stock, shipping or payment.`:'A demo-only completion receipt will appear here.';
}
$('next').addEventListener('click',()=>{
 try{
  if(state.completed)return;
  const step=WAREHOUSE_MISSION_STAGES[state.stage];
  state=advanceWarehouseMission(state,step.id);
  saveWarehouseMission(localStorage,state);
  emit('tryamm:warehouse-mission-progress',{missionId:WAREHOUSE_MISSION_ID,checkpoint:step.id,completed:state.completed});
  if(state.completed)emit('tryamm:streetverse-mission-complete',{missionId:WAREHOUSE_MISSION_ID,id:WAREHOUSE_MISSION_ID,simulated:true,noRewards:true});
  render(state.completed?'SIX-MISSION CHAPTER COMPLETE — DEMO RECEIPT READY':`✓ ${step.title.toUpperCase()}`);
 }catch(err){render(err.message||'Unable to save mission');}
});
$('replay').addEventListener('click',()=>{try{state=resetWarehouseMission(localStorage);render('Chapter reset; no real inventory or earned credits changed.')}catch(e){render('Browser storage unavailable.')}});
emit('tryamm:streetverse-mission-start',{missionId:WAREHOUSE_MISSION_ID,label:'All American Warehouse Delivery',simulated:true});
render();
