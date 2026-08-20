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
  chargebacks: number
  reserves: number
  taxesCollected: number
  creatorPartnerPayables: number
  infrastructureCost: number
  otherDirectCost: number
  netRevenue: number
  contributionMargin: number
  contributionMarginPct: number
  transactions: number
  activeCustomers: number
  payingCustomers: number
  currency: string
}

export interface FounderCockpitSnapshot {
  asOf: string
  currency: string
  grossVolume: number
  grossRevenue: number
  netRevenue: number
  contributionMargin: number
  contributionMarginPct: number
  cashAvailableToReinvest: number
  creatorPartnerPayables: number
  refundsChargebacksAndReserves: number
  topCashCow?: RevenueEngine
  engines: RevenueEngineSnapshot[]
  warnings: string[]
  releaseGate: 'GREEN' | 'YELLOW' | 'RED'
  source: 'money_engine_authoritative' | 'sandbox' | 'unavailable'
}

export function calculateEngine(input: Omit<RevenueEngineSnapshot, 'netRevenue' | 'contributionMargin' | 'contributionMarginPct'>): RevenueEngineSnapshot {
  const netRevenue = input.grossRevenue - input.providerFees - input.refunds - input.chargebacks - input.creatorPartnerPayables
  const contributionMargin = netRevenue - input.infrastructureCost - input.otherDirectCost
  const contributionMarginPct = netRevenue > 0 ? contributionMargin / netRevenue : 0
  return { ...input, netRevenue, contributionMargin, contributionMarginPct }
}

export function buildFounderCockpit(engines: RevenueEngineSnapshot[], releaseGate: FounderCockpitSnapshot['releaseGate'], source: FounderCockpitSnapshot['source']): FounderCockpitSnapshot {
  const sum = (pick: (e: RevenueEngineSnapshot) => number) => engines.reduce((n, e) => n + pick(e), 0)
  const currency = engines[0]?.currency ?? 'USD'
  const netRevenue = sum(e => e.netRevenue)
  const contributionMargin = sum(e => e.contributionMargin)
  const warnings: string[] = []
  const grossRevenue = sum(e => e.grossRevenue)
  const chargebacks = sum(e => e.chargebacks)
  const refunds = sum(e => e.refunds)
  if (grossRevenue > 0 && chargebacks / grossRevenue > 0.02) warnings.push('Chargebacks exceed 2% of gross revenue.')
  if (grossRevenue > 0 && refunds / grossRevenue > 0.10) warnings.push('Refunds exceed 10% of gross revenue.')
  if (contributionMargin < 0) warnings.push('Combined contribution margin is negative.')
  const topCashCow = [...engines].sort((a,b) => b.contributionMargin - a.contributionMargin)[0]?.engine
  return {
    asOf: new Date().toISOString(),
    currency,
    grossVolume: sum(e => e.grossVolume),
    grossRevenue,
    netRevenue,
    contributionMargin,
    contributionMarginPct: netRevenue > 0 ? contributionMargin / netRevenue : 0,
    cashAvailableToReinvest: Math.max(0, contributionMargin - sum(e => e.reserves)),
    creatorPartnerPayables: sum(e => e.creatorPartnerPayables),
    refundsChargebacksAndReserves: refunds + chargebacks + sum(e => e.reserves),
    topCashCow,
    engines,
    warnings,
    releaseGate,
    source,
  }
}

export function rankRevenueEngines(snapshot: FounderCockpitSnapshot) {
  return [...snapshot.engines].sort((a, b) => b.contributionMargin - a.contributionMargin)
}

export const FOUNDER_COCKPIT_SECTIONS = [
  'cash_and_runway',
  'revenue_by_engine',
  'gmv_and_transactions',
  'creator_seller_rightsholder_ministry_payables',
  'refunds_chargebacks_reserves',
  'provider_and_infrastructure_cost',
  'contribution_margin',
  'geography_and_currency',
  'customer_conversion_and_retention',
  'payout_and_reconciliation_health',
  'quantum_money_sandbox_status',
  'release_green_yellow_red',
] as const

// Cockpit rules:
// 1. Never treat GMV, customer principal, ministry offerings, escrow/custody balances,
//    or regulated investment assets as TRYAMM revenue.
// 2. Never fabricate live financial data; show unavailable until Money Engine data exists.
// 3. Partner/creator/ministry/customer payables remain liabilities until settled.
// 4. Reinvestment recommendations use contribution margin, cash reserves, release readiness and risk.
// 5. Stubbs AI can explain and recommend; it cannot move money without an authorized Money Engine action.
