export const CHICAGO_COMMUNITY_AREA_COUNT = 77 as const

export type ChicagoCommunityAreaStatus =
  | 'planned'
  | 'sources-ready'
  | 'compiling'
  | 'qa'
  | 'certified'
  | 'blocked'

export interface CommunityAreaSource {
  id: string
  kind: 'boundary' | 'street' | 'transit' | 'building' | 'business' | 'landmark' | 'ecology' | 'history'
  uri: string
  authorized: boolean
  capturedAt?: string
}

export interface CommunityAreaPassport {
  id: number
  slug: string
  name: string
  city: 'Chicago'
  state: 'Illinois'
  country: 'US'
  status: ChicagoCommunityAreaStatus
  sources: CommunityAreaSource[]
  systems: {
    streets: boolean
    transit: boolean
    buildings: boolean
    propertyVerse: boolean
    businesses: boolean
    population: boolean
    ecology: boolean
    missions: boolean
    timeMachine: boolean
  }
  mobileBudget: {
    maxActiveAgents: number
    maxActiveVehicles: number
    maxVisibleTriangles: number
    streamingCellMeters: number
  }
  certification: {
    navigation: boolean
    collision: boolean
    mobilePerformance: boolean
    sourceProvenance: boolean
    livingCity: boolean
    founderApproved: boolean
  }
}

export const CHICAGO_AREA_COMPILER_STAGES = [
  'VALIDATE_PASSPORT',
  'INGEST_AUTHORIZED_SOURCES',
  'COMPILE_GEOGRAPHY',
  'COMPILE_STREETS_AND_TRANSIT',
  'COMPILE_BUILDINGS_AND_PROPERTY',
  'COMPILE_BUSINESSES',
  'COMPILE_POPULATION',
  'COMPILE_ECOLOGY',
  'COMPILE_MISSIONS',
  'ATTACH_LIVING_CITY',
  'ATTACH_TIME_MACHINE',
  'GENERATE_LODS_COLLISION_STREAMING',
  'RUN_NAVIGATION_QA',
  'RUN_MOBILE_PERFORMANCE_QA',
  'RUN_PROVENANCE_QA',
  'GUARDIAN_QA',
  'FOUNDER_PREVIEW',
] as const

export type ChicagoAreaCompilerStage = typeof CHICAGO_AREA_COMPILER_STAGES[number]

export interface CommunityAreaCompileJob {
  areaId: number
  stage: ChicagoAreaCompilerStage
  status: 'queued' | 'running' | 'passed' | 'failed'
  attempt: number
  warnings: string[]
  checkpoint?: string
}

export function validateCommunityAreaPassport(passport: CommunityAreaPassport): string[] {
  const errors: string[] = []
  if (!Number.isInteger(passport.id) || passport.id < 1 || passport.id > CHICAGO_COMMUNITY_AREA_COUNT) {
    errors.push('Community area id must be an integer from 1 through 77.')
  }
  if (!passport.name.trim() || !passport.slug.trim()) errors.push('Community area name and slug are required.')
  if (passport.sources.some(source => !source.authorized)) {
    errors.push('All compiler sources must be authorized before ingestion.')
  }
  if (passport.mobileBudget.maxVisibleTriangles <= 0 || passport.mobileBudget.streamingCellMeters <= 0) {
    errors.push('A positive mobile rendering and streaming budget is required.')
  }
  return errors
}

export function canCertifyCommunityArea(passport: CommunityAreaPassport): boolean {
  const checks = passport.certification
  return (
    validateCommunityAreaPassport(passport).length === 0 &&
    checks.navigation &&
    checks.collision &&
    checks.mobilePerformance &&
    checks.sourceProvenance &&
    checks.livingCity &&
    checks.founderApproved
  )
}

export function nextIncompleteStage(
  completed: readonly ChicagoAreaCompilerStage[],
): ChicagoAreaCompilerStage | null {
  return CHICAGO_AREA_COMPILER_STAGES.find(stage => !completed.includes(stage)) ?? null
}

export function batchAreaIds(batchSize = 7): number[][] {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('batchSize must be a positive integer')
  const ids = Array.from({ length: CHICAGO_COMMUNITY_AREA_COUNT }, (_, index) => index + 1)
  const batches: number[][] = []
  for (let i = 0; i < ids.length; i += batchSize) batches.push(ids.slice(i, i + batchSize))
  return batches
}
