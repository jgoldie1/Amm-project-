import type { WorldMemoryState } from '../world/StreetVerseWorldMemory'

export type EveInput = {
  characterId: string
  regionId: string
  missionId: string
  health?: number
  reputation?: number
  accessibility?: { reducedMotion?: boolean; oneHanded?: boolean; captions?: boolean }
  memory: WorldMemoryState
}

export type EveDirective = {
  pacing: 'quiet' | 'normal' | 'intense'
  npcDensity: 'low' | 'medium' | 'high'
  camera: 'stable' | 'cinematic' | 'assistive'
  hintLevel: 0 | 1 | 2 | 3
  lottieMotion: 'full' | 'reduced' | 'static'
  nextBeat: string
  reasons: string[]
}

export function directStreetVerseScene(input: EveInput): EveDirective {
  const reasons: string[] = []
  let pacing: EveDirective['pacing'] = 'normal'
  let npcDensity: EveDirective['npcDensity'] = 'medium'
  let camera: EveDirective['camera'] = 'cinematic'
  let hintLevel: EveDirective['hintLevel'] = 1
  let lottieMotion: EveDirective['lottieMotion'] = 'full'

  if (input.accessibility?.reducedMotion) {
    camera = 'stable'
    lottieMotion = 'static'
    reasons.push('reduced-motion preference')
  }
  if (input.accessibility?.oneHanded) {
    camera = 'assistive'
    hintLevel = 2
    reasons.push('one-handed control assistance')
  }
  if ((input.health ?? 100) < 35) {
    pacing = 'quiet'
    npcDensity = 'low'
    hintLevel = 3
    reasons.push('player state needs a lower-pressure beat')
  }
  const regionMemories = input.memory.events.filter(e => e.characterId === input.characterId && e.regionId === input.regionId)
  if (regionMemories.length >= 8 && (input.reputation ?? 0) >= 50) {
    npcDensity = 'high'
    reasons.push('world recognizes established character history')
  }

  const nextBeat = regionMemories.length
    ? `Recall ${regionMemories[0].summary} through dialogue or environment before advancing ${input.missionId}.`
    : `Introduce ${input.missionId} without pretending the world remembers events that have not happened.`

  return { pacing, npcDensity, camera, hintLevel, lottieMotion, nextBeat, reasons }
}

export const EVE_STREETVERSE_GUARDRAILS = [
  'Never fabricate a player memory as verified fact.',
  'Never unlock licensed film or celebrity likeness media without rights proof.',
  'Prefer original/reused assets before generating duplicate assets.',
  'Respect accessibility before cinematic intensity.',
  'Preserve player agency: recommendations may guide but must not silently make irreversible choices.',
  'Keep real-money eligibility separate from story rewards.',
] as const
