export type LivingWorldStatus='live'|'planned'

export type LivingWorld13={
  slug:string
  name:string
  status:LivingWorldStatus
  role:string
}

export const LIVING_WORLDS_13:LivingWorld13[]=[
  {slug:'faith-hub',name:'The Faith Hub',status:'live',role:'faith, community, reflection and values hub'},
  {slug:'lion-kingdom-gate',name:'Lion Kingdom Gate',status:'live',role:'kingdom gateway and portal-routing world'},
  {slug:'chicago-commons',name:'Chicago Commons',status:'live',role:'StreetVerse / Living City civic and open-world anchor'},
  {slug:'africa-trade-kingdom',name:'Africa Trade Kingdom',status:'planned',role:'trade, culture and business world'},
  {slug:'creator-city',name:'Creator City',status:'planned',role:'creator production, performance and media world'},
  {slug:'gameverse-nexus',name:'GameVerse Nexus',status:'planned',role:'central bridge into standalone TRYAMM games'},
  {slug:'holotech-city',name:'HoloTech City',status:'planned',role:'AR, VR, MR, holographic and advanced-tech world'},
  {slug:'marketplace-metropolis',name:'Marketplace Metropolis',status:'planned',role:'commerce, delivery, business and marketplace world'},
  {slug:'academy-world',name:'Academy World',status:'planned',role:'education, training, esports and skill progression'},
  {slug:'omnicare-wellness',name:'Wellness and OmniCare World',status:'planned',role:'wellness and care experience world'},
  {slug:'music-culture-universe',name:'Music and Culture Universe',status:'planned',role:'music, culture, performance and record-label experiences'},
  {slug:'future-mobility',name:'Future Mobility World',status:'planned',role:'rides, racing, flight, delivery, drones and future transportation'},
  {slug:'kingdom-builders',name:'Kingdom Builders World',status:'planned',role:'building, restoration, persistent strategy and reconstruction'},
]

export const SPORTVERSE_CANON={
  id:'sportverse',
  title:'SportVerse',
  model:'one-sports-universe-many-games',
  sharedCareer:[
    'one athlete identity',
    'shared physical attributes and training history',
    'sport-specific skill trees',
    'team and league reputation',
    'combat-sport mastery where applicable',
    'accessibility passport',
    'replay and creator highlights',
  ],
  standaloneGames:[
    {id:'gridiron-x',title:'Gridiron X',sport:'football'},
    {id:'court-kings',title:'Court Kings',sport:'basketball'},
    {id:'diamond-legends',title:'Diamond Legends',sport:'baseball'},
    {id:'ice-storm',title:'Ice Storm',sport:'hockey'},
    {id:'world-pitch',title:'World Pitch',sport:'global football / soccer'},
    {id:'fight-night-holo',title:'Fight Night Holo',sport:'boxing, MMA and martial arts'},
  ],
} as const

export const LEGACY_13_EXPERIENCE_TRANSLATION=[
  {legacy:'Living City / My World',current:'StreetVerse + Chicago Commons',destination:'chicago-commons'},
  {legacy:'Volcano Sports Universe',current:'SportVerse',destination:'gameverse-nexus'},
  {legacy:'Realm Clash',current:'Fight Night Holo + Combat Passport',destination:'gameverse-nexus'},
  {legacy:'Ghost Operations',current:'Paranormal Unit: Rift Hunters',destination:'gameverse-nexus'},
  {legacy:'Creature Quest',current:'HoloBeasts: Living Wilds',destination:'gameverse-nexus'},
  {legacy:'Holo Card Arena',current:'Yogihoo Arena / Battle Deck: Holo Champions + OmniDeck AR',destination:'gameverse-nexus'},
  {legacy:'Laser Grid',current:'Living Laser + Quantum Tag spatial modes',destination:'gameverse-nexus'},
  {legacy:'Tactical Front',current:'Tactical Realms: Global Conflict',destination:'gameverse-nexus'},
  {legacy:'Drone Command',current:'Future Mobility + drone missions',destination:'future-mobility'},
  {legacy:'Twin World',current:'Time Machine / alternate-world transformation layer',destination:'holotech-city'},
  {legacy:'Mischief Lab',current:'Mischief Creatures + creator/environment puzzles',destination:'creator-city'},
  {legacy:'Scooty Rescue',current:'Accessibility-first rescue and mobility missions',destination:'future-mobility'},
  {legacy:'Quantum Defense / Holo Console Adventure',current:'Quantum Tag + Global Conflict universal campaign fabric',destination:'gameverse-nexus'},
] as const

export const LIVING_WORLDS_GAMEVERSE_BRIDGE={
  principle:'Worlds are places; games are playable systems; GameVerse Nexus connects them without duplicating the renderer or game engines.',
  persistence:[
    'one TRYAMM Passport',
    'one avatar identity',
    'shared XP and reputation where rules allow',
    'shared inventory references with game-specific eligibility',
    'world checkpoints and portal history',
    'sports career continuity through SportVerse',
    'creator replay and highlight metadata',
    'accessibility and language preferences',
  ],
  releaseModel:[
    'monthly game releases can launch through GameVerse Nexus',
    'Living Worlds can host preview portals and crossover missions without containing the full game runtime',
    'SportVerse can release individual sports titles while preserving one athlete career',
    'Global Conflict can act as an optional seasonal story across games and worlds',
  ],
} as const
