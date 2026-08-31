export type MissionRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'secret' | 'mythic'
export type MissionCategory = 'story' | 'racing' | 'drift' | 'motorcycle' | 'delivery' | 'business' | 'crew' | 'relationship' | 'nightlife' | 'after-dark' | 'puzzle' | 'exploration' | 'cross-verse' | 'reality-quest'
export type SecretTriggerType = 'location' | 'item' | 'audio-clue' | 'qr-symbol' | 'relationship-state' | 'business-state' | 'race-win' | 'time-window' | 'weather' | 'sequence' | 'world-memory' | 'cross-verse-clue'
export type SecretAreaState = 'hidden' | 'discovered' | 'unlocked' | 'completed'

export interface MissionDiscovery {
  missionId: string
  title: string
  rarity: MissionRarity
  category: MissionCategory
  playerId: string
  locationId?: string
  clue?: string
  adultOnly?: boolean
  crossVerseDestination?: 'streetverse' | 'spaceverse' | 'starverse' | 'kingdoms-press' | 'living-scroll' | 'holoverse' | '64-track-studio' | 'after-dark'
  metadata?: Record<string, unknown>
}

export interface SecretTrigger {
  secretId: string
  playerId: string
  type: SecretTriggerType
  value: string
  locationId?: string
  adultOnly?: boolean
  ageVerified18Plus?: boolean
  afterDarkOptIn?: boolean
}

const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }))
const missionState = new Map<string, MissionDiscovery & { status: 'discovered' | 'completed'; discoveredAt: string; completedAt?: string }>()
const secretState = new Map<string, { state: SecretAreaState; updatedAt: string }>()

const adultGate = (input: { adultOnly?: boolean; ageVerified18Plus?: boolean; afterDarkOptIn?: boolean }) => {
  if (!input.adultOnly) return true
  return input.ageVerified18Plus === true && input.afterDarkOptIn === true
}

export function discoverStreetVerseMission(mission: MissionDiscovery) {
  const record = { ...mission, status: 'discovered' as const, discoveredAt: new Date().toISOString() }
  missionState.set(mission.missionId, record)
  emit('tryamm:mission:discovered', record)
  emit('tryamm:world-memory:record', { type: 'mission-discovery', ...record })
  if (mission.rarity === 'secret' || mission.rarity === 'mythic') emit('tryamm:easter-egg:found', record)
  if (mission.crossVerseDestination) emit('tryamm:cross-verse:clue', { missionId: mission.missionId, destination: mission.crossVerseDestination, clue: mission.clue })
  return record
}

export function triggerStreetVerseSecret(trigger: SecretTrigger) {
  const allowed = adultGate(trigger)
  if (!allowed) {
    const denied = { allowed: false, secretId: trigger.secretId, reason: 'adult-gate-required' }
    emit('tryamm:after-dark:mission-gate', denied)
    return denied
  }
  const record = { ...trigger, allowed: true, triggeredAt: new Date().toISOString() }
  secretState.set(trigger.secretId, { state: 'discovered', updatedAt: record.triggeredAt })
  emit('tryamm:secret:triggered', record)
  emit('tryamm:secret-area:unlocked', { secretId: trigger.secretId, state: 'unlocked', trigger: trigger.type })
  secretState.set(trigger.secretId, { state: 'unlocked', updatedAt: record.triggeredAt })
  emit('tryamm:world-memory:record', { ...record, recordType: 'secret-discovery' })
  return record
}

export function completeStreetVerseMission(missionId: string, outcome: Record<string, unknown> = {}) {
  const mission = missionState.get(missionId)
  if (!mission) return { completed: false, missionId, reason: 'mission-not-discovered' }
  const record = { ...mission, status: 'completed' as const, completedAt: new Date().toISOString(), outcome }
  missionState.set(missionId, record)
  emit('tryamm:mission:completed', record)
  emit('tryamm:mission:consequence', { missionId, rarity: mission.rarity, category: mission.category, outcome, destinations: ['world-memory', 'relationships', 'crew-reputation', 'business-network', 'creator-content', 'command-nexus'] })
  emit('tryamm:world-memory:record', { type: 'mission-consequence', ...record })
  emit('tryamm:mission:next-candidate', { sourceMissionId: missionId, prefer: mission.rarity === 'mythic' ? ['cross-verse', 'reality-quest'] : ['story', 'exploration', 'business'] })
  return record
}

export function buildLivingMysteryContext(input: { playerId: string; timeOfDay?: string; weather?: string; neighborhood?: string; reputation?: number; crewId?: string; relationshipStates?: string[]; businessStates?: string[]; worldMemoryKeys?: string[] }) {
  const context = { ...input, generatedAt: new Date().toISOString(), directors: ['time', 'weather', 'location', 'reputation', 'crew', 'relationships', 'business-state', 'world-memory'] }
  emit('tryamm:living-mystery:context', context)
  return context
}

export function buildRealityQuest(input: { questId: string; playerId: string; virtualStart: string; optionalRealWorldClue?: string; approvedLocationId?: string; xrEncounter?: string; accessibilityVirtualAlternative: string }) {
  const quest = { ...input, stages: ['virtual-discovery', 'optional-reality-bridge', 'ar-xr-encounter', 'streetverse-return', 'world-memory'], rightsAndLocationApprovalRequired: Boolean(input.approvedLocationId), generatedAt: new Date().toISOString() }
  emit('tryamm:reality-quest:created', quest)
  return quest
}

export function getStreetVerseMissionDiscoveryState() {
  return { missions: [...missionState.values()], secrets: [...secretState.entries()].map(([secretId, value]) => ({ secretId, ...value })) }
}

export function installStreetVerseMissionDiscoveryRuntime() {
  const w = window as unknown as Window & Record<string, unknown>
  w.__discoverStreetVerseMission = discoverStreetVerseMission
  w.__triggerStreetVerseSecret = triggerStreetVerseSecret
  w.__completeStreetVerseMission = completeStreetVerseMission
  w.__getStreetVerseMissionDiscoveryState = getStreetVerseMissionDiscoveryState
  w.__buildStreetVerseLivingMysteryContext = buildLivingMysteryContext
  w.__buildStreetVerseRealityQuest = buildRealityQuest
  emit('tryamm:mission-discovery:ready', {
    rarities: ['common', 'uncommon', 'rare', 'legendary', 'secret', 'mythic'],
    systems: ['mission-compiler', 'living-mystery-director', 'easter-eggs', 'secret-areas', 'cross-verse-clues', 'world-memory', 'reality-quests', 'adult-gated-after-dark'],
    interfaceLadder: ['phone-3d', 'ar', 'vr-mr', 'spatial-display', 'compatible-holographic-display', 'haptics', 'experimental-construct-interface'],
    boundaries: { adultLane18Plus: true, noMinorsInAdultLane: true, nonGraphicAdultPresentationOnly: true, noPublicIntimateTelemetry: true, noIntimateAdTargeting: true, physicalHologramClaimsRequireHardwareValidation: true },
  })
}
