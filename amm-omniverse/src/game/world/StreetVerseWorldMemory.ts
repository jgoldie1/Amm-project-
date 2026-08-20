export type MemoryScope = 'character' | 'relationship' | 'business' | 'school' | 'career' | 'neighborhood' | 'city' | 'sports' | 'media' | 'travel' | 'legacy'

export type WorldMemoryEvent = {
  id: string
  userId: string
  characterId: string
  scope: MemoryScope
  regionId: string
  subjectId?: string
  eventType: string
  summary: string
  importance: number
  occurredAt: string
  tags: string[]
  consequences?: string[]
}

export type RelationshipMemory = {
  npcId: string
  characterId: string
  affinity: number
  trust: number
  respect: number
  lastSeenAt?: string
  memories: string[]
}

export type WorldMemoryState = {
  events: WorldMemoryEvent[]
  relationships: Record<string, RelationshipMemory>
  reputationByRegion: Record<string, number>
  legacyScore: number
}

export const emptyWorldMemory = (): WorldMemoryState => ({
  events: [], relationships: {}, reputationByRegion: {}, legacyScore: 0,
})

export function rememberEvent(state: WorldMemoryState, event: WorldMemoryEvent): WorldMemoryState {
  const events = [...state.events, event]
    .sort((a,b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 2500)
  const currentRep = state.reputationByRegion[event.regionId] ?? 0
  const reputationDelta = Math.max(-5, Math.min(5, Math.round((event.importance - 50) / 15)))
  return {
    ...state,
    events,
    reputationByRegion: { ...state.reputationByRegion, [event.regionId]: Math.max(-100, Math.min(100, currentRep + reputationDelta)) },
    legacyScore: Math.max(0, state.legacyScore + Math.max(0, Math.floor(event.importance / 25))),
  }
}

export function rememberRelationship(state: WorldMemoryState, memory: RelationshipMemory): WorldMemoryState {
  return { ...state, relationships: { ...state.relationships, [`${memory.characterId}:${memory.npcId}`]: memory } }
}

export function recallForDialogue(state: WorldMemoryState, characterId: string, regionId: string, subjectId?: string) {
  return state.events
    .filter(e => e.characterId === characterId && e.regionId === regionId && (!subjectId || e.subjectId === subjectId))
    .sort((a,b) => b.importance - a.importance || Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 12)
}

export function buildReturnToCityBeat(state: WorldMemoryState, characterId: string, regionId: string) {
  const memories = recallForDialogue(state, characterId, regionId)
  const rep = state.reputationByRegion[regionId] ?? 0
  if (!memories.length) return 'Nobody here knows your story yet. Build one.'
  if (rep >= 60) return `People recognize you. Local screens and NPC conversations remember ${memories[0].summary}.`
  if (rep <= -40) return `Your return creates tension. NPCs remember ${memories[0].summary}, and some opportunities require rebuilding trust.`
  return `The city remembers. Old contacts can reference ${memories[0].summary}, while new choices can change your reputation.`
}

export const WORLD_MEMORY_CONSEQUENCES = [
  'NPCs remember promises, favors, conflicts and collaborations',
  'schools remember attendance, achievements and alumni milestones',
  'employers remember performance and references',
  'businesses remember contracts, customers, employees and disputes',
  'neighborhoods remember major missions and community investments',
  'sports districts remember championships, event work and creator coverage',
  'media remembers broadcasts, viral moments and corrections',
  'cities remember reputation when the player leaves and returns',
  'family and relationship arcs react to time away and major choices',
  'legacy records long-term impact across generations and worlds',
] as const

export const WORLD_MEMORY_PRIVACY = {
  playerCanReview: true,
  playerCanDeleteOptionalPersonalMemories: true,
  sensitiveRealWorldDataAllowed: false,
  syntheticNpcMemoryOnly: true,
  cashLedgerSeparateFromNarrativeMemory: true,
} as const
