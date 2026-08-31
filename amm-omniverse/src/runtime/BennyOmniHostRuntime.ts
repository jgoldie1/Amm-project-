export type BennyMood = 'welcoming' | 'playful' | 'dramatic' | 'competitive' | 'mysterious' | 'celebratory' | 'serious'
export type BennySurface = 'streetverse' | 'holo-fon' | 'live' | 'pk' | 'reels' | 'billboard' | 'vehicle' | 'ar' | 'vr' | 'spatial-display'

export interface BennyOmniHostMessage {
  id: string
  sourceEvent: string
  mood: BennyMood
  text: string
  surfaces: BennySurface[]
  playerId?: string
  missionId?: string
  secretId?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface BennyWorldState {
  solvedMysteries: string[]
  discoveredSecrets: string[]
  completedMissions: string[]
  broadcasts: number
  glitches: number
}

const state: BennyWorldState = {
  solvedMysteries: [],
  discoveredSecrets: [],
  completedMissions: [],
  broadcasts: 0,
  glitches: 0,
}

const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }))
const uniquePush = (items: string[], value?: string) => {
  if (value && !items.includes(value)) items.push(value)
}
const id = () => `benny-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function say(input: Omit<BennyOmniHostMessage, 'id' | 'createdAt'>) {
  const message: BennyOmniHostMessage = { ...input, id: id(), createdAt: new Date().toISOString() }
  emit('tryamm:benny:message', message)
  emit('tryamm:omnihost:message', message)
  return message
}

function bennyGlitch(detail: Record<string, unknown>) {
  state.glitches += 1
  const glitch = {
    id: id(),
    host: 'benny',
    signature: 'BENNY_GLITCH',
    clueOnly: true,
    directRewardAuthority: false,
    createdAt: new Date().toISOString(),
    ...detail,
  }
  emit('tryamm:benny:glitch', glitch)
  emit('tryamm:easter-egg:clue', glitch)
  return glitch
}

function requestAuthoritativeReward(input: { missionId?: string; secretId?: string; playerId?: string; reason: string }) {
  // Benny can request a reward, but never mutates balances or settles money herself.
  const request = {
    requestId: id(),
    requestedBy: 'benny-omnihost',
    authority: 'request-only',
    requiresServerValidation: true,
    requiresFundingCheck: true,
    requiresAntiReplay: true,
    ...input,
    createdAt: new Date().toISOString(),
  }
  emit('tryamm:reward:request', request)
  return request
}

function broadcastMoment(detail: Record<string, unknown>, reason: string) {
  state.broadcasts += 1
  emit('tryamm:benny:broadcast-intent', {
    id: id(),
    host: 'benny',
    reason,
    destinations: ['tryamm-live', 'pk', 'reels', 'holo-fon', 'ctv-fast'],
    source: detail,
    createdAt: new Date().toISOString(),
  })
}

function onMissionDiscovered(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const missionId = String(detail.missionId || '') || undefined
  const title = String(detail.title || 'a new mission')
  const rarity = String(detail.rarity || 'common')
  const playerId = String(detail.playerId || '') || undefined
  const isSecret = rarity === 'secret' || rarity === 'mythic'

  say({
    sourceEvent: 'tryamm:mission:discovered',
    mood: isSecret ? 'mysterious' : 'welcoming',
    text: isSecret ? `You found something the city was trying to hide. ${title} has begun.` : `${title} is live. I’ll be watching the world for what happens next.`,
    surfaces: ['streetverse', 'holo-fon'],
    playerId,
    missionId,
    metadata: { rarity },
  })

  if (isSecret) bennyGlitch({ missionId, playerId, hint: 'Watch signs, sound, timing, NPC routines, vehicles and Holo Fon messages for the next clue.' })
}

function onMissionCompleted(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const missionId = String(detail.missionId || '') || undefined
  const title = String(detail.title || 'Mission')
  const playerId = String(detail.playerId || '') || undefined
  uniquePush(state.completedMissions, missionId)

  say({
    sourceEvent: 'tryamm:mission:completed',
    mood: 'celebratory',
    text: `${title} complete. That changed your story — and it may have changed the city too.`,
    surfaces: ['streetverse', 'holo-fon', 'live', 'reels'],
    playerId,
    missionId,
  })
  broadcastMoment(detail, 'mission-completed')
  requestAuthoritativeReward({ missionId, playerId, reason: 'validated-mission-completion' })
  emit('tryamm:benny:world-state', getBennyWorldState())
}

function onEasterEggFound(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const missionId = String(detail.missionId || '') || undefined
  const secretId = String(detail.secretId || missionId || '') || undefined
  const playerId = String(detail.playerId || '') || undefined
  uniquePush(state.discoveredSecrets, secretId)

  say({
    sourceEvent: 'tryamm:easter-egg:found',
    mood: 'mysterious',
    text: 'That wasn’t a bug. You found one of my hidden threads. The next clue may not appear on the same screen.',
    surfaces: ['streetverse', 'holo-fon', 'billboard', 'vehicle', 'ar', 'vr'],
    playerId,
    missionId,
    secretId,
  })
  bennyGlitch({ missionId, secretId, playerId, stage: 'easter-egg-found' })
}

function onSecretTriggered(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const secretId = String(detail.secretId || '') || undefined
  const playerId = String(detail.playerId || '') || undefined
  uniquePush(state.discoveredSecrets, secretId)

  say({
    sourceEvent: 'tryamm:secret:triggered',
    mood: 'dramatic',
    text: 'Secret route unlocked. Keep going — some mysteries require several places, times, sounds and choices before the whole story opens.',
    surfaces: ['streetverse', 'holo-fon', 'billboard', 'spatial-display'],
    playerId,
    secretId,
  })
  emit('tryamm:benny:mystery-next-stage', {
    secretId,
    playerId,
    candidateStages: ['encrypted-holo-fon-message', 'location-clue', 'audio-clue', 'npc-routine', 'night-window', 'cross-verse-clue'],
    createdAt: new Date().toISOString(),
  })
}

function onMysterySolved(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const mysteryId = String(detail.mysteryId || detail.secretId || '') || undefined
  const playerId = String(detail.playerId || '') || undefined
  uniquePush(state.solvedMysteries, mysteryId)

  say({
    sourceEvent: 'tryamm:mystery:solved',
    mood: 'celebratory',
    text: 'Mystery solved. I’m recording the consequence in world memory so the discovery can unlock future story branches.',
    surfaces: ['streetverse', 'holo-fon', 'live', 'reels'],
    playerId,
    secretId: mysteryId,
  })
  emit('tryamm:world-memory:record', { type: 'benny-mystery-consequence', mysteryId, playerId, solvedAt: new Date().toISOString() })
  broadcastMoment(detail, 'mystery-solved')
  requestAuthoritativeReward({ secretId: mysteryId, playerId, reason: 'validated-mystery-completion' })
  emit('tryamm:benny:world-state', getBennyWorldState())
}

function onRaceMoment(event: Event) {
  const detail = ((event as CustomEvent<Record<string, unknown>>).detail || {})
  const playerId = String(detail.playerId || detail.driverId || '') || undefined
  say({
    sourceEvent: event.type,
    mood: 'competitive',
    text: 'Benny here — that’s a highlight moment. Keep it clean, keep it fast, and make the replay worth watching.',
    surfaces: ['streetverse', 'vehicle', 'live', 'reels'],
    playerId,
    metadata: detail,
  })
  broadcastMoment(detail, 'race-highlight')
}

export function getBennyWorldState(): BennyWorldState {
  return {
    solvedMysteries: [...state.solvedMysteries],
    discoveredSecrets: [...state.discoveredSecrets],
    completedMissions: [...state.completedMissions],
    broadcasts: state.broadcasts,
    glitches: state.glitches,
  }
}

let installed = false
export function installBennyOmniHostRuntime() {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('tryamm:mission:discovered', onMissionDiscovered)
  window.addEventListener('tryamm:mission:completed', onMissionCompleted)
  window.addEventListener('tryamm:easter-egg:found', onEasterEggFound)
  window.addEventListener('tryamm:secret:triggered', onSecretTriggered)
  window.addEventListener('tryamm:mystery:solved', onMysterySolved)
  window.addEventListener('tryamm:race:finished', onRaceMoment)
  window.addEventListener('tryamm:drift:completed', onRaceMoment)
  window.addEventListener('tryamm:tournament:won', onRaceMoment)

  const runtime = window as unknown as Record<string, unknown>
  runtime.__getBennyWorldState = getBennyWorldState
  runtime.__bennyGlitch = bennyGlitch
  runtime.__bennyRewardRequest = requestAuthoritativeReward

  emit('tryamm:benny:ready', {
    schema: 'tryamm.omnihost.benny.v1',
    identity: { name: 'Benny', gender: 'female', role: 'Flagship OmniHost / Living World Host' },
    capabilities: ['mission-host', 'game-master', 'commentary', 'creator-host', 'broadcast-director', 'easter-egg-narrator', 'mystery-master', 'world-state-memory', 'highlight-director', 'multisurface-presence'],
    surfaces: ['streetverse', 'holo-fon', 'live', 'pk', 'reels', 'billboard', 'vehicle', 'ar', 'vr', 'spatial-display'],
    easterEggSystem: ['benny-glitch', 'encrypted-holo-fon-clues', 'location-clues', 'audio-clues', 'npc-routines', 'nighttime-windows', 'multi-stage-mysteries', 'cross-verse-clues', 'world-state-unlocks'],
    accessibility: ['captions', 'translation-ready', 'audio-description-ready', 'alternate-input-ready'],
    controls: { directCashAuthority: false, directLedgerMutation: false, serverValidatedRewardsOnly: true, privacyScopedWorldMemory: true },
  })

  queueMicrotask(() => say({
    sourceEvent: 'tryamm:benny:ready',
    mood: 'playful',
    text: 'I’m Benny. I host the world, follow the missions, and hide a few things you’re not supposed to find right away.',
    surfaces: ['streetverse', 'holo-fon'],
  }))
}
