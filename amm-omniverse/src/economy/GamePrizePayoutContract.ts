export const GAME_PRIZE_PAYOUT_CONTRACT = {
  principle: 'Game and race prizes become payable only after server-authoritative results, eligibility, anti-cheat, published rules, funding, identity/age and payout checks pass.',
  supportedEvents: ['Volcano: Last Route','Battle Deck: Holo Champions','Photon Tag: Neon District','Timewalk: Archive Detectives','sponsored-race','seasonal-tournament','venue-championship'],
  prizeTypes: ['cash-prize-when-lawful-and-published','creator-earnings-credit','Beans','promotional-Holo-Credits','digital-trophy','store-perk','membership-perk'],
  lifecycle: ['PUBLISH RULES','FUND PRIZE POOL','ENTER','PLAY','SERVER RESULT','ANTI-CHEAT','ELIGIBILITY','FINALIZE PODIUM','CALCULATE PRIZE','BENEFICIARY/SPONSOR ALLOCATION','PAYOUT LEDGER','PAYOUT PROVIDER','SETTLED','WORLD MEMORY'],
  payoutGates: ['event-rules-version','prize-pool-funded','server-result-final','anti-cheat-clear','identity-verified-when-required','age/guardian-eligible','jurisdiction-eligible','tax-info-when-required','no-sanctions/fraud-hold','refund/chargeback-reserve-applied','payout-provider-ready'],
  podium: { first:'configured event prize', second:'configured event prize', third:'configured event prize' },
  beneficiary: { bps:2000, basis:'eligible net sponsor-race revenue only under approved agreement', separateFromWinnerPrize:true },
  safety: ['no client-side cash minting','no entry-fee gambling design','no undisclosed odds','no pay-to-win prize advantage','no automatic youth cash payout','no payout before final result'],
} as const
