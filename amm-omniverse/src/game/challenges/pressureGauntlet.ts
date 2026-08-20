export type ChallengeMode = 'creator_challenge'|'survival_puzzle'|'team_strategy'|'memory'|'timed_escape'|'social_deduction'|'precision'|'endurance_gameplay'
export type ExitChoice = 'continue'|'safe_exit'|'pause_and_return'

export interface PressureChallenge {
  id: string
  title: string
  mode: ChallengeMode
  objective: string
  timeLimitSeconds?: number
  cooperative: boolean
  eliminationStyle: 'score_drop'|'round_reset'|'spectator'|'story_branch'
  physicalRisk: 'none'
  realWorldPenalty: 'none'
  accessibilityAlternatives: string[]
  rewards: Array<'xp'|'passport_mastery'|'cosmetic'|'story'|'secret_mission'|'creator_collectible'>
}

export interface GauntletRun {
  runId: string
  playerId: string
  challengeIds: string[]
  currentIndex: number
  completed: string[]
  failed: string[]
  checkpointId: string
  returnAllowed: boolean
  exitChoice?: ExitChoice
}

export const PRESSURE_GAUNTLET: PressureChallenge[] = [
  {
    id:'light-floor',
    title:'Pulse Floor',
    mode:'precision',
    objective:'Cross a reactive holographic floor by reading timing patterns and choosing safe lanes.',
    cooperative:false,
    eliminationStyle:'round_reset',
    physicalRisk:'none',
    realWorldPenalty:'none',
    accessibilityAlternatives:['reduced-speed mode','high-contrast lanes','audio rhythm cues','haptic timing cues'],
    rewards:['xp','passport_mastery'],
  },
  {
    id:'creator-vault',
    title:'Creator Vault',
    mode:'creator_challenge',
    objective:'Complete three creative tasks under a shared timer and audience vote simulation.',
    timeLimitSeconds:600,
    cooperative:true,
    eliminationStyle:'score_drop',
    physicalRisk:'none',
    realWorldPenalty:'none',
    accessibilityAlternatives:['voice input','switch control','extended timer','captioned instructions'],
    rewards:['xp','creator_collectible','story'],
  },
  {
    id:'echo-memory',
    title:'Echo Memory Chamber',
    mode:'memory',
    objective:'Reconstruct a sequence of symbols, sounds and story clues to unlock the next chamber.',
    cooperative:true,
    eliminationStyle:'story_branch',
    physicalRisk:'none',
    realWorldPenalty:'none',
    accessibilityAlternatives:['visual-only equivalent','audio-only equivalent','caption transcript','pattern simplification'],
    rewards:['secret_mission','story','xp'],
  },
  {
    id:'crew-choice',
    title:'Crew Choice',
    mode:'team_strategy',
    objective:'Split roles, allocate limited tools and solve a multi-room objective before the world state changes.',
    cooperative:true,
    eliminationStyle:'story_branch',
    physicalRisk:'none',
    realWorldPenalty:'none',
    accessibilityAlternatives:['role reassignment','solo AI teammate','extended planning time','simplified navigation'],
    rewards:['passport_mastery','story'],
  },
]

export interface ReturnGateInput {
  checkpointExists: boolean
  challengeCompleted: boolean
  playerRequestedExit: boolean
  panicMode: boolean
}

export function resolveReturnToGame(input: ReturnGateInput) {
  if (input.panicMode || input.playerRequestedExit) return { allowed:true, route:'safe_exit' as const }
  if (!input.checkpointExists) return { allowed:false, route:'recover_checkpoint' as const }
  if (input.challengeCompleted) return { allowed:true, route:'return_to_world' as const }
  return { allowed:true, route:'resume_or_exit' as const }
}

// Design rule: "trapped" is narrative pressure only. Players always retain a visible safe-exit/pause path.
// No challenge may require real-world pain, injury, deprivation, dangerous stunts, coercion, wagering,
// or irreversible punishment. Failure changes score/story/progression only.
export const GAUNTLET_SAFETY_RULES = [
  'always_visible_safe_exit',
  'pause_and_return_supported',
  'panic_mode_overrides_challenge',
  'no_real_world_harm',
  'no_coercive_device_control',
  'no_real_money_wager_required',
  'minor_profiles_use_age_appropriate_content',
  'adult_after_dark_isolated_from_minors',
  'accessibility_equivalent_for_every_required_clue',
  'server_validates_completion_and_rewards',
] as const

export const ORIGINAL_INSPIRATION_BOUNDARY = {
  allowed: ['high-stakes pacing','game-show spectacle','survival-puzzle tension','mystery-thriller atmosphere','creator challenge energy'],
  prohibited: ['copying protected characters','copying signature sets','copying exact games','copying dialogue','copying franchise branding'],
} as const
