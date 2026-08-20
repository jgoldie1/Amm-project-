export type RevenueEngine =
  | 'live_creator'
  | 'marketplace'
  | 'hologpt'
  | 'holoforge'
  | 'media_distribution'
  | 'propertyverse'
  | 'mobility'
  | 'fractional_services'
  | 'education'
  | 'faith_services'
  | 'ai_call_center'
  | 'advertising'
  | 'enterprise_government'
  | 'manufacturing'

export interface RevenueEngineSnapshot {
  engine: RevenueEngine
  grossVolume: number
  grossRevenue: number
  providerFees: number
  refunds: number
  reserves: number
  taxesCollected: number
  creatorPartnerPayables: number
  infrastructureCost: number
  netRevenue: number
  contributionMargin: number
  transactions: number
  activeCustomers: number
  currency: string
}

export interface FounderCockpitSnapshot {
  asOf: string
  currency: string
  grossVolume: number
  grossRevenue: number
  netRevenue: number
  contributionMargin: number
  cashAvailableToReinvest: number
  creatorPartnerPayables: number
  refundsAndReserves: number
  engines: RevenueEngineSnapshot[]
  releaseGate: 'GREEN' | 'YELLOW' | 'RED'
  source: 'money_engine_authoritative' | 'sandbox' | 'unavailable'
}

export function calculateEngine(input: Omit<RevenueEngineSnapshot, 'netRevenue' | 'contributionMargin'>): RevenueEngineSnapshot {
  const netRevenue = input.grossRevenue - input.providerFees - input.refunds - input.creatorPartnerPayables
  const contributionMargin = netRevenue - input.infrastructureCost
  return { ...input, netRevenue, contributionMargin }
}

export function buildFounderCockpit(engines: RevenueEngineSnapshot[], releaseGate: FounderCockpitSnapshot['releaseGate'], source: FounderCockpitSnapshot['source']): FounderCockpitSnapshot {
  const sum = (pick: (e: RevenueEngineSnapshot) => number) => engines.reduce((n, e) => n + pick(e), 0)
  const currency = engines[0]?.currency ?? 'USD'
  return {
    asOf: new Date().toISOString(),
    currency,
    grossVolume: sum(e => e.grossVolume),
    grossRevenue: sum(e => e.grossRevenue),
    netRevenue: sum(e => e.netRevenue),
    contributionMargin: sum(e => e.contributionMargin),
    cashAvailableToReinvest: Math.max(0, sum(e => e.contributionMargin) - sum(e => e.reserves)),
    creatorPartnerPayables: sum(e => e.creatorPartnerPayables),
    refundsAndReserves: sum(e => e.refunds + e.reserves),
    engines,
    releaseGate,
    source,
  }
}

export function rankRevenueEngines(snapshot: FounderCockpitSnapshot) {
  return [...snapshot.engines].sort((a, b) => b.contributionMargin - a.contributionMargin)
}

// Cockpit rules:
// 1. Never treat GMV/customer principal/offering principal as TRYAMM revenue.
// 2. Never fabricate live financial data; show unavailable until Money Engine data exists.
// 3. Partner/creator/ministry/customer payables remain liabilities until settled.
// 4. Regulated investment assets are never company operating cash.
// 5. Reinvestment recommendations may use contribution margin, release readiness and risk,
//    but Stubbs AI cannot move money without an authorized Money Engine action.
