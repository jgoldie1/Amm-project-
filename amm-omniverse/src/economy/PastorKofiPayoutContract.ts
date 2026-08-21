export const PASTOR_KOFI_PAYOUT_CONTRACT = {
  program: 'Pastor Kofi / Servants of Christ service share',
  shareBps: 1000,
  basis: 'eligible net service revenue defined by the executed agreement only',
  lifecycle: [
    'EXECUTED AGREEMENT',
    'ELIGIBLE SERVICE SALE',
    'PAYMENT SETTLED',
    'REFUND/CHARGEBACK WINDOW',
    'NET ELIGIBLE REVENUE',
    'CALCULATE 10% SHARE',
    'EVIDENCE REVIEW',
    'LEDGER ENTRY',
    'PAYOUT PROVIDER',
    'SETTLED',
    'TAX/REPORTING',
    'REVERSAL IF REQUIRED'
  ],
  gates: [
    'agreement-active',
    'service-category-eligible',
    'payment-evidence-present',
    'refunds-and-chargebacks-netted',
    'identity/business-payee-verified-when-required',
    'tax-information-complete-when-required',
    'fraud-hold-clear',
    'payout-provider-ready'
  ],
  accounting: {
    separateFromGamePrizes: true,
    separateFromHoloCredits: true,
    separateFromBeans: true,
    separateFromCreatorEarnings: true,
    idempotencyRequired: true,
  },
  safety: [
    'browser cannot create payable share',
    '10% is not calculated on gross revenue unless the signed agreement explicitly says so',
    'no payout before underlying payment settles',
    'reversals must be traceable to original ledger entries'
  ]
} as const

export const SERVICE_SHARE_SANDBOX_PROOF = 'SANDBOX $1 ELIGIBLE SERVICE → SETTLED PAYMENT EVIDENCE → CALCULATE AGREEMENT BASIS → 10% SHARE → LEDGER → TEST PAYOUT → SETTLEMENT → REVERSAL TEST → GREEN'
