export const CHARITY_DAO_CONTRACT = {
  name: 'TRYAMM Community Impact Council',
  principle: 'A governance and audit layer for company-authorized charitable allocations; not itself represented as a tax-exempt charity, donor-advised fund, or legal DAO entity unless separately formed and approved.',
  proposedDefaultAllocationBps: 5000,
  allocationBasis: 'eligible net proceeds from specifically enrolled campaigns/events after prizes, refunds, chargebacks, taxes, provider fees and other published exclusions',
  governance: {
    proposalStates: ['draft','compliance-review','open-vote','approved','rejected','executing','settled','cancelled'],
    voterClasses: ['authorized-community-member','creator-representative','beneficiary-representative','company-steward'],
    safeguards: ['conflict-disclosure','quorum','vote-window','one-eligible-identity-one-vote-within-class','no-self-dealing','charity-eligibility-check','human-compliance-approval-before-transfer'],
    blockchainUse: ['proposal-hash','rules-version-hash','vote-receipt-hash','tally-hash','allocation-ledger-hash','payout-receipt-hash'],
    privacy: 'Never place donor/player PII, tax IDs, payment credentials, medical data or private beneficiary records on-chain.'
  },
  charityGate: ['recipient-identity','tax-status-or-approved-fiscal-sponsor','purpose-eligibility','sanctions/fraud-screen','conflict-check','written-allocation-basis','board/company-authorization','payment-provider-ready'],
  enrolledRevenueExamples: ['HoloArena sponsored event net proceeds','selected game tournament sponsorship proceeds','Movie Box charity premieres','creator benefit concerts','store charity collections where legally configured','University/community fundraising events'],
  excludedByDefault: ['winner prize pool','creator payable earnings','Pastor Kofi contractual 10% service share','kids/beneficiary contractual 20% race allocation','taxes','refunds','chargebacks','restricted funds not authorized for charity'],
} as const

export const CASH_COW_FLYWHEEL = [
  'ORIGINAL GAME/EXPERIENCE',
  'TICKET/MEMBERSHIP',
  'SPONSORSHIP',
  'REPLAY/MOVIE BOX',
  'DIGITAL HOLO CREDIT UPSELL',
  'MERCHANDISE',
  'TOURNAMENT/EVENT',
  'CREATOR CONTENT/DISTRIBUTION',
  'WORLD MEMORY/RETENTION',
  'RETURN VISIT',
  'ELIGIBLE NET PROCEEDS',
  'CONTRACTUAL ALLOCATIONS',
  'OPTIONAL CHARITY CAMPAIGN ALLOCATION',
  'TRANSPARENT IMPACT RECEIPT',
] as const
