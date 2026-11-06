/** Demo-only warehouse partner and customer order orchestration.
 * No external storefront, shipping carrier, FBA, TikTok, or payment credentials.
 * Never treat these records as verified real orders or inventory.
 */
export type PartnerStatus='applied'|'approved'|'rejected'
export type OrderStatus='pending'|'accepted'|'picked'|'packed'|'shipped'|'delivered'
export type WarehousePartner={id:string;name:string;region:string;status:PartnerStatus}
export type WarehouseSeller={id:string;name:string;status:'pending'|'approved'}
export type FulfillmentOrder={id:string;sellerId:string;partnerId:string;sku:string;quantity:number;status:OrderStatus;tracking:string;carrier:string;demo:true}
export type FulfillmentState={partners:WarehousePartner[];sellers:WarehouseSeller[];orders:FulfillmentOrder[];sequence:number}
export const FULFILLMENT_SAVE_KEY='tryamm.streetverse.fulfillment-demo.v1'
export const initialFulfillmentState=():FulfillmentState=>({partners:[],sellers:[],orders:[],sequence:1})
const clean=(s:string,max=80)=>s.trim().slice(0,max)
const unique=(prefix:string,sequence:number)=>prefix+'-'+String(sequence).padStart(4,'0')
export function addPartner(state:FulfillmentState,name:string,region:string):FulfillmentState{
 name=clean(name);region=clean(region);if(!name||!region)return state
 return {...state,partners:[...state.partners,{id:unique('WH',state.sequence),name,region,status:'applied'}],sequence:state.sequence+1}
}
export function approvePartner(state:FulfillmentState,id:string):FulfillmentState{
 return {...state,partners:state.partners.map(p=>p.id===id?{...p,status:'approved'}:p)}
}
export function addSeller(state:FulfillmentState,name:string):FulfillmentState{
 name=clean(name);if(!name)return state
 return {...state,sellers:[...state.sellers,{id:unique('SELLER',state.sequence),name,status:'pending'}],sequence:state.sequence+1}
}
export function approveSeller(state:FulfillmentState,id:string):FulfillmentState{
 return {...state,sellers:state.sellers.map(s=>s.id===id?{...s,status:'approved'}:s)}
}
export function createDemoOrder(state:FulfillmentState,sellerId:string,partnerId:string,sku:string,quantity:number):FulfillmentState{
 if(!state.sellers.some(s=>s.id===sellerId&&s.status==='approved')||!state.partners.some(p=>p.id===partnerId&&p.status==='approved'))return state
 if(!clean(sku)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100)return state
 return {...state,orders:[...state.orders,{id:unique('ORDER',state.sequence),sellerId,partnerId,sku:clean(sku),quantity,status:'pending',tracking:'',carrier:'',demo:true}],sequence:state.sequence+1}
}
const nextStatus:Partial<Record<OrderStatus,OrderStatus>>={pending:'accepted',accepted:'picked',picked:'packed',packed:'shipped',shipped:'delivered'}
export function advanceDemoOrder(state:FulfillmentState,id:string,carrier='',tracking=''):FulfillmentState{
 const order=state.orders.find(o=>o.id===id);if(!order)return state
 const next=nextStatus[order.status];if(!next)return state
 if(next==='shipped'&&(!clean(carrier)||!clean(tracking)))return state
 return {...state,orders:state.orders.map(o=>o.id===id?{...o,status:next,carrier:next==='shipped'?clean(carrier):o.carrier,tracking:next==='shipped'?clean(tracking):o.tracking}:o)}
}
export function readFulfillmentState(raw:string|null):FulfillmentState{
 if(!raw)return initialFulfillmentState()
 try{const value=JSON.parse(raw);if(value?.version!==1||!value?.state)return initialFulfillmentState();const s=value.state as FulfillmentState
 if(!Array.isArray(s.partners)||!Array.isArray(s.sellers)||!Array.isArray(s.orders)||!Number.isSafeInteger(s.sequence)||s.sequence<1||s.orders.length>500)return initialFulfillmentState()
 return s}catch{return initialFulfillmentState()}
}
export const serializeFulfillmentState=(state:FulfillmentState)=>JSON.stringify({version:1,state})
