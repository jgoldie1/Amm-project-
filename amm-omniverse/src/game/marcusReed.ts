export const MARCUS_REED_ID = 'character_marcus_reed_001' as const

export type PathfinderChapter =
  | 'home' | 'build' | 'move' | 'create'
  | 'gateway' | 'three-discoveries' | 'omniverse' | 'return-home'

export interface MarcusSaveState {
  characterId: typeof MARCUS_REED_ID
  legacyXp: number
  reputation: number
  discovery: number
  omniCash: number
  completedMissions: string[]
  businessesDiscovered: string[]
  creatorRelationships: Record<string, number>
  vehicles: string[]
  inventory: string[]
  universalPassportLevel: number
  unlockedWorlds: string[]
  decisions: Record<string, string>
  currentChapter: PathfinderChapter
}

export const marcusReed = {
  id: MARCUS_REED_ID,
  name: 'Marcus Reed',
  age: 32,
  home: 'Chicago',
  role: 'StreetVerse Pathfinder',
  playable: true,
  canonical: true,
  traits: ['observant','calm','loyal','entrepreneurial','protective','curious'],
  visualAnchor: {
    scar: 'small thin diagonal scar through outer right eyebrow',
    jacket: 'black premium varsity jacket with deep crimson-red leather sleeves',
    shirt: 'black fitted crew-neck T-shirt',
    jeans: 'dark charcoal slim jeans',
    shoes: 'black high-top sneakers with subtle crimson accents',
    jewelry: 'thin gold chain',
    device: 'StreetVerse wrist device on left wrist',
  },
  backstory:
    'A Chicago entrepreneur and creator who enters StreetVerse to connect neighborhood talent, workers, creators and businesses to a larger economy. His journey begins at home and expands through HoloVerse into the Omniverse.',
  progression: ['legacyXp','reputation','discovery'],
  chapters: [
    { id:'home', title:'Home' },
    { id:'build', title:'Build' },
    { id:'move', title:'Move' },
    { id:'create', title:'Create' },
    { id:'gateway', title:'Gateway' },
    { id:'three-discoveries', title:'Three Discoveries' },
    { id:'omniverse', title:'Omniverse' },
    { id:'return-home', title:'Return Home' },
  ] as const,
  wristMenu: ['PASSPORT','MAP','MISSIONS','CONTACTS','BUSINESS','CREATOR','JOBS','MARKET','WALLET','VEHICLES','WORLDS'],
} as const

export function createMarcusSaveState(): MarcusSaveState {
  return {
    characterId: MARCUS_REED_ID,
    legacyXp: 0,
    reputation: 0,
    discovery: 0,
    omniCash: 0,
    completedMissions: [],
    businessesDiscovered: [],
    creatorRelationships: {},
    vehicles: [],
    inventory: ['streetverse-wrist-device','universal-passport'],
    universalPassportLevel: 1,
    unlockedWorlds: ['streetverse-chicago'],
    decisions: {},
    currentChapter: 'home',
  }
}
