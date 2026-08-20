export type HoloShopCategory = 'hair'|'makeup'|'fashion'|'shoes'|'glasses'|'jewelry'|'accessories'|'creator_merch'
export type TryOnMode = 'avatar'|'camera_ar'|'vr_mirror'|'mr_room'|'browser_3d'

export interface HoloShopProduct {
  id: string
  category: HoloShopCategory
  name: string
  priceCents: number
  creatorId?: string
  glbAssetId?: string
  physicalSku?: string
  virtualOnly: boolean
  tryOnModes: TryOnMode[]
  rightsVerified: boolean
  inventoryRequired: boolean
  deliveryEligible: boolean
}

export interface BeautyService {
  id: string
  kind: 'hair_style'|'barber'|'makeup_session'|'nails'|'styling'
  providerId: string
  priceCents: number
  durationMinutes: number
  physicalAppointment: boolean
  avatarPreview: boolean
}

export interface DeliveryOrder {
  orderId: string
  storeId: string
  customerId: string
  fulfillment: 'pickup'|'local_delivery'|'courier'|'marketplace_shipping'
  trackingRequired: boolean
  proofOfDeliveryRequired: boolean
  driverEarningsEligible: boolean
}

export const HOLO_SHOP_RULES = [
  'camera_try_on_requires_explicit_permission',
  'do_not_store_raw_camera_or_biometric_data_by_default',
  'physical_products_require_authoritative_inventory_before_checkout',
  'virtual_goods_require_server_authoritative_entitlement_receipt',
  'creator_products_require_rights_review_before sale',
  'prices_are_server_authoritative_and_may_vary_by_product',
  'physical_beauty_services_require_real_provider_availability',
  'delivery_requires dispatch_tracking_and_proof_of_delivery',
  'refund_chargeback_can_revoke_virtual_entitlement',
] as const

export const HOLO_SHOP_FLOW = [
  'discover_product',
  'preview_on_avatar_or_ar_vr_mr',
  'select_variant_or_service',
  'verify_inventory_or_provider_slot',
  'checkout_through_money_engine',
  'create_receipt_and_entitlement_or_order',
  'pickup_delivery_shipping_or_avatar_equip',
  'settle_creator_store_and_driver_payables',
] as const
