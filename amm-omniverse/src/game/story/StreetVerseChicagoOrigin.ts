import type { WorldMemoryEvent } from '../world/StreetVerseWorldMemory'

export type OriginMission = {
  id: string
  title: string
  district: string
  objective: string
  worldMemory: string
  unlocks: string[]
  presentation: string[]
}

export const CHICAGO_ORIGIN_TITLE = 'Meet the Stubbs: From the Projects to the Omniverse'

export const CHICAGO_ORIGIN_CONTEXT = {
  publicStoryAnchor: 'Near West Side / Madden Park / Circle Park / ABLA-Village surroundings',
  privateHomeAnchorPolicy: 'Exact apartment/unit information belongs only in the player private profile and must never be embedded in public source code or public world labels.',
  framing: 'Autobiographical inspiration is transformed into an original StreetVerse story using fictionalized NPCs, privacy-safe locations, World Memory and player choice.',
} as const

export const CHICAGO_ORIGIN_MISSIONS: OriginMission[] = [
  {
    id: 'origin-01-the-block-remembers',
    title: 'The Block Remembers',
    district: 'Near West Side Memory District',
    objective: 'Wake into the neighborhood, learn movement, phone, Stubbs AI, accessibility and World Memory. Walk the first route and choose what details your character wants the world to remember.',
    worldMemory: 'Your origin becomes the first permanent character memory, but private home details remain private.',
    unlocks: ['character claim', 'neighborhood map', 'memory journal'],
    presentation: ['gold-hour Chicago light', 'holographic memory echoes', 'distant trains and traffic', 'basketball court ambience', 'spatial neighborhood sound'],
  },
  {
    id: 'origin-02-everybody-knows-somebody',
    title: 'Everybody Knows Somebody',
    district: 'Community Loop',
    objective: 'Meet fictionalized neighbors and mentors. Choose who to help, who to trust and which relationship you want to build first.',
    worldMemory: 'NPC affinity, trust and respect begin changing future dialogue and opportunities.',
    unlocks: ['relationship graph', 'mentor missions', 'community reputation'],
    presentation: ['reactive crowds', 'porch and storefront conversations', 'holo subtitles', 'cinematic close conversation camera'],
  },
  {
    id: 'origin-03-first-dollar',
    title: 'First Dollar',
    district: 'Neighborhood Commerce',
    objective: 'Complete a legitimate first-money mission: help a vendor, work a shift, make a delivery, produce content or assist a local service.',
    worldMemory: 'The first employer/customer remembers whether you were reliable, late, creative or careless.',
    unlocks: ['career history', 'first reference', 'marketplace tutorial'],
    presentation: ['customer traffic', 'working storefronts', 'receipt/ledger holo overlay', 'dynamic street traffic'],
  },
  {
    id: 'origin-04-the-choice',
    title: 'The Choice',
    district: 'Life Path Junction',
    objective: 'Choose or combine school, work, music, sports, creator, public-service, technology, logistics and entrepreneurship paths.',
    worldMemory: 'The world records the choice as a starting direction, not a permanent restriction.',
    unlocks: ['education', 'jobs', 'sportsverse', 'creator tools', 'business claim'],
    presentation: ['holographic future-path projections', 'branching Stubbs AI dialogue', 'interactive city map'],
  },
  {
    id: 'origin-05-lakefront-promise',
    title: 'Lakefront Promise',
    district: 'Chicago Lakefront',
    objective: 'Travel from the neighborhood to the lakefront. Complete a summer job/event task while seeing how far the same character can travel.',
    worldMemory: 'The lakefront becomes an aspiration memory that can be referenced later after the player succeeds elsewhere.',
    unlocks: ['lakefront summer', 'sports events', 'media missions', 'tourism economy'],
    presentation: ['photoreal water reflections', 'Lake Shore Drive traffic', 'boats and beaches', 'volumetric sunset', 'holographic skyline wayfinding'],
  },
  {
    id: 'origin-06-build-something-that-stays',
    title: 'Build Something That Stays',
    district: 'All American Marketplace',
    objective: 'Create or help launch the first storefront/community project. Hire or collaborate with one NPC and make a decision that changes the neighborhood state.',
    worldMemory: 'The project persists after the mission and can grow, struggle, hire or close based on later choices.',
    unlocks: ['storefront growth', 'staffing', 'business missions', 'regional expansion'],
    presentation: ['before/after world state', 'construction/storefront VFX', 'customer simulation', 'holo business dashboard'],
  },
  {
    id: 'origin-07-return-home',
    title: 'Return Home',
    district: 'Near West Side Memory District',
    objective: 'After completing at least one out-of-city chapter, return to Chicago and experience NPC, business and neighborhood consequences from your earlier decisions.',
    worldMemory: 'The opening becomes replayable as a changed place rather than a static tutorial.',
    unlocks: ['legacy chapter', 'alumni/mentor role', 'community investment', 'new-game legacy hooks'],
    presentation: ['changed storefronts and NPC schedules', 'memory comparison holograms', 'local media reactions', 'dynamic return dialogue'],
  },
]

export function createOriginMemoryEvent(input: {
  userId: string
  characterId: string
  mission: OriginMission
  summary: string
  consequences?: string[]
}): WorldMemoryEvent {
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    characterId: input.characterId,
    scope: input.mission.id === 'origin-07-return-home' ? 'legacy' : 'neighborhood',
    regionId: 'chicago',
    subjectId: input.mission.id,
    eventType: 'origin-mission',
    summary: input.summary,
    importance: input.mission.id === 'origin-01-the-block-remembers' ? 100 : 80,
    occurredAt: new Date().toISOString(),
    tags: ['meet-the-stubbs', 'chicago-origin', input.mission.id],
    consequences: input.consequences,
  }
}

export const STUBBS_AI_ORIGIN_LINES = [
  'This city does not start with a mission marker. It starts with memory.',
  'You came from somewhere. What you do next decides what that place remembers about you.',
  'You can leave Chicago, build across the world, and come back. The block will not reset while you are gone.',
  'StreetVerse is not asking whether you can beat the game. It is asking what kind of life you can build inside it.',
] as const
