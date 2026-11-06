import {initialLivingWorldState,type LivingWorldState,applyStoreAction} from './StreetVerseLivingStoreRuntime'
/** Fictional wallet + inventory ledger, persisted locally. Never real currency or inventory. */
export type ShoppingLedger={version:1;world:LivingWorldState;completedMissionIds:string[];receipts:Array<{id:string;storeId:string;sku:string;quantity:number;credits:number;demo:true}>}
export const SHOPPING_SAVE_KEY='tryamm.streetverse.shopping-ledger.v1'
export const initialShoppingLedger=():ShoppingLedger=>({version:1,world:initialLivingWorldState(),completedMissionIds:[],receipts:[]})
export function awardDeliveryOnce(ledger:ShoppingLedger,id:string,storeId:string,sku:string,quantity:number,reward:number):ShoppingLedger{
 if(!id||ledger.completedMissionIds.includes(id)||!Number.isSafeInteger(reward)||reward<0||reward>1000||!Number.isSafeInteger(quantity)||quantity<1||quantity>25)return ledger
 const store=ledger.world.stores.find(s=>s.id===storeId&&s.sku===sku)
 if(!store)return ledger
 const restocked=applyStoreAction(ledger.world,{kind:'restock',storeId,quantity})
 if(!restocked.ok)return ledger
 return {...ledger,completedMissionIds:[...ledger.completedMissionIds,id],world:{...restocked.state,credits:restocked.state.credits+reward}}
}
export function buyGameProduct(ledger:ShoppingLedger,storeId:string,sku:string,quantity:number):{ledger:ShoppingLedger;ok:boolean;message:string}{
 const store=ledger.world.stores.find(s=>s.id===storeId)
 const result=applyStoreAction(ledger.world,{kind:'purchase',storeId,sku,quantity})
 if(!result.ok||!store)return {ledger,ok:false,message:result.reason}
 const receipt={id:'SHOP-'+String(ledger.receipts.length+1).padStart(5,'0'),storeId,sku,quantity,credits:store.priceCredits*quantity,demo:true as const}
 return {ledger:{...ledger,world:result.state,receipts:[...ledger.receipts,receipt]},ok:true,message:'Game purchase completed. Item added to your receipt history.'}
}
export function readShoppingLedger(raw:string|null):ShoppingLedger{
 if(!raw)return initialShoppingLedger()
 try{
  const data=JSON.parse(raw) as ShoppingLedger
  if(data?.version!==1||!data.world||!Array.isArray(data.world.stores)||!Number.isSafeInteger(data.world.credits)||data.world.credits<0||!Array.isArray(data.receipts)||!Array.isArray(data.completedMissionIds)||data.receipts.length>1000||data.completedMissionIds.length>1000)return initialShoppingLedger()
  if(data.world.stores.some(s=>!s||typeof s.id!=='string'||!Number.isSafeInteger(s.stock)||s.stock<0||!Number.isSafeInteger(s.priceCredits)||s.priceCredits<0))return initialShoppingLedger()
  return data
 }catch{return initialShoppingLedger()}
}
export const serializeShoppingLedger=(ledger:ShoppingLedger)=>JSON.stringify(ledger)
