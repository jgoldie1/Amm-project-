export type ProofState = 'PASS'|'FAIL'|'UNTESTED'

export interface ProofEvidence {
  id: string
  label: string
  state: ProofState
  evidenceUri?: string
  measuredValue?: number
  target?: number
  notes?: string
}

export const DISTRICT_01_ADVANCED_IMMERSION_GATES: ProofEvidence[] = [
  {id:'glb-load',label:'GLBs load and stream with LOD',state:'UNTESTED'},
  {id:'district-render',label:'District renders from spawn to horizon without fatal errors',state:'UNTESTED'},
  {id:'player-spawn',label:'Player spawns into canonical District 01 checkpoint',state:'UNTESTED'},
  {id:'movement',label:'Movement uses authoritative validation and remains responsive',state:'UNTESTED'},
  {id:'spaceos-buildings',label:'SpaceOS interiors, stairs, elevators and accessible circulation work',state:'UNTESTED'},
  {id:'window-door-audio',label:'Windows and doors alter sound transmission, occlusion and reverb',state:'UNTESTED'},
  {id:'vehicle-cabin-audio',label:'Vehicle windows/doors/speed/weather alter cabin acoustics',state:'UNTESTED'},
  {id:'parks-woods-wildlife',label:'Parks, woods and wildlife react to time/weather/World Pulse',state:'UNTESTED'},
  {id:'npc-mpc-world-citizen',label:'NPC, MPC and World Citizen actions are explainable and server-bounded',state:'UNTESTED'},
  {id:'race',label:'Street race completes with authoritative result',state:'UNTESTED'},
  {id:'arcade-pinball',label:'Arcade and Holo Pinball load and complete a session',state:'UNTESTED'},
  {id:'escape-room',label:'Escape Room can be completed with accessibility-equivalent clues',state:'UNTESTED'},
  {id:'starverse-stage',label:'StarVerse stage supports performance loop and recording hooks',state:'UNTESTED'},
  {id:'world-pulse',label:'World Pulse visibly changes traffic, crowds, businesses, sound and wildlife',state:'UNTESTED'},
  {id:'two-device-live',label:'Two-device LIVE proves audio/video/chat room correctness',state:'UNTESTED'},
  {id:'save-rejoin',label:'Leave/rejoin restores canonical player, inventory, mission and world state',state:'UNTESTED'},
  {id:'commerce-mask',label:'$10 cosmetic sandbox purchase creates entitlement and refund can revoke it',state:'UNTESTED'},
  {id:'panic-mode',label:'Panic Mode freezes privileged actions/device commands while preserving checkpoint/evidence',state:'UNTESTED'},
  {id:'mobile-performance',label:'Mobile quality tier meets configured frame-time/FPS budget',state:'UNTESTED'},
  {id:'xr-performance',label:'XR quality tier meets configured frame-time/FPS/latency budget',state:'UNTESTED'},
  {id:'poc-rendering',label:'Black/POC skin, hair, eyes, lips and teeth pass lighting/exposure QA',state:'UNTESTED'},
  {id:'quantum-cone-lens',label:'Quantum Cone Lens passes brightness, ghosting/crosstalk, angle and thermal QA',state:'UNTESTED'},
]

export function district01Status(gates: ProofEvidence[]) {
  if (gates.some(g => g.state === 'FAIL')) return 'RED' as const
  if (gates.every(g => g.state === 'PASS' && Boolean(g.evidenceUri || g.notes))) return 'GREEN' as const
  return 'YELLOW' as const
}

export interface ImmersionScenario {
  id: string
  steps: string[]
  expected: string[]
}

export const APARTMENT_TO_STREET_TO_CAR_SCENARIO: ImmersionScenario = {
  id:'apartment-street-car-rain',
  steps:[
    'spawn_inside_apartment',
    'listen_through_closed_window',
    'crack_window',
    'open_window',
    'walk_into_hallway',
    'enter_stairwell',
    'ride_elevator_to_lobby',
    'exit_to_street',
    'enter_vehicle',
    'close_vehicle_doors_and_windows',
    'lower_vehicle_window',
    'drive_into_tunnel',
    'trigger_rain_world_pulse',
  ],
  expected:[
    'closed_glass_muffles_high_frequency_street_detail',
    'cracked_window_increases_directional_street_transmission',
    'open_window_restores_fuller_outdoor_mix',
    'hallway_and_stairwell_apply_distinct_occlusion_and_reverb',
    'elevator_door_state_changes_lobby_transmission',
    'street_mix_restores outdoor_spatial_emitters',
    'vehicle_cabin_filters_external_audio_when_closed',
    'lowered_window_reintroduces traffic_sirens_music_voices',
    'tunnel_applies_reflection_and_reverb_profile',
    'rain_adds_roof_glass_road_and_environment_layers',
    'voice_chat_and_critical_accessibility_cues_remain_intelligible',
  ],
}

export const ADVANCED_WORLD_SYSTEMS = [
  'persistent_identity_and_checkpoint_state',
  'server_authoritative_multiplayer',
  'spaceos_vertical_building_exploration',
  'door_window_floor_vehicle_acoustic_propagation',
  'world_pulse_reactive_population_business_wildlife_weather',
  'npc_mpc_world_citizen_explainable_intelligence',
  'discovery_director_dynamic_missions_easter_eggs',
  'holoforge_glb_streaming_and_lod',
  'quantum_cone_lens_render_pipeline',
  'mobile_ar_vr_mr_holo_quality_scaling',
  'live_chat_recording_reels',
  'panic_mode_and_money_security_boundaries',
] as const

export const RELEASE_DISCIPLINE = ['RECOVER','ADAPT','WIRE','MIGRATE','TEST','REPAIR','BENCHMARK','DEPLOY'] as const
