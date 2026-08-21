export const CHARITY_FUNDRAISING_PROFIT_CONTRACT = {
  principle: 'TRYAMM can earn disclosed platform/production revenue while charitable funds remain separately tracked, restricted to the approved beneficiary/campaign purpose, and never used as ordinary operating cash unless the campaign terms and applicable law expressly allow a disclosed fee or reimbursement.',
  eventTypes: [
    'Volcano charity challenge',
    'Battle Deck charity tournament',
    'Photon Tag charity league',
    'Timewalk memorial/education fundraiser',
    'sponsored race fundraiser',
    'HoloArena community night',
    'creator/music benefit concert',
    'Movie Box benefit premiere'
  ],
  moneyLanes: {
    companyRevenue: ['ticket/service revenue','disclosed platform fee','production fee','merchandise margin','sponsorship inventory','membership revenue','replay/movie package','eligible F&B/vendor commission'],
    restrictedCharityFunds: ['direct donation','campaign-designated sponsor contribution','published charity share of eligible event revenue'],
    prizeFunds: ['pre-funded player prize pool','sponsor-funded podium prize'],
    beneficiaryAllocations: ['approved 20% sponsor-race beneficiary allocation','other campaign-specific beneficiary percentage under signed terms'],
  },
  waterfall: [
    'GROSS EVENT RECEIPTS',
    'separate purchases from donations',
    'processor/refund/tax treatment according to transaction type',
    'record disclosed TRYAMM commercial revenue/fees',
    'lock campaign-designated charitable amount in restricted ledger',
    'lock funded prize pool separately',
    'calculate only published sponsor/beneficiary allocations',
    'settle charity transfer and beneficiary transfers',
    'recognize remaining legitimate company revenue',
    'publish campaign reconciliation'
  ],
  campaignGates: [
    'beneficiary verified',
    'written campaign agreement',
    'charitable-solicitation/fundraising registration reviewed where required',
    'campaign geography and dates defined',
    'fee/share clearly disclosed before payment',
    'donation versus purchase classification clear',
    'refund/chargeback policy defined',
    'prize rules separated from donation solicitation',
    'age/youth safeguards',
    'no gambling/chance mechanics unless separately lawful/licensed',
    'payout bank/provider destination verified',
  ],
  sustainability: {
    rule: 'Do not promise 100% of gross receipts to charity if TRYAMM needs to recover costs or earn margin. Publish the exact donation/share formula before checkout.',
    preferredModels: [
      'fixed-dollar donation funded by TRYAMM per paid ticket after minimum economics are met',
      'published percentage of eligible net event revenue',
      'sponsor-funded donation that does not reduce operating margin',
      'optional customer donation routed separately from purchase',
      'merchandise where a disclosed dollar amount or percentage benefits the campaign',
      'corporate sponsor underwrites venue/production costs so ticket economics remain sustainable'
    ],
    reserve: 'Company should maintain operating, tax, refund and chargeback reserves from company revenue—not from restricted charitable funds.'
  },
  audit: ['campaign-id','beneficiary','gross-receipts','commercial-revenue','fees','restricted-charity-liability','prize-liability','beneficiary-allocation','refunds','chargebacks','transfers','receipts','reconciliation-status'],
  prohibited: ['commingling restricted donations with operating cash','using charitable funds to cover unrelated losses','claiming tax deductibility without eligible charity/receipt basis','changing charity percentage after purchase','using donations as a prize pool','fake charity claims','undisclosed fundraising fees'],
} as const

export const CHARITY_GAME_LOOP = 'PLAY → SPONSOR / BUY TICKET / OPTIONAL DONATION → GAME OR RACE → VERIFIED RESULT → PRIZE LEDGER (SEPARATE) → CHARITY LEDGER (SEPARATE) → TRYAMM COMMERCIAL REVENUE (SEPARATE) → CHARITY PAYOUT → PLAYER/BENEFICIARY PAYOUT → RECONCILIATION → WORLD MEMORY → RETURN EVENT'
