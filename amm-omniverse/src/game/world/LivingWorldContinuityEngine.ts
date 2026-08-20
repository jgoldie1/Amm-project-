export type LivingEntityKind = 'npc'|'business'|'school'|'venue'|'neighborhood'|'media'|'family'|'career'

export type LivingEntity = {
  id: string
  kind: LivingEntityKind
  regionId: string
  state: string
  reputation: number
  lastUpdatedAt: string
  relationships?: Record<string, number>
  metadata?: Record<string, string | number | boolean>
}

export type WorldTickContext = {
  now: string
  playerAwaySince?: string
  regionPopulationFactor: number
  eventIntensity: number
  economyFactor: number
}

export type WorldChange = {
  entityId: string
  before: string
  after: string
  reason: string
  importance: number
}

function elapsedDays(from: string | undefined, to: string) {
  if (!from) return 0
  return Math.max(0, Math.floor((Date.parse(to) - Date.parse(from)) / 86_400_000))
}

export function simulateWorldContinuity(entities: LivingEntity[], ctx: WorldTickContext): WorldChange[] {
  const daysAway = elapsedDays(ctx.playerAwaySince, ctx.now)
  if (daysAway < 1) return []
  const changes: WorldChange[] = []

  for (const entity of entities) {
    const seed = [...entity.id].reduce((n,c)=>n+c.charCodeAt(0),0)
    const pressure = (daysAway * Math.max(.25, ctx.economyFactor) * Math.max(.25, ctx.regionPopulationFactor)) + ctx.eventIntensity + (seed % 7)
    if (entity.kind === 'business' && pressure > 35) {
      const after = entity.reputation >= 50 ? 'expanded' : entity.reputation <= -30 ? 'closed-or-restructured' : 'changed-staff-or-hours'
      changes.push({ entityId:entity.id, before:entity.state, after, reason:'economy + time away + reputation', importance:70 })
    } else if (entity.kind === 'npc' && pressure > 25) {
      changes.push({ entityId:entity.id, before:entity.state, after:'life-changed', reason:'career/relationship schedule advanced while player was away', importance:55 })
    } else if (entity.kind === 'school' && daysAway > 120) {
      changes.push({ entityId:entity.id, before:entity.state, after:'new-term-or-alumni-era', reason:'academic calendar advanced', importance:45 })
    } else if (entity.kind === 'neighborhood' && pressure > 50) {
      changes.push({ entityId:entity.id, before:entity.state, after:'district-evolved', reason:'events, commerce and time changed the district', importance:65 })
    }
  }
  return changes
}

export type BiographySnapshot = {
  id: string
  characterId: string
  capturedAt: string
  chapter: string
  regionId: string
  ageOrLifeStage?: string
  reputation: Record<string, number>
  relationships: Record<string, number>
  businesses: string[]
  schools: string[]
  careers: string[]
  homes: string[]
  vehicles: string[]
  missions: string[]
  majorChoices: string[]
  legacyScore: number
}

export function createBiographySnapshot(input: Omit<BiographySnapshot,'id'>): BiographySnapshot {
  const safe = `${input.characterId}:${input.capturedAt}:${input.chapter}`.replace(/[^a-zA-Z0-9:-]/g,'-')
  return { ...input, id:`bio-${safe}` }
}

export const RETURN_HOME_SEQUENCE = [
  'load departure biography snapshot',
  'simulate elapsed world time',
  'apply eligible NPC/business/school/neighborhood changes',
  'compare old and new world states',
  'select the most meaningful choice echoes',
  'Eve/Stubbs AI prepares context-aware return dialogue',
  'spawn visual World Memory echoes at relevant locations',
  'offer reconciliation, opportunity, consequence and legacy missions',
  'write the return chapter into the biography',
] as const
