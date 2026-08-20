export type RetailFulfillment='in_game_preview'|'pickup'|'local_delivery'|'shipping'
export type FuelType='gasoline_regular'|'gasoline_midgrade'|'gasoline_premium'|'diesel'|'ev_fast_charge'|'ev_level2'

export interface AllAmericanStorefront {
  id:string
  name:string
  districtId:string
  kind:'general_store'|'gas_station'|'hybrid'
  physicalLocationVerified:boolean
  address?:string
  hoursVerified:boolean
  taxConfigured:boolean
  posConnected:boolean
  inventoryConnected:boolean
  liveInWorld:boolean
  fulfillment:RetailFulfillment[]
}

export interface RetailSku {
  sku:string
  name:string
  category:'grocery'|'apparel'|'electronics'|'household'|'auto'|'creator_merch'|'other'
  priceCents:number
  stock:number
  taxable:boolean
  fulfillment:RetailFulfillment[]
}

export interface FuelPump {
  pumpId:string
  fuelTypes:FuelType[]
  pricePerUnitCents:number
  available:boolean
  providerMeterId?:string
  physicalMeterVerified:boolean
}

export interface FuelSession {
  sessionId:string
  userId:string
  vehicleId:string
  pumpId:string
  providerReceiptId:string
  quantity:number
  unit:'gallon'|'kwh'
  subtotalCents:number
  taxCents:number
  totalCents:number
  status:'authorized'|'dispensing'|'completed'|'refunded'|'cancelled'
}

export const ALL_AMERICAN_STORE:AllAmericanStorefront={
  id:'all-american-store-01',
  name:'All American Store',
  districtId:'streetverse_district_01',
  kind:'general_store',
  physicalLocationVerified:false,
  hoursVerified:false,
  taxConfigured:false,
  posConnected:false,
  inventoryConnected:false,
  liveInWorld:true,
  fulfillment:['in_game_preview'],
}

export const ALL_AMERICAN_GAS:AllAmericanStorefront={
  id:'all-american-gas-01',
  name:'All American Gas & Charge',
  districtId:'streetverse_district_01',
  kind:'gas_station',
  physicalLocationVerified:false,
  hoursVerified:false,
  taxConfigured:false,
  posConnected:false,
  inventoryConnected:false,
  liveInWorld:true,
  fulfillment:['in_game_preview'],
}

export const RETAIL_GAMEPLAY=[
  'walk_into_store',
  'browse_and_inspect_products',
  'creator_merch_popups',
  'npc_mpc_staff',
  'jobs_and_shift_missions',
  'pickup_counter',
  'delivery_dispatch',
  'vehicle_refuel_or_charge',
  'car_wash_and_basic_service_hooks',
  'world_pulse_changes_prices_crowds_and_stock',
  'receipts_feed_founder_revenue_cockpit',
] as const

export const REAL_RETAIL_LAUNCH_GATES=[
  'verify_legal_operator',
  'verify_physical_location',
  'verify_required_retail_and_fuel_permits',
  'configure_sales_and_fuel_taxes',
  'connect_pos_inventory_and_metering',
  'connect_payment_provider',
  'configure_refunds_chargebacks_and_receipts',
  'verify pump_meter_or_ev_charger integration',
  'configure safety_emergency_and_shutdown controls',
  'run sandbox purchase_and_fuel authorization',
  'run supervised physical fulfillment test',
  'security_privacy_and_compliance_review',
] as const

export function canAcceptRealRetailOrders(s:AllAmericanStorefront){
  return s.physicalLocationVerified&&s.hoursVerified&&s.taxConfigured&&s.posConnected&&s.inventoryConnected&&s.fulfillment.some(f=>f!=='in_game_preview')
}

export function canDispenseRealFuel(s:AllAmericanStorefront,pump:FuelPump){
  return s.kind!=='general_store'&&s.physicalLocationVerified&&s.taxConfigured&&s.posConnected&&pump.available&&pump.physicalMeterVerified
}

export const RETAIL_HYBRID_FLOW='STREETVERSE STORE/GAS → REAL INVENTORY OR PUMP CHECK → CART/AUTHORIZATION → MONEY ENGINE/PAYMENT PROVIDER → TAX → PICK/PACK OR FUEL/CHARGE → RECEIPT → FOUNDER REVENUE COCKPIT' as const
