export type SoulTrainLineState = {
  round: number
  crowdEnergy: number
  cameraScore: number
  rhythmScore: number
  originalityScore: number
  completed: boolean
}

export const SOUL_TRAIN_LINE_EXPERIENCE = {
  id: 'soul-train-line',
  title: 'Soul Train Line — Legacy Dance Corridor',
  rightsMode: 'original-recreation-only' as const,
  description: 'A rights-safe homage built with original choreography, original music, reactive floor lighting, holographic motion trails, camera blocking and World Memory.',
  roles: ['featured dancer','line dancer','camera operator','floor director','lighting operator','scenic crew','music producer','creator host'],
  gameplay: [
    'enter through a holographic dance corridor with adaptive accessibility settings',
    'pick an original dance style or freestyle',
    'move through the line while rhythm timing and originality are scored',
    'camera AI chooses close, medium and wide shots based on movement',
    'reactive floor panels and holographic trails respond to timing and crowd energy',
    'multiplayer spectators can emote and raise crowd energy without altering the dancer score',
    'finish with a creator replay clip and a World Memory write',
  ],
  accessibility: [
    'one-handed input presets',
    'seated dance mode',
    'upper-body-only scoring',
    'reduced-motion visual mode',
    'beat haptics when available',
    'visual beat lane for deaf/hard-of-hearing players',
    'audio cues and narrated stage markers for blind/low-vision players',
  ],
  rightsGate: [
    'Soul Train name/logo/trade dress',
    'archival footage',
    'recorded performances',
    'celebrity likenesses',
    'copyrighted choreography',
    'commercial music masters/compositions',
  ],
} as const

export function createSoulTrainLineState(): SoulTrainLineState {
  return { round: 1, crowdEnergy: 50, cameraScore: 0, rhythmScore: 0, originalityScore: 0, completed: false }
}

export function scoreSoulTrainMove(
  state: SoulTrainLineState,
  input: { onBeat: number; cameraFraming: number; originality: number; crowdDelta?: number }
): SoulTrainLineState {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))
  const rhythmScore = clamp((state.rhythmScore * (state.round - 1) + input.onBeat) / state.round)
  const cameraScore = clamp((state.cameraScore * (state.round - 1) + input.cameraFraming) / state.round)
  const originalityScore = clamp((state.originalityScore * (state.round - 1) + input.originality) / state.round)
  const crowdEnergy = clamp(state.crowdEnergy + (input.crowdDelta ?? 0) + Math.round((input.onBeat + input.originality - 100) / 20))
  const nextRound = state.round + 1
  return { round: nextRound, crowdEnergy, cameraScore, rhythmScore, originalityScore, completed: nextRound > 8 }
}

export function soulTrainLineResult(state: SoulTrainLineState) {
  const total = Math.round(state.rhythmScore * 0.4 + state.originalityScore * 0.35 + state.cameraScore * 0.15 + state.crowdEnergy * 0.1)
  const rank = total >= 90 ? 'LEGENDARY' : total >= 75 ? 'HEADLINER' : total >= 60 ? 'SHOWCASE' : 'RISING'
  return {
    total,
    rank,
    memory: `Completed the Hollywood legacy dance line with ${total}/100 and ${rank} rank.`,
    unlocks: total >= 75 ? ['creator replay','advanced dance mission','Hollywood showcase invite'] : ['creator replay','practice remix'],
  }
}
