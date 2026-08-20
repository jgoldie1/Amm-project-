export type CharacterBrain = 'npc'|'mpc'|'world_citizen'
export type AwarenessChannel = 'self'|'social'|'world'|'mission'|'safety'|'economic'|'temporal'

export interface CharacterMemory {
  id: string
  summary: string
  emotionalWeight: number
  importance: number
  createdAt: number
  expiresAt?: number
  tags: string[]
}

export interface CharacterRelationship {
  targetId: string
  trust: number
  familiarity: number
  affection: number
  fear: number
  rivalry: number
  obligation: number
}

export interface CharacterGoal {
  id: string
  description: string
  priority: number
  expiresAt?: number
  worldImpact?: string
}

export interface CharacterAwareness {
  channels: AwarenessChannel[]
  currentWorld: string
  district?: string
  currentEventIds: string[]
  nearbyPlayerIds: string[]
  nearbyCharacterIds: string[]
  weather?: string
  timeOfDay?: string
  worldPulse?: number
  dangerLevel: number
}

export interface EmotionVector {
  joy: number
  sadness: number
  anger: number
  fear: number
  calm: number
  hope: number
  excitement: number
  loneliness: number
  trust: number
}

export interface CharacterState {
  id: string
  brain: CharacterBrain
  displayName: string
  role: string
  emotion: EmotionVector
  memory: CharacterMemory[]
  relationships: CharacterRelationship[]
  goals: CharacterGoal[]
  awareness: CharacterAwareness
  currentAction: string
  revision: number
}

export interface CharacterIntent {
  characterId: string
  action: string
  reason: string
  targetId?: string
  confidence: number
  emotionalContext: string
  expectedWorldEffect?: string
  requiresServerValidation: boolean
}

export function chooseBrain({ distanceMeters, storyImportance, activeConversation, cpuBudget }: { distanceMeters:number; storyImportance:number; activeConversation:boolean; cpuBudget:number }): CharacterBrain {
  if (activeConversation || storyImportance >= .8) return 'world_citizen'
  if (distanceMeters < 40 && cpuBudget >= .5) return 'mpc'
  return 'npc'
}

export function scoreGoal(goal: CharacterGoal, state: CharacterState) {
  const urgency = goal.expiresAt ? Math.max(0, 1 - (goal.expiresAt - Date.now()) / 3_600_000) : 0
  const emotionalBoost = Math.max(state.emotion.hope, state.emotion.fear, state.emotion.excitement) * .2
  return clamp(goal.priority + urgency * .25 + emotionalBoost, 0, 1.5)
}

export function selectGoal(state: CharacterState) {
  return [...state.goals].sort((a,b)=>scoreGoal(b,state)-scoreGoal(a,state))[0]
}

export function explainIntent(intent: CharacterIntent) {
  return `${intent.action} because ${intent.reason}. Emotional context: ${intent.emotionalContext}.`
}

export function validateIntent(intent: CharacterIntent) {
  if (!intent.characterId || !intent.action || !intent.reason) return false
  if (intent.confidence < 0 || intent.confidence > 1) return false
  return true
}

export const BRAIN_CAPABILITIES = {
  npc: ['schedule','pathfinding','basic_reactions','crowd_behavior','ambient_dialogue'],
  mpc: ['memory','emotion','conversation','relationship_updates','personal_goals','world_pulse_reaction'],
  world_citizen: ['persistent_memory','multi_step_goals','social_reasoning','creator_story_role','dynamic_missions','temporal_echoes','cross_world_relationships'],
} as const

export const CHARACTER_INTELLIGENCE_PIPELINE = [
  'sense_world',
  'load_canonical_character_state',
  'update_emotion',
  'update_short_term_memory',
  'update_relationships',
  'select_goal',
  'propose_intent',
  'safety_and_world_rule_validation',
  'server_authoritative_action',
  'expression_voice_animation',
  'persist_meaningful_consequence',
  'emit_explainability_trace',
] as const

export const CHARACTER_SAFETY_RULES = [
  'model_never_authoritative_for_money',
  'model_never_authoritative_for_player_inventory',
  'model_never_bypasses_age_or_content_rules',
  'model_never_controls_external_haptics_without_server_authorization',
  'model_never_exposes_private_security_or_identity_data',
  'model_generated_missions_require_deterministic_validation',
  'panic_mode_overrides_all_model_actions',
  'important_world_changes_require_checkpoint_and_revision',
] as const

export const CHARACTER_QUALITY_GATES = [
  'response_latency_budget',
  'dialogue_repetition_rate',
  'memory_consistency',
  'emotion_expression_alignment',
  'goal_coherence',
  'relationship_continuity',
  'world_awareness_accuracy',
  'accessibility_equivalent_interaction',
  'server_authority_preserved',
  'safe_fallback_to_deterministic_npc',
] as const

function clamp(n:number,min:number,max:number){ return Math.max(min,Math.min(max,n)) }
