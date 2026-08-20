export type LifeStage =
  | 'background'
  | 'school'
  | 'friends'
  | 'first-job'
  | 'career'
  | 'money'
  | 'home'
  | 'vehicle'
  | 'relationships'
  | 'business'
  | 'employees'
  | 'reputation'
  | 'travel'
  | 'legacy'

export type UniversalLifeState = {
  characterId: string
  currentStage: LifeStage
  educationXp: number
  careerXp: number
  reputation: number
  homes: string[]
  vehicles: string[]
  relationships: Record<string, number>
  businesses: string[]
  employees: string[]
  visitedRegions: string[]
  legacyMilestones: string[]
}

export const UNIVERSAL_LIFE_PATH: LifeStage[] = [
  'background','school','friends','first-job','career','money','home','vehicle','relationships','business','employees','reputation','travel','legacy'
]

export const LIFE_PATH_GAME_ADAPTERS = [
  'StreetVerse',
  'GameVerse',
  'StarVerse',
  'PropertyVerse',
  'SpaceOS',
  'Isaiah AI TV',
  'HoloMusic',
  'All American University',
] as const

export function canAdvanceLifeStage(state: UniversalLifeState, target: LifeStage) {
  const current = UNIVERSAL_LIFE_PATH.indexOf(state.currentStage)
  const next = UNIVERSAL_LIFE_PATH.indexOf(target)
  return next <= current + 1
}

export function addVisitedRegion(state: UniversalLifeState, regionId: string): UniversalLifeState {
  if (state.visitedRegions.includes(regionId)) return state
  return { ...state, visitedRegions: [...state.visitedRegions, regionId] }
}
