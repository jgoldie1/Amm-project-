// Planning assumptions only. No live account balances, payment calls or game income.
export const plans = Object.freeze({
  starter: { price: 29, serviceCost: 8 },
  growth: { price: 49, serviceCost: 14 },
  businessPass: { price: 149, serviceCost: 55 },
});
export function monthlyModel(counts, { serviceMultiplier = 1, fixedCosts = 300, acquisitionBudget = 200, commissionRate = 0.10, lossReserveRate = 0.02 } = {}) {
  for (const value of [serviceMultiplier, fixedCosts, acquisitionBudget, commissionRate, lossReserveRate]) {
    if (!Number.isFinite(value) || value < 0) throw new Error('Costs and rates must be finite and nonnegative');
  }
  if (commissionRate > 1 || lossReserveRate > 1) throw new Error('Rates must not exceed 1');
  for (const [id, count] of Object.entries(counts)) {
    if (!plans[id] || !Number.isSafeInteger(count) || count < 0) throw new Error('Unknown plan or invalid customer count');
  }
  const result = { customers: 0, revenue: 0, processing: 0, services: 0, commissions: 0, lossReserve: 0, fixedCosts, acquisitionBudget };
  for (const [id, plan] of Object.entries(plans)) {
    const count = counts[id] ?? 0;
    result.customers += count;
    result.revenue += count * plan.price;
    // Standard US domestic card 2.9% + $0.30, plus pay-as-you-go Billing 0.7%.
    result.processing += count * (plan.price * 0.036 + 0.30);
    result.services += count * plan.serviceCost * serviceMultiplier;
  }
  result.commissions = result.revenue * commissionRate;
  result.lossReserve = result.revenue * lossReserveRate;
  result.contribution = result.revenue - result.processing - result.services - result.commissions - result.lossReserve;
  result.operatingSurplus = result.contribution - fixedCosts - acquisitionBudget;
  result.averageContribution = result.customers ? result.contribution / result.customers : 0;
  result.breakEvenCustomers = result.averageContribution > 0 ? Math.ceil((fixedCosts + acquisitionBudget) / result.averageContribution) : null;
  return result;
}
export function launchPackageModel(deliveryCost = 200) {
  if (!Number.isFinite(deliveryCost) || deliveryCost < 0) throw new Error('Invalid delivery cost');
  const revenue = 499;
  const processing = revenue * 0.029 + 0.30;
  const lossReserve = revenue * 0.02;
  const commission = revenue * 0.10;
  return { revenue, processing, lossReserve, commission, deliveryCost, contribution: revenue - processing - lossReserve - commission - deliveryCost };
}
