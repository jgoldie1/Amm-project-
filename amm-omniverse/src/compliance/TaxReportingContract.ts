export const TAX_REPORTING_CONTRACT = {
  classification: {
    rule: 'Classify the relationship before selecting a tax form. Do not let the recipient choose employee vs contractor merely for convenience.',
    lanes: ['employee-W2','nonemployee-1099-NEC','prize-award-1099-MISC-or-applicable-form','royalty-1099-MISC-or-applicable-form','other-review-required'],
    celebrityRule: 'Celebrity status does not determine the form; the payment type and worker/payee relationship do.',
  },
  onboarding: {
    collect: ['legal-name','mailing-address','tax-classification','TIN-via-secure-tax-provider-or-restricted-vault','W-9-or-W-4-as-applicable','consent-for-electronic-delivery','delivery-preference'],
    security: ['never-email-full-TIN','encrypt-restricted-tax-data','least-privilege-access','audit-log','retention-policy'],
  },
  yearEnd: {
    reconcileSources: ['payroll-wages','creator-earnings','agency-commissions','service-shares','game-prizes','race-prizes','royalties','eligible-other-payments'],
    workflow: ['CLASSIFY','RECONCILE','VALIDATE-TIN','CALCULATE','GENERATE-DRAFT','AI-COMPLIANCE-CHECK','HUMAN-APPROVAL','E-FILE','RECIPIENT-DELIVERY','DELIVERY-EVIDENCE','CORRECTIONS','RETENTION'],
  },
  filing: {
    w2: 'SSA Business Services Online / approved payroll filing path',
    informationReturns: 'IRS IRIS or approved authorized filing provider',
    efileThreshold: 'aggregate 10-or-more information returns generally requires electronic filing',
    noDuplicatePaperAfterEfile: true,
  },
  delivery: {
    methods: ['secure-portal-download','electronic-delivery-with-valid-consent','postal-mail-via-approved-mail-provider'],
    email: 'Email may notify the recipient that a tax document is ready; do not attach unprotected sensitive tax documents by default.',
    evidence: ['generated-at','filed-at','accepted/rejected-status','recipient-furnished-at','delivery-method','mail-tracking-when-used','correction-history'],
  },
  aiLegal: {
    name: 'TRYAMM AI Legal & Compliance Desk',
    capabilities: ['issue-spotting','contract-checklists','rights-and-sample-review-support','tax-form-routing-support','deadline-monitoring','policy-drafting','evidence-packet-preparation','escalation-to-human-professional'],
    restrictions: ['not-a-law-firm','no-claim-of-attorney-client-relationship','no-final-legal-or-tax-determination-without-authorized-human-review-where-required','never-invent-law-or-filing-status'],
  },
} as const
