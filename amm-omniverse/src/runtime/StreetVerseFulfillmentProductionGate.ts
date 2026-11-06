/** Fail-closed boundary: no demo data is ever eligible for real fulfillment. */
export type ProductionAuthorization={authenticated:boolean;role:'seller'|'warehouse-staff'|'admin'|'guest';sellerId?:string;partnerId?:string}
export type ProductionOrderEvidence={demo?:boolean;paymentVerified:boolean;agreementActive:boolean;inventoryConfirmed:boolean;carrierTrackingVerified:boolean;reconciled:boolean}
export function mayReleaseRealShipment(auth:ProductionAuthorization,order:ProductionOrderEvidence):boolean{
 return auth.authenticated===true&&auth.role==='warehouse-staff'&&Boolean(auth.partnerId)&&order.demo!==true&&order.paymentVerified===true&&order.agreementActive===true&&order.inventoryConfirmed===true&&order.carrierTrackingVerified===true&&order.reconciled===true
}
/** Pure policy check only; it does not implement secure server sessions or validate webhooks. */
export function mayApproveRealWarehouse(auth:ProductionAuthorization):boolean{return auth.authenticated===true&&auth.role==='admin'}
