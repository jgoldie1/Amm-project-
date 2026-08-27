import type { UniversalRealityAddress } from './universalRealityAddress'

export type TimeMode = 'HISTORY' | 'RECONSTRUCTION' | 'SIMULATION' | 'ADVENTURE' | 'ENGINEERING' | 'SPACE'

export type RealitySnapshot<T = unknown> = {
  id: string
  ura: UniversalRealityAddress
  timestamp: string
  version: string
  mode: TimeMode
  payload: T
  sourceRefs: string[]
  uncertainty?: number
}

export type Timeline<T = unknown> = {
  objectId: string
  snapshots: RealitySnapshot<T>[]
}

export function sortTimeline<T>(timeline: Timeline<T>) {
  return {
    ...timeline,
    snapshots: [...timeline.snapshots].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)),
  }
}

export function nearestSnapshot<T>(timeline: Timeline<T>, timestamp: string) {
  const target = Date.parse(timestamp)
  if (!Number.isFinite(target)) throw new Error('Invalid target timestamp.')
  return timeline.snapshots.reduce<RealitySnapshot<T> | undefined>((best, current) => {
    const distance = Math.abs(Date.parse(current.timestamp) - target)
    if (!best) return current
    const bestDistance = Math.abs(Date.parse(best.timestamp) - target)
    return distance < bestDistance ? current : best
  }, undefined)
}

export function branchSimulation<T>(base: RealitySnapshot<T>, nextPayload: T, id: string): RealitySnapshot<T> {
  return {
    ...base,
    id,
    timestamp: new Date().toISOString(),
    version: `${base.version}-sim`,
    mode: 'SIMULATION',
    payload: nextPayload,
    sourceRefs: [...base.sourceRefs],
  }
}
