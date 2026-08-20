export type LegacyEntertainmentChapter = {
  id: string
  title: string
  regionId: 'hollywood'
  era: string
  memoryStatus: 'player-authored'
  playableRoles: string[]
  beats: string[]
  worldMemoryWrites: string[]
  rightsGate: string[]
}

export const SOUL_TRAIN_MEMORY: LegacyEntertainmentChapter = {
  id: 'soul-train-memory',
  title: 'The Line, the Camera, the Groove',
  regionId: 'hollywood',
  era: 'early-1990s',
  memoryStatus: 'player-authored',
  playableRoles: ['dancer','scenic crew','camera assistant','stagehand','audience coordinator','creator'],
  beats: [
    'Stubbs AI opens a rights-safe early-1990s television-studio memory',
    'player enters through a fictionalized production check-in and learns stage etiquette',
    'rehearsal teaches rhythm, blocking, camera awareness and crowd timing',
    'player completes a dance-line challenge using original choreography and original music',
    'scenic-board mission teaches how television sets transform between performances',
    'family/network memory can record Raymond Jarreau as a player-authored connection without asserting independent verification',
    'the completed broadcast-memory writes creator, dance and production experience into World Memory',
  ],
  worldMemoryWrites: ['television production experience','dance reputation','scenic-production skill','Hollywood network memory'],
  rightsGate: ['Soul Train trademarks','broadcast footage','recorded performances','music compositions/masters','celebrity likenesses','archival photographs'],
}

export const UNIVERSAL_STUDIOS_HOLLYWOOD_MEMORY: LegacyEntertainmentChapter = {
  id: 'universal-studios-hollywood',
  title: 'Backlot to Boulevard',
  regionId: 'hollywood',
  era: 'multi-era',
  memoryStatus: 'player-authored',
  playableRoles: ['visitor','production assistant','set builder','camera crew','performer','tour guide','creator'],
  beats: [
    'enter a rights-safe Hollywood studio/backlot district inspired by the filmmaking economy',
    'take a production-tour mission through original reusable street, soundstage and effects assets',
    'learn practical-effects, camera, lighting, sound and set-dressing mini-games',
    'use the StreetVerse Time Machine to compare early-1990s Hollywood production culture with the modern entertainment district',
    'unlock creator jobs that connect Hollywood productions to All American Network and the marketplace',
    'return to Hollywood Boulevard and carry production skills into mural, television, film and creator missions',
  ],
  worldMemoryWrites: ['studio-production skill','Hollywood exploration memory','creator-career progress','time-machine discovery'],
  rightsGate: ['Universal Studios trademarks/logos','ride designs','film franchise IP','studio footage','character likenesses','proprietary backlot designs'],
}

export const HOLLYWOOD_LEGACY_SEQUENCE = [
  'Hollywood High / education memory',
  '1992 Hollywood Boulevard time layer',
  'public-art and mural apprenticeship',
  'television production memory',
  'Soul Train-era dance and scenic-production memory',
  'Universal Studios Hollywood / filmmaking-economy memory',
  'Avenue of Stars and mural archive',
  'return to present-day Hollywood with World Memory consequences',
] as const
