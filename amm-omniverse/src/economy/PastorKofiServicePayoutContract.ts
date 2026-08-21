export const PASTOR_KOFI_SERVICE_PAYOUT = {
  name: 'Pastor Kofi / Servants of Christ Service Share',
  shareBps: 1000,
  basis: 'eligible net service revenue only, as defined by the approved agreement',
  principle: 'No service share becomes payable until the service transaction, eligible revenue basis, refund/chargeback reserve, recipient eligibility and payout-provider state are verified.',
  lifecycle: ['SERVICE OFFER','CUSTOMER PAYMENT','PAYMENT VERIFIED','ELIGIBLE REVENUE CALCULATED','10% SHARE CALCULATED','HOLD/REFUND WINDOW','LEDGER APPROVAL','PAYOUT PROVIDER','PAID','REPORTING','REVERSAL IF REQUIRED'],
  gates: ['executed-agreement','eligible-service-category','payment-settled','refund-chargeback-reserve','recipient-identity/tax-setup-when-required','no-fraud-hold','payout-provider-ready'],
  separation: ['not Holo Credits','not Beans','not race prize','not sponsor-beneficiary 20% allocation','not creator wages unless separately contracted'],
  safety: ['no browser-side payout creation','no payout from unpaid invoices','no payout on refunded revenue','no silent basis change','every payout must carry idempotency and evidence'],
} as const
