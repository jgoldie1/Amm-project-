import type { Money, OrderState } from './holoDeliveryCore';

export type Merchant = {
  id: string;
  ownerAccountId: string;
  name: string;
  categories: string[];
  communityBusiness?: boolean;
  accessibility?: string[];
  active: boolean;
};

export type MenuItem = {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  price: Money;
  available: boolean;
  imageUrl?: string;
  videoUrl?: string;
  arAssetUrl?: string;
  ingredientsDisclosure?: string[];
  allergenDisclosure?: string[];
};

export type CartLine = {
  id: string;
  menuItemId: string;
  merchantId: string;
  name: string;
  quantity: number;
  unitPrice: Money;
  notes?: string;
  participantAccountId?: string;
};

export type HoloCart = {
  id: string;
  accountId: string;
  merchantId: string;
  currency: string;
  lines: CartLine[];
  couponCodes: string[];
  groupOrderId?: string;
};

export function cartSubtotalMinor(cart: HoloCart) {
  return cart.lines.reduce((sum, line) => sum + line.unitPrice.amountMinor * Math.max(0, line.quantity), 0);
}

export type GroupOrderParticipant = {
  accountId: string;
  displayName: string;
  status: 'invited' | 'joined' | 'ready' | 'paid' | 'removed';
  contributionMinor?: number;
};

export type GroupOrder = {
  id: string;
  hostAccountId: string;
  merchantId: string;
  closesAt: string;
  paymentMode: 'host_pays' | 'split_evenly' | 'each_pays' | 'sponsor';
  participants: GroupOrderParticipant[];
  sponsorMissionId?: string;
};

export type CourierProfile = {
  id: string;
  accountId: string;
  displayName: string;
  modes: ('walk' | 'bike' | 'car' | 'van')[];
  verifiedForDelivery: boolean;
  accessibilityPreferences?: string[];
  active: boolean;
};

export type DeliveryProof = {
  orderId: string;
  method: 'photo' | 'pin' | 'signature' | 'merchant_handoff' | 'customer_confirmed';
  createdAt: string;
  storageRef?: string;
  confirmationCodeHash?: string;
  latitudeRounded?: number;
  longitudeRounded?: number;
};

export type DeliveryIssueType = 'missing_item' | 'wrong_item' | 'damaged' | 'late' | 'not_delivered' | 'unsafe_delivery' | 'merchant_issue' | 'courier_issue' | 'other';

export type DeliveryDispute = {
  id: string;
  orderId: string;
  openedByAccountId: string;
  type: DeliveryIssueType;
  status: 'open' | 'reviewing' | 'resolved_customer' | 'resolved_merchant' | 'partial_refund' | 'full_refund' | 'denied';
  description?: string;
  evidenceRefs?: string[];
  refundMinor?: number;
  createdAt: string;
  resolvedAt?: string;
};

export type SponsoredMealWallet = {
  id: string;
  accountId?: string;
  communityProgramId?: string;
  sponsorMissionId: string;
  currency: string;
  authorizedMinor: number;
  spentMinor: number;
  expiresAt?: string;
  restrictions?: {
    merchantIds?: string[];
    categories?: string[];
    maxOrderMinor?: number;
  };
};

export function sponsoredMealAvailableMinor(wallet: SponsoredMealWallet) {
  return Math.max(0, wallet.authorizedMinor - wallet.spentMinor);
}

export type FridgeInventoryItem = {
  id: string;
  ownerType: 'household' | 'community_fridge' | 'pantry' | 'merchant_surplus';
  ownerId: string;
  name: string;
  quantity: number;
  unit?: string;
  expiresAt?: string;
  safeForShare?: boolean;
  verifiedHandling?: boolean;
};

export type FridgeShareOffer = {
  id: string;
  sourceOwnerId: string;
  destinationProgramId?: string;
  inventoryItemIds: string[];
  status: 'draft' | 'available' | 'claimed' | 'pickup_scheduled' | 'in_transit' | 'received' | 'cancelled';
  pickupOrderId?: string;
  foodSafetyAttestationRequired: boolean;
};

export type HoloOrder = {
  id: string;
  accountId: string;
  merchantId: string;
  cartId: string;
  state: OrderState;
  subtotal: Money;
  discount: Money;
  deliveryFee: Money;
  tax?: Money;
  tip?: Money;
  total: Money;
  groupOrderId?: string;
  sponsoredMealWalletId?: string;
  courierId?: string;
  createdAt: string;
};

// Production notes:
// - Menu availability, cart pricing, coupon redemption, sponsored balances and order state are server-authoritative.
// - Allergy/ingredient information must come from merchant-provided/verified data; AI must not invent safety claims.
// - Delivery proof/evidence storage must be private, access-controlled and retained only as required.
// - Sponsored meal funds remain restricted in Money Engine until valid eligible spend or release.
