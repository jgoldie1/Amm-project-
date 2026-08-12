// Sources that may fund El Saturn engineering/audit/mainnet work.
// A source becomes spendable only after the underlying transaction settles and required reserves/obligations are covered.

export const EL_SATURN_FUNDING_SOURCES = Object.freeze([
  { id: 'platform_margin', source: 'TRYAMM operating margin', risk: 'low', enabled: true },
  { id: 'enterprise_api', source: 'Enterprise/API/white-label contracts', risk: 'low', enabled: true },
  { id: 'developer_services', source: 'Developer tooling, hosting and support', risk: 'low', enabled: true },
  { id: 'sponsorships', source: 'Disclosed sponsorships and ecosystem grants', risk: 'medium', enabled: true },
  { id: 'education', source: 'Funded blockchain courses/labs/certification', risk: 'low', enabled: true },
  { id: 'marketplace_margin', source: 'Marketplace/sourcing/live-commerce margin', risk: 'low', enabled: true },
  { id: 'creator_margin', source: 'Platform share after creator obligations', risk: 'low', enabled: true },
  { id: 'token_sale', source: 'Token sale / investment proceeds', risk: 'high', enabled: false, requires: 'securities/commodities/money-transmission/legal review before activation' },
]);

export function calculateChainContribution({ settledRevenueUsd, directCostsUsd = 0, taxesUsd = 0, refundsReserveUsd = 0, fraudReserveUsd = 0, contractualPayablesUsd = 0, contributionRate = 0.05 }) {
  const safeBase = Math.max(0,
    Number(settledRevenueUsd || 0) -
    Number(directCostsUsd || 0) -
    Number(taxesUsd || 0) -
    Number(refundsReserveUsd || 0) -
    Number(fraudReserveUsd || 0) -
    Number(contractualPayablesUsd || 0)
  );
  const rate = Math.min(1, Math.max(0, Number(contributionRate || 0)));
  return {
    safeBaseUsd: Math.round(safeBase * 100) / 100,
    chainFundContributionUsd: Math.round(safeBase * rate * 100) / 100,
    contributionRate: rate,
  };
}
