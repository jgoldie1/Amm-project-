export type Interest = 'racing'|'music'|'mystery'|'exploration'|'building'|'creator'|'sports'|'faith'|'history'|'science'|'xr'|'social'
export type WorldId = 'streetverse'|'my_world'|'we_are_the_world'|'kingdom'|'starverse'|'holoverse'|'mars'

export interface PlayerDiscoveryProfile {
  playerId: string
  interests: Interest[]
  recentActivities: string[]
  avoidedActivities: string[]
  currentWorld: WorldId
  passportLevel: number
  worldMastery: Partial<Record<WorldId, number>>
  accessibilityTags: string[]
  sessionMinutes: number
  lastMajorDiscoveryAt?: number
}

export interface DiscoveryCandidate {
  id: string
  world: WorldId
  interests: Interest[]
  title: string
  hintText: string
  hidden: boolean
  minimumPassportLevel?: number
  requiredMastery?: number
  cooldownMinutes?: number
  worldPulseTags?: string[]
  accessibilityTags?: string[]
  spoilerSensitive: boolean
}

export interface DiscoveryDecisionTrace {
  playerId: string
  candidateId: string
  score: number
  reasons: string[]
  blockedReasons: string[]
  shownAs: 'ambient_hint'|'stubbs_ai_nudge'|'npc_rumor'|'world_event'|'not_shown'
  spoilerProtected: boolean
  revision: number
}

export function scoreDiscovery(profile: PlayerDiscoveryProfile, candidate: DiscoveryCandidate, worldPulseTags: string[] = []): DiscoveryDecisionTrace {
  const reasons: string[] = []
  const blockedReasons: string[] = []
  let score = 0

  if (candidate.minimumPassportLevel && profile.passportLevel < candidate.minimumPassportLevel) blockedReasons.push('passport_level')
  if (candidate.requiredMastery && (profile.worldMastery[candidate.world] ?? 0) < candidate.requiredMastery) blockedReasons.push('world_mastery')
  if (profile.avoidedActivities.includes(candidate.id)) blockedReasons.push('player_avoided')

  const interestMatches = candidate.interests.filter(i => profile.interests.includes(i)).length
  score += interestMatches * 24
  if (interestMatches) reasons.push(`interest_match:${interestMatches}`)
  if (candidate.world === profile.currentWorld) { score += 16; reasons.push('current_world') }
  if (!profile.recentActivities.includes(candidate.id)) { score += 10; reasons.push('novelty') }
  const pulseMatches = (candidate.worldPulseTags ?? []).filter(t => worldPulseTags.includes(t)).length
  score += pulseMatches * 12
  if (pulseMatches) reasons.push(`world_pulse_match:${pulseMatches}`)
  if (profile.sessionMinutes < 8) { score += 10; reasons.push('early_session_hook') }

  const blocked = blockedReasons.length > 0
  const shownAs: DiscoveryDecisionTrace['shownAs'] = blocked ? 'not_shown'
    : score >= 65 ? 'stubbs_ai_nudge'
    : score >= 45 ? 'world_event'
    : score >= 28 ? 'npc_rumor'
    : score >= 16 ? 'ambient_hint'
    : 'not_shown'

  return {
    playerId: profile.playerId,
    candidateId: candidate.id,
    score,
    reasons,
    blockedReasons,
    shownAs,
    spoilerProtected: candidate.spoilerSensitive,
    revision: Date.now(),
  }
}

export function renderHint(candidate: DiscoveryCandidate, trace: DiscoveryDecisionTrace) {
  if (trace.shownAs === 'not_shown') return null
  if (!candidate.spoilerSensitive) return candidate.hintText
  return candidate.hidden ? obscure(candidate.hintText) : candidate.hintText
}

function obscure(text: string) {
  const words = text.split(/\s+/)
  return words.map((w, i) => i % 3 === 1 && w.length > 4 ? '…' : w).join(' ')
}

export const DISCOVERY_DIRECTOR_RULES = [
  'never_reveal_exact_easter_egg_solution',
  'always_log_why_an_opportunity_was_shown',
  'respect_player_avoidance_and_accessibility',
  'prefer_one_good_nudge_over_map_marker_spam',
  'give_new_players_an_interesting_option_early',
  'use_world_pulse_to_make_discovery_feel_alive',
  'do_not_gate_basic_world_access_behind_grind',
  'do_not_recommend_adult_content_to_minor_profiles',
  'do_not_use_paid_reward_status_to_manipulate_discovery',
  'fallback_to_deterministic_ranker_if_ai_provider_fails',
] as const
