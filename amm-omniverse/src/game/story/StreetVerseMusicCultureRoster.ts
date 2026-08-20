export type CulturalFigureReference = {
  id: string
  displayName: string
  city: 'Chicago' | 'Detroit'
  type: 'living-artist' | 'deceased-artist' | 'historical-reference'
  rightsStatus: 'reference-only' | 'licensed'
  allowedUse: string[]
}

// Named real artists remain reference-only until likeness/name/voice/music/story rights are cleared.
// Never synthesize a real person's endorsement, private conversation, criminal conduct or voice.
export const MUSIC_CULTURE_REFERENCES: CulturalFigureReference[] = [
  { id: 'lil-durk', displayName: 'Lil Durk', city: 'Chicago', type: 'living-artist', rightsStatus: 'reference-only', allowedUse: ['rights-planning', 'cultural-timeline'] },
  { id: 'king-von', displayName: 'King Von', city: 'Chicago', type: 'deceased-artist', rightsStatus: 'reference-only', allowedUse: ['rights-planning', 'cultural-timeline'] },
]

export type FictionalMusicMission = {
  id: string
  city: 'Chicago' | 'Detroit'
  title: string
  playableRoles: string[]
  beats: string[]
}

export const FICTIONAL_MUSIC_MISSIONS: FictionalMusicMission[] = [
  {
    id: 'chi-breakout-night', city: 'Chicago', title: 'Breakout Night',
    playableRoles: ['rapper', 'singer', 'producer', 'engineer', 'videographer', 'promoter', 'security'],
    beats: ['find a rehearsal room', 'finish the record', 'shoot a performance clip', 'promote the show', 'solve a venue problem', 'perform', 'settle the legitimate business ledger'],
  },
  {
    id: 'det-sound-lab', city: 'Detroit', title: 'Motor City Sound Lab',
    playableRoles: ['female rapper', 'male rapper', 'singer', 'producer', 'DJ', 'engineer', 'designer'],
    beats: ['meet the fictional crew', 'build a track', 'choose a visual identity', 'book a showcase', 'collaborate or compete', 'launch merchandise through the marketplace'],
  },
  {
    id: 'chi-det-crossover', city: 'Chicago', title: 'I-94 Crossover',
    playableRoles: ['artist', 'manager', 'driver', 'producer', 'promoter'],
    beats: ['assemble the Chicago team', 'travel I-94', 'meet Detroit collaborators', 'complete studio challenge', 'play dual-city event', 'unlock recurring tour missions'],
  },
]

export const ARTIST_RIGHTS_GATE = {
  likeness: true,
  nameAndBrand: true,
  recordedMusic: true,
  composition: true,
  archivalMedia: true,
  estateApprovalWhenApplicable: true,
  voiceCloneAllowedWithoutPermission: false,
  fictionalPrivateDialogueAllowed: false,
} as const
