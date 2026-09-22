import {canFulfill,type HoloBusinessInventory} from './holoStorage'

export type HoloFulfillmentChannel='pickup'|'local-delivery'|'postal'|'rideshare-courier'|'drone'
export type HoloOrderStatus='pending'|'reserved'|'preparing'|'ready'|'dispatched'|'delivered'|'cancelled'|'returned'

export type HoloOrderLine={sku:string;name:string;quantity:number;unitPriceCents:number}
export type HoloCommerceOrder={
 id:string;businessId:string;customerId:string;lines:HoloOrderLine[]
 channel:HoloFulfillmentChannel;status:HoloOrderStatus
 subtotalCents:number;createdAt:string
}
export type HoloReservation={orderId:string;businessId:string;lines:{sku:string;quantity:number}[];reservedAt:string}
export type HoloLedgerIntent={id:string;orderId:string;businessId:string;kind:'sale'|'refund'|'storage-fee'|'fulfillment-fee'|'supplier-purchase';amountCents:number;status:'pending-server-verification'}

export function createOrder(input:Omit<HoloCommerceOrder,'subtotalCents'|'status'|'createdAt'>):HoloCommerceOrder{
 const subtotalCents=input.lines.reduce((sum,line)=>sum+line.quantity*line.unitPriceCents,0)
 return {...input,subtotalCents,status:'pending',createdAt:new Date().toISOString()}
}

export function reserveOrder(order:HoloCommerceOrder,inventory:HoloBusinessInventory):HoloReservation|null{
 const lines=order.lines.map(({sku,quantity})=>({sku,quantity}))
 if(order.businessId!==inventory.businessId||!canFulfill(inventory,lines))return null
 return {orderId:order.id,businessId:order.businessId,lines,reservedAt:new Date().toISOString()}
}

export function saleLedgerIntent(order:HoloCommerceOrder):HoloLedgerIntent{
 return {id:`sale:${order.id}`,orderId:order.id,businessId:order.businessId,kind:'sale',amountCents:order.subtotalCents,status:'pending-server-verification'}
}

export type HoloSupplier={id:string;name:string;businessId:string;skus:string[];fulfillmentRegions:string[]}
export type HoloStorageRental={id:string;ownerBusinessId:string;storageNodeId:string;tenantBusinessId:string;monthlyCents:number;status:'offered'|'active'|'paused'}
export type HoloReturn={id:string;orderId:string;sku:string;quantity:number;reason:string;status:'requested'|'approved'|'received'|'rejected'}
