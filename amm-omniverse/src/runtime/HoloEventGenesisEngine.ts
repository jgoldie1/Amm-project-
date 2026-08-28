export type EventOutputKind =
  | 'GAME' | 'MISSION' | 'LIVE' | 'NEWS' | 'PK_BATTLE' | 'REEL'
  | 'BUSINESS' | 'HISTORY' | 'QUANTUM_TIME' | 'HOLO_LAB' | 'EDUCATION'
  | 'AR' | 'VR_MR' | 'CASE_FILE' | 'PODCAST_DEBATE' | 'STARVERSE'
  | 'CREATOR_JOB' | 'LEGACY'

export type EventGate = {
  rights: 'CLEAR' | 'REVIEW' | 'BLOCK'
  safety: 'CLEAR' | 'REVIEW' | 'BLOCK'
  age: 'GENERAL' | 'TEEN' | 'ADULT'
  provenance: 'VERIFIED' | 'PARTIAL' | 'UNKNOWN'
  money: 'VIRTUAL_ONLY' | 'PROVIDER_VERIFIED_REQUIRED'
}

export type EventDNA = {
  eventId: string
  worldId: string
  timelineId: string
  branchId: string
  occurredAt: string
  title: string
  summary: string
  location?: string
  actors: string[]
  entities: string[]
  decisions: string[]
  consequences: string[]
  tags: string[]
  source: 'AUTHORITATIVE_WORLD_STATE' | 'DOCUMENTED_REAL_EVENT' | 'SIMULATION'
  gate: EventGate
}

export type GenesisOutput = {
  outputId: string
  eventId: string
  kind: EventOutputKind
  title: string
  status: 'PROPOSED' | 'REVIEW_REQUIRED' | 'READY'
  reason: string
}

const defaultKinds: EventOutputKind[] = [
  'GAME','MISSION','LIVE','NEWS','PK_BATTLE','REEL','BUSINESS','HISTORY',
  'QUANTUM_TIME','HOLO_LAB','EDUCATION','AR','VR_MR','CASE_FILE',
  'PODCAST_DEBATE','STARVERSE','CREATOR_JOB','LEGACY',
]

function statusFor(event: EventDNA): GenesisOutput['status'] {
  if (event.gate.rights === 'BLOCK' || event.gate.safety === 'BLOCK') return 'REVIEW_REQUIRED'
  if (event.gate.rights === 'REVIEW' || event.gate.safety === 'REVIEW' || event.gate.provenance !== 'VERIFIED') return 'REVIEW_REQUIRED'
  return 'READY'
}

export function compileEvent(event: EventDNA, kinds: EventOutputKind[] = defaultKinds): GenesisOutput[] {
  const status = statusFor(event)
  return kinds.map((kind, index) => ({
    outputId: `${event.eventId}:${kind.toLowerCase()}:${index + 1}`,
    eventId: event.eventId,
    kind,
    title: `${event.title} — ${kind.replaceAll('_', ' ')}`,
    status,
    reason: `Derived from authoritative Event DNA ${event.eventId}; downstream systems must preserve source, timeline and gates.`,
  }))
}

export function canMonetize(event: EventDNA): boolean {
  return event.gate.rights === 'CLEAR' &&
    event.gate.safety === 'CLEAR' &&
    event.gate.provenance === 'VERIFIED' &&
    event.gate.money === 'PROVIDER_VERIFIED_REQUIRED'
}

export function createEventDNA(input: Omit<EventDNA, 'eventId'> & { eventId?: string }): EventDNA {
  return {
    ...input,
    eventId: input.eventId ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  }
}

export const HOLO_EVENT_GENESIS_PIPELINE = [
  'EVENT_DNA','EVENT_COMPILER','STORY_ENGINE','MEDIA_ENGINE','BATTLE_ENGINE',
  'CREATOR_ENGINE','OPPORTUNITY_ENGINE','HOLO_LABS','EDUCATION_ENGINE',
  'BUSINESS_ENGINE','TIMELINE','BUTTERFLY','LEGACY','QUANTUM_TIME','NEW_EVENT',
] as const
