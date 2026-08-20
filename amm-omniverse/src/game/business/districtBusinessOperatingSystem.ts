export type BusinessType = 'yahavah_grocery'|'all_american_store'|'gas_charge'|'holo_beauty_fashion'|'creator_store'|'restaurant'|'service'
export type FulfillmentMode = 'in_store'|'pickup'|'local_delivery'|'courier'|'shipping'|'digital_entitlement'|'appointment'

export interface DistrictBusiness {
  id: string
  type: BusinessType
  physicalLocation?: string
  virtualLocationId: string
  verifiedForRealCommerce: boolean
  inventorySource: 'sandbox'|'pos'|'shopify'|'manual_verified'|'none'
  fulfillment: FulfillmentMode[]
  staffingEnabled: boolean
  worldPulseDemandEnabled: boolean
}

export interface BusinessOrder {
  orderId: string
  businessId: string
  customerId: string
  fulfillment: FulfillmentMode
  grossCents: number
  taxCents: number
  platformFeeCents: number
  creatorPayableCents: number
  storePayableCents: number
  driverPayableCents: number
  paymentReceiptId: string
  inventoryReserved: boolean
  status: 'created'|'paid'|'preparing'|'ready'|'dispatched'|'completed'|'refunded'|'cancelled'
}

export const DISTRICT_BUSINESS_SYSTEMS = [
  'catalog_and_inventory',
  'pricing_and_promotions',
  'appointments_and_services',
  'orders_and_receipts',
  'pickup_and_delivery',
  'dispatch_and_tracking',
  'proof_of_delivery',
  'creator_and_store_payables',
  'driver_earnings',
  'tax_and_refund_metadata',
  'world_pulse_demand',
  'staffing_and_jobs',
  'founder_revenue_cockpit_feed',
] as const

export const DISTRICT_BUSINESS_RULES = [
  'one_business_os_for_physical_and_in_world_storefronts',
  'real_commerce_stays_locked_until_business_provider_tax_inventory_and_fulfillment_are_verified',
  'money_engine_is_authoritative_for_real_value',
  'customer_principal_is_not_revenue',
  'creator_store_and_driver_amounts_remain_payables_until_settled',
  'world_pulse_can_change_demand_but_cannot_fabricate_inventory_or_provider_availability',
  'digital_try_on_does_not imply_physical_fit_or_product_availability',
  'gas_or_charging_dispense_requires_verified_physical_meter_and_safety_controls',
] as const

export const STREETVERSE_ANCHOR_BUSINESSES: DistrictBusiness[] = [
  {id:'yahavah-grocery-01',type:'yahavah_grocery',virtualLocationId:'district01-yahavah-grocery',verifiedForRealCommerce:false,inventorySource:'sandbox',fulfillment:['in_store','pickup','local_delivery'],staffingEnabled:true,worldPulseDemandEnabled:true},
  {id:'all-american-store-01',type:'all_american_store',virtualLocationId:'district01-all-american-store',verifiedForRealCommerce:false,inventorySource:'sandbox',fulfillment:['in_store','pickup','local_delivery','shipping'],staffingEnabled:true,worldPulseDemandEnabled:true},
  {id:'all-american-gas-charge-01',type:'gas_charge',virtualLocationId:'district01-gas-charge',verifiedForRealCommerce:false,inventorySource:'none',fulfillment:['in_store'],staffingEnabled:true,worldPulseDemandEnabled:true},
  {id:'holo-beauty-fashion-01',type:'holo_beauty_fashion',virtualLocationId:'district01-holo-shop',verifiedForRealCommerce:false,inventorySource:'sandbox',fulfillment:['in_store','pickup','local_delivery','shipping','digital_entitlement','appointment'],staffingEnabled:true,worldPulseDemandEnabled:true},
]
