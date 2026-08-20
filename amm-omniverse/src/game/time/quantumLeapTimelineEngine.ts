export type TimelineMode = 'historical_living_history'|'alternate_history'|'personal_echo'|'future_warning'|'cosmic'|'mystery'
export type TimelineOutcome = 'preserved'|'branched'|'rescued'|'learned'|'failed_safe'|'returned'

export interface TimelineDestination {
  id: string
  title: string
  eraLabel: string
  mode: TimelineMode
  worldId: string
  educationalContext?: string[]
  contentWarnings?: string[]
  historicalFactsLocked?: boolean
}

export interface TemporalMission {
  id: string
  destinationId: string
  title: string
  briefing: string
  objectives: string[]
  secretObjectives: string[]
  choices: Array<{ id:string; label:string; consequenceTag:string }>
  checkpointRequired: boolean
  allowsAlternateBranch: boolean
  returnPortalRequired: boolean
}

export interface TimelineState {
  canonicalTimelineId: string
  activeBranchId: string
  visitedDestinationIds: string[]
  completedMissionIds: string[]
  rescuedStoryIds: string[]
  discoveredEchoIds: string[]
  paradoxRisk: number
  revision: number
}

export interface TimeJumpRequest {
  userId: string
  avatarId: string
  fromWorldId: string
  destinationId: string
  missionId?: string
  crewIds: string[]
  checkpointId: string
}

export const TIME_JUMP_PIPELINE = [
  'authenticate_identity',
  'load_avatar_passport_inventory',
  'validate_destination_and_age_lane',
  'load_historical_or_fiction_context',
  'create_pre_jump_checkpoint',
  'crew_readiness_check',
  'quantum_security_check',
  'open_time_portal',
  'stream_destination_assets',
  'reconstruct_avatar_and_inventory',
  'start_temporal_mission',
  'record_choices_and_echoes',
  'branch_without_overwriting_canonical_history',
  'save_mission_checkpoint',
  'return_portal',
  'restore_origin_world',
  'persist_rewards_memories_and_consequences',
] as const

export const ORIGINAL_TEMPORAL_MISSION_IDEAS: TemporalMission[] = [
  {
    id:'save-the-echo', destinationId:'echo-city-1980s', title:'Save the Echo',
    briefing:'A lost creative work is about to disappear from the timeline. Recover its pieces without erasing the people who made it.',
    objectives:['locate three memory fragments','identify the original creator trail','restore the archive','return through the portal'],
    secretObjectives:['find the unsigned recording','discover who preserved the first copy'],
    choices:[{id:'archive',label:'Preserve the original archive',consequenceTag:'history_preserved'},{id:'branch',label:'Explore an alternate creative future',consequenceTag:'alternate_branch'}],
    checkpointRequired:true, allowsAlternateBranch:true, returnPortalRequired:true,
  },
  {
    id:'tomorrow-sent-a-warning', destinationId:'streetverse-future', title:'Tomorrow Sent a Warning',
    briefing:'Travel forward, discover what damaged the city, then return with knowledge that can change a fictional branch.',
    objectives:['investigate future StreetVerse','collect evidence','survive the temporal storm','return to present'],
    secretObjectives:['find your future Echo'],
    choices:[{id:'share',label:'Share the warning',consequenceTag:'community_prepared'},{id:'investigate',label:'Investigate deeper first',consequenceTag:'hidden_truth'}],
    checkpointRequired:true, allowsAlternateBranch:true, returnPortalRequired:true,
  },
  {
    id:'mars-first-echo', destinationId:'mars-future-colony', title:'The First Mars Echo',
    briefing:'A future Mars colony has lost the record of its first crew. Recover the mission Echo and bring it home.',
    objectives:['reach abandoned habitat','restore colony power','recover crew Echo','escape temporal collapse'],
    secretObjectives:['open the Canyon Vault'],
    choices:[{id:'restore',label:'Restore the public record',consequenceTag:'colony_memory_restored'},{id:'vault',label:'Follow the hidden vault signal',consequenceTag:'secret_mars_branch'}],
    checkpointRequired:true, allowsAlternateBranch:true, returnPortalRequired:true,
  },
]

export const TEMPORAL_DESIGN_RULES = [
  'real_history_is_not_silently_rewritten_as_fact',
  'alternate_history_is_clearly_labeled',
  'sensitive_history_uses_context_and_content_controls',
  'player_can_exit_and_restore_checkpoint',
  'failure_creates_story_not_real_world_punishment',
  'canonical_player_state_survives_every_jump',
  'crew_state_and_inventory_are_reconciled_on_return',
  'panic_mode_can_abort_jump_and_restore_known_good_checkpoint',
  'historical_people_are_not impersonated_without_rights_or_clear_context',
] as const

export function createTimelineBranch(baseTimelineId:string, missionId:string, revision:number){
  return `${baseTimelineId}:${missionId}:r${revision + 1}`
}

export function calculateParadoxRisk(changes:number, unresolvedEchoes:number, branchDepth:number){
  return Math.min(100, Math.round(changes*8 + unresolvedEchoes*5 + branchDepth*7))
}
