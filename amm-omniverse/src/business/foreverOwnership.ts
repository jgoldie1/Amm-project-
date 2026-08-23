export type ForeverWebsitePlan = {
  id: string;
  accountId: string;
  siteId: string;
  purchasedAt: string;
  purchaseAmountMinor: number;
  currency: string;
  hostingReserveMinor: number;
  includedStorageGb: number;
  includedMonthlyBandwidthGb: number;
  includedAiActionsMonthly?: number;
  status: 'active' | 'reserve_low' | 'migration_required' | 'closed';
};

export type ForeverDomainReserve = {
  id: string;
  accountId: string;
  domainName: string;
  registrarProviderId?: string;
  yearsFunded: number;
  reserveBalanceMinor: number;
  estimatedRenewalMinor: number;
  nextRenewalAt?: string;
  autoRenewEnabled: boolean;
  status: 'planned' | 'funded' | 'registered' | 'renewal_due' | 'reserve_low' | 'expired' | 'transferred';
};

export function estimateDomainReserve(input: {
  annualRenewalMinor: number;
  years: number;
  annualInflationBufferPercent?: number;
}) {
  const inflation = (input.annualInflationBufferPercent ?? 5) / 100;
  let total = 0;
  for (let year = 0; year < input.years; year += 1) {
    total += Math.round(input.annualRenewalMinor * Math.pow(1 + inflation, year));
  }
  return total;
}

export function evaluateForeverWebsite(plan: ForeverWebsitePlan, measuredMonthlyCostMinor: number) {
  const runwayMonths = measuredMonthlyCostMinor > 0 ? plan.hostingReserveMinor / measuredMonthlyCostMinor : Infinity;
  return {
    runwayMonths,
    sustainableAtCurrentCost: runwayMonths >= 120,
    needsReview: runwayMonths < 120,
  };
}

export type OwnershipExport = {
  siteId: string;
  exportFormats: Array<'html' | 'css' | 'js' | 'assets' | 'content_json' | 'dns_records'>;
  domainTransferSupported: boolean;
  customerOwnsExportedSiteContent: boolean;
};

// Product language rules:
// 1. A conventional DNS domain is never promised as literally free/permanent: registries/registrars charge recurring renewal fees.
// 2. "Forever Domain" means TRYAMM manages renewals from a funded reserve for the disclosed funded term/conditions.
// 3. "Forever Website" means no recurring TRYAMM website-builder subscription for the purchased entitlement, subject to disclosed fair-use limits.
// 4. Customers retain export/transfer pathways so a lifetime entitlement is not dependent on TRYAMM operating forever.
// 5. AI, premium data, high-bandwidth video, commerce providers and third-party services may remain metered or separately priced.
