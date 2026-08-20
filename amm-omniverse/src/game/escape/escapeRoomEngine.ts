export type EscapeRoomMode = 'solo'|'co_op'|'timed'|'story'|'creator'|'secret'|'xr'|'adult_after_dark'
export type PuzzleKind = 'logic'|'pattern'|'spatial'|'audio'|'visual'|'inventory'|'cooperation'|'world_state'|'movement'|'memory'|'holographic'

export interface EscapePuzzle {
  id: string
  kind: PuzzleKind
  prompt: string
  solutionKey: string
  accessibleAlternatives: Array<'visual'|'audio'|'caption'|'haptic'|'text'|'simplified_motion'>
  requiresScent: false
  timeLimitSec?: number
  coOpRoles?: string[]
  secretUnlockId?: string
}

export interface EscapeRoomChapter {
  id: string
  title: string
  world: 'streetverse'|'my_world'|'we_are_the_world'|'kingdom'|'starverse'|'holoverse'|'mars'|'pinball'
  mode: EscapeRoomMode
  difficulty: 1|2|3|4|5
  puzzles: EscapePuzzle[]
  checkpoints: string[]
  rewards: Array<'passport_xp'|'world_mastery'|'cosmetic'|'creator_collectible'|'story_echo'|'table_modifier'>
  creatorCharacterIds?: string[]
  adultOnly?: boolean
}

export interface EscapeSessionState {
  roomId: string
  playerIds: string[]
  currentPuzzleId?: string
  solvedPuzzleIds: string[]
  failedAttempts: number
  hintsUsed: number
  startedAt: number
  checkpointId?: string
  panicMode: boolean
}

export interface EscapeRoomTemplate {
  id: string
  title: string
  summary: string
  chapters: EscapeRoomChapter[]
  ar: boolean
  vr: boolean
  mr: boolean
  roomScale: boolean
  handTracking: boolean
  controller: boolean
  accessibilityFallback: boolean
}

export const TRYAMM_ESCAPE_ROOMS: EscapeRoomTemplate[] = [
  {
    id:'streetverse-after-hours', title:'StreetVerse: After Hours', summary:'A citywide blackout strands the crew inside a shifting nightlife district while World Pulse keeps changing the clues.',
    ar:true, vr:true, mr:true, roomScale:true, handTracking:true, controller:true, accessibilityFallback:true,
    chapters:[{ id:'sv-ah-1', title:'11:47', world:'streetverse', mode:'story', difficulty:2, checkpoints:['lobby','power-room','roof'], rewards:['passport_xp','world_mastery','story_echo'], puzzles:[
      {id:'grid',kind:'logic',prompt:'Restore the district power routing.',solutionKey:'validated-server-state',accessibleAlternatives:['visual','audio','caption','haptic','text'],requiresScent:false},
      {id:'voices',kind:'audio',prompt:'Identify the correct broadcast path from multiple creator feeds.',solutionKey:'validated-audio-sequence',accessibleAlternatives:['visual','caption','text','haptic'],requiresScent:false},
    ]}],
  },
  {
    id:'starverse-backstage', title:'StarVerse: Backstage Lock-In', summary:'A performance is minutes away and the crew must rebuild the show from scattered holographic cues.',
    ar:true, vr:true, mr:true, roomScale:true, handTracking:true, controller:true, accessibilityFallback:true,
    chapters:[{ id:'sv-stage-1', title:'Find the Missing Master', world:'starverse', mode:'creator', difficulty:3, checkpoints:['studio','backstage','main-stage'], rewards:['passport_xp','world_mastery','creator_collectible'], puzzles:[
      {id:'mix',kind:'pattern',prompt:'Reconstruct the show cue sequence.',solutionKey:'validated-show-cue',accessibleAlternatives:['visual','audio','caption','text'],requiresScent:false},
      {id:'collab',kind:'cooperation',prompt:'Two players must synchronize independent stage controls.',solutionKey:'validated-coop-window',accessibleAlternatives:['visual','audio','caption','haptic','text'],requiresScent:false,coOpRoles:['director','performer']},
    ]}],
  },
  {
    id:'mars-canyon-vault', title:'Mars: Canyon Vault', summary:'A buried research vault opens only when a crew combines navigation, science and world-state clues.',
    ar:true, vr:true, mr:true, roomScale:true, handTracking:true, controller:true, accessibilityFallback:true,
    chapters:[{ id:'mars-vault-1', title:'Red Echo', world:'mars', mode:'co_op', difficulty:4, checkpoints:['airlock','canyon','vault'], rewards:['passport_xp','world_mastery','story_echo'], puzzles:[
      {id:'route',kind:'spatial',prompt:'Align the canyon route and beacon network.',solutionKey:'validated-route',accessibleAlternatives:['visual','audio','caption','haptic','text','simplified_motion'],requiresScent:false},
      {id:'archive',kind:'memory',prompt:'Recover the correct mission history from Echo fragments.',solutionKey:'validated-echo-history',accessibleAlternatives:['visual','audio','caption','text'],requiresScent:false},
    ]}],
  },
]

export function canEnterEscapeChapter(chapter: EscapeRoomChapter, ageVerified18Plus: boolean) {
  return !chapter.adultOnly || ageVerified18Plus
}

export function validatePuzzleAccessibility(puzzle: EscapePuzzle) {
  return puzzle.requiresScent === false && puzzle.accessibleAlternatives.length > 0
}

export const ESCAPE_ROOM_PIPELINE = [
  'identity_and_age_lane',
  'canonical_avatar_and_inventory',
  'world_checkpoint_load',
  'server_authoritative_puzzle_state',
  'dynamic_stubbs_ai_hint_budget',
  'accessible_equivalent_cues',
  'co_op_presence_and_roles',
  'panic_mode_and_safe_exit',
  'checkpoint_and_rejoin',
  'passport_xp_world_mastery_rewards',
  'reel_moment_suggestion',
  'internal_event_evidence',
] as const

export const ESCAPE_ROOM_QUALITY_GATES = [
  'first_puzzle_under_60_seconds',
  'no_single_sensory_channel_required',
  'co_op_desync_recovery',
  'server_authoritative_solution_validation',
  'hint_system_never_spoils_without_player_request',
  'stable_xr_comfort_and_recenter',
  'checkpoint_restore_after_disconnect',
  'adult_content_isolated_from_minor_profiles',
  'creator_likeness_rights_verified',
  'performance_budget_survives_room_transformation',
] as const
