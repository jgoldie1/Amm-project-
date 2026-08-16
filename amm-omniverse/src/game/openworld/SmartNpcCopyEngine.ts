import type { DistrictId, NpcMemory } from './LivingCitySystems'

export type ObservedBehaviorKind =
  | 'route'
  | 'visit'
  | 'work'
  | 'shop'
  | 'socialize'
  | 'help'
  | 'avoid'
  | 'drive_style'
  | 'sport'
  | 'creator'
  | 'security_response'
  | 'weather_response'

export type NpcArchetype =
  | 'civilian'
  | 'worker'
  | 'creator'
  | 'merchant'
  | 'athlete'
  | 'driver'
  | 'security'
  | 'student'
  | 'visitor'

export interface ObservedBehavior {
  id: string
  sourceId: string
  sourceType: 'player' | 'npc' | 'world'
  kind: ObservedBehaviorKind
  district: DistrictId
  context: string
  action: string
  outcomeScore: number
  safetyScore: number
  repetition: number
  observedAt: number
}

export interface LearnedHabit {
  id: string
  kind: ObservedBehaviorKind
  district: DistrictId
  action: string
  confidence: number
  utility: number
  safetyScore: number
  learnedFrom: string[]
  lastUsedAt?: number
}

export interface SmartNpcProfile {
  npcId: string
  name: string
  archetype: NpcArchetype
  homeDistrict: DistrictId
  currentDistrict: DistrictId
  curiosity: number
  sociability: number
  caution: number
  adaptability: number
  trust: Record<string, number>
  observations: ObservedBehavior[]
  habits: LearnedHabit[]
  goals: string[]
  scheduleTags: string[]
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n))

export function observeBehavior(
  npc: SmartNpcProfile,
  observation: Omit<ObservedBehavior, 'id' | 'observedAt'>,
  now = Date.now(),
): SmartNpcProfile {
  const entry: ObservedBehavior = {
    ...observation,
    id: `obs-${npc.npcId}-${now}-${npc.observations.length}`,
    observedAt: now,
    outcomeScore: clamp(observation.outcomeScore),
    safetyScore: clamp(observation.safetyScore),
    repetition: Math.max(1, observation.repetition),
  }

  const observations = [...npc.observations, entry]
    .sort((a, b) => b.observedAt - a.observedAt)
    .slice(0, 100)

  return { ...npc, observations }
}

