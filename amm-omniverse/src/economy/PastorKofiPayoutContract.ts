export const PASTOR_KOFI_PAYOUT_CONTRACT = {
  contractKey:'servants-of-christ-pastor-kofi-10pct',
  beneficiary:'Pastor Kofi / Servants of Christ program',
  shareBps:1000,
  basis:'eligible net service revenue defined by executed agreement',
  lifecycle:['SERVICE PURCHASE','PAYMENT SETTLES','CLASSIFY ELIGIBLE REVENUE','APPLY REFUNDS/CHARGEBACKS/EXCLUSIONS','VERIFY CONTRACT ACTIVE','CALCULATE 10% SHARE','TAX/PAYOUT GATES','LEDGER APPROVAL','PAYOUT PROVIDER','PAID','RECONCILE/REVERSE IF REQUIRED'],
  gates:['signed-agreement-ref','eligible-revenue-definition','payment-settled','refund-window-applied','chargeback-reserve-applied','beneficiary-payout-onboarding','tax-info-when-required','fraud/sanctions-clear','provider-ready','idempotency-key'],
  separation:['not-race-winner-prize','not-20pct-race-beneficiary-allocation','not-Holo-Credits','not-Beans','not-creator-wages'],
  truth:'The 10% is not calculated from gross platform revenue by default and is not payable until the executed agreement and eligible revenue basis are verified.',
} as const
