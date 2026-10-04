export type CarrierId='fedex'|'ups'|'usps'|'dhl'|'supplier-direct'|'holo-local'|'third-party-3pl'
export type CarrierCapability='quote'|'label'|'tracking'|'pickup'|'international'|'returns'|'proof'

export type CarrierDefinition={
 id:CarrierId
 name:string
 capabilities:CarrierCapability[]
 external:boolean
}

export const CARRIER_NETWORK:CarrierDefinition[]=[
 {id:'fedex',name:'FedEx',capabilities:['quote','label','tracking','pickup','international','returns','proof'],external:true},
 {id:'ups',name:'UPS',capabilities:['quote','label','tracking','pickup','international','returns','proof'],external:true},
 {id:'usps',name:'USPS / Mail',capabilities:['quote','label','tracking','pickup','international','returns'],external:true},
 {id:'dhl',name:'DHL',capabilities:['quote','label','tracking','pickup','international','returns','proof'],external:true},
 {id:'supplier-direct',name:'Supplier Direct',capabilities:['tracking','returns','proof'],external:false},
 {id:'holo-local',name:'Holo Local Delivery',capabilities:['quote','tracking','pickup','returns','proof'],external:false},
 {id:'third-party-3pl',name:'Approved 3PL',capabilities:['quote','label','tracking','pickup','international','returns','proof'],external:false},
]

export type TrackingMilestone=
 'order-confirmed'|'supplier-accepted'|'label-created'|'picked-up'|'origin-facility'|
 'customs-export'|'in-transit'|'customs-import'|'destination-facility'|'out-for-delivery'|
 'delivery-attempt'|'delivered'|'return-started'|'returned'|'exception'

export type ProofTrackingEvent={
 id:string
 orderId:string
 carrier:CarrierId
 providerTrackingId?:string
 milestone:TrackingMilestone
 occurredAt:string
 publicMessage:string
 eta?:string
 proofType?:'carrier-scan'|'photo'|'signature'|'delivery-code'|'customs-event'
 authoritative:boolean
}

export function latestProofTracking(events:ProofTrackingEvent[]){
 const sorted=[...events].sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt))
 const latest=sorted.at(-1)
 return{
  latest,
  delivered:latest?.milestone==='delivered',
  hasAuthoritativeProof:events.some(e=>e.authoritative&&Boolean(e.proofType)),
  events:sorted
 }
}
