/** Local fictional shop economy. No real money, orders, payouts or payment authorization. */
export type ShopLedger={version:1;credits:number;inventory:Record<string,number>;receipts:{id:string;kind:'purchase'|'mission';sku:string;quantity:number;creditsDelta:number}[]}
export const SHOP_LEDGER_KEY='tryamm.streetverse.shop-ledger.demo.v1'
export const initialShopLedger=():ShopLedger=>({version:1,credits:250,inventory:{'creator-shirt':0,'meal-kit':0,'beauty-kit':0},receipts:[]})
export function parseShopLedger(raw:string|null):ShopLedger{
 if(!raw)return initialShopLedger()
 try{const s=JSON.parse(raw);if(s?.version!==1||!Number.isSafeInteger(s.credits)||s.credits<0||s.credits>10000000||!s.inventory||typeof s.inventory!=='object'||Array.isArray(s.inventory)||!Array.isArray(s.receipts)||s.receipts.length>1000)return initialShopLedger()
 if(!Object.values(s.inventory).every(v=>Number.isSafeInteger(v)&&Number(v)>=0&&Number(v)<=100000))return initialShopLedger()
 if(!s.receipts.every((r:ShopLedger['receipts'][number])=>r&&typeof r.id==='string'&&typeof r.sku==='string'&&Number.isSafeInteger(r.quantity)&&Number.isSafeInteger(r.creditsDelta)&&['purchase','mission'].includes(r.kind)))return initialShopLedger()
 return s as ShopLedger}catch{return initialShopLedger()}
}
export function buyFictionalItem(state:ShopLedger,receiptId:string,sku:string,quantity:number,unitPrice:number,available:number):ShopLedger{
 if(!receiptId||state.receipts.some(r=>r.id===receiptId)||!sku||!Number.isSafeInteger(quantity)||quantity<1||quantity>25||!Number.isSafeInteger(unitPrice)||unitPrice<0||!Number.isSafeInteger(available)||available<quantity)return state
 const cost=quantity*unitPrice;if(!Number.isSafeInteger(cost)||state.credits<cost)return state
 return {...state,credits:state.credits-cost,inventory:{...state.inventory,[sku]:(state.inventory[sku]||0)+quantity},receipts:[...state.receipts,{id:receiptId,kind:'purchase',sku,quantity,creditsDelta:-cost}]}
}
export function creditMissionOnce(state:ShopLedger,missionId:string,sku:string,quantity:number,reward:number):ShopLedger{
 if(!missionId||state.receipts.some(r=>r.id==='mission:'+missionId)||!sku||!Number.isSafeInteger(quantity)||quantity<1||quantity>25||!Number.isSafeInteger(reward)||reward<0||reward>1000)return state
 return {...state,credits:state.credits+reward,receipts:[...state.receipts,{id:'mission:'+missionId,kind:'mission',sku,quantity,creditsDelta:reward}]}
}
