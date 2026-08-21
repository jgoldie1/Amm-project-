export const LEGACY_RACE_ECONOMY = {
  memorials: ['Kenosha Stubbs Legacy','Kenosha Shelton Memorial'],
  tiedGames: ['Volcano: Last Route','Battle Deck: Holo Champions','Photon Tag: Neon District','Timewalk: Archive Detectives'],
  raceProgram: {
    sponsorEligible: true,
    podium: ['1st','2nd','3rd'],
    rewards: ['digital trophy','Beans','eligible promotional Holo Credits','store/venue perk','sponsor-funded prize where lawful and published'],
    verification: ['server-authoritative result','anti-cheat','identity/age lane','event rules','sponsor proof','ledger approval'],
  },
  beneficiaryRule: {
    beneficiaries: 'designated children/beneficiaries in the approved legacy record',
    shareBps: 2000,
    source: 'eligible net sponsor-race revenue only as defined by the signed program/beneficiary agreement',
    safeguards: ['no browser-created entitlement','no automatic payment from gameplay','refund/chargeback reserve','guardian/trustee control for minors','tax/reporting workflow','auditable ledger'],
  },
  pastorKofi: {
    serviceShareBps: 1000,
    appliesOnlyTo: 'eligible Servants of Christ / Pastor Kofi service revenue defined by executed agreement',
  },
} as const

export const FOUR_GAME_LEGACY_LOOP = 'VOLCANO / BATTLE DECK / PHOTON TAG / TIMEWALK → LEGACY EVENT OR SPONSORED RACE → VERIFIED RESULT → PODIUM → SPONSOR REWARD → BENEFICIARY/PROGRAM LEDGER → WORLD MEMORY → MOVIE BOX HIGHLIGHT → STORE/MEMBERSHIP → RETURN'
