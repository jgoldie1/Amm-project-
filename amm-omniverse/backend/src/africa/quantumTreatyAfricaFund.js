// Quantum Treaty Africa Fund policy layer.
// This file defines transparent routing of eligible TRYAMM margin and opt-in donations.
// It must never sweep customer, creator, worker, merchant, restricted, or regulated funds without explicit authorization.

export const AFRICA_COUNTRY_PACKS = Object.freeze({
  NG: { name: 'Nigeria', currency: 'NGN', paymentPartners: ['Flutterwave', 'Paystack'] },
  ZA: { name: 'South Africa', currency: 'ZAR', paymentPartners: ['Flutterwave', 'Paystack'] },
  KE: { name: 'Kenya', currency: 'KES', paymentPartners: ['Flutterwave', 'Paystack'] },
  GH: { name: 'Ghana', currency: 'GHS', paymentPartners: ['Flutterwave', 'Paystack'] },
});

export const AFRICA_FUND_BUCKETS = Object.freeze({
  education: 0.25,
  infrastructure: 0.20,
  entrepreneurship: 0.20,
  healthcareWellness: 0.10,
  housingCommunity: 0.10,
  agricultureFoodSystems: 0.05,
  digitalConnectivity: 0.05,
  emergencyReserve: 0.05,
});

export function calculateAfricaContribution({
  eligiblePlatformMarginUsd = 0,
  platformContributionRate = 0.10,
  optInDonationUsd = 0,
}) {
  const margin = Math.max(0, Number(eligiblePlatformMarginUsd || 0));
  const rate = Math.min(1, Math.max(0, Number(platformContributionRate || 0)));
  const donation = Math.max(0, Number(optInDonationUsd || 0));
  const companyContribution = Math.round(margin * rate * 100) / 100;
  return {
    companyContributionUsd: companyContribution,
    optInDonationUsd: Math.round(donation * 100) / 100,
    totalFundedUsd: Math.round((companyContribution + donation) * 100) / 100,
    contributionRate: rate,
  };
}

export function allocateAfricaFund(totalUsd) {
  const total = Math.max(0, Number(totalUsd || 0));
  return Object.fromEntries(
    Object.entries(AFRICA_FUND_BUCKETS).map(([bucket, weight]) => [
      bucket,
      Math.round(total * weight * 100) / 100,
    ])
  );
}

export function validateAfricaFundSource(source = {}) {
  const prohibited = [
    'customer_funds',
    'creator_payable',
    'worker_payable',
    'merchant_payable',
    'tax_reserve',
    'refund_reserve',
    'regulated_client_funds',
  ];
  if (prohibited.includes(source.type)) {
    return { allowed: false, reason: 'restricted_or_third_party_funds' };
  }
  if (source.type === 'user_donation' && source.explicitOptIn !== true) {
    return { allowed: false, reason: 'explicit_opt_in_required' };
  }
  return { allowed: true, reason: 'eligible_source' };
}
