export const HOLOARENA_COLOSSEUM = {
  name: 'TRYAMM Colosseum District',
  purpose: 'A persistent sports, combat, racing, creator and fan district that connects HoloArena, home AR/VR/MR, StreetVerse and World Memory.',
  zones: [
    'Grand Colosseum Bowl',
    'Fight Night / Boxing Ring',
    'Race Circuit + Podium Plaza',
    'Tailgate Commons',
    'Creator Stage + Movie Box capture',
    'Fan Marketplace',
    'University Training Lab',
    'Accessibility + Family Lounge',
    'Sponsor Pavilion',
    'World Memory Hall of Champions',
  ],
  modes: {
    venue: 'Players physically present at a HoloArena venue enter the same event/session world.',
    homeXR: 'Approved home AR/VR/MR clients can join as remote participants, spectators or selected interactive roles subject to latency/safety rules.',
    mobile: 'HoloFon/mobile users can spectate, vote in non-wager polls, join tailgate social spaces, buy eligible merchandise/tickets and receive highlights.',
    web: 'Web users can spectate, follow brackets, creator feeds, schedules and stores where supported.',
  },
  eventFlow: [
    'TAILGATE',
    'CHECK-IN / ACCESSIBILITY',
    'FAN SOCIAL / CREATOR CONTENT',
    'ENTER COLOSSEUM',
    'PLAY / WATCH / PARTICIPATE',
    'SERVER RESULT',
    'PODIUM / PRIZE GATE',
    'MOVIE BOX HIGHLIGHT',
    'STORE / MEMBERSHIP',
    'WORLD MEMORY',
    'RETURN EVENT',
  ],
  supportedLaunchGames: [
    'Volcano: Last Route',
    'Battle Deck: Holo Champions',
    'Photon Tag: Neon District',
    'Timewalk: Archive Detectives',
  ],
  expansionSports: [
    'boxing / Fight Night Holo',
    'racing championships',
    'football tailgate experiences',
    'basketball fan challenges',
    'creator battles and music performances',
  ],
  tailgate: {
    activities: ['avatar meetups','team/family rooms','food/vendor discovery','creator performances','merchandise','sponsor activations','safe fan challenges','AR scavenger missions','pre-game interviews','Movie Box fan clips'],
    rules: ['no gambling mechanic','age-appropriate zones','licensed/authorized brand use only','moderation and accessibility always active'],
  },
  remoteInteractionRules: [
    'Remote users cannot bypass venue physical-safety state.',
    'Competitive roles require server-authoritative synchronization and latency eligibility.',
    'Spectator interactions must not alter prize outcomes unless explicitly part of published game rules.',
    'No paid vote can decide a cash-prize winner.',
  ],
  monetization: [
    'tickets','memberships','tailgate packages','creator/movie packages','merchandise','original Battle Deck products','eligible sponsorships','food/vendor commissions where lawful/disclosed','education labs','corporate/group events','replays/highlights',
  ],
} as const

export const COLOSSEUM_PAYOUT_CHAIN = 'TRANSACTION → ELIGIBLE BASIS → CALCULATED SHARE/PRIZE → HELD → APPROVED → PROVIDER SUBMISSION → SETTLED → LEDGER MATCH → REVERSAL TEST → WORLD MEMORY'
