export type GateStatus = 'NOT_RUN'|'PASS'|'FAIL'|'BLOCKED'

export type DistrictGateId =
  | 'assets_glbs_load'
  | 'district_renders'
  | 'player_spawns'
  | 'movement_works'
  | 'npc_mpc_world_citizen_works'
  | 'race_works'
  | 'arcade_pinball_works'
  | 'escape_room_works'
  | 'starverse_stage_works'
  | 'world_pulse_changes_district'
  | 'live_two_devices'
  | 'save_rejoin'
  | 'mask_cosmetic_sandbox_purchase'
  | 'panic_mode'
  | 'mobile_performance'
  | 'xr_performance'
  | 'black_poc_render_qa'
  | 'quantum_cone_lens_qa'

export interface DistrictGateEvidence {
  gate: DistrictGateId
  status: GateStatus
  evidenceIds: string[]
  notes?: string
}

export interface DistrictReleaseState {
  districtId: 'streetverse_district_01'|'streetverse_district_02'|'streetverse_district_03'
  gates: DistrictGateEvidence[]
  overall: 'RED'|'YELLOW'|'GREEN'
}

export const DISTRICT_01_REQUIRED_GATES: DistrictGateId[] = [
  'assets_glbs_load','district_renders','player_spawns','movement_works','npc_mpc_world_citizen_works',
  'race_works','arcade_pinball_works','escape_room_works','starverse_stage_works','world_pulse_changes_district',
  'live_two_devices','save_rejoin','mask_cosmetic_sandbox_purchase','panic_mode','mobile_performance','xr_performance',
  'black_poc_render_qa','quantum_cone_lens_qa'
]

export function evaluateDistrict(gates: DistrictGateEvidence[]): DistrictReleaseState['overall'] {
  const byId = new Map(gates.map(g => [g.gate,g]))
  if (DISTRICT_01_REQUIRED_GATES.some(id => byId.get(id)?.status === 'FAIL')) return 'RED'
  if (DISTRICT_01_REQUIRED_GATES.every(id => byId.get(id)?.status === 'PASS' && (byId.get(id)?.evidenceIds.length ?? 0) > 0)) return 'GREEN'
  return 'YELLOW'
}

export const DISTRICT_01_LOCKED_SEQUENCE = [
  'assets_glbs_actually_load',
  'district_renders',
  'player_spawns',
  'movement_works',
  'npc_mpc_world_citizen_works',
  'race_works',
  'arcade_pinball_works',
  'escape_room_works',
  'starverse_stage_works',
  'world_pulse_changes_district',
  'live_works_with_two_devices',
  'save_rejoin_works',
  '10_dollar_cosmetic_sandbox_purchase_works',
  'panic_mode_works',
  'mobile_and_xr_performance_pass',
  'black_poc_character_render_qa_pass',
  'quantum_cone_lens_qa_pass',
] as const

export const CLONE_AFTER_GREEN = {
  source: 'streetverse_district_01',
  targets: ['streetverse_district_02','streetverse_district_03'],
  rule: 'Do not declare a clone production-ready merely because the source district was GREEN. Re-run asset, content, render, multiplayer, save/rejoin, accessibility, safety and performance gates for every clone.',
  preserve: ['identity','avatar','passport','inventory','canonical_player_state','world_pulse','character_intelligence','discovery_director','dynamic_missions','live_chat','checkpoint','panic_mode','money_entitlements','accessibility','render_quality','quantum_cone_lens','holoforge_glb_pipeline'],
  replace: ['district_geometry','glb_assets','businesses','missions','characters','dialogue','stories','music','events','easter_eggs','creator_content'],
} as const

export const PROPAGATE_TO_WORLDS = [
  'my_world','we_are_the_world','kingdom','starverse','holoverse','mars'
] as const

export const LOCKED_BUILD_DISCIPLINE = 'RECOVER → ADAPT → WIRE → MIGRATE → TEST → REPAIR → BENCHMARK → DEPLOY' as const
