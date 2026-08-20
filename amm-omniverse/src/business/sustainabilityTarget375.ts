export type SustainabilityTarget = {
  minimumStrongHealthRatio: number;
  stretchTargetRatio: number;
  reserveTargetMonths: number;
  requirePositiveVariableContribution: boolean;
  requirePositiveOperatingSurplus: boolean;
};

export const TRYAMM_SUSTAINABILITY_TARGET: SustainabilityTarget = {
  minimumStrongHealthRatio: 3.0,
  stretchTargetRatio: 3.75,
  reserveTargetMonths: 12,
  requirePositiveVariableContribution: true,
  requirePositiveOperatingSurplus: true,
};

export type SustainabilitySnapshot = {
  eligiblePlatformRevenueMinor: number;
  infrastructureCostMinor: number;
  variableContributionMinor: number;
  fixedOperationsMinor: number;
  reserveContributionMinor: number;
};

export function evaluateSustainability375(snapshot: SustainabilitySnapshot) {
  const ratio = snapshot.infrastructureCostMinor > 0
    ? snapshot.eligiblePlatformRevenueMinor / snapshot.infrastructureCostMinor
    : Infinity;

  const operatingSurplusMinor =
    snapshot.variableContributionMinor - snapshot.fixedOperationsMinor - snapshot.reserveContributionMinor;

  return {
    ratio,
    strongHealthFloorMet: ratio >= TRYAMM_SUSTAINABILITY_TARGET.minimumStrongHealthRatio,
    stretchTargetMet: ratio >= TRYAMM_SUSTAINABILITY_TARGET.stretchTargetRatio,
    positiveVariableContribution: snapshot.variableContributionMinor > 0,
    positiveOperatingSurplus: operatingSurplusMinor > 0,
    operatingSurplusMinor,
    selfSupporting:
      ratio >= TRYAMM_SUSTAINABILITY_TARGET.minimumStrongHealthRatio &&
      snapshot.variableContributionMinor > 0 &&
      operatingSurplusMinor > 0,
    stretchHealthy:
      ratio >= TRYAMM_SUSTAINABILITY_TARGET.stretchTargetRatio &&
      snapshot.variableContributionMinor > 0 &&
      operatingSurplusMinor > 0,
  };
}

export function additionalRevenueNeededFor375(input: {
  infrastructureCostMinor: number;
  eligiblePlatformRevenueMinor: number;
}) {
  const targetRevenue = Math.round(
    input.infrastructureCostMinor * TRYAMM_SUSTAINABILITY_TARGET.stretchTargetRatio,
  );
  return Math.max(0, targetRevenue - input.eligiblePlatformRevenueMinor);
}

// Product language:
// - 3.00x is the minimum strong-health floor, not a guarantee of solvency.
// - 3.75x is the current TRYAMM stretch sustainability target (+25% over 3.00x).
// - The dashboard must use measured eligible revenue and measured costs.
// - Creator earnings, restricted funds, taxes, provider settlements and other liabilities are excluded from available platform revenue.
