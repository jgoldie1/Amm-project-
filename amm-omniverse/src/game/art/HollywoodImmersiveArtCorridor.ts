export type ImmersiveArtNode = {
  id: string
  title: string
  medium: string[]
  triggers: string[]
  memoryInputs: string[]
  outputs: string[]
  rightsMode: 'original' | 'reference-only' | 'licensed'
}

export const HOLLYWOOD_IMMERSIVE_ART_CORRIDOR: ImmersiveArtNode[] = [
  {
    id: 'living-mural-wall',
    title: 'Living Mural Wall',
    medium: ['PBR mural surface','projection mapping','hologram depth','spatial audio','particle light'],
    triggers: ['player proximity','time-of-day','World Memory milestone','music beat','community event'],
    memoryInputs: ['Hollywood memories','school memories','film/TV memories','family memories','creator achievements'],
    outputs: ['animated mural layers','spoken memory fragments','holographic silhouettes','unlockable story portal'],
    rightsMode: 'original',
  },
  {
    id: 'soul-train-dance-light',
    title: 'Dance Light Corridor',
    medium: ['reactive floor light','motion trails','original music stems','Lottie 2.0 overlays','volumetric light'],
    triggers: ['dance input','group rhythm','creator performance','World Memory callback'],
    memoryInputs: ['dance reputation','television production memories','scenic-production skill'],
    outputs: ['music-reactive visuals','crowd response','creator clip moment','legacy score event'],
    rightsMode: 'original',
  },
  {
    id: 'time-portal-gallery',
    title: 'Time Portal Gallery',
    medium: ['era-shift shader','environment morphing','archival-style typography','spatial ambience','holographic wayfinding'],
    triggers: ['Time Machine selection','evidence level','player chapter progress'],
    memoryInputs: ['1992 Hollywood layer','present-day Hollywood','verified public-history references'],
    outputs: ['before/after environment transition','historical context cards','memory missions','return-to-present consequence'],
    rightsMode: 'original',
  },
  {
    id: 'avenue-of-stars',
    title: 'Avenue of Stars',
    medium: ['interactive pavement lights','AR star markers','holographic biographies','creator portals'],
    triggers: ['walk path','scan interaction','mission completion','licensed creator partnership'],
    memoryInputs: ['public cultural references','licensed creator data','player-authored legacy memories'],
    outputs: ['story nodes','creator missions','rights-safe cultural timeline','unlockable production jobs'],
    rightsMode: 'reference-only',
  },
]

export const IMMERSIVE_ART_PRINCIPLES = [
  'art reacts to the player instead of remaining a static texture',
  'World Memory changes the artwork over time',
  'sound, light, movement and story are equal parts of the artwork',
  'every visual-heavy interaction has reduced-motion and nonvisual alternatives',
  'real murals/artworks are references until reproduction/display rights are cleared',
  'community-created art enters through moderation, attribution and rights review',
] as const

export function buildArtState(input: { memoryCount: number; legacyScore: number; timeLayer: string; reducedMotion?: boolean }) {
  const intensity = Math.min(1, Math.max(0.25, input.legacyScore / 100))
  return {
    intensity: input.reducedMotion ? Math.min(intensity, .45) : intensity,
    memoryDensity: Math.min(12, Math.max(1, input.memoryCount)),
    timeLayer: input.timeLayer,
    motionMode: input.reducedMotion ? 'stable' : 'reactive',
    renderMode: 'holographic-immersive-art',
  }
}
