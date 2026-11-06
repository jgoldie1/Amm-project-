/** StreetVerse-only warehouse-to-store mission. Never represents a real shipment. */
export type MissionStage='dispatch'|'pickup'|'drive'|'handoff'|'complete'
export type HoloMission={id:string;storeId:string;sku:string;quantity:number;stage:MissionStage;vanId:'holo-delivery-van';rewardCredits:number;arrived:boolean;demo:true}
export const initialHoloMission=():HoloMission=>({id:'HOLO-STORE-001',storeId:'creator',sku:'creator-shirt',quantity:3,stage:'dispatch',vanId:'holo-delivery-van',rewardCredits:35,arrived:false,demo:true})
export type MissionAction={type:'accept'|'pickup'|'enter-van'|'arrive'|'handoff';nearWarehouse?:boolean;nearStore?:boolean;vehicleId?:string;npcId?:string;packageAvailable?:boolean;onFoot?:boolean}
export function advanceHoloMission(mission:HoloMission,action:MissionAction):{mission:HoloMission;ok:boolean;message:string;reward:number}{
 const fail=(message:string)=>({mission,ok:false,message,reward:0})
 if(mission.stage==='dispatch'&&action.type==='accept')return {mission:{...mission,stage:'pickup'},ok:true,message:'Dispatch accepted. Travel to Roosevelt warehouse.',reward:0}
 if(mission.stage==='pickup'&&action.type==='pickup'){
  if(!action.nearWarehouse||!action.packageAvailable)return fail('Approach warehouse and collect the reserved package.')
  return {mission:{...mission,stage:'drive'},ok:true,message:'Package collected. Enter the Holo Delivery van.',reward:0}
 }
 if(mission.stage==='drive'&&action.type==='enter-van'){
  if(action.vehicleId!==mission.vanId)return fail('Enter the Holo Delivery van.')
  return {mission:{...mission,stage:'handoff'},ok:true,message:'Drive to the creator storefront and meet the vendor.',reward:0}
 }
 if(mission.stage==='handoff'&&action.type==='arrive'){
  if(!action.nearStore)return fail('Drive to the storefront destination.')
  return {mission:{...mission,arrived:true},ok:true,message:'Destination reached. Exit and hand package to the vendor.',reward:0}
 }
 if(mission.stage==='handoff'&&action.type==='handoff'){
  if(!mission.arrived||!action.nearStore||action.onFoot!==true||action.npcId!=='npc-creator-vendor')return fail('Meet the creator vendor at the storefront.')
  return {mission:{...mission,stage:'complete'},ok:true,message:'NPC vendor accepted package. Fictional mission completed.',reward:mission.rewardCredits}
 }
 return fail(mission.stage==='complete'?'Mission already completed.':'Complete the previous mission step first.')
}
