export type GuardianThreat =
  | 'griefing'
  | 'harassment'
  | 'cheating'
  | 'exploit_attempt'
  | 'economy_abuse'
  | 'minor_safety_risk'
  | 'spam_or_botting'
  | 'world_state_corruption'
  | 'unauthorized_privilege'
  | 'doxxing_or_privacy_risk';

export type GuardianAction =
  | 'observe'
  | 'rate_limit'
  | 'mute'
  | 'restrict_interaction'
  | 'remove_from_instance'
  | 'freeze_suspicious_transaction'
  | 'quarantine_asset_or_script'
  | 'rollback_world_state'
  | 'escalate_human_review'
  | 'suspend_account_pending_review';

export interface GuardianIncident {
  incidentId: string;
  worldId: string;
  playerId?: string;
  threat: GuardianThreat;
  evidence: string[];
  confidence: number;
  proposedActions: GuardianAction[];
  humanReviewRequired: boolean;
  reversible: boolean;
  createdAt: string;
}

export interface GuardianPolicy {
  id: string;
  scope: 'global'|'world'|'district'|'match'|'live_room'|'commerce';
  threat: GuardianThreat;
  minConfidenceForAutoAction: number;
  allowedAutoActions: GuardianAction[];
  alwaysHumanReviewFor: GuardianAction[];
}

export const GUARDIAN_GROUP_SYSTEMS = [
  'holoGuardian_minor_safety',
  'anti_griefing',
  'anti_cheat',
  'exploit_detection',
  'economy_abuse_detection',
  'privacy_and_doxxing_protection',
  'spam_and_bot_detection',
  'world_state_integrity_monitor',
  'asset_and_script_quarantine',
  'safe_instance_ejection',
  'checkpoint_and_rollback_support',
  'human_admin_escalation',
  'audit_log_and_evidence_chain',
] as const;

export const GUARDIAN_GROUP_RULES = [
  'safety_overrides_engagement_for_minors',
  'guardian_group_cannot_create_money_inventory_or_paid_rewards',
  'guardian_group_cannot_silently_change_competitive_results',
  'guardian_group_cannot_bypass_age_or_jurisdiction_gates',
  'high_impact_enforcement_requires_logged_evidence',
  'suspension_and_major_account_actions_require_human_review_unless_emergency_policy_explicitly_allows_temporary_containment',
  'rollback_uses_known_good_checkpoint_and_preserves_audit_trace',
  'all_auto_actions_are_bounded_reversible_and_policy_scoped',
  'spectator_and_live_moderation_are_separated_from_match_authority',
] as const;

export const GUARDIAN_PROTECTION_FLOW = [
  'sense_event',
  'classify_threat',
  'collect_evidence',
  'score_confidence',
  'apply_low_risk_containment_if_policy_allows',
  'preserve_player_and_world_state',
  'escalate_high_risk_actions_to_human_review',
  'repair_or_rollback_if_integrity_was_damaged',
  'retest_world_or_match',
  'close_incident_with_audit_record',
] as const;
