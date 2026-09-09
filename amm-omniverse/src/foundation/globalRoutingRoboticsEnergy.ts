export type RouteDomain = 'communications' | 'network' | 'ai' | 'payments' | 'world'
export type RouteHealth = 'live' | 'degraded' | 'locked'
export type RobotMode = 'simulation' | 'physical'

export interface RoutingCandidate {
  providerId: string
  region: string
  latencyMs?: number
  estimatedCostUsd?: number
  healthy: boolean
  compliant: boolean
}

export interface RoutingPolicy {
  domain: RouteDomain
  preferredRegions: string[]
  maxLatencyMs?: number
  requireCompliance: true
  allowFailover: boolean
}

export function chooseEligibleRoute(policy: RoutingPolicy, candidates: RoutingCandidate[]) {
  const eligible = candidates.filter(candidate =>
    candidate.healthy &&
    (!policy.requireCompliance || candidate.compliant) &&
    (!policy.maxLatencyMs || candidate.latencyMs == null || candidate.latencyMs <= policy.maxLatencyMs)
  )
  return eligible.sort((a, b) => {
    const ar = policy.preferredRegions.indexOf(a.region)
    const br = policy.preferredRegions.indexOf(b.region)
    const regionScoreA = ar < 0 ? Number.MAX_SAFE_INTEGER : ar
    const regionScoreB = br < 0 ? Number.MAX_SAFE_INTEGER : br
    if (regionScoreA !== regionScoreB) return regionScoreA - regionScoreB
    return (a.latencyMs ?? Number.MAX_SAFE_INTEGER) - (b.latencyMs ?? Number.MAX_SAFE_INTEGER)
  })[0] ?? null
}

export interface RobotSafetyState {
  mode: RobotMode
  emergencyStopEngaged: boolean
  safetyControllerHealthy: boolean
  humanApprovalRequired: boolean
  humanApproved: boolean
  localControlAvailable: boolean
}

export function canExecutePhysicalRobotAction(state: RobotSafetyState) {
  if (state.mode !== 'physical') return false
  if (state.emergencyStopEngaged) return false
  if (!state.safetyControllerHealthy || !state.localControlAvailable) return false
  if (state.humanApprovalRequired && !state.humanApproved) return false
  return true
}

export interface BlueEnergyTelemetry {
  assetId: string
  batteryPercent?: number
  charging?: boolean
  powerWatts?: number
  temperatureC?: number
  estimatedRuntimeMinutes?: number
  estimatedEnergyCostUsd?: number
  health: 'healthy' | 'warning' | 'critical' | 'unverified'
  observedAt: string
}

export interface OmniComputeTelemetry {
  workloadId: string
  providerId: string
  region: string
  estimatedComputeCostUsd?: number
  estimatedEnergyCostUsd?: number
  latencyMs?: number
  observedAt: string
}

export const RELEASE1_AUTHORITY_RULES = {
  paymentVerification: 'server-authoritative',
  settlement: 'server-authoritative',
  refunds: 'server-authoritative',
  payableBalance: 'server-authoritative',
  financialLedger: 'server-authoritative',
  robotEmergencyStop: 'local-safety-controller',
  physicalRobotMotion: 'safety-gated',
  blueEnergyHardwareClaims: 'evidence-required',
} as const

export const RELEASE1_REVENUE_OFFERS = [
  'digital-twin-robot-readiness',
  'energy-readiness',
  'simulation-training',
  'robotics-as-a-service',
  'blue-energy-monitoring',
  'business-ai-routing',
] as const
