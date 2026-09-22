import type {HoloBusinessInventory,HoloInventoryItem} from './holoStorage'
import type {HoloCommerceOrder,HoloSupplier} from './holoSupplyNetwork'

export type InventoryScan={code:string;format:'qr'|'barcode'|'manual';storageId:string;quantity:number;scannedAt:string}
export type FoodSafetyFlag={itemId:string;severity:'info'|'warning'|'block';reason:string}
export type ReorderProposal={sku:string;quantity:number;supplierId?:string;reason:string;requiresApproval:true}
export type B2BPurchaseOrder={id:string;buyerBusinessId:string;supplierBusinessId:string;lines:{sku:string;quantity:number}[];status:'draft'|'approved'|'submitted'|'fulfilled'|'cancelled'}
export type FulfillmentCenter={id:string;businessId:string;name:string;regions:string[];storageNodeIds:string[];channels:('pickup'|'local-delivery'|'postal'|'rideshare-courier'|'drone')[]}
export type BusinessDigitalTwinLink={businessId:string;passportId:string;worldId:string;storefrontAssetId?:string;inventoryVisible:boolean}
export type DeliveryDispatch={id:string;orderId:string;channel:HoloCommerceOrder['channel'];status:'queued'|'assigned'|'picked-up'|'delivered'|'failed';providerRef?:string}
export type EarningsLedgerEntry={id:string;businessId:string;orderId:string;grossCents:number;feesCents:number;netCents:number;status:'pending-verification'|'verified'|'payable'|'paid'|'reversed';verifiedBy?:string}

export function foodSafetyFlags(items:HoloInventoryItem[],now=Date.now()):FoodSafetyFlag[]{
 return items.flatMap(item=>{
  if(!item.expiresAt)return[]
  const expiry=Date.parse(item.expiresAt)
  if(!Number.isFinite(expiry))return[{itemId:item.id,severity:'warning' as const,reason:'invalid-expiration-date'}]
  if(expiry<=now)return[{itemId:item.id,severity:'block' as const,reason:'expired'}]
  if(expiry-now<=72*60*60*1000)return[{itemId:item.id,severity:'warning' as const,reason:'expires-within-72-hours'}]
  return[]
 })
}

export function proposeReorders(inventory:HoloBusinessInventory,suppliers:HoloSupplier[]):ReorderProposal[]{
 const totals:Record<string,number>={}
 for(const item of inventory.items){if(item.sku)totals[item.sku]=(totals[item.sku]||0)+item.quantity}
 return Object.entries(inventory.reorderPoints).flatMap(([sku,min])=>{
  const current=totals[sku]||0
  if(current>min)return[]
  const supplier=suppliers.find(x=>x.skus.includes(sku))
  return[{sku,quantity:Math.max(min*2-current,1),supplierId:supplier?.id,reason:`stock ${current} <= reorder point ${min}`,requiresApproval:true as const}]
 })
}

export function marketplaceShelf(inventory:HoloBusinessInventory){
 const blocked=new Set(foodSafetyFlags(inventory.items).filter(x=>x.severity==='block').map(x=>x.itemId))
 return inventory.items.filter(x=>x.quantity>0&&!blocked.has(x.id)).map(x=>({sku:x.sku||x.id,name:x.name,available:x.quantity,storageId:x.storageId}))
}

export function createPendingEarnings(order:HoloCommerceOrder,feesCents:number):EarningsLedgerEntry{
 const safeFees=Math.max(0,Math.min(feesCents,order.subtotalCents))
 return {id:`earnings:${order.id}`,businessId:order.businessId,orderId:order.id,grossCents:order.subtotalCents,feesCents:safeFees,netCents:order.subtotalCents-safeFees,status:'pending-verification'}
}
