import type { Money } from '../holoDelivery/holoDeliveryCore';

export type MarketplaceSellerType = 'creator' | 'business' | 'supplier' | 'individual' | 'community_org';
export type MarketplaceItemType = 'physical' | 'digital' | 'service' | 'ticket' | 'course' | 'subscription';
export type FulfillmentType = 'holo_delivery' | 'package_delivery' | 'pickup' | 'digital_delivery' | 'service_booking' | 'external_shipping';

export type MarketplaceSeller = {
  id: string;
  accountId: string;
  displayName: string;
  sellerType: MarketplaceSellerType;
  verifiedBusiness?: boolean;
  communityBusiness?: boolean;
  disabilityOwnedBusiness?: boolean;
  blackOwnedBusiness?: boolean;
  locationLabel?: string;
  rating?: number;
  completedOrders?: number;
};

export type MarketplaceListing = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  itemType: MarketplaceItemType;
  price: Money;
  quantityAvailable?: number;
  fulfillment: FulfillmentType[];
  imageUrls?: string[];
  category: string;
  tags: string[];
  active: boolean;
  creatorProjectId?: string;
  supplierCapabilityIds?: string[];
  accessibility?: {
    digitalAccessible?: boolean;
    pickupStepFree?: boolean;
    deliveryAvailable?: boolean;
    supportContact?: string;
  };
};

export type MarketplaceCartLine = {
  listingId: string;
  sellerId: string;
  title: string;
  quantity: number;
  unitPrice: Money;
  fulfillment: FulfillmentType;
};

export type MarketplaceCart = {
  id: string;
  accountId: string;
  lines: MarketplaceCartLine[];
  couponCodes: string[];
  updatedAt: string;
};

export type MarketplaceOrderState =
  | 'draft'
  | 'payment_pending'
  | 'paid'
  | 'seller_processing'
  | 'ready_for_fulfillment'
  | 'in_fulfillment'
  | 'delivered_or_completed'
  | 'problem'
  | 'return_requested'
  | 'refunded'
  | 'cancelled';

export type MarketplaceOrder = {
  id: string;
  buyerAccountId: string;
  sellerId: string;
  lines: MarketplaceCartLine[];
  subtotal: Money;
  discount: Money;
  deliveryOrShipping: Money;
  tax?: Money;
  total: Money;
  state: MarketplaceOrderState;
  fulfillmentReference?: string;
  jinPayReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  listingId?: string;
  reason: 'damaged' | 'wrong_item' | 'not_as_described' | 'missing' | 'late' | 'other';
  description: string;
  requestedAt: string;
  state: 'requested' | 'reviewing' | 'approved' | 'denied' | 'item_returned' | 'refunded';
};

export function cartSubtotal(cart: MarketplaceCart): Money {
  const currency = cart.lines[0]?.unitPrice.currency ?? 'USD';
  return {
    currency,
    amountMinor: cart.lines.reduce((sum, line) => sum + line.unitPrice.amountMinor * line.quantity, 0),
  };
}

export type MarketplaceDiscoveryLane =
  | 'for_you'
  | 'local'
  | 'black_business'
  | 'disability_owned'
  | 'creator_goods'
  | 'supplier_exchange'
  | 'community_circulation'
  | 'new_businesses';

export function marketplaceLaneMatches(lane: MarketplaceDiscoveryLane, seller: MarketplaceSeller, listing: MarketplaceListing) {
  switch (lane) {
    case 'black_business': return seller.blackOwnedBusiness === true;
    case 'disability_owned': return seller.disabilityOwnedBusiness === true;
    case 'creator_goods': return seller.sellerType === 'creator' || Boolean(listing.creatorProjectId);
    case 'supplier_exchange': return seller.sellerType === 'supplier' || Boolean(listing.supplierCapabilityIds?.length);
    case 'community_circulation': return seller.communityBusiness === true;
    case 'new_businesses': return (seller.completedOrders ?? 0) < 50;
    case 'local': return Boolean(seller.locationLabel);
    case 'for_you': default: return true;
  }
}

// Fulfillment rule: physical marketplace orders should route into Holo Delivery/package delivery
// when selected; digital items/services must not create fake courier jobs.
// Payment authority remains Jin Pay + Money Engine; marketplace UI never edits authoritative balances.
