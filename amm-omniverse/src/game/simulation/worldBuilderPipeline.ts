import type { LcsScope } from './livingCitySimulation'

export type BuildStage =
  | 'queued' | 'seeded' | 'compiled' | 'simulated'
  | 'validated' | 'certified' | 'playable' | 'failed'

export interface WorldSeed {
  id: string
  scope: LcsScope
  country: string
  region: string
  city: string
  neighborhoods: string[]
  locale: string
  currency: string
}

export interface BuildManifest {
  seed: WorldSeed
  stage: BuildStage
  checks: Record<string, boolean>
  generatedAt: number
  errors: string[]
}

export const WORLD_REGISTRY: WorldSeed[] = [
  {id:'us-il-chicago',scope:'chicago',country:'US',region:'IL',city:'Chicago',neighborhoods:['South Side','Downtown','West Side'],locale:'en-US',currency:'USD'},
  {id:'ng-la-lagos',scope:'global',country:'NG',region:'LA',city:'Lagos',neighborhoods:['Lagos Core'],locale:'en-NG',currency:'NGN'},
  {id:'ng-fc-abuja',scope:'global',country:'NG',region:'FC',city:'Abuja',neighborhoods:['Abuja Core'],locale:'en-NG',currency:'NGN'},
]

export function queueWorldBuild(seed: WorldSeed): BuildManifest {
  return {seed,stage:'queued',checks:{},generatedAt:Date.now(),errors:[]}
}

export function advanceWorldBuild(manifest: BuildManifest, check: string, passed: boolean): BuildManifest {
  const next=structuredClone(manifest)
  next.checks[check]=passed
  if(!passed){ next.stage='failed'; next.errors.push(check); return next }
  const order: BuildStage[]=['queued','seeded','compiled','simulated','validated','certified','playable']
  const i=order.indexOf(next.stage)
  if(i>=0 && i<order.length-1) next.stage=order[i+1]
  return next
}

export function canPublishWorld(manifest: BuildManifest): boolean {
  return manifest.stage==='playable' && Object.values(manifest.checks).every(Boolean)
}

/**
 * Required certification contract for generated StreetVerse worlds.
 * Agents may generate content, but cannot bypass these gates.
 */
export const WORLD_CERTIFICATION_CHECKS = [
  'geography',
  'collision',
  'spawn',
  'movement',
  'accessibility',
  'traffic',
  'mission',
  'economy',
  'persistence',
  'performance',
] as const
