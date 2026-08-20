export type BrandCategory = 'makeup' | 'skincare' | 'haircare' | 'fragrance' | 'beauty_accessory' | 'wellness_nonmedical' | 'other';

export type BrandProject = {
  id: string;
  ownerAccountId: string;
  brandName: string;
  category: BrandCategory;
  concept: string;
  status: 'idea' | 'design' | 'supplier_search' | 'samples' | 'compliance_review' | 'ready_to_launch' | 'live' | 'paused';
  targetMarket?: string;
  supplierIds: string[];
  productIds: string[];
  packagingIds: string[];
  createdAt: string;
};

export type MakeupPaletteDesign = {
  id: string;
  brandProjectId: string;
  name: string;
  format: 'eyeshadow' | 'face' | 'lip' | 'mixed';
  panCount: number;
  shadeNames: string[];
  finishTypes: Array<'matte' | 'satin' | 'shimmer' | 'metallic' | 'glitter' | 'other'>;
  layoutNotes?: string;
  artworkAssetIds: string[];
};

export type PackageDesign = {
  id: string;
  brandProjectId: string;
  packageType: 'palette_box' | 'mailer' | 'bottle' | 'jar' | 'tube' | 'pouch' | 'label' | 'insert' | 'other';
  dimensionsMm?: { width: number; height: number; depth: number };
  material?: string;
  artworkAssetIds: string[];
  dielineAssetId?: string;
  prototypeStatus: 'not_started' | 'digital_mockup' | 'sample_requested' | 'sample_received' | 'approved';
};

export type PrivateLabelSupplier = {
  id: string;
  name: string;
  categories: BrandCategory[];
  privateLabel: boolean;
  customFormula: boolean;
  minimumOrderQuantity?: number;
  regionsServed: string[];
  certificationsClaimed?: string[];
  verificationStatus: 'unverified' | 'self_reported' | 'verified' | 'suspended';
};

export type BrandComplianceChecklist = {
  brandProjectId: string;
  jurisdiction: string;
  ingredientListReceived: boolean;
  labelingReviewed: boolean;
  prohibitedClaimsReviewed: boolean;
  responsiblePartyIdentified: boolean;
  manufacturerInfoVerified: boolean;
  adverseEventProcessDefined: boolean;
  requiredRegistrationOrListingStatus: 'not_applicable' | 'unknown' | 'required' | 'submitted' | 'verified';
  notes: string[];
};

export type CreatorBrandRevenueShare = {
  brandProjectId: string;
  platformFeeType: 'subscription' | 'transaction_percentage' | 'service_fee' | 'hybrid';
  transactionPercent?: number;
  monthlyFeeMinor?: number;
  fixedServiceFeeMinor?: number;
  currency: string;
};

export function validateRevenueShare(model: CreatorBrandRevenueShare) {
  if (model.transactionPercent != null && (model.transactionPercent < 0 || model.transactionPercent > 30)) {
    return { valid: false, reason: 'Transaction percentage must be between 0% and 30%.' };
  }
  if ((model.monthlyFeeMinor ?? 0) < 0 || (model.fixedServiceFeeMinor ?? 0) < 0) {
    return { valid: false, reason: 'Fees cannot be negative.' };
  }
  return { valid: true, reason: 'Revenue-share structure is syntactically valid; legal/accounting review may still be required.' };
}

export type BrandLaunchStep =
  | 'business_passport'
  | 'brand_identity'
  | 'product_design'
  | 'supplier_selection'
  | 'sample_review'
  | 'compliance_review'
  | 'packaging'
  | 'pricing'
  | 'storefront'
  | 'content_launch'
  | 'marketplace_listing'
  | 'holo_coupon'
  | 'jin_pay'
  | 'fulfillment'
  | 'analytics';

export const creatorBrandLaunchFlow: BrandLaunchStep[] = [
  'business_passport','brand_identity','product_design','supplier_selection','sample_review',
  'compliance_review','packaging','pricing','storefront','content_launch','marketplace_listing',
  'holo_coupon','jin_pay','fulfillment','analytics',
];

// Safety/compliance boundaries:
// - TRYAMM may help design products, packaging, branding, sourcing, storefronts and launch workflows.
// - Manufacturing must be performed by qualified/verified suppliers.
// - Cosmetic/beauty labeling and claims must be reviewed for the target jurisdiction.
// - Do not market products with medical/drug claims unless the product and seller are appropriately authorized.
// - Supplier certifications are displayed with verification status; self-reported claims are not treated as independently verified.
// - Platform percentage/service fees must be transparent before the seller accepts them.
