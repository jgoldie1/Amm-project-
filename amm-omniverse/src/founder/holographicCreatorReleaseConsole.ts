import type { StreetVerseGameId } from '../gameplay/streetVersePlayableCast'

export type ReleaseState = 'IDEA' | 'DESIGNED' | 'COMMITTED' | 'TESTED' | 'DEPLOYED' | 'LIVE'
export type FounderArtifactKind = 'CHARACTER' | 'MISSION' | 'WORLD_DATA' | 'CREATOR_DATA' | 'BUSINESS_DATA'

export interface FounderCharacterDraft {
  id: string
  name: string
  origin?: string
  role: string
  storyRole?: string
  starterGame: StreetVerseGameId
  biography?: string
  missionIds: string[]
}

export interface FounderMissionDraft {
  id: string
  title: string
  worldId: string
  locationId?: string
  characterIds: string[]
  objective: string
  rewardXp: number
  rewardPolicy: 'XP_ONLY' | 'SERVER_VERIFIED_ECONOMIC_REWARD'
  evidenceRefs: string[]
}

export interface FounderReleaseRecord {
  id: string
  kind: FounderArtifactKind
  artifactId: string
  state: ReleaseState
  version: number
  evidenceRefs: string[]
  approvedByFounder: boolean
  releasedAt?: string
  rollbackVersion?: number
}

export const HOLOGRAPHIC_CREATOR_SURFACES = Object.freeze([
  'CREATE_CHARACTER',
  'CREATE_MISSION',
  'MISSION_BUILDER',
  'WORLD_DATA',
  'RELEASE_CENTER',
  'VERSION_COMPARE',
  'ROLLBACK',
  'CHARACTERS',
  'CONTINUE_MISSION',
  'BENNY_HOLOGPT',
  'MEMORY_RESTORE',
] as const)

export const FOUNDER_RELEASE_POLICY = Object.freeze({
  founderApprovalRequiredForLive: true,
  evidenceRequiredForTestedOrHigher: true,
  githubCommitRequiredForCommittedOrHigher: true,
  deploymentEvidenceRequiredForDeployedOrLive: true,
  rollbackRequiredBeforeLive: true,
  clientMayReleaseRealMoney: false,
  clientMayPublishSensitivePersonalData: false,
  regulatedActionsRequireProviderAndHumanApproval: true,
  rawConversationMayBeReleaseEvidence: false,
  structuredCheckpointPrimary: true,
  screenshotsSupportingEvidenceOnly: true,
})

const rank: Record<ReleaseState, number> = {
  IDEA: 0,
  DESIGNED: 1,
  COMMITTED: 2,
  TESTED: 3,
  DEPLOYED: 4,
  LIVE: 5,
}

export function canPromoteFounderRelease(record: FounderReleaseRecord, target: ReleaseState): boolean {
  if (rank[target] < rank[record.state]) return Boolean(record.rollbackVersion)
  if (rank[target] >= rank.COMMITTED && !record.evidenceRefs.some(ref => ref.startsWith('github:'))) return false
  if (rank[target] >= rank.TESTED && record.evidenceRefs.length === 0) return false
  if (rank[target] >= rank.DEPLOYED && !record.evidenceRefs.some(ref => ref.startsWith('deploy:'))) return false
  if (target === 'LIVE' && (!record.approvedByFounder || !record.rollbackVersion)) return false
  return true
}

export function createFounderCharacter(input: FounderCharacterDraft): FounderCharacterDraft {
  if (!input.id || !input.name || !input.role) throw new Error('character identity and role are required')
  return {...input, missionIds: [...input.missionIds]}
}

export function createFounderMission(input: FounderMissionDraft): FounderMissionDraft {
  if (!input.id || !input.title || !input.worldId || !input.objective) throw new Error('mission identity, world, and objective are required')
  if (!Number.isFinite(input.rewardXp) || input.rewardXp < 0) throw new Error('mission XP must be non-negative')
  return {...input, characterIds: [...input.characterIds], evidenceRefs: [...input.evidenceRefs]}
}
