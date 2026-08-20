export type RemasterDomain = 'graphics'|'glb_assets'|'ui_ux'|'performance'|'accessibility'|'world_systems'|'commerce'|'live'|'regression'
export type RemasterAction = 'analyze'|'propose_patch'|'run_test'|'compare_baseline'|'recommend_rollback'

export interface RemasterAgent {
  id: string
  domain: RemasterDomain
  enabled: boolean
  shadowMode: boolean
  maxActionsPerRun: number
  canWriteCode: boolean
  requiresHumanOrCiApproval: boolean
}

export interface RemasterFinding {
  agentId: string
  domain: RemasterDomain
  severity: 'info'|'warning'|'critical'
  summary: string
  evidenceIds: string[]
  proposedAction: RemasterAction
  reversible: boolean
}

export const REMASTER_AGENTS: RemasterAgent[] = [
  {id:'visual-remaster',domain:'graphics',enabled:true,shadowMode:false,maxActionsPerRun:10,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'asset-remaster',domain:'glb_assets',enabled:true,shadowMode:false,maxActionsPerRun:10,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'experience-remaster',domain:'ui_ux',enabled:true,shadowMode:false,maxActionsPerRun:10,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'quantum-performance-remaster',domain:'performance',enabled:true,shadowMode:false,maxActionsPerRun:12,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'accessibility-remaster',domain:'accessibility',enabled:true,shadowMode:false,maxActionsPerRun:10,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'world-remaster',domain:'world_systems',enabled:true,shadowMode:true,maxActionsPerRun:8,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'commerce-remaster',domain:'commerce',enabled:true,shadowMode:true,maxActionsPerRun:6,canWriteCode:false,requiresHumanOrCiApproval:true},
  {id:'live-remaster',domain:'live',enabled:true,shadowMode:true,maxActionsPerRun:6,canWriteCode:true,requiresHumanOrCiApproval:true},
  {id:'regression-remaster',domain:'regression',enabled:true,shadowMode:false,maxActionsPerRun:20,canWriteCode:false,requiresHumanOrCiApproval:true},
]

export const REMASTER_AGENT_RULES = [
  'agents_may_analyze_and_propose_but_ci_and_server_remain_authoritative',
  'all_agent_actions_are_logged_with_input_snapshot_revision_and_evidence',
  'same_snapshot_and_seed_must_produce_same_deterministic_fallback_result',
  'no_agent_can_move_money_grant_paid_rewards_disable_panic_mode_bypass_age_gate_or_change_security_privileges',
  'commerce_agent_may_find_inconsistencies_but_cannot authorize_or_settle_real_value',
  'provider_outage_or_model_failure_falls_back_to_deterministic_rules',
  'every_patch_requires_tests_and_can_be_rolled_back',
  'feature_flags_support_per_agent_per_world_enable_shadow_and_kill_switch',
  'agents_must_not_reveal_hidden_chain_of_thought_only concise_action_rationale_and_evidence',
  'remaster_cycle_is recover_adapt_wire_migrate_test_repair_benchmark_deploy',
] as const

export const REMASTER_TARGETS = [
  'district01_green',
  'app_shell_and_navigation',
  'streetverse_visual_quality',
  'character_skin_hair_teeth_eye_qa',
  'spaceos_building_streaming',
  'window_door_vehicle_acoustics',
  'parks_woods_wildlife',
  'npc_mpc_world_citizen_behavior',
  'race_arcade_pinball_escape_room_starverse',
  'world_pulse_and_discovery',
  'live_two_device',
  'save_rejoin',
  'district_business_os',
  'mobile_xr_performance',
  'quantum_cone_lens',
] as const
