export type ArenaLevel = {
  id: string
  name: string
  objective: string
  mechanics: string[]
  worldMemory: string
}

export type ArenaGame = {
  id: string
  name: string
  genre: string
  partySize: string
  levels: ArenaLevel[]
  venueProducts: string[]
}

export const HOLOARENA_STARTUP_GAMES: ArenaGame[] = [
  {
    id: 'volcano-escape',
    name: 'Volcano: Last Route',
    genre: 'co-op survival / exploration',
    partySize: '1-6',
    levels: [
      { id:'rumble', name:'The Rumble', objective:'Read warning signals and evacuate the research village.', mechanics:['team navigation','environment puzzles','accessibility routes'], worldMemory:'records who helped civilians and which route survived' },
      { id:'lava-run', name:'Lava Run', objective:'Cross collapsing terrain while the eruption changes the map.', mechanics:['free roam','dynamic hazards','co-op bridges'], worldMemory:'remembers rescues, injuries avoided and discovered paths' },
      { id:'ash-sky', name:'Ash Sky', objective:'Restore communications and guide the party through low visibility.', mechanics:['spatial audio','HoloFon companion clues','team beacons'], worldMemory:'records leadership and communication choices' },
      { id:'heart', name:'Heart of the Volcano', objective:'Reach the geothermal station, stabilize it and choose the final evacuation plan.', mechanics:['multi-role controls','timed engineering puzzle','branching finale'], worldMemory:'changes the return-state of the island and unlocks sequel missions' }
    ],
    venueProducts:['Volcano mission photo/replay','team achievement patch','collector map','original soundtrack download']
  },
  {
    id: 'battle-deck-arena',
    name: 'Battle Deck: Holo Champions',
    genre: 'original holographic tactical deck battle',
    partySize: '1-6',
    levels: [
      { id:'academy', name:'Deck Academy', objective:'Learn energy, positioning, counters and team roles.', mechanics:['original digital cards','holographic summons','tutorial AI'], worldMemory:'stores unlocked original TRYAMM cards and play style' },
      { id:'district', name:'District Trials', objective:'Win three tactical arena encounters.', mechanics:['deck building','room-scale objectives','co-op combos'], worldMemory:'records deck history and rivalries' },
      { id:'rift', name:'Rift Tournament', objective:'Adapt decks to changing arena rules.', mechanics:['procedural modifiers','spectator display','party tournament'], worldMemory:'creates tournament reputation and highlights' },
      { id:'crown', name:'Crown Circuit', objective:'Defeat the original Holo Champion encounter.', mechanics:['multi-phase boss','team deck synergies','branching rewards'], worldMemory:'adds champion status without pay-to-win power' }
    ],
    venueProducts:['Battle Deck starter set','booster-style original expansion packs','deck sleeves/binder','playmat','venue tournament entry']
  },
  {
    id: 'photon-tag',
    name: 'Photon Tag: Neon District',
    genre: 'family-safe sci-fi tag / objective sport',
    partySize: '2-8 where venue hardware permits',
    levels: [
      { id:'training', name:'Signal Training', objective:'Learn safe aiming, tagging and boundaries.', mechanics:['tracked controller shell','no projectile','boundary guardian'], worldMemory:'stores accuracy and accessibility preferences' },
      { id:'relay', name:'Neon Relay', objective:'Capture and carry energy nodes.', mechanics:['team objectives','respawn zones','spectator scoring'], worldMemory:'records assists instead of only eliminations' },
      { id:'vault', name:'Vault Defense', objective:'Protect the core while rotating roles.', mechanics:['defense','haptics optional','co-op shields'], worldMemory:'records teamwork and role mastery' },
      { id:'city', name:'City Championship', objective:'Complete a multi-objective arena final.', mechanics:['capture zones','relay','moving virtual cover'], worldMemory:'creates seasonal team standings' }
    ],
    venueProducts:['Photon Tag controller shell','wearable team band','venue jersey','scorecard/replay package']
  },
  {
    id: 'timewalk-archive',
    name: 'Timewalk: Archive Detectives',
    genre: 'immersive history / mystery / creation',
    partySize: '1-6',
    levels: [
      { id:'object', name:'The Object', objective:'Examine a rights-cleared archive object and identify reliable clues.', mechanics:['3D inspection','evidence board','source labels'], worldMemory:'stores discovered evidence separately from interpretation' },
      { id:'reconstruct', name:'Reconstruct the Room', objective:'Build a historically grounded immersive reconstruction.', mechanics:['room assembly','evidence confidence','AI guide'], worldMemory:'records why each reconstruction choice was made' },
      { id:'mission', name:'Walk the Question', objective:'Solve a playable research mission without inventing facts.', mechanics:['NPC interviews','archive comparison','fact/family-memory labels'], worldMemory:'updates research knowledge and unresolved questions' },
      { id:'create', name:'Create the Future', objective:'Make an original work inspired by what was learned and preserve provenance.', mechanics:['movie/reel capture','original audio/art','credits/provenance'], worldMemory:'connects research to creator portfolio and University learning passport' }
    ],
    venueProducts:['education group ticket','research workbook','creator replay package','museum/university program bundle']
  }
]

export const HOLOARENA_COMMERCE_PACK = {
  rule: 'Sell original TRYAMM goods and licensed/authorized goods only. No third-party character/card/game branding without rights.',
  products: [
    'Battle Deck original starter set and expansions',
    'Battle Deck Gear: sleeves, binder, playmat, deck case, apparel',
    'Holographic Deck display/scan stand',
    'Photon Tag tracked controller shell (consumer-safe accessory; no projectile)',
    'HoloFon companion/controller mount',
    'TRYAMM sensor kit when certified/tested',
    'Venue team bands and washable tracker accessories',
    'Headset hygiene kits and replacement face interfaces',
    'Venue jerseys, shirts, hats and achievement patches',
    'Mission photos, highlight reels and movie packages',
    'Original soundtracks and digital art packs',
    'Birthday/corporate/school gift cards',
    'Membership and season-pass cards',
    'Collector maps/posters from original TRYAMM worlds',
    'University XR lab kits and educator workbooks'
  ],
  profitEngine: [
    'ticket -> optional replay -> merchandise bundle',
    'game achievement -> relevant physical/digital collectible',
    'birthday/group booking -> prepaid merchandise bundle',
    'Battle Deck tournament -> entry + original deck products',
    'University visit -> education bundle, never pay-to-win',
    'online storefront -> venue pickup or compliant fulfillment',
    'inventory margin, return rate and attachment rate tracked per SKU'
  ]
} as const
