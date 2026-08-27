export type PocketRecord<T = unknown> = {
  id: string
  kind: 'object' | 'room' | 'dataset' | 'timeline' | 'project-state'
  title: string
  updatedAt: string
  data: T
}

const memory = new Map<string, PocketRecord>()
const storageKey = 'tryamm:pocket-dimension:v1'

function loadBrowserRecords() {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const parsed = JSON.parse(raw) as PocketRecord[]
    for (const record of parsed) memory.set(record.id, record)
  } catch {
    // Corrupt local cache should not break the app. Server/cloud persistence can supersede this prototype.
  }
}

function flushBrowserRecords() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(storageKey, JSON.stringify(Array.from(memory.values())))
}

loadBrowserRecords()

export function savePocketRecord<T>(record: PocketRecord<T>) {
  memory.set(record.id, structuredClone(record))
  flushBrowserRecords()
  return record
}

export function getPocketRecord<T = unknown>(id: string) {
  const record = memory.get(id)
  return record ? structuredClone(record) as PocketRecord<T> : undefined
}

export function listPocketRecords(kind?: PocketRecord['kind']) {
  return Array.from(memory.values())
    .filter(record => !kind || record.kind === kind)
    .map(record => structuredClone(record))
}

export function deletePocketRecord(id: string) {
  const deleted = memory.delete(id)
  flushBrowserRecords()
  return deleted
}
