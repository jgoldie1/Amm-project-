export type MerchantChannel = 'ai-storefront' | 'physical-store' | 'streetverse' | 'live-commerce' | 'creator-shop';

export type MerchantProfile = {
  merchantId: string;
  businessName: string;
  channels: MerchantChannel[];
  physicalLocations: Array<{ id: string; name: string; address: string; pickup: boolean; delivery: boolean }>;
  verification: 'draft' | 'pending' | 'verified' | 'restricted';
};

export type ProductListing = {
  sku: string;
  merchantId: string;
  title: string;
  description: string;
  brand?: string;
  category: string;
  priceCents: number;
  memberPriceCents?: number;
  currency: 'USD';
  stockOnHand: number;
  variants: Array<{ id: string; label: string; stock: number }>;
  media: Array<{ kind: 'image' | 'video' | 'glb'; url: string }>;
  fulfillment: Array<'ship' | 'pickup' | 'local-delivery' | 'digital'>;
  worldPlacement?: { world: string; storeId: string; shelfId?: string };
  creatorCommissionBps?: number;
  status: 'draft' | 'review' | 'active' | 'paused' | 'sold-out';
};

export const MERCHANT_JOIN_FLOW = [
  'CREATE TRYAMM BUSINESS ACCOUNT',
  'VERIFY BUSINESS / SELLER IDENTITY',
  'CONNECT PAYOUT ACCOUNT',
  'ADD PHYSICAL LOCATION OR AI-ONLY STOREFRONT',
  'CHOOSE PICKUP / DELIVERY / SHIPPING',
  'CREATE OR IMPORT PRODUCT CATALOG',
  'ADD SKU / PRICE / VARIANTS / INVENTORY / MEDIA',
  'OPTIONALLY GENERATE GLB DIGITAL TWIN WITH HOLOFORGE',
  'GUARDIAN CATALOG + POLICY CHECK',
  'PUBLISH TO AI STOREFRONT / STREETVERSE / LIVE / CREATOR SHOPS',
] as const;

export const PRODUCT_COMMERCE_LOOP = [
  'PRODUCT', 'INVENTORY', 'AI DISCOVERY', 'HOLO CONCIERGE', 'HOLO COUPON', 'CART',
  'GUARDIAN', 'PAYMENT', 'FULFILLMENT', 'TRACKING', 'DELIVERY/PICKUP', 'LOYALTY',
  'CREATOR ATTRIBUTION', 'REORDER',
] as const;

export function listingCanPublish(merchant: MerchantProfile, listing: ProductListing) {
  if (merchant.verification !== 'verified') return { ok: false, reason: 'Merchant verification required' } as const;
  if (listing.priceCents <= 0) return { ok: false, reason: 'Valid price required' } as const;
  if (!listing.title.trim() || !listing.sku.trim()) return { ok: false, reason: 'SKU and title required' } as const;
  if (!listing.fulfillment.length) return { ok: false, reason: 'At least one fulfillment method required' } as const;
  return { ok: true, reason: 'Ready for catalog review/publish' } as const;
}
