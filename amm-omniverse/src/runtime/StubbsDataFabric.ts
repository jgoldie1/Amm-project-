export type SourceClassification = 'PUBLIC' | 'AUTHORIZED' | 'RESTRICTED'
export type IngestionState = 'REGISTERED' | 'INGESTING' | 'HEALTHY' | 'STALE' | 'BLOCKED'

export type DataSourceRegistration = {
  id: string
  name: string
  classification: SourceClassification
  owner: string
  purpose: string
  retentionDays: number
  freshnessMinutes: number
  state: IngestionState
  lastSuccessfulSync?: string
  authorizationReference?: string
}

export type DataLineageRecord = {
  sourceId: string
  objectId: string
  observedAt: string
  transformedBy: string[]
  qualityScore: number
}

export const dataFabricPolicy = {
  name: 'TRYAMM Data Fabric',
  principles: [
    'SOURCE_REGISTRATION_REQUIRED',
    'PURPOSE_LIMITATION_REQUIRED',
    'LEAST_PRIVILEGE_ACCESS',
    'LINEAGE_REQUIRED',
    'FRESHNESS_VISIBLE',
    'QUALITY_VISIBLE',
    'DATA_MINIMIZATION',
    'AUTOMATIC_EXPIRATION',
    'RESTRICTED_FEEDS_REQUIRE_AUTHORIZATION',
    'NO_SECRET_BYPASS',
  ] as const,
  prohibited: [
    'UNAUTHORIZED_SCRAPING',
    'CREDENTIAL_BYPASS',
    'PRIVATE_COMMUNICATION_INTERCEPTION',
    'COVERT_PERSON_TRACKING',
    'UNAUTHORIZED_CAMERA_ACCESS',
  ] as const,
}

export function validateSource(source: DataSourceRegistration) {
  const errors: string[] = []
  if (!source.id || !source.name) errors.push('SOURCE_ID_AND_NAME_REQUIRED')
  if (!source.owner) errors.push('SOURCE_OWNER_REQUIRED')
  if (!source.purpose) errors.push('PURPOSE_REQUIRED')
  if (source.retentionDays < 0) errors.push('INVALID_RETENTION')
  if (source.freshnessMinutes <= 0) errors.push('INVALID_FRESHNESS_WINDOW')
  if (source.classification !== 'PUBLIC' && !source.authorizationReference) {
    errors.push('AUTHORIZATION_REFERENCE_REQUIRED')
  }
  return { valid: errors.length === 0, errors }
}

export function isFresh(source: DataSourceRegistration, now = new Date()) {
  if (!source.lastSuccessfulSync) return false
  const ageMs = now.getTime() - new Date(source.lastSuccessfulSync).getTime()
  return ageMs <= source.freshnessMinutes * 60_000
}

export function canReadSource(source: DataSourceRegistration, grants: SourceClassification[]) {
  if (source.classification === 'PUBLIC') return true
  return grants.includes(source.classification)
}

export function summarizeFabric(sources: DataSourceRegistration[]) {
  return {
    total: sources.length,
    public: sources.filter((s) => s.classification === 'PUBLIC').length,
    authorized: sources.filter((s) => s.classification === 'AUTHORIZED').length,
    restricted: sources.filter((s) => s.classification === 'RESTRICTED').length,
    blocked: sources.filter((s) => s.state === 'BLOCKED').length,
    stale: sources.filter((s) => s.state === 'STALE').length,
  }
}
