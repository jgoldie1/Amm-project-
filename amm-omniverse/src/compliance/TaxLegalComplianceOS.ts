export const TAX_LEGAL_COMPLIANCE_OS = {
  scope: ['game-prizes','race-prizes','creator-earnings','agency-commissions','pastor-kofi-service-share','20-percent-beneficiary-allocation','mobile/franchise-revenue','marketplace-sales','holoarena-tickets','music/streaming','merchandise','holo-credits-digital-sales'],
  tax: {
    gates: ['payee-identity','tax-classification','country/state/local-jurisdiction','tax-form-status','withholding-rule','sales-tax/VAT/GST-treatment','payout-threshold','year-to-date-reporting','refund/reversal-adjustment'],
    rule: 'Tax treatment must be calculated from current jurisdiction/provider rules and reviewed by qualified tax professionals where required; HoloGPT does not invent tax rates.',
  },
  legalAI: {
    name: 'TRYAMM AI Legal Assistant',
    role: 'issue spotting, document intake, contract checklist, policy routing, evidence organization and escalation',
    never: ['claim to be a licensed attorney','give final legal approval without authorized human review where required','fabricate law/case citations','waive rights or sign contracts','hide material risk'],
    escalation: ['licensed-attorney-review','tax-professional-review','telecom-regulatory-review','franchise-counsel-review','music-rights-review','privacy/child-safety-review','gaming/prize-law-review'],
  },
  compliance: {
    universal: ['KYC/KYB-when-required','age/guardian-gates','sanctions/fraud-screening','privacy/consent','record-retention','audit-log','terms-version','refund/chargeback-policy','accessibility','advertising-disclosures'],
    prizeSpecific: ['published-rules','no-client-result-authority','anti-cheat','funded-prize-pool','jurisdiction-eligibility','tax-onboarding-before-payout'],
    ministryServiceSpecific: ['executed-revenue-share-agreement','eligible-revenue-definition','10-percent=1000-bps','refund/chargeback-netting','recipient-tax-status','ledger-evidence'],
    beneficiarySpecific: ['executed-beneficiary-agreement','20-percent=2000-bps','eligible-net-sponsor-race-revenue-basis','guardian/trustee-controls-for-minors','separate-from-winner-prize'],
  },
  releaseGate: 'MONEY EVENT → CLASSIFY → LEGAL/COMPLIANCE CHECK → TAX CHECK → FRAUD/IDENTITY → LEDGER → HOLD/APPROVAL → PAYOUT/SETTLEMENT → REPORTING → REVERSAL/ADJUSTMENT'
} as const
