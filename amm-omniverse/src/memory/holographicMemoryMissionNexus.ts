export type ImplementationState =
  | 'IDEA'
  | 'DESIGNED'
  | 'COMMITTED'
  | 'TESTED'
  | 'DEPLOYED'
  | 'LIVE'

export type MemoryEvidenceKind = 'STRUCTURED_CHECKPOINT' | 'SCREENSHOT' | 'GITHUB_COMMIT'

export interface MemoryEvidence {
  kind: MemoryEvidenceKind
  ref: string
  capturedAt: string
}

export interface HolographicMissionCheckpoint {
  id: string
  sessionId: string
  characterId: string
  worldId: string
  locationId?: string
  missionId?: string
  xp: number
  level: number
  implementationState: ImplementationState
  evidence: MemoryEvidence[]
  createdAt: string
  expiresAt?: string
}

export interface HolographicMemoryPolicy {
  structuredCheckpointsPrimary: true
  screenshotsSupportingEvidenceOnly: true
  githubAuthoritativeForCode: true
  conversationMayDeclareLive: false
  rawConversationRetentionLimited: true
  sensitiveDataMinimized: true
  restoreRequiresAuthorizedUser: true
}

export const HOLOGRAPHIC_MEMORY_POLICY: HolographicMemoryPolicy = {
  structuredCheckpointsPrimary: true,
  screenshotsSupportingEvidenceOnly: true,
  githubAuthoritativeForCode: true,
  conversationMayDeclareLive: false,
  rawConversationRetentionLimited: true,
  sensitiveDataMinimized: true,
  restoreRequiresAuthorizedUser: true,
}

export const HOLOGRAPHIC_DASHBOARD_SURFACES = [
  'CONTINUE_MISSION',
  'CHARACTERS',
  'BENNY_HOLOGPT',
  'MEMORY_RESTORE',
] as const

export function canClaimLive(checkpoint: HolographicMissionCheckpoint): boolean {
  return checkpoint.implementationState === 'LIVE' &&
    checkpoint.evidence.some((item) => item.kind === 'GITHUB_COMMIT')
}

export function createCheckpoint(input: HolographicMissionCheckpoint): HolographicMissionCheckpoint {
  if (!input.id || !input.sessionId || !input.characterId || !input.worldId) {
    throw new Error('checkpoint identity fields are required')
  }
  if (!Number.isFinite(input.xp) || input.xp < 0 || !Number.isFinite(input.level) || input.level < 1) {
    throw new Error('checkpoint progression is invalid')
  }
  return {
    ...input,
    evidence: [...input.evidence],
  }
}
