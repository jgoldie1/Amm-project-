export type EsportsMode = 'ranked'|'casual'|'tournament'|'creator_event'|'training'|'spectator';
export type MatchFormat = '1v1'|'2v2'|'3v3'|'5v5'|'battle_royale'|'race'|'sports'|'fighting'|'arcade';

export interface EsportsPlayerProfile {
  playerId: string;
  passportLevel: number;
  rating: number;
  rankTier: 'Rookie'|'Bronze'|'Silver'|'Gold'|'Platinum'|'Diamond'|'Master'|'Legend';
  teamId?: string;
  accessibilityProfileId?: string;
  controllerProfileId?: string;
  fairPlayEligible: boolean;
}

export interface EsportsTeam {
  teamId: string;
  name: string;
  captainPlayerId: string;
  rosterPlayerIds: string[];
  public: boolean;
  recruiting: boolean;
}

export interface EsportsMatch {
  matchId: string;
  mode: EsportsMode;
  format: MatchFormat;
  playerIds: string[];
  teamIds?: string[];
  serverInstanceId: string;
  authoritative: true;
  spectatorEnabled: boolean;
  liveBroadcastEnabled: boolean;
  antiCheatRequired: true;
  resultVerified: boolean;
}

export interface Tournament {
  tournamentId: string;
  name: string;
  format: MatchFormat;
  bracket: 'single_elimination'|'double_elimination'|'round_robin'|'swiss';
  maxEntrants: number;
  entryType: 'free'|'sponsor'|'real_value_gated';
  ageJurisdictionGateRequired: boolean;
  prizeRulesVerified: boolean;
  liveFinalsEnabled: boolean;
}

export const ESPORTS_WORLD_ZONES = [
  'main_arena',
  'ranked_matchmaking_hub',
  'team_clubhouses',
  'training_lab',
  'creator_event_stage',
  'spectator_stands',
  'broadcast_control_room',
  'holo_replay_theater',
  'controller_calibration_bay',
  'merch_and_skin_shop',
] as const;

export const ESPORTS_WORLD_SYSTEMS = [
  'volcano_2_controller_normalization',
  'bluetooth_gaming_computer_bridge',
  'regular_controller_profiles',
  'quantum_speed_engine',
  'quantum_lag_buster',
  'quantum_wifi_optimizer',
  'server_authoritative_match_state',
  'skill_based_matchmaking',
  'team_and_roster_management',
  'ranked_ladders',
  'tournament_brackets',
  'spectator_mode',
  'live_broadcast_and_commentary',
  'instant_replays',
  'creator_events',
  'anti_cheat_and_result_verification',
  'accessibility_equivalent_controls',
  'save_rejoin_and_disconnect_recovery',
  'cosmetics_and_team_merch',
  'founder_revenue_cockpit_feed',
] as const;

export const ESPORTS_WORLD_RULES = [
  'competitive_results_are_server_authoritative',
  'no_ai_or_client_can_award_real_value_prizes_without_verified_result_and_eligibility',
  'controller_disconnect_neutralizes_input_and_preserves_match_state',
  'ranked_matches_require_anti_cheat_and_latency_quality_checks',
  'accessibility_controls_must_not reduce_competitive_access',
  'spectator_clients_are_read_only_for_match_authority',
  'prize_or_paid_entry_modes_remain_locked_until age_jurisdiction_and_provider_rules_are_verified',
  'cosmetics_do_not alter competitive stats',
] as const;

export const ESPORTS_WORLD_FLOW = [
  'enter_esports_world',
  'load_player_passport_and_controller_profile',
  'calibrate_input_and_network_quality',
  'choose_training_casual_ranked_or_tournament',
  'matchmake_or_join_team',
  'allocate_authoritative_game_server',
  'play_match',
  'verify_result_and_anti_cheat_evidence',
  'update_rank_and_progression',
  'publish_replay_live_clip_or_team_result',
  'settle_only_verified_eligible_rewards',
] as const;
