import type { InventoryReservation, InventorySku } from './inventoryAuthority'
import { fulfillReservation, releaseReservation, reserveInventory } from './inventoryAuthority'

export type CommerceOrderState =
  | 'DRAFT'
  | 'INVENTORY_RESERVED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'FULFILLING'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'REVERSED'

export type MoneyClass = 'MERCHANT_PROCEEDS' | 'CREATOR_COMMISSION' | 'SCOUT_COMMISSION' | 'TRYAMM_REVENUE'
export type NonCashClass = 'XP' | 'HOLO_CREDITS'

export type CommerceLedgerEvent = {
  id: string
  orderId: string
  class: MoneyClass
  amountMinor: number
  currency: 'USD'
  state: 'PENDING' | 'PAYABLE' | 'REVERSED'
  sourceEventId: string
}

export type EngagementLedgerEvent = {
  id: string
  orderId?: string
  class: NonCashClass
  units: number
  state: 'EARNED' | 'REVERSED'
  cashValueMinor: 0
}

export type CommerceOrder = {
  id: string
  merchantId: string
  sku: string
  quantity: number
  totalMinor: number
  currency: 'USD'
  state: CommerceOrderState
  paymentProvider?: string
  providerPaymentId?: string
  providerVerifiedAt?: string
  reservation?: InventoryReservation
  creatorId?: string
  scoutId?: string
}

export function reserveOrderInventory(order: CommerceOrder, item: InventorySku, reservationId: string) {
  if (order.state !== 'DRAFT') throw new Error('Only DRAFT orders can reserve inventory')
  if (order.merchantId !== item.merchantId || order.sku !== item.sku) throw new Error('Order does not match inventory authority')
  const reserved = reserveInventory(item, order.quantity, order.id, reservationId)
  return { item: reserved.item, order: { ...order, state: 'INVENTORY_RESERVED' as const, reservation: reserved.reservation } }
}

export function markPaymentPending(order: CommerceOrder, provider: string) {
  if (order.state !== 'INVENTORY_RESERVED') throw new Error('Inventory reservation required before payment')
  return { ...order, state: 'PAYMENT_PENDING' as const, paymentProvider: provider }
}

export function verifyProviderPayment(order: CommerceOrder, evidence: { providerPaymentId: string; verifiedAt: string; amountMinor: number; currency: 'USD' }) {
  if (order.state !== 'PAYMENT_PENDING') throw new Error('PAYMENT_PENDING order required')
  if (evidence.amountMinor !== order.totalMinor || evidence.currency !== order.currency) throw new Error('Provider payment evidence does not reconcile to order')
  return { ...order, state: 'PAYMENT_VERIFIED' as const, providerPaymentId: evidence.providerPaymentId, providerVerifiedAt: evidence.verifiedAt }
}

export function beginFulfillment(order: CommerceOrder) {
  if (order.state !== 'PAYMENT_VERIFIED') throw new Error('Verified provider payment required before fulfillment')
  return { ...order, state: 'FULFILLING' as const }
}

export function completeFulfillment(order: CommerceOrder, item: InventorySku) {
  if (order.state !== 'FULFILLING' || !order.reservation) throw new Error('Active fulfillment reservation required')
  const result = fulfillReservation(item, order.reservation)
  return { item: result.item, order: { ...order, state: 'FULFILLED' as const, reservation: result.reservation } }
}

export function cancelBeforeFulfillment(order: CommerceOrder, item: InventorySku) {
  if (!order.reservation || order.reservation.state !== 'ACTIVE') throw new Error('Active reservation required for cancellation')
  if (order.state === 'FULFILLED') throw new Error('Fulfilled order requires refund/return workflow')
  const released = releaseReservation(item, order.reservation)
  return { item: released.item, order: { ...order, state: 'CANCELLED' as const, reservation: released.reservation } }
}

export function createMoneyLedgerEvents(order: CommerceOrder, allocation: { merchantMinor: number; creatorMinor?: number; scoutMinor?: number; tryammMinor: number }, sourceEventId: string) {
  if (order.state !== 'FULFILLED') throw new Error('Fulfilled order required before payable ledger creation')
  const creatorMinor = allocation.creatorMinor ?? 0
  const scoutMinor = allocation.scoutMinor ?? 0
  const total = allocation.merchantMinor + creatorMinor + scoutMinor + allocation.tryammMinor
  if (total !== order.totalMinor) throw new Error('Money allocation must reconcile exactly to order total')
  if (creatorMinor && !order.creatorId) throw new Error('Creator commission requires attributed creator')
  if (scoutMinor && !order.scoutId) throw new Error('Scout commission requires attributed scout')
  const rows: CommerceLedgerEvent[] = [
    { id: `${sourceEventId}:merchant`, orderId: order.id, class: 'MERCHANT_PROCEEDS', amountMinor: allocation.merchantMinor, currency: order.currency, state: 'PAYABLE', sourceEventId },
    { id: `${sourceEventId}:tryamm`, orderId: order.id, class: 'TRYAMM_REVENUE', amountMinor: allocation.tryammMinor, currency: order.currency, state: 'PAYABLE', sourceEventId },
  ]
  if (creatorMinor) rows.push({ id: `${sourceEventId}:creator`, orderId: order.id, class: 'CREATOR_COMMISSION', amountMinor: creatorMinor, currency: order.currency, state: 'PAYABLE', sourceEventId })
  if (scoutMinor) rows.push({ id: `${sourceEventId}:scout`, orderId: order.id, class: 'SCOUT_COMMISSION', amountMinor: scoutMinor, currency: order.currency, state: 'PAYABLE', sourceEventId })
  return rows
}

export function createEngagementReward(orderId: string, kind: NonCashClass, units: number): EngagementLedgerEvent {
  if (!Number.isInteger(units) || units <= 0) throw new Error('Reward units must be positive integers')
  return { id: `${orderId}:${kind}`, orderId, class: kind, units, state: 'EARNED', cashValueMinor: 0 }
}

export function reverseMoneyEvents(events: CommerceLedgerEvent[], sourceEventId: string) {
  return events.map((event) => ({ ...event, id: `${sourceEventId}:${event.id}`, state: 'REVERSED' as const, amountMinor: -Math.abs(event.amountMinor), sourceEventId }))
}

export const COMMERCE_TRANSACTION_TRUTH =
  'Holo Credits and XP are non-cash engagement units. Real-money payable ledgers require reconciled provider payment evidence, fulfillment evidence, attribution where applicable, and server-authoritative persistence.'
