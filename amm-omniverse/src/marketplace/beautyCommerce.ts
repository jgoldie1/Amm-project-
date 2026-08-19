export type BeautyCategory =
  | 'wigs'
  | 'lace_systems'
  | 'braiding_hair'
  | 'extensions'
  | 'natural_hair_products'
  | 'barber_supplies'
  | 'salon_supplies'
  | 'esthetician_supplies'
  | 'skincare'
  | 'bonnets_scarves'
  | 'tools'
  | 'professional_equipment';

export type BeautyProduct = {
  id: string;
  sellerId: string;
  supplierId?: string;
  sku: string;
  title: string;
  category: BeautyCategory;
  brand?: string;
  privateLabelEligible?: boolean;
  dropshipEligible?: boolean;
  wholesaleEligible?: boolean;
  inventoryOnHand: number;
  priceMinor: number;
  costMinor?: number;
  currency: string;
  hair?: {
    texture?: string;
    lengthInches?: number;
    color?: string;
    densityPercent?: number;
    laceType?: string;
    originClaim?: string;
  };
  holoTryOnAssetId?: string;
  threeDAssetId?: string;
  liveShoppingEligible?: boolean;
  active: boolean;
};

export type BeautySupplier = {
  id: string;
  businessName: string;
  verificationStatus: 'draft' | 'submitted' | 'verified' | 'rejected' | 'suspended';
  shipsDirectToCustomer: boolean;
  supportsWholesale: boolean;
  supportsPrivateLabel: boolean;
  minimumOrderMinor?: number;
  leadTimeDays?: number;
  supportedCategories: BeautyCategory[];
  trackingProviderRequired: boolean;
};

export type BeautyBundle = {
  id: string;
  title: string;
  productIds: string[];
  bundlePriceMinor: number;
  currency: string;
  bundleType: 'wig_kit' | 'hair_bundle' | 'braiding_kit' | 'barber_kit' | 'esthetician_kit' | 'salon_startup' | 'custom';
  active: boolean;
};

export type GroupBuy = {
  id: string;
  title: string;
  supplierId: string;
  productId?: string;
  category?: BeautyCategory;
  targetQuantity: number;
  committedQuantity: number;
  unitPriceMinor: number;
  currency: string;
  startsAt: string;
  endsAt: string;
  state: 'open' | 'target_met' | 'closed' | 'cancelled' | 'fulfilled';
};

export type PrivateLabelScenario = {
  productId: string;
  units: number;
  productCostMinor: number;
  packagingCostMinor: number;
  labelingCostMinor: number;
  freightCostMinor: number;
  fulfillmentCostMinor: number;
  marketplaceFeeMinor: number;
  sellingPriceMinor: number;
};

export function calculatePrivateLabelEconomics(s: PrivateLabelScenario) {
  const landedCostMinor = s.productCostMinor + s.packagingCostMinor + s.labelingCostMinor + s.freightCostMinor + s.fulfillmentCostMinor;
  const grossContributionPerUnitMinor = s.sellingPriceMinor - landedCostMinor - s.marketplaceFeeMinor;
  const totalContributionMinor = grossContributionPerUnitMinor * s.units;
  const contributionMarginPercent = s.sellingPriceMinor > 0 ? Math.round((grossContributionPerUnitMinor / s.sellingPriceMinor) * 10000) / 100 : 0;
  return { landedCostMinor, grossContributionPerUnitMinor, totalContributionMinor, contributionMarginPercent };
}

export type SellerFulfillmentMode = 'seller_ships' | 'supplier_dropship' | 'holo_package_delivery' | 'local_pickup';

export type ResaleOrder = {
  id: string;
  sellerId: string;
  supplierId?: string;
  productIds: string[];
  fulfillmentMode: SellerFulfillmentMode;
  trackingRequired: boolean;
  trackingCode?: string;
  state: 'ordered' | 'seller_confirmed' | 'supplier_confirmed' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'problem' | 'returned' | 'refunded';
};

export function canPublishBeautyProduct(product: BeautyProduct, supplier?: BeautySupplier) {
  if (!product.active) return { allowed: false, reason: 'Product is inactive.' };
  if (product.dropshipEligible && supplier?.verificationStatus !== 'verified') {
    return { allowed: false, reason: 'Dropship products require a verified supplier.' };
  }
  if (product.inventoryOnHand < 0) return { allowed: false, reason: 'Inventory cannot be negative.' };
  return { allowed: true, reason: 'Product can be listed.' };
}

// Commerce rules:
// - Origin/material/medical/skincare claims must come from verified supplier/manufacturer data.
// - TRYAMM must not invent product safety, ingredient, efficacy or hair-origin claims.
// - Dropship sellers must disclose seller/fulfillment policies and provide tracking where promised.
// - Private-label products require compliant labeling and product-category obligations before launch.
// - Holo Try-On is a visualization aid; color/fit/appearance can differ in real life.
