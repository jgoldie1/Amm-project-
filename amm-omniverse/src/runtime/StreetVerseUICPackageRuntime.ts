/** Local Chicago pilot package state. Physical proximity and interaction are verified by the world. */
export type UICPackageStage='awaiting-pickup'|'carrying'|'delivered'
export const UIC_PACKAGE_PICKUP={x:0,z:49} as const
export const UIC_PACKAGE_DROPOFF={x:24,z:-8} as const
export const UIC_PACKAGE_ID='chicago-uic-pilot-01'
export const UIC_PACKAGE_RADIUS=6
export function canInteractWithUICPackage(stage:UICPackageStage,action:'pickup'|'deliver',x:number,z:number,inVehicle:boolean){
 if(inVehicle)return false
 const target=action==='pickup'?UIC_PACKAGE_PICKUP:UIC_PACKAGE_DROPOFF
 return stage===(action==='pickup'?'awaiting-pickup':'carrying')&&Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-target.x,z-target.z)<=UIC_PACKAGE_RADIUS
}
