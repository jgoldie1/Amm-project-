export type SupplierVerification = 'unverified' | 'self_reported' | 'verified' | 'suspended';
export type SupplierType = 'factory' | 'manufacturer' | 'wholesaler' | 'private_label' | 'dropshipper' | 'service_provider';

export type SupplierProfile = {
  id: string;
  name: string;
  countryCode: string;
  supplierType: SupplierType;
  verification: SupplierVerification;
  categories: string[];
  minimumOrderQuantity?: number;
  sampleAvailable?: boolean;
  certifications?: string[];
  lastVerifiedAt?: string;
  riskFlags?: string[];
};

export type ProductConcept = {
  id: string;
  ownerAccountId: string;
  category: string;
  conceptName: string;
  targetCustomer?: string;
  variants: Array<{ name: string; skuHint?: string }>;
  packagingNotes?: string;
  targetUnitCostMinor?: number;
  targetRetailPriceMinor?: number;
  targetMOQ?: number;
};

export type ManufacturingRFQ = {
  id: string;
  conceptId: string;
  requestedSupplierIds: string[];
  requestedMOQ: number;
  sampleRequired: boolean;
  targetUnitCostMinor?: number;
  destinationCountryCode: string;
  destinationPostalCode?: string;
  incotermPreference?: 'EXW' | 'FOB' | 'CIF' | 'DDP' | 'unspecified';
  complianceRequirements: string[];
  status: 'draft' | 'sent' | 'quotes_received' | 'sample_ordered' | 'sample_review' | 'approved' | 'rejected' | 'cancelled';
};

export type SupplierQuote = {
  id: string;
  rfqId: string;
  supplierId: string;
  moq: number;
  unitCostMinor: number;
  toolingCostMinor?: number;
  sampleCostMinor?: number;
  estimatedLeadDays: number;
  shippingEstimateMinor?: number;
  dutyEstimateMinor?: number;
  taxesEstimateMinor?: number;
  quoteCurrency: string;
  expiresAt?: string;
  notes?: string;
};

export type SampleOrder = {
  id: string;
  quoteId: string;
  supplierId: string;
  status: 'requested' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'testing' | 'approved' | 'rejected';
  testChecklist: string[];
  results?: Array<{ check: string; passed: boolean; note?: string }>;
};

export type LandedCostEstimate = {
  unitCostMinor: number;
  shippingMinor: number;
  dutyMinor: number;
  tariffMinor: number;
  taxesMinor: number;
  brokerageMinor: number;
  complianceMinor: number;
  totalMinor: number;
  currency: string;
  verifiedAt?: string;
  confidence: 'low' | 'medium' | 'high';
  sourceNotes: string[];
};

export function calculateLandedCost(input: Omit<LandedCostEstimate, 'totalMinor'>): LandedCostEstimate {
  return {
    ...input,
    totalMinor: input.unitCostMinor + input.shippingMinor + input.dutyMinor + input.tariffMinor + input.taxesMinor + input.brokerageMinor + input.complianceMinor,
  };
}

export function supplierCanReceiveRfq(supplier: SupplierProfile) {
  return supplier.verification !== 'suspended';
}

export function supplierBadge(supplier: SupplierProfile) {
  const labels: Record<SupplierVerification, string> = {
    unverified: 'UNVERIFIED',
    self_reported: 'SELF-REPORTED',
    verified: 'VERIFIED',
    suspended: 'SUSPENDED',
  };
  return labels[supplier.verification];
}

export type BrandLaunchStage =
  | 'concept'
  | 'palette_design'
  | 'naming_variants'
  | 'packaging'
  | 'supplier_search'
  | 'rfq'
  | 'sample'
  | 'compliance_review'
  | 'pricing'
  | 'storefront'
  | 'content_launch'
  | 'marketplace'
  | 'coupon'
  | 'payment'
  | 'fulfillment'
  | 'analytics';

export const brandLaunchFlow: BrandLaunchStage[] = [
  'concept','palette_design','naming_variants','packaging','supplier_search','rfq','sample','compliance_review','pricing','storefront','content_launch','marketplace','coupon','payment','fulfillment','analytics',
];

// Quantum Tariff Buster is a cost-comparison and sourcing optimizer, not a tariff-evasion tool.
// It may compare lawful countries of origin, suppliers, shipping terms, trade programs and landed costs,
// but must not falsify origin, misclassify goods, undervalue shipments or evade duties/taxes.
