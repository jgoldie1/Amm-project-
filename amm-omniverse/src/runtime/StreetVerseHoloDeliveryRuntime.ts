/** Holo Delivery: fictional last-mile simulation only. No carrier, payments or external order integration. */
export type DeliveryStage='unassigned'|'assigned'|'picked-up'|'out-for-delivery'|'delivered'|'failed'|'returned'
export type DeliveryJob={id:string;orderId:string;driverId:string;stage:DeliveryStage;proofCode:string;attempts:number;demo:true}
export type DeliveryState={jobs:DeliveryJob[];sequence:number}
export const initialDeliveryState=():DeliveryState=>({jobs:[],sequence:1})
export function assignDelivery(state:DeliveryState,orderId:string,driverId:string,eligible:boolean):DeliveryState{
 if(!eligible||!orderId.trim()||!driverId.trim()||state.jobs.some(j=>j.orderId===orderId))return state
 const id='HOLO-'+String(state.sequence).padStart(4,'0')
 return {...state,sequence:state.sequence+1,jobs:[...state.jobs,{id,orderId,driverId,stage:'assigned',proofCode:'',attempts:0,demo:true}]}
}
export function advanceDelivery(state:DeliveryState,id:string,action:'pickup'|'depart'|'deliver'|'fail'|'return',proofCode=''):DeliveryState{
 const job=state.jobs.find(j=>j.id===id);if(!job)return state
 const next:Record<string,Partial<Record<DeliveryStage,DeliveryStage>>>={
 pickup:{assigned:'picked-up'},depart:{'picked-up':'out-for-delivery'},
 deliver:{'out-for-delivery':'delivered'},fail:{'out-for-delivery':'failed'},
 return:{failed:'returned'}
 }
 const stage=next[action]?.[job.stage];if(!stage)return state
 // A locally entered proof code is a simulated customer confirmation, NOT independently verified delivery.
 if(action==='deliver'&&(!proofCode.trim()||proofCode.trim().length<4))return state
 return {...state,jobs:state.jobs.map(j=>j.id===id?{...j,stage,proofCode:action==='deliver'?proofCode.trim().slice(0,32):j.proofCode,attempts:action==='fail'?j.attempts+1:j.attempts}:j)}
}
export type FulfillmentQuote={partnerId:string;pickPack:number;storage:number;shipping:number;lastMile:number;returns:number}
export function compareFulfillmentQuotes(quotes:FulfillmentQuote[],orders:number){
 if(!Number.isSafeInteger(orders)||orders<1)return []
 return quotes.filter(q=>Object.values(q).every(v=>typeof v==='string'||Number.isFinite(v))&&[q.pickPack,q.storage,q.shipping,q.lastMile,q.returns].every(v=>v>=0))
 .map(q=>({...q,total:q.storage+orders*(q.pickPack+q.shipping+q.lastMile+q.returns)})).sort((a,b)=>a.total-b.total)
}
export type SellerTier='starter'|'growth'|'enterprise'
export const DEMO_SELLER_PLANS:Record<SellerTier,{monthly:number;includedOrders:number;extraOrder:number}>={
 starter:{monthly:0,includedOrders:10,extraOrder:2.5},
 growth:{monthly:49,includedOrders:100,extraOrder:1.5},
 enterprise:{monthly:149,includedOrders:500,extraOrder:1}
}
export function estimateSellerPlan(tier:SellerTier,orders:number){
 if(!Number.isSafeInteger(orders)||orders<0)return null
 const plan=DEMO_SELLER_PLANS[tier];return plan.monthly+Math.max(0,orders-plan.includedOrders)*plan.extraOrder
}
export type InventorySyncResult={accepted:boolean;reason:string;nextVersion:number}
export function validateInventorySync(currentVersion:number,incomingVersion:number,quantity:number,authorized:boolean):InventorySyncResult{
 if(!authorized)return {accepted:false,reason:'Authentication required',nextVersion:currentVersion}
 if(!Number.isSafeInteger(quantity)||quantity<0)return {accepted:false,reason:'Invalid quantity',nextVersion:currentVersion}
 if(!Number.isSafeInteger(incomingVersion)||incomingVersion<=currentVersion)return {accepted:false,reason:'Stale or duplicate inventory update',nextVersion:currentVersion}
 return {accepted:true,reason:'Version accepted for simulation',nextVersion:incomingVersion}
}
export type ReturnStage='requested'|'approved'|'received'|'inspected'|'closed'
export function nextReturnStage(current:ReturnStage,action:'approve'|'receive'|'inspect'|'close'):ReturnStage|null{
 const transitions:Record<ReturnStage,Partial<Record<typeof action,ReturnStage>>>={
 requested:{approve:'approved'},approved:{receive:'received'},received:{inspect:'inspected'},inspected:{close:'closed'},closed:{}
 }
 return transitions[current][action]||null
}
