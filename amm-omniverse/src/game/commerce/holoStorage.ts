export type HoloStorageKind='fridge'|'freezer'|'pantry'|'warehouse'|'locker'|'closet'|'garage'|'vault'
export type HoloInventoryUnit='each'|'case'|'pallet'|'lb'|'oz'|'kg'|'liter'

export type HoloInventoryItem={
 id:string;sku?:string;name:string;quantity:number;unit:HoloInventoryUnit
 expiresAt?:string;lot?:string;ownerId:string;storageId:string
}

export type HoloStorageNode={
 id:string;kind:HoloStorageKind;name:string;ownerId:string
 worldId:string;businessId?:string;capacity:number
 temperatureZone?:'ambient'|'chilled'|'frozen'
 virtual:boolean;physicalTwinId?:string
}

export type HoloBusinessInventory={
 businessId:string
 storage:HoloStorageNode[]
 items:HoloInventoryItem[]
 reorderPoints:Record<string,number>
}

export function inventoryStatus(inventory:HoloBusinessInventory){
 const quantityBySku:Record<string,number>={}
 for(const item of inventory.items){const key=item.sku||item.id;quantityBySku[key]=(quantityBySku[key]||0)+item.quantity}
 const lowStock=Object.entries(inventory.reorderPoints).filter(([sku,min])=>(quantityBySku[sku]||0)<=min).map(([sku])=>sku)
 const expiring=inventory.items.filter(x=>x.expiresAt&&Date.parse(x.expiresAt)>Date.now()&&Date.parse(x.expiresAt)-Date.now()<=72*60*60*1000)
 return {quantityBySku,lowStock,expiring}
}

export function canFulfill(inventory:HoloBusinessInventory,lines:{sku:string;quantity:number}[]){
 const status=inventoryStatus(inventory)
 return lines.every(line=>(status.quantityBySku[line.sku]||0)>=line.quantity)
}
