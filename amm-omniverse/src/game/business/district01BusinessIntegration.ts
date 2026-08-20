export type BusinessGateStatus = 'GREEN'|'YELLOW'|'RED'

export interface District01BusinessProof {
  gateId: string
  description: string
  requiredEvidence: ('ci'|'runtime'|'device'|'provider'|'visual_review')[]
  status: BusinessGateStatus
}

export const DISTRICT_01_BUSINESS_FLOW = [
  'player_enters_business',
  'catalog_loads',
  'inventory_or_service_availability_verified',
  'world_pulse_demand_applied_without_fabricating_stock',
  'product_or_service_selected',
  'try_on_or_preview_if_supported',
  'server_authoritative_price_resolved',
  'money_engine_checkout',
  'receipt_created',
  'inventory_reserved_or_digital_entitlement_created',
  'creator_store_driver_payables_recorded',
  'pickup_delivery_shipping_appointment_or_digital_equip',
  'proof_of_delivery_or_completion_recorded_when_required',
  'founder_revenue_cockpit_updated',
  'save_rejoin_preserves_order_and_entitlement_state',
] as const

export const DISTRICT_01_BUSINESS_GREEN_GATES: District01BusinessProof[] = [
  {gateId:'business_catalog',description:'YAHAVAH Grocery, All American Store, Gas/Charge and Holo Beauty/Fashion catalogs/services load in District 01',requiredEvidence:['ci','runtime'],status:'YELLOW'},
  {gateId:'variable_skin_pricing',description:'Creator cosmetics resolve server-authoritative variable prices and never trust client price',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'holo_try_on',description:'Hair, makeup, fashion and accessory previews work with avatar/browser 3D and permission-gated AR/XR paths',requiredEvidence:['runtime','visual_review'],status:'YELLOW'},
  {gateId:'inventory_reservation',description:'Physical orders cannot oversell and reserve authoritative inventory before fulfillment',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'service_booking',description:'Hair/barber/makeup/nail/styling appointments require real provider availability before real-world confirmation',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'checkout_receipt',description:'Sandbox checkout creates one authoritative receipt and prevents duplicate financial posting',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'creator_store_driver_split',description:'Gross sale, fees, taxes, creator/store/driver payables reconcile without counting liabilities as revenue',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'pickup_delivery',description:'Pickup/local delivery/courier/shipping states transition correctly with tracking and proof of delivery when required',requiredEvidence:['ci','runtime','device'],status:'YELLOW'},
  {gateId:'gas_charge_safety',description:'Game refuel/charge remains simulated until verified real meter, payment and physical safety controls exist',requiredEvidence:['ci','provider'],status:'YELLOW'},
  {gateId:'world_pulse_business_demand',description:'World Pulse changes foot traffic, staffing demand and promotions without inventing inventory or money',requiredEvidence:['ci','runtime'],status:'YELLOW'},
  {gateId:'jobs_and_staffing',description:'Store jobs and delivery work create gameplay progression while real earnings remain server-authoritative and eligibility-gated',requiredEvidence:['ci','runtime'],status:'YELLOW'},
  {gateId:'save_rejoin_business_state',description:'Orders, appointments, entitlements and fulfillment state survive save/rejoin without duplication',requiredEvidence:['ci','runtime'],status:'YELLOW'},
  {gateId:'founder_revenue_feed',description:'Commerce results feed the Founder Revenue Cockpit with gross volume, net revenue, fees, taxes and payables separated',requiredEvidence:['ci','runtime'],status:'YELLOW'},
]

export function evaluateDistrictBusinessGreen(gates: District01BusinessProof[]): BusinessGateStatus {
  if (gates.some(g => g.status === 'RED')) return 'RED'
  if (gates.every(g => g.status === 'GREEN')) return 'GREEN'
  return 'YELLOW'
}

export const BUSINESS_OS_LOCK = [
  'yahavah_grocery',
  'all_american_store',
  'all_american_gas_charge',
  'holo_beauty_fashion',
  'creator_cosmetics',
  'inventory',
  'services_and_appointments',
  'orders_and_receipts',
  'pickup_delivery_dispatch',
  'creator_store_driver_payables',
  'world_pulse_demand',
  'jobs_and_staffing',
  'founder_revenue_cockpit',
] as const
