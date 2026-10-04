export type FreightMode='parcel'|'ltl'|'ftl'|'intermodal'|'air'|'ocean'|'local'
export type FreightState='draft'|'quoted'|'approved'|'booked'|'picked-up'|'in-transit'|'delivered'|'exception'|'cancelled'
export type FreightDocumentType='BOL'|'POD'|'COMMERCIAL_INVOICE'|'PACKING_LIST'|'CUSTOMS'

export type FreightShipment={
 id:string;reference:string;mode:FreightMode;state:FreightState;origin:string;destination:string;
 pieces:number;weightLb:number;declaredValueMinor?:number;currency:'USD';hazmat:boolean;coldChain:boolean;
 supplierId?:string;merchantId?:string;orderIds:string[];carrierId?:string;quoteId?:string;
 requiresHumanApproval:boolean;externalBookingConfirmed:boolean;createdAt:string;updatedAt:string
}

export type FreightQuote={id:string;shipmentId:string;carrierId:string;amountMinor:number;currency:'USD';transitDays:number;service:string;authoritative:boolean;expiresAt?:string}
export type FreightMilestone={id:string;shipmentId:string;state:FreightState;occurredAt:string;message:string;authoritative:boolean;location?:string}
export type FreightDocument={id:string;shipmentId:string;type:FreightDocumentType;url?:string;verified:boolean;providerReference?:string}

export function freightCanBook(shipment:FreightShipment,quote?:FreightQuote){
 const blockers:string[]=[]
 if(!quote?.authoritative)blockers.push('authoritative_carrier_quote_required')
 if(shipment.hazmat)blockers.push('hazmat_requires_specialized_provider_review')
 if(shipment.requiresHumanApproval)blockers.push('human_approval_required')
 if(!shipment.origin||!shipment.destination)blockers.push('route_required')
 if(shipment.weightLb<=0)blockers.push('weight_required')
 return{eligible:blockers.length===0,blockers,externalConfirmationRequired:true}
}

export const FREIGHT_FLOW=[
 'DEMAND / ORDER','SUPPLIER / WAREHOUSE','SHIPMENT PLAN','RATE / QUOTE','CARRIER / 3PL SELECTION',
 'BOL / DOCUMENTS','HUMAN / POLICY APPROVAL','EXTERNAL BOOKING CONFIRMATION','PICKUP','IN TRANSIT',
 'CUSTOMS / EXCEPTION','POD','RECEIVING','LEDGER / SETTLEMENT','PERFORMANCE LEARNING'
] as const