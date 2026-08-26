import type { ConstructPlan } from './constructEngine'

export type ConstructRecord = {
  id: string
  creatorId?: string
  ownerId?: string
  version: number
  plan: ConstructPlan
  provenance: {
    source: 'generated' | 'user' | 'licensed' | 'internal'
    licenseRef?: string
  }
  status: 'DRAFT' | 'APPROVED' | 'ARCHIVED'
}

const records = new Map<string, ConstructRecord>()

export function saveConstruct(record: ConstructRecord) {
  records.set(record.id, structuredClone(record))
  return record
}

export function getConstruct(id: string) {
  const value = records.get(id)
  return value ? structuredClone(value) : undefined
}

export function listConstructs() {
  return Array.from(records.values()).map(record => structuredClone(record))
}
