export type MoneyScenario =
  | 'duplicate_payment'
  | 'insufficient_funds'
  | 'refund'
  | 'chargeback'
  | 'split_payout'
  | 'provider_outage'
  | 'currency_conversion'
  | 'fractional_transfer'
  | 'offering_restriction'
  | 'game_reward_fraud'
  | 'panic_mode'
  | 'ledger_chain_reconciliation'

export interface MoneySandboxCase {
  scenario: MoneyScenario
  passed: boolean
  evidence: string[]
  preservedLedgerIntegrity: boolean
  preservedSecurityGates: boolean
}

export interface QuantumMoneySandboxReport {
  cases: MoneySandboxCase[]
  green: boolean
  blockers: string[]
}

export function evaluateQuantumMoneySandbox(cases: MoneySandboxCase[]): QuantumMoneySandboxReport {
  const required: MoneyScenario[] = [
    'duplicate_payment',
    'insufficient_funds',
    'refund',
    'chargeback',
    'split_payout',
    'provider_outage',
    'currency_conversion',
    'fractional_transfer',
    'offering_restriction',
    'game_reward_fraud',
    'panic_mode',
    'ledger_chain_reconciliation',
  ]

  const blockers: string[] = []
  for (const scenario of required) {
    const result = cases.find((item) => item.scenario === scenario)
    if (!result) blockers.push(`${scenario}: missing test evidence`)
    else if (!result.passed) blockers.push(`${scenario}: test failed`)
    else if (!result.preservedLedgerIntegrity) blockers.push(`${scenario}: ledger integrity not preserved`)
    else if (!result.preservedSecurityGates) blockers.push(`${scenario}: security gate not preserved`)
    else if (result.evidence.length === 0) blockers.push(`${scenario}: no evidence attached`)
  }

  return { cases, green: blockers.length === 0, blockers }
}

export const QUANTUM_MONEY_RULES = {
  productionMutationFromSandbox: false,
  syntheticFundsOnly: true,
  requireIdempotency: true,
  requireDoubleEntryBalance: true,
  requireChainReceiptForCriticalEvents: true,
  panicModeOverridesAll: true,
  autoRetryNonIdempotentMoneyMovement: false,
  aiMayUnlockFinancialPrivileges: false,
} as const

export function assertPromotionAllowed(report: QuantumMoneySandboxReport) {
  if (!report.green) throw new Error(`quantum_money_sandbox_blocked: ${report.blockers.join('; ')}`)
  return true
}
