export type InventoryState =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'IN_TRANSIT'
  | 'HOLD'
  | 'SOLD'
  | 'RETURNED'
  | 'LOW_STOCK'
  | 'REPLENISHMENT_RECOMMENDED'

export type StorageKind = 'SHELF' | 'STOCKROOM' | 'DRY' | 'REFRIGERATED' | 'FREEZER' | 'THIRD_PARTY'

export type InventoryLocation = {
  id: string
  merchantId: string
  name: string
  kind: StorageKind
  providerId?: string
  verified: boolean
}

export type InventorySku = {
  sku: string
  merchantId: string
  title: string
  locationId: string
  state: InventoryState
  onHand: number
  reserved: number
  reorderAt: number
  updatedAt: string
  lotId?: string
  expiresAt?: string
  temperatureMinC?: number
  temperatureMaxC?: number
  coldChainVerified?: boolean
}

export type InventoryReservation = {
  id: string
  sku: string
  merchantId: string
  orderId: string
  quantity: number
  state: 'ACTIVE' | 'RELEASED' | 'FULFILLED' | 'EXPIRED'
  createdAt: string
}

export function availableToPromise(item: InventorySku) {
  return Math.max(0, item.onHand - item.reserved)
}

export function deriveInventoryState(item: InventorySku): InventoryState {
  const available = availableToPromise(item)
  if (item.state === 'HOLD' || item.state === 'IN_TRANSIT' || item.state === 'SOLD' || item.state === 'RETURNED') return item.state
  if (available <= item.reorderAt) return available === 0 ? 'LOW_STOCK' : 'REPLENISHMENT_RECOMMENDED'
  return 'AVAILABLE'
}

export function reserveInventory(item: InventorySku, quantity: number, orderId: string, reservationId: string) {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Reservation quantity must be a positive integer')
  if (item.state === 'HOLD') throw new Error('Inventory on HOLD cannot be reserved')
  if (availableToPromise(item) < quantity) throw new Error('Insufficient available-to-promise inventory')
  const updated: InventorySku = { ...item, reserved: item.reserved + quantity, state: 'RESERVED', updatedAt: new Date().toISOString() }
  const reservation: InventoryReservation = {
    id: reservationId,
    sku: item.sku,
    merchantId: item.merchantId,
    orderId,
    quantity,
    state: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
  return { item: updated, reservation }
}

export function releaseReservation(item: InventorySku, reservation: InventoryReservation) {
  if (reservation.state !== 'ACTIVE') throw new Error('Only ACTIVE reservations can be released')
  if (reservation.sku !== item.sku || reservation.merchantId !== item.merchantId) throw new Error('Reservation does not match inventory authority')
  const next = { ...item, reserved: Math.max(0, item.reserved - reservation.quantity), updatedAt: new Date().toISOString() }
  return {
    item: { ...next, state: deriveInventoryState(next) },
    reservation: { ...reservation, state: 'RELEASED' as const },
  }
}

export function fulfillReservation(item: InventorySku, reservation: InventoryReservation) {
  if (reservation.state !== 'ACTIVE') throw new Error('Only ACTIVE reservations can be fulfilled')
  if (reservation.sku !== item.sku || reservation.merchantId !== item.merchantId) throw new Error('Reservation does not match inventory authority')
  if (item.reserved < reservation.quantity || item.onHand < reservation.quantity) throw new Error('Inventory invariant violated')
  const next = {
    ...item,
    onHand: item.onHand - reservation.quantity,
    reserved: item.reserved - reservation.quantity,
    updatedAt: new Date().toISOString(),
  }
  return {
    item: { ...next, state: deriveInventoryState(next) },
    reservation: { ...reservation, state: 'FULFILLED' as const },
  }
}

export function replenishmentSuggestion(item: InventorySku) {
  const available = availableToPromise(item)
  if (available > item.reorderAt) return null
  return {
    sku: item.sku,
    merchantId: item.merchantId,
    currentAvailable: available,
    suggestedQuantity: Math.max(1, item.reorderAt * 2 - available),
    state: 'REPLENISHMENT_RECOMMENDED' as const,
    requiresHumanApproval: true as const,
  }
}

export function coldChainCanSell(item: InventorySku, location: InventoryLocation) {
  const cold = location.kind === 'REFRIGERATED' || location.kind === 'FREEZER'
  if (!cold) return { ok: true, reason: 'Non-cold storage item' } as const
  if (!location.verified) return { ok: false, reason: 'Cold storage location must be verified' } as const
  if (item.coldChainVerified !== true) return { ok: false, reason: 'Cold-chain evidence required' } as const
  if (item.expiresAt && Date.parse(item.expiresAt) <= Date.now()) return { ok: false, reason: 'Expired inventory cannot be sold' } as const
  return { ok: true, reason: 'Cold-chain inventory eligible for commerce review' } as const
}
