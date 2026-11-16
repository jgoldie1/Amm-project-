// TRYAMM / StreetVerse warehouse delivery: offline fictional RP mission, not real commerce.
// Shared by TRYAMM app mission page and StreetVerse launch button.
export const WAREHOUSE_MISSION_KEY='tryamm.warehouse.delivery.chapter.v1';
export const WAREHOUSE_MISSION_ID='all-american-merch-route-001';
export const WAREHOUSE_MISSION_STAGES=Object.freeze([
 {id:'accept',title:'Accept the Chicago order',instruction:'The All American Records shop needs an original T-shirt and record delivered. Tap CONFIRM to accept this fictional order.',action:'CONFIRM ORDER'},
 {id:'inspect',title:'Inspect the warehouse parcel',instruction:'At the virtual warehouse, inspect the sealed All American package and its product label. This is simulated inventory.',action:'INSPECT PARCEL'},
 {id:'verify',title:'Check the warehouse receipt',instruction:'Ask the warehouse NPC to confirm a fictional receipt. No real inventory or blockchain record is changed.',action:'VERIFY RECEIPT'},
 {id:'load',title:'Load the delivery van',instruction:'Carry the virtual package to the marked van, then confirm that it is loaded.',action:'LOAD VAN'},
 {id:'deliver',title:'Deliver to the Chicago storefront',instruction:'Drive or take the accessible simulated transfer to the storefront, and hand the package to the shop NPC.',action:'HAND OFF PARCEL'},
 {id:'receipt',title:'Finish the delivery mission',instruction:'Review the fictional handoff and issue a demo-only completion receipt. No money or XP is awarded.',action:'COMPLETE MISSION'}
]);
export function initialWarehouseMission(){return {schema:1,missionId:WAREHOUSE_MISSION_ID,stage:0,completed:false,receipt:null,history:[]};}
export function isValidWarehouseMission(x){
 return x&&x.schema===1&&x.missionId===WAREHOUSE_MISSION_ID&&Number.isInteger(x.stage)&&x.stage>=0&&x.stage<=WAREHOUSE_MISSION_STAGES.length&&typeof x.completed==='boolean'&&Array.isArray(x.history)&&x.history.length<=WAREHOUSE_MISSION_STAGES.length&&x.history.every((e,i)=>e===WAREHOUSE_MISSION_STAGES[i]?.id)&&x.stage===x.history.length&&x.completed===(x.stage===WAREHOUSE_MISSION_STAGES.length);
}
export function advanceWarehouseMission(state,stageId){
 if(!isValidWarehouseMission(state))throw new Error('Mission save invalid; start a new demo');
 if(state.completed)return state;
 const expected=WAREHOUSE_MISSION_STAGES[state.stage];
 if(stageId!==expected.id)throw new Error('Complete the current checkpoint first');
 const stage=state.stage+1,completed=stage===WAREHOUSE_MISSION_STAGES.length;
 return {...state,stage,completed,history:[...state.history,stageId],receipt:completed?{type:'SIMULATED_MISSION_RECEIPT',missionId:WAREHOUSE_MISSION_ID,reference:'DEMO-CHICAGO-WAREHOUSE-001',notInventoryProof:true,notBlockchainProof:true,noPayment:true}:null};
}
export function readWarehouseMission(storage){
 try{const data=JSON.parse(storage.getItem(WAREHOUSE_MISSION_KEY)||'null');return isValidWarehouseMission(data)?data:initialWarehouseMission();}catch{return initialWarehouseMission();}
}
export function saveWarehouseMission(storage,state){
 if(!isValidWarehouseMission(state))throw new Error('Invalid mission state');storage.setItem(WAREHOUSE_MISSION_KEY,JSON.stringify(state));return state;
}
export function resetWarehouseMission(storage){const s=initialWarehouseMission();saveWarehouseMission(storage,s);return s;}
