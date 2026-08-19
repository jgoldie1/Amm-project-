export type GameId = 'quantum-racer' | 'judah-chainbreakers' | 'tryamm-hoops';

export type AllocationBucket =
  | 'player_prize'
  | 'legacy_allocation'
  | 'charity_allocation'
  | 'tryamm_platform_revenue';

export type AllocationRule = {
  bucket: AllocationBucket;
  basisPoints: number;
  beneficiaryId?: string;
  restricted: boolean;
};

export type EventEconomyConfig = {
  gameId: GameId;
  eventId: string;
  grossEligibleRevenueMinor: number;
  currency: string;
  allocations: AllocationRule[];
};

export type AllocationResult = {
  bucket: AllocationBucket;
  amountMinor: number;
  beneficiaryId?: string;
  restricted: boolean;
};

export function validateAllocationConfig(config: EventEconomyConfig) {
  const totalBps = config.allocations.reduce((sum, item) => sum + item.basisPoints, 0);
  if (totalBps !== 10_000) {
    throw new Error(`Allocation rules must equal 10000 basis points; received ${totalBps}.`);
  }
  for (const rule of config.allocations) {
    if (rule.basisPoints < 0 || rule.basisPoints > 10_000) {
      throw new Error(`Invalid allocation for ${rule.bucket}.`);
    }
  }
  return true;
}

export function allocateEventRevenue(config: EventEconomyConfig): AllocationResult[] {
  validateAllocationConfig(config);
  let distributed = 0;
  return config.allocations.map((rule, index) => {
    const isLast = index === config.allocations.length - 1;
    const amountMinor = isLast
      ? config.grossEligibleRevenueMinor - distributed
      : Math.floor((config.grossEligibleRevenueMinor * rule.basisPoints) / 10_000);
    distributed += amountMinor;
    return {
      bucket: rule.bucket,
      amountMinor,
      beneficiaryId: rule.beneficiaryId,
      restricted: rule.restricted,
    };
  });
}

export function assertNoCommingling(results: AllocationResult[]) {
  const seen = new Set<AllocationBucket>();
  for (const result of results) {
    if (seen.has(result.bucket)) throw new Error(`Duplicate bucket ${result.bucket}; aggregate before settlement.`);
    seen.add(result.bucket);
  }
  return true;
}

export const designatedLegacyExample = (gameId: GameId, eventId: string, grossEligibleRevenueMinor: number): EventEconomyConfig => ({
  gameId,
  eventId,
  grossEligibleRevenueMinor,
  currency: 'USD',
  allocations: [
    { bucket: 'legacy_allocation', basisPoints: 2000, beneficiaryId: 'kenosha-legacy-family', restricted: true },
    { bucket: 'charity_allocation', basisPoints: 1000, beneficiaryId: 'approved-ministry-charity', restricted: true },
    { bucket: 'player_prize', basisPoints: 3000, restricted: true },
    { bucket: 'tryamm_platform_revenue', basisPoints: 4000, beneficiaryId: 'tryamm', restricted: false },
  ],
});

// Accounting invariants:
// LEGACY ALLOCATION != PLAYER PRIZE != CHARITY ALLOCATION != TRYAMM PROFIT/PLATFORM REVENUE.
// These buckets require separate ledger accounts and settlement rules in Money Engine.
// Percentages shown in designatedLegacyExample are an event configuration example based on prior designated-event rules,
// not a universal default for every game/event. Real-money prize events remain behind legal/geographic/feature gates.
