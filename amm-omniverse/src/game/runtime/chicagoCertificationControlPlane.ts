export type AreaReleaseState =
  | 'source-missing'
  | 'compiling'
  | 'failed'
  | 'qa'
  | 'certified'
  | 'deployed'
  | 'device-verified'

export interface ProvenanceRecord {
  sourceId: string
  uri: string
  authorized: boolean
  license?: string
  checksum?: string
}

export interface AreaEvidence {
  exactSha: string
  workflowRunId?: string
  deploymentId?: string
  deviceProofId?: string
  provenance: ProvenanceRecord[]
  generatedAt: string
}

export interface AreaCertificationManifest {
  areaId: number
  state: AreaReleaseState
  evidence: AreaEvidence
  gates: {
    navigation: boolean
    collision: boolean
    mobilePerformance: boolean
    livingCity: boolean
    ecology: boolean
    missionLoop: boolean
    authoritativeReward: boolean
    reelHandoff: boolean
    rollbackReady: boolean
    founderApproved: boolean
  }
  previousGoodSha?: string
  failures: string[]
}

export interface SpeciesPassport {
  id: string
  commonName: string
  class:
    | 'mammal'
    | 'bird'
    | 'fish'
    | 'reptile'
    | 'amphibian'
    | 'insect'
    | 'arachnid'
    | 'other'
  groupBehavior?: 'solitary' | 'herd' | 'flock' | 'school' | 'swarm' | 'colony'
  habitats: string[]
  diet: string[]
  activity: 'diurnal' | 'nocturnal' | 'crepuscular' | 'variable'
  simulation: {
    near: 'agent'
    mid: 'group'
    far: 'aggregate'
  }
}

export type WorldAssetTarget =
  | 'streetverse'
  | 'propertyverse'
  | 'timemachine'
  | 'spaceverse'

export interface SharedWorldAsset {
  id: string
  passportId: string
  targets: WorldAssetTarget[]
  profile:
    | 'earth-building'
    | 'farm'
    | 'warehouse'
    | 'high-rise'
    | 'space-habitat'
    | 'lunar-base'
    | 'mars-base'
    | 'space-station'
    | 'spacecraft'
  sourceSha: string
}

export const FOUNDER_ALPHA_DEVICE_LOOP = [
  'SIGN_IN',
  'PASSPORT',
  'CHICAGO',
  'MOVE',
  'VEHICLE',
  'MISSION',
  'WORLD_CONSEQUENCE',
  'SERVER_VERIFIED_REWARD',
  'RELOAD_REWARD_PERSISTS',
  'REEL',
  'SAVE_OR_SHARE',
] as const

export function canPromoteArea(manifest: AreaCertificationManifest): boolean {
  const g = manifest.gates
  return (
    manifest.evidence.provenance.length > 0 &&
    manifest.evidence.provenance.every(source => source.authorized) &&
    g.navigation &&
    g.collision &&
    g.mobilePerformance &&
    g.livingCity &&
    g.ecology &&
    g.missionLoop &&
    g.authoritativeReward &&
    g.reelHandoff &&
    g.rollbackReady &&
    g.founderApproved &&
    manifest.failures.length === 0
  )
}

export function canMarkDeviceVerified(manifest: AreaCertificationManifest): boolean {
  return canPromoteArea(manifest) && Boolean(manifest.evidence.deviceProofId)
}
