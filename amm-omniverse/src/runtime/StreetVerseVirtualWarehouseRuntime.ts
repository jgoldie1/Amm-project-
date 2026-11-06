/** Local-only StreetVerse logistics simulation; no real inventory, freight or payments. */
export type WarehouseItem='uic-package'|'restaurant-supplies'|'studio-equipment'
export type WarehouseStock=Record<WarehouseItem,number>
export type WarehouseState={stock:WarehouseStock;reserved:WarehouseStock;fulfilled:number}
export const WAREHOUSE_LOCATION={x:-28,z:18} as const
export const WAREHOUSE_RADIUS=7
export const initialWarehouseState=():WarehouseState=>({stock:{'uic-package':5,'restaurant-supplies':8,'studio-equipment':3},reserved:{'uic-package':0,'restaurant-supplies':0,'studio-equipment':0},fulfilled:0})
export function warehouseNear(x:number,z:number,inVehicle:boolean){return !inVehicle&&Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-WAREHOUSE_LOCATION.x,z-WAREHOUSE_LOCATION.z)<=WAREHOUSE_RADIUS}
export function reserveWarehouseItem(state:WarehouseState,item:WarehouseItem):{ok:boolean;state:WarehouseState}{
 if(!Object.prototype.hasOwnProperty.call(state.stock,item)||state.stock[item]<=0)return {ok:false,state}
 return {ok:true,state:{...state,stock:{...state.stock,[item]:state.stock[item]-1},reserved:{...state.reserved,[item]:state.reserved[item]+1}}}
}
export function fulfillWarehouseItem(state:WarehouseState,item:WarehouseItem):{ok:boolean;state:WarehouseState}{
 if(!Object.prototype.hasOwnProperty.call(state.reserved,item)||state.reserved[item]<=0)return {ok:false,state}
 return {ok:true,state:{...state,reserved:{...state.reserved,[item]:state.reserved[item]-1},fulfilled:state.fulfilled+1}}
}
