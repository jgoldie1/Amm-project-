export type DeliveryMode = 'walk' | 'bike' | 'car' | 'van' | 'third_party' | 'robot' | 'drone';
export type OrderState = 'cart' | 'quoted' | 'payment_pending' | 'confirmed' | 'merchant_accepted' | 'preparing' | 'ready_for_pickup' | 'courier_assigned' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered' | 'problem' | 'cancelled' | 'refunded';

export type Money = { currency: string; amountMinor: number };
export type GeoPoint = { lat: number; lng: number; accuracyMeters?: number };

export type HoloCoupon = {
  id: string;
  code: string;
  title: string;
  kind: 'percent' | 'fixed' | 'free_delivery' | 'community' | 'sponsor';
  value: number;
  startsAt?: string;
  endsAt?: string;
  minimumSubtotalMinor?: number;
  merchantIds?: string[];
  maxRedemptions?: number;
  perAccountLimit?: number;
  communityCirculationEligible?: boolean;
  sponsorMissionId?: string;
  active: boolean;
};

export type CouponDecision = {
  valid: boolean;
  reason: string;
  discountMinor: number;
  deliveryDiscountMinor: number;
};

export function evaluateHoloCoupon(input: {
  coupon: HoloCoupon;
  merchantId: string;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  now?: Date;
}): CouponDecision {
  const { coupon, merchantId, subtotalMinor, deliveryFeeMinor } = input;
  const now = input.now ?? new Date();
  if (!coupon.active) return { valid: false, reason: 'Coupon is inactive.', discountMinor: 0, deliveryDiscountMinor: 0 };
  if (coupon.startsAt && now < new Date(coupon.startsAt)) return { valid: false, reason: 'Coupon has not started.', discountMinor: 0, deliveryDiscountMinor: 0 };
  if (coupon.endsAt && now > new Date(coupon.endsAt)) return { valid: false, reason: 'Coupon expired.', discountMinor: 0, deliveryDiscountMinor: 0 };
  if (coupon.merchantIds?.length && !coupon.merchantIds.includes(merchantId)) return { valid: false, reason: 'Coupon is not valid for this merchant.', discountMinor: 0, deliveryDiscountMinor: 0 };
  if (coupon.minimumSubtotalMinor && subtotalMinor < coupon.minimumSubtotalMinor) return { valid: false, reason: 'Minimum subtotal not met.', discountMinor: 0, deliveryDiscountMinor: 0 };

  let discountMinor = 0;
  let deliveryDiscountMinor = 0;
  if (coupon.kind === 'percent') discountMinor = Math.min(subtotalMinor, Math.round(subtotalMinor * (coupon.value / 100)));
  if (coupon.kind === 'fixed' || coupon.kind === 'community' || coupon.kind === 'sponsor') discountMinor = Math.min(subtotalMinor, Math.max(0, coupon.value));
  if (coupon.kind === 'free_delivery') deliveryDiscountMinor = deliveryFeeMinor;
  return { valid: true, reason: 'Coupon applied.', discountMinor, deliveryDiscountMinor };
}

export type DeliveryTrackingEvent = {
  id: string;
  orderId: string;
  state: OrderState;
  occurredAt: string;
  publicMessage: string;
  location?: GeoPoint;
  etaMinutes?: number;
  source: 'merchant' | 'courier' | 'provider' | 'system';
};

export type DeliveryTrackingView = {
  orderId: string;
  state: OrderState;
  statusLabel: string;
  etaMinutes?: number;
  courierLocation?: GeoPoint;
  events: DeliveryTrackingEvent[];
};

const labels: Record<OrderState, string> = {
  cart: 'Building order', quoted: 'Delivery quote ready', payment_pending: 'Waiting for payment confirmation',
  confirmed: 'Order confirmed', merchant_accepted: 'Merchant accepted', preparing: 'Preparing your order',
  ready_for_pickup: 'Ready for pickup', courier_assigned: 'Courier assigned', picked_up: 'Picked up',
  in_transit: 'On the way', arriving: 'Arriving soon', delivered: 'Delivered', problem: 'Delivery needs attention',
  cancelled: 'Cancelled', refunded: 'Refunded',
};

export function buildTrackingView(orderId: string, events: DeliveryTrackingEvent[]): DeliveryTrackingView {
  const sorted = [...events].filter((e) => e.orderId === orderId).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const latest = sorted.at(-1);
  const lastLocation = [...sorted].reverse().find((e) => e.location)?.location;
  const lastEta = [...sorted].reverse().find((e) => typeof e.etaMinutes === 'number')?.etaMinutes;
  const state = latest?.state ?? 'confirmed';
  return { orderId, state, statusLabel: labels[state], etaMinutes: lastEta, courierLocation: lastLocation, events: sorted };
}

export type DeliveryQuote = {
  providerId: string;
  mode: DeliveryMode;
  fee: Money;
  etaMinutes: number;
  available: boolean;
  unavailableReason?: string;
  legalSafetyVerified?: boolean;
};

export function chooseDeliveryQuote(quotes: DeliveryQuote[], preference: 'fastest' | 'lowest_cost' = 'lowest_cost') {
  const eligible = quotes.filter((q) => q.available && (q.mode !== 'drone' && q.mode !== 'robot' || q.legalSafetyVerified));
  return eligible.sort((a, b) => preference === 'fastest' ? a.etaMinutes - b.etaMinutes : a.fee.amountMinor - b.fee.amountMinor)[0];
}

export type DeliveryPrivacySettings = {
  preciseTrackingEnabled: boolean;
  shareCourierName: boolean;
  shareCustomerPhone: false;
  retainPreciseLocationMinutes: number;
};

export const defaultDeliveryPrivacy: DeliveryPrivacySettings = {
  preciseTrackingEnabled: true,
  shareCourierName: true,
  shareCustomerPhone: false,
  retainPreciseLocationMinutes: 60,
};

// Production rules:
// - authoritative order state and coupon redemption counts live server-side.
// - courier/customer phone numbers should be masked/proxied where possible.
// - precise courier/customer location is minimized and retained only as needed.
// - robot/drone quotes appear only from approved providers after legal/safety checks.
// - payment/discount settlement flows through Jin Pay + Money Engine, never client balances.