export function learnFromObservations(npc: SmartNpcProfile): SmartNpcProfile {
  const grouped = new Map<string, ObservedBehavior[]>()

  for (const observation of npc.observations) {
    const key = `${observation.kind}|${observation.district}|${observation.action}`
    const bucket = grouped.get(key) || []
    bucket.push(observation)
    grouped.set(key, bucket)
  }

  const habits: LearnedHabit[] = [...npc.habits]

  for (const [key, group] of grouped) {
    const repetition = group.reduce((sum, item) => sum + item.repetition, 0)
    const avgOutcome = group.reduce((sum, item) => sum + item.outcomeScore, 0) / group.length
    const avgSafety = group.reduce((sum, item) => sum + item.safetyScore, 0) / group.length
    const adaptationThreshold = 4 + Math.round((100 - npc.adaptability) / 25)

    if (repetition < adaptationThreshold || avgSafety < Math.max(45, npc.caution * 0.55)) continue

    const confidence = clamp(repetition * 7 + avgOutcome * 0.3 + npc.curiosity * 0.15)
    const utility = clamp(avgOutcome * 0.7 + avgSafety * 0.2 + npc.adaptability * 0.1)
    const [kind, district, action] = key.split('|') as [ObservedBehaviorKind, DistrictId, string]
    const id = `habit-${npc.npcId}-${kind}-${district}-${action.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
    const learnedFrom = [...new Set(group.map(item => item.sourceId))].slice(0, 8)
    const existingIndex = habits.findIndex(h => h.id === id)
    const habit: LearnedHabit = { id, kind, district, action, confidence, utility, safetyScore: avgSafety, learnedFrom }

    if (existingIndex >= 0) habits[existingIndex] = { ...habits[existingIndex], ...habit }
    else habits.push(habit)
  }

  return { ...npc, habits: habits.sort((a, b) => b.utility * b.confidence - a.utility * a.confidence).slice(0, 40) }
}

export function chooseAdaptiveHabit(
  npc: SmartNpcProfile,
  district: DistrictId,
  allowedKinds?: ObservedBehaviorKind[],
): LearnedHabit | undefined {
  const candidates = npc.habits.filter(h =>
    (h.district === district || h.district === npc.homeDistrict) &&
    h.safetyScore >= Math.max(45, npc.caution * 0.55) &&
    (!allowedKinds || allowedKinds.includes(h.kind)),
  )

  return candidates.sort((a, b) => {
    const aScore = a.utility * 0.55 + a.confidence * 0.35 + npc.adaptability * 0.1
    const bScore = b.utility * 0.55 + b.confidence * 0.35 + npc.adaptability * 0.1
    return bScore - aScore
  })[0]
}

export function updateTrustFromMemory(npc: SmartNpcProfile, memories: NpcMemory[], playerId: string): SmartNpcProfile {
  const relevant = memories.filter(memory => memory.npcId === npc.npcId && memory.playerId === playerId)
  const delta = relevant.reduce((sum, memory) => sum + memory.sentiment * (memory.importance / 100), 0)
  return { ...npc, trust: { ...npc.trust, [playerId]: clamp(delta, -100, 100) } }
}

export function shareLocalKnowledge(source: SmartNpcProfile, target: SmartNpcProfile): SmartNpcProfile {
  if (source.currentDistrict !== target.currentDistrict) return target
  if (target.sociability < 30) return target

  const shareable = source.habits
    .filter(h => h.safetyScore >= 60 && h.confidence >= 55)
    .slice(0, Math.max(1, Math.round(target.sociability / 25)))

  let next = target
  for (const habit of shareable) {
    next = observeBehavior(next, {
      sourceId: source.npcId,
      sourceType: 'npc',
      kind: habit.kind,
      district: habit.district,
      context: 'shared-local-knowledge',
      action: habit.action,
      outcomeScore: habit.utility,
      safetyScore: habit.safetyScore,
      repetition: Math.max(1, Math.round(habit.confidence / 25)),
    })
  }

  return learnFromObservations(next)
}

export function createSmartNpc(
  npcId: string,
  name: string,
  archetype: NpcArchetype,
  district: DistrictId,
  overrides: Partial<Pick<SmartNpcProfile, 'curiosity' | 'sociability' | 'caution' | 'adaptability' | 'goals' | 'scheduleTags'>> = {},
): SmartNpcProfile {
  return {
    npcId,
    name,
    archetype,
    homeDistrict: district,
    currentDistrict: district,
    curiosity: 60,
    sociability: 55,
    caution: 60,
    adaptability: 65,
    trust: {},
    observations: [],
    habits: [],
    goals: ['work', 'social', 'rest'],
    scheduleTags: ['day', 'evening'],
    ...overrides,
  }
}

export const smartNpcRules = {
  copyAllowed: [
    'navigation routes',
    'safe driving patterns',
    'shopping and venue preferences',
    'work and social routines',
    'sports and creator activities',
    'helpful interactions',
    'weather and traffic adaptation',
    'nonviolent security avoidance and de-escalation',
  ],
  neverCopy: [
    'unsafe or self-destructive behavior',
    'harassment',
    'exploitation',
    'private account secrets',
    'real-world personal identity data',
    'unverified financial behavior',
    'behavior explicitly blocked by game rules',
  ],
  principle: 'NPCs learn patterns and preferences, not private identities. Canonical rules and server authority always win.',
} as const
