import { DistrictProofReport, assertPromotionAllowed } from './districtProofOrchestrator'

export interface DistrictTemplate {
  id: string
  sourceDistrictId: string
  theme: string
  preserveSystems: string[]
  replaceContent: string[]
  requiredEvidence: string[]
}

const PRESERVE_SYSTEMS = [
  'identity','avatar','passport','inventory','canonical_state','world_pulse',
  'character_intelligence','discovery_director','dynamic_missions','live_chat',
  'checkpoints','panic_mode','accessibility','render_quality','quantum_cone_lens',
  'holoforge_glb','spaceos_digital_twins','parks_woods_wildlife','building_acoustics',
  'vehicle_acoustics','quantum_performance_tester','money_security_boundaries',
]

const REPLACE_CONTENT = [
  'geography','district_geometry','buildings','interiors','businesses','characters',
  'missions','stories','music','easter_eggs','wildlife_mix','park_layout','weather_events',
  'creator_events','races','arcade_tables','escape_room_layouts','starverse_programming',
]

const REQUIRED_EVIDENCE = [
  'asset_rights','glb_validation','render_pass','spawn_pass','movement_pass','spaceos_pass',
  'audio_propagation_pass','wildlife_pass','character_intelligence_pass','gameplay_loop_pass',
  'world_pulse_pass','two_device_live_pass','save_rejoin_pass','commerce_sandbox_pass',
  'panic_mode_pass','mobile_perf_pass','xr_perf_pass','black_poc_render_pass','cone_lens_pass',
  'security_money_pass',
]

export const DISTRICT_02_TEMPLATE: DistrictTemplate = {
  id:'streetverse_district_02',
  sourceDistrictId:'streetverse_district_01',
  theme:'Riverfront Commerce & Creator District',
  preserveSystems:[...PRESERVE_SYSTEMS],
  replaceContent:[...REPLACE_CONTENT],
  requiredEvidence:[...REQUIRED_EVIDENCE],
}

export const DISTRICT_03_TEMPLATE: DistrictTemplate = {
  id:'streetverse_district_03',
  sourceDistrictId:'streetverse_district_01',
  theme:'Transit, Sports & Nightlife District',
  preserveSystems:[...PRESERVE_SYSTEMS],
  replaceContent:[...REPLACE_CONTENT],
  requiredEvidence:[...REQUIRED_EVIDENCE],
}

export interface ClonePlan {
  sourceDistrictId: string
  targetDistrictId: string
  allowed: boolean
  preserveSystems: string[]
  replaceContent: string[]
  requiredEvidence: string[]
}

export function createClonePlan(report: DistrictProofReport, template: DistrictTemplate): ClonePlan {
  assertPromotionAllowed(report)
  return {
    sourceDistrictId: template.sourceDistrictId,
    targetDistrictId: template.id,
    allowed: true,
    preserveSystems:[...template.preserveSystems],
    replaceContent:[...template.replaceContent],
    requiredEvidence:[...template.requiredEvidence],
  }
}

export const EXPANSION_SEQUENCE = [
  'DISTRICT_01_GREEN',
  'CLONE_DISTRICT_02',
  'REPLACE_CONTENT',
  'RUN_FULL_PROOF',
  'DISTRICT_02_GREEN',
  'CLONE_DISTRICT_03',
  'REPLACE_CONTENT',
  'RUN_FULL_PROOF',
  'DISTRICT_03_GREEN',
  'EXPAND_STREETVERSE',
  'PROPAGATE_TO_MY_WORLD',
  'PROPAGATE_TO_WE_ARE_THE_WORLD',
  'PROPAGATE_TO_KINGDOM',
  'PROPAGATE_TO_STARVERSE',
  'PROPAGATE_TO_HOLOVERSE',
  'PROPAGATE_TO_MARS',
] as const
