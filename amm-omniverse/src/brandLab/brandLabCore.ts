export type BrandCategory =
  | 'fashion_apparel'
  | 'white_label_apparel'
  | 'custom_fragrance'
  | 'hair_products_wigs'
  | 'jewelry_accessories'
  | 'food_beverage'
  | 'print_on_demand'
  | 'packaging_manufacturing';

export type SupplierVerificationState = 'unverified' | 'self_reported' | 'verified' | 'suspended';

export type SupplierProfile = {
  id: string;
  name: string;
  categories: BrandCategory[];
  verificationState: SupplierVerificationState;
  country?: string;
  minimumOrderQuantity?: number;
  sampleAvailable?: boolean;
  certifications?: string[];
  leadTimeDays?: number;
  paymentTerms?: string;
  suspensionReason?: string;
};

export type BrandProjectStage =
  | 'concept'
  | 'palette_design'
  | 'product_design'
  | 'naming'
  | 'packaging'
  | 'supplier_search'
  | 'sample_review'
  | 'compliance_review'
  | 'pricing'
  | 'storefront'
  | 'content_launch'
  | 'marketplace_launch'
  | 'promotion'
  | 'fulfillment'
  | 'analytics';

export type BrandProject = {
  id: string;
  ownerId: string;
  name: string;
  category: BrandCategory;
  stage: BrandProjectStage;
  targetCustomer?: string;
  palette?: string[];
  productConcepts?: string[];
  shadeOrVariantNames?: string[];
  packagingNotes?: string;
  supplierIds?: string[];
  complianceStatus: 'not_started' | 'review_needed' | 'cleared_for_current_scope' | 'blocked';
  unitCostMinor?: number;
  targetPriceMinor?: number;
  estimatedGrossMarginPercent?: number;
  currency: string;
};

export type ManufacturingRFQ = {
  id: string;
  projectId: string;
  category: BrandCategory;
  quantity: number;
  specifications: string[];
  packagingRequirements?: string[];
  targetUnitCostMinor?: number;
  sampleRequired: boolean;
  dueAt?: string;
  invitedSupplierIds: string[];
  status: 'draft' | 'sent' | 'quotes_received' | 'selected' | 'cancelled';
};

export type BrandLabPricingMode = 'subscription' | 'project_fee' | 'success_fee' | 'hybrid';

export type BrandLabPricing = {
  mode: BrandLabPricingMode;
  monthlyPlatformFeeMinor?: number;
  projectSetupFeeMinor?: number;
  marketplaceFeePercent?: number;
  supplierSourcingFeePercent?: number;
  fulfillmentFeeMinor?: number;
  includedAiActions?: number;
  includedProjects?: number;
};

export function estimateBrandMargin(input: {
  salePriceMinor: number;
  productCostMinor: number;
  packagingCostMinor?: number;
  fulfillmentCostMinor?: number;
  paymentCostMinor?: number;
  tryammFeeMinor?: number;
}) {
  const totalCost =
    input.productCostMinor +
    (input.packagingCostMinor ?? 0) +
    (input.fulfillmentCostMinor ?? 0) +
    (input.paymentCostMinor ?? 0) +
    (input.tryammFeeMinor ?? 0);
  const profitMinor = input.salePriceMinor - totalCost;
  const grossMarginPercent = input.salePriceMinor > 0 ? (profitMinor / input.salePriceMinor) * 100 : 0;
  return { totalCostMinor: totalCost, profitMinor, grossMarginPercent };
}

export function canUseSupplierForProduction(supplier: SupplierProfile) {
  if (supplier.verificationState === 'suspended') {
    return { allowed: false, reason: supplier.suspensionReason ?? 'Supplier suspended.' };
  }
  if (supplier.verificationState !== 'verified') {
    return { allowed: false, reason: 'Supplier must be verified before production purchase orders.' };
  }
  return { allowed: true, reason: 'Supplier verified for production workflow.' };
}

export const defaultBrandLabHybridPricing: BrandLabPricing = {
  mode: 'hybrid',
  monthlyPlatformFeeMinor: 1900,
  projectSetupFeeMinor: 4900,
  marketplaceFeePercent: 5,
  supplierSourcingFeePercent: 3,
  includedAiActions: 500,
  includedProjects: 1,
};

// Product boundaries:
// - Compliance requirements vary by category and jurisdiction; regulated products stay gated until verified.
// - Food/beverage, cosmetics/fragrance, hair products, and other regulated goods require appropriate labeling/safety/compliance review.
// - Supplier verification is not a guarantee of performance; preserve audit evidence and dispute pathways.
// - Brand Lab supports creation, sourcing, storefront, promotion and analytics while keeping manufacturer/provider obligations explicit.
