export type VectorClock = Record<string, number>

export type PocketDimensionSnapshot<T = unknown> = {
  dimensionId: string
  ownerDid: string
  revision: number
  clock: VectorClock
  payload: T
  contentId: string
  createdAt: number
  updatedAt: number
}

export type QuantumTimeEvent<T = unknown> = {
  eventId: string
  stream: string
  subjectDid: string
  sequence: number
  happenedAt: number
  recordedAt: number
  kind: string
  payload: T
  provenance?: string
}

const dimensions = new Map<string, PocketDimensionSnapshot>()
const streams = new Map<string, QuantumTimeEvent[]>()

function hash(input: string) {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i)
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function createPocketDimension<T>(dimensionId: string, ownerDid: string, payload: T, nodeId = 'origin') {
  const now = Date.now()
  const snapshot: PocketDimensionSnapshot<T> = {
    dimensionId,
    ownerDid,
    revision: 1,
    clock: { [nodeId]: 1 },
    payload,
    contentId: `qstate:${hash(JSON.stringify(payload))}`,
    createdAt: now,
    updatedAt: now,
  }
  dimensions.set(dimensionId, snapshot)
  return snapshot
}

export function updatePocketDimension<T>(dimensionId: string, ownerDid: string, payload: T, nodeId = 'origin') {
  const current = dimensions.get(dimensionId)
  if (!current) return createPocketDimension(dimensionId, ownerDid, payload, nodeId)
  if (current.ownerDid !== ownerDid) throw new Error('Pocket Dimension owner mismatch')
  const next: PocketDimensionSnapshot<T> = {
    ...current,
    revision: current.revision + 1,
    clock: { ...current.clock, [nodeId]: (current.clock[nodeId] ?? 0) + 1 },
    payload,
    contentId: `qstate:${hash(JSON.stringify(payload))}`,
    updatedAt: Date.now(),
  }
  dimensions.set(dimensionId, next)
  return next
}

export function mergePocketDimension<T>(local: PocketDimensionSnapshot<T>, remote: PocketDimensionSnapshot<T>) {
  if (local.dimensionId !== remote.dimensionId || local.ownerDid !== remote.ownerDid) throw new Error('Incompatible Pocket Dimension snapshots')
  const mergedClock: VectorClock = { ...local.clock }
  for (const [node, rev] of Object.entries(remote.clock)) mergedClock[node] = Math.max(mergedClock[node] ?? 0, rev)
  const winner = remote.updatedAt > local.updatedAt ? remote : local
  const merged = { ...winner, clock: mergedClock, revision: Math.max(local.revision, remote.revision) + 1, updatedAt: Date.now() }
  dimensions.set(merged.dimensionId, merged)
  return merged
}

export function getPocketDimension(dimensionId: string) {
  return dimensions.get(dimensionId) ?? null
}

export function appendQuantumTimeEvent<T>(stream: string, subjectDid: string, kind: string, payload: T, happenedAt = Date.now(), provenance?: string) {
  const list = streams.get(stream) ?? []
  const sequence = list.length + 1
  const event: QuantumTimeEvent<T> = {
    eventId: `qtime:${hash(`${stream}:${subjectDid}:${sequence}:${happenedAt}`)}`,
    stream,
    subjectDid,
    sequence,
    happenedAt,
    recordedAt: Date.now(),
    kind,
    payload,
    provenance,
  }
  list.push(event)
  streams.set(stream, list)
  return event
}

export function readQuantumTimeRange(stream: string, from = 0, to = Number.MAX_SAFE_INTEGER) {
  return (streams.get(stream) ?? []).filter(e => e.happenedAt >= from && e.happenedAt <= to)
}

export function replayQuantumTime<T>(stream: string, reducer: (state: T, event: QuantumTimeEvent) => T, initial: T, to = Number.MAX_SAFE_INTEGER) {
  return readQuantumTimeRange(stream, 0, to).reduce(reducer, initial)
}
