export type Jurisdiction = 'chicago' | 'cook-county' | 'illinois' | 'federal'
export type EncounterStage = 'none' | 'observed' | 'stop' | 'citation' | 'arrest' | 'pretrial' | 'court' | 'county-jail' | 'state-corrections' | 'federal-referral' | 'federal-custody' | 'released'

export type CivicEvent = {
  id: string
  kind: 'traffic' | 'ordinance' | 'crime' | 'business' | 'court' | 'custody' | 'emergency'
  jurisdiction: Jurisdiction
  stage: EncounterStage
  reason: string
  sourceLabel?: string
  sourceUrl?: string
  createdAt: number
}

export type BusinessLicenseRecord = {
  licenseId?: string
  licenseNumber?: string
  legalName?: string
  doingBusinessAs?: string
  licenseDescription?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  ward?: string
  policeDistrict?: string
  communityArea?: string
  latitude?: string
  longitude?: string
  status?: string
  expirationDate?: string
}

export const CHICAGO_CIVIC_SOURCES = {
  activeBusinessLicenses: 'https://data.cityofchicago.org/resource/uupf-x98q.json',
  crimes2026: 'https://data.cityofchicago.org/resource/f6bk-yv3r.json',
  municipalCode: 'https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-1',
  bacp: 'https://www.chicago.gov/city/en/depts/bacp.html',
  cookCountyCourts: 'https://www.cookcountyclerkofcourt.org/',
  cookCountySheriff: 'https://www.cookcountysheriffil.gov/',
  federalBop: 'https://www.bop.gov/'
} as const

export const JUSTICE_PIPELINE: Record<EncounterStage, EncounterStage[]> = {
  none: ['observed'],
  observed: ['stop', 'none'],
  stop: ['citation', 'arrest', 'released'],
  citation: ['court', 'released'],
  arrest: ['pretrial', 'court'],
  pretrial: ['released', 'court', 'county-jail'],
  court: ['released', 'county-jail', 'state-corrections', 'federal-referral'],
  'county-jail': ['released', 'court', 'state-corrections'],
  'state-corrections': ['released'],
  'federal-referral': ['federal-custody', 'released'],
  'federal-custody': ['released'],
  released: ['none'],
}

export function canTransitionJusticeStage(from: EncounterStage, to: EncounterStage) {
  return JUSTICE_PIPELINE[from].includes(to)
}

export function transitionJusticeStage(event: CivicEvent, next: EncounterStage): CivicEvent {
  if (!canTransitionJusticeStage(event.stage, next)) {
    throw new Error(`Invalid civic transition ${event.stage} -> ${next}`)
  }
  return { ...event, stage: next }
}

export function jurisdictionForStage(stage: EncounterStage): Jurisdiction {
  if (stage === 'federal-referral' || stage === 'federal-custody') return 'federal'
  if (stage === 'county-jail' || stage === 'pretrial' || stage === 'court') return 'cook-county'
  if (stage === 'state-corrections') return 'illinois'
  return 'chicago'
}

export async function fetchChicagoActiveBusinesses(options?: {
  limit?: number
  offset?: number
  licenseDescription?: string
  policeDistrict?: number
  signal?: AbortSignal
}): Promise<BusinessLicenseRecord[]> {
  const limit = Math.min(Math.max(options?.limit ?? 250, 1), 1000)
  const params = new URLSearchParams({ '$limit': String(limit), '$offset': String(Math.max(options?.offset ?? 0, 0)) })
  const clauses: string[] = []
  if (options?.licenseDescription) clauses.push(`license_description='${options.licenseDescription.replaceAll("'", "''")}'`)
  if (Number.isFinite(options?.policeDistrict)) clauses.push(`police_district=${Number(options?.policeDistrict)}`)
  if (clauses.length) params.set('$where', clauses.join(' AND '))

  const response = await fetch(`${CHICAGO_CIVIC_SOURCES.activeBusinessLicenses}?${params.toString()}`, { signal: options?.signal })
  if (!response.ok) throw new Error(`Chicago business feed failed: ${response.status}`)
  const rows = await response.json() as Record<string, string>[]
  return rows.map(row => ({
    licenseId: row.license_id,
    licenseNumber: row.license_number,
    legalName: row.legal_name,
    doingBusinessAs: row.doing_business_as_name,
    licenseDescription: row.license_description,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip_code,
    ward: row.ward,
    policeDistrict: row.police_district,
    communityArea: row.community_area,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.license_status,
    expirationDate: row.expiration_date,
  }))
}

export function createSyntheticEncounter(kind: CivicEvent['kind'], reason: string, stage: EncounterStage = 'observed'): CivicEvent {
  return {
    id: crypto.randomUUID(),
    kind,
    jurisdiction: jurisdictionForStage(stage),
    stage,
    reason,
    createdAt: Date.now(),
  }
}

export const GLOBAL_CIVIC_ADAPTER_CONTRACT = {
  version: 1,
  requiredCapabilities: [
    'local-law-reference',
    'business-registry',
    'police-encounters',
    'traffic-citations',
    'court-routing',
    'custody-routing',
    'emergency-dispatch',
    'privacy-safe-public-data'
  ] as const,
  rule: 'Each city/country adapter supplies its own current legal and licensing sources; gameplay never assumes Chicago rules apply globally.'
}
