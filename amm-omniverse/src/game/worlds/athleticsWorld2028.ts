export type AthleticsEvent =
  | '100m'|'200m'|'400m'|'800m'|'1500m'|'5000m'|'10000m'
  | '100m_hurdles'|'110m_hurdles'|'400m_hurdles'|'3000m_steeplechase'
  | '4x100m_relay'|'4x400m_relay'|'4x100m_mixed_relay'|'4x400m_mixed_relay'
  | 'high_jump'|'pole_vault'|'long_jump'|'triple_jump'
  | 'shot_put'|'discus'|'hammer'|'javelin'
  | 'heptathlon'|'decathlon'|'half_marathon_race_walk'|'marathon';

export interface AthleticsAthleteProfile {
  playerId: string;
  eventSpecialties: AthleticsEvent[];
  acceleration: number;
  topSpeed: number;
  endurance: number;
  reaction: number;
  coordination: number;
  strength: number;
  jumpTechnique: number;
  vaultTechnique: number;
  throwTechnique: number;
  accessibilityProfileId?: string;
}

export interface AthleticsMeet {
  meetId: string;
  name: string;
  eventIds: AthleticsEvent[];
  qualificationRounds: boolean;
  finalsEnabled: boolean;
  serverAuthoritative: true;
  replayEnabled: true;
  broadcastEnabled: true;
  resultVerificationRequired: true;
}

export const CALIFORNIA_2028_REFERENCE = {
  city: 'Los Angeles',
  state: 'California',
  gamesStart: '2028-07-14',
  gamesEnd: '2028-07-30',
  primaryAthleticsVenueReference: 'LA Memorial Coliseum',
  poleVaultIncluded: true,
  brandingMode: 'reference_only_no_official_affiliation_without_license',
} as const;

export const ATHLETICS_WORLD_ZONES = [
  'track_stadium',
  'pole_vault_center',
  'jump_field',
  'throws_field',
  'relay_exchange_lab',
  'sprint_reaction_lab',
  'endurance_training_center',
  'combined_events_center',
  'warmup_track',
  'athlete_village',
  'coach_analysis_room',
  'broadcast_booth',
  'spectator_grandstand',
  'medal_stage',
] as const;

export const ATHLETICS_WORLD_SYSTEMS = [
  'volcano_2_input_layer',
  'bluetooth_and_regular_controller_profiles',
  'touch_keyboard_mouse_and_one_hand_controls',
  'quantum_speed_engine',
  'quantum_lag_buster',
  'quantum_wifi_optimizer',
  'server_authoritative_timing_and_distance',
  'photo_finish_and_false_start_logic',
  'jump_and_throw_measurement',
  'pole_vault_simulation',
  'relay_exchange_validation',
  'weather_and_wind_conditions',
  'crowd_and_broadcast_presentation',
  'replay_and_slow_motion_analysis',
  'coach_ai_explainable_feedback',
  'ranked_meets_and_tournaments',
  'training_drills',
  'accessibility_equivalent_controls',
  'save_rejoin_for_training_and_meets',
  'anti_cheat_and_result_verification',
  'isaiah_ai_tv_highlights_hook',
  'live_broadcast_hook',
] as const;

export const ATHLETICS_WORLD_RULES = [
  'official_olympic_marks_and_branding_require_permission',
  'real_world_reference_data_is_reference_only_until licensed',
  'competition_results_are_server_authoritative',
  'client_or_ai_cannot_forge_times_heights_distances_or_medals',
  'accessibility_profiles_must_preserve competitive access where rules allow',
  'paid_or_real_value_rewards_require eligibility_and_result_verification',
  'weather_and_wind_must_be recorded_for affected_events',
] as const;

export const ATHLETICS_PLAYER_FLOW = [
  'enter_athletics_world',
  'load_passport_athlete_and_controller_profile',
  'calibrate_input_network_and_accessibility',
  'choose_training_meet_ranked_or_tournament',
  'select_event',
  'run_event_specific_warmup',
  'compete_on_authoritative_server',
  'verify_time_height_distance_and_rule_compliance',
  'generate_replay_and_coach_breakdown',
  'update_progression_rank_and_personal_bests',
  'publish_eligible_highlights_to_live_or_isaiah_ai_tv',
] as const;
