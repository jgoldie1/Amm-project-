/** Fictional living-world storefronts; never connected to real inventory or payments. */
export type StoreKind='creator-merch'|'restaurant'|'beauty'|'general'
export type LivingStore={id:string;name:string;kind:StoreKind;x:number;z:number;sku:string;stock:number;priceCredits:number;merchant:string}
export type StoreAction={kind:'browse'|'purchase'|'restock'|'npc-visit';storeId:string;sku?:string;quantity?:number}
export type LivingWorldState={stores:LivingStore[];credits:number;visits:number;transactions:number;tick:number}
export const initialLivingWorldState=():LivingWorldState=>({credits:250,visits:0,transactions:0,tick:0,stores:[
 {id:'creator',name:'TRYAMM Creator Merch',kind:'creator-merch',x:-12,z:12,sku:'creator-shirt',stock:8,priceCredits:20,merchant:'NPC Creator'},
 {id:'restaurant',name:'Chicago Community Kitchen',kind:'restaurant',x:18,z:20,sku:'meal-kit',stock:12,priceCredits:15,merchant:'NPC Cook'},
 {id:'beauty',name:'TeaAsia Beauty House',kind:'beauty',x:32,z:-12,sku:'beauty-kit',stock:6,priceCredits:25,merchant:'NPC Vendor'}
]})
export function applyStoreAction(state:LivingWorldState,action:StoreAction):{state:LivingWorldState;ok:boolean;reason:string}{
 const store=state.stores.find(s=>s.id===action.storeId);if(!store)return {state,ok:false,reason:'Unknown store'}
 if(action.kind==='browse')return {state:{...state,visits:state.visits+1},ok:true,reason:'Catalog opened'}
 if(action.kind==='npc-visit')return {state:{...state,visits:state.visits+1},ok:true,reason:store.merchant+' greeted a customer'}
 const quantity=action.quantity??1
 if(!Number.isSafeInteger(quantity)||quantity<1||quantity>25)return {state,ok:false,reason:'Invalid quantity'}
 if(action.kind==='restock')return {state:{...state,stores:state.stores.map(s=>s.id===store.id?{...s,stock:s.stock+quantity}:s)},ok:true,reason:'Fictional inventory restocked'}
 if(action.kind==='purchase'){
  if(action.sku!==store.sku)return {state,ok:false,reason:'SKU mismatch'}
  if(store.stock<quantity)return {state,ok:false,reason:'Out of stock'}
  const cost=store.priceCredits*quantity
  if(state.credits<cost)return {state,ok:false,reason:'Insufficient fictional credits'}
  return {state:{...state,credits:state.credits-cost,transactions:state.transactions+1,stores:state.stores.map(s=>s.id===store.id?{...s,stock:s.stock-quantity}:s)},ok:true,reason:'Fictional purchase completed'}
 }
 return {state,ok:false,reason:'Unsupported action'}
}
export function advanceLivingWorld(state:LivingWorldState):LivingWorldState{
 const tick=state.tick+1
 if(tick%5!==0)return {...state,tick}
 return {...state,tick,visits:state.visits+1,stores:state.stores.map((s,i)=>s.stock<3?{...s,stock:s.stock+3+i}:s)}
}
