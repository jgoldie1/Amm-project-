export const FUNDRAISING_SEPARATION_CONTRACT = {
  purpose:'Keep charitable, memorial, ministry and beneficiary fundraising operationally separate from games of chance, raffles, sweepstakes, lotteries and prize-entry mechanics unless a separately reviewed program is explicitly approved.',
  fundraisingLane:{
    allowed:['direct-donation','fixed-price-benefit-event','membership-support','sponsor-support','merchandise-fundraiser','service-revenue-allocation','grant-or-sponsor-funding'],
    prohibited:['paid-entry-for-random-prize','donation-increases-odds','purchase-required-chance-entry','random-winner-from-donor-pool','Holo-Credit-wager','Bean-wager'],
    ledger:'fundraising and beneficiary ledgers stay separate from game_prize_payouts and Holo Credit wallets',
  },
  prizeLane:{
    allowed:['skill-based published competition','server-authoritative race result','sponsor-funded fixed podium awards','non-cash achievements','promotional rewards under published terms'],
    rule:'Prize eligibility cannot depend on making a charitable donation.',
  },
  hardFirewall:[
    'separate campaign/event identifiers',
    'separate checkout and payment intents',
    'separate ledger accounts/categories',
    'no shared random-selection service',
    'no donation amount stored as prize odds or entries',
    'no prize CTA on donation confirmation by default',
    'server validation rejects campaign configuration that mixes donation and chance-entry semantics',
  ],
  reviewGate:'Any future raffle, sweepstakes, lottery or chance-based charitable promotion remains disabled until jurisdiction-specific legal/tax review, official rules, eligibility, registration/bonding where required, payment-provider approval and responsible operating controls are documented.',
} as const

export const FUNDRAISING_SAFE_PATH='FUNDRAISING PAGE → PURPOSE/BENEFICIARY → FIXED DONATION OR PURCHASE → PAYMENT EVIDENCE → REFUND/CHARGEBACK HANDLING → BENEFICIARY/SERVICE ALLOCATION → LEDGER → REPORTING'
export const SKILL_PRIZE_SAFE_PATH='PUBLISHED SKILL RULES → FUNDED PRIZE POOL → PLAY/RACE → SERVER RESULT → ANTI-CHEAT → ELIGIBILITY → PODIUM → PRIZE LEDGER → PAYOUT PROVIDER'
