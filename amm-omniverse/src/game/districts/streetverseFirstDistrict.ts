export type DistrictVenueKind =
  | 'home_base'|'restaurant'|'store'|'music_venue'|'starverse_stage'|'holo_arcade'|'escape_room'
  | 'street_race'|'creator_event'|'job_activity'|'mystery'|'quantum_portal'|'live_location'

export interface DistrictVenue {
  id: string
  title: string
  kind: DistrictVenueKind
  glbAssetKey: string
  worldPulseReactive: boolean
  multiplayer: boolean
  liveEnabled: boolean
  secretLinks?: string[]
}

export interface DistrictCharacter {
  id: string
  displayName: string
  brain: 'npc'|'mpc'|'world_citizen'
  role: string
  homeVenueId?: string
  workVenueId?: string
  explainableAI: true
}

export interface InclusiveCharacterRenderingProfile {
  skin: {
    toneRangeValidation: true
    melaninAwareMaterialResponse: true
    subsurfaceScattering: true
    exposureClippingProtection: true
    specularHotspotLimit: number
    diffuseDetailPreservation: true
  }
  hair: {
    coilyCurlyStraightCoverage: true
    strandOrCardLOD: true
    scalpContrastValidation: true
    edgeTransparencyQA: true
  }
  eyes: {
    scleraNotPureWhite: true
    irisRoughnessValidation: true
    tearlineControlled: true
  }
  teeth: {
    notPureWhite: true
    highlightClamp: number
    enamelRoughnessValidation: true
    exposureTestAcrossSkinTones: true
  }
  lips: {
    naturalToneRange: true
    wetnessSpecularClamp: true
  }
  lightingQA: Array<'daylight'|'overcast'|'warm_indoor'|'cool_indoor'|'night_neon'|'stage_spotlight'|'xr_holographic'>
}

export const INCLUSIVE_CHARACTER_RENDERING: InclusiveCharacterRenderingProfile = {
  skin: {
    toneRangeValidation: true,
    melaninAwareMaterialResponse: true,
    subsurfaceScattering: true,
    exposureClippingProtection: true,
    specularHotspotLimit: 0.72,
    diffuseDetailPreservation: true,
  },
  hair: {
    coilyCurlyStraightCoverage: true,
    strandOrCardLOD: true,
    scalpContrastValidation: true,
    edgeTransparencyQA: true,
  },
  eyes: { scleraNotPureWhite:true, irisRoughnessValidation:true, tearlineControlled:true },
  teeth: { notPureWhite:true, highlightClamp:0.82, enamelRoughnessValidation:true, exposureTestAcrossSkinTones:true },
  lips: { naturalToneRange:true, wetnessSpecularClamp:true },
  lightingQA: ['daylight','overcast','warm_indoor','cool_indoor','night_neon','stage_spotlight','xr_holographic'],
}

export const STREETVERSE_FIRST_DISTRICT = {
  id: 'streetverse-district-01',
  title: 'StreetVerse First District',
  proofGoal: 'One dense, replayable, living district that proves the reusable world engine.',
  venues: <DistrictVenue[]>[
    {id:'home-01',title:'Player Home/Base',kind:'home_base',glbAssetKey:'sv/home-base-v1',worldPulseReactive:false,multiplayer:true,liveEnabled:false},
    {id:'food-01',title:'Judah Grill',kind:'restaurant',glbAssetKey:'sv/restaurant-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:false},
    {id:'store-01',title:'Creator Market',kind:'store',glbAssetKey:'sv/store-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true},
    {id:'music-01',title:'Set Apart Music Hall',kind:'music_venue',glbAssetKey:'sv/music-hall-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true,secretLinks:['starverse-stage']},
    {id:'stage-01',title:'StarVerse Street Stage',kind:'starverse_stage',glbAssetKey:'sv/starverse-stage-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true},
    {id:'arcade-01',title:'Holo Arcade + Pinball',kind:'holo_arcade',glbAssetKey:'sv/holo-arcade-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true,secretLinks:['escape-01','quantum-01']},
    {id:'escape-01',title:'After Hours Escape Room',kind:'escape_room',glbAssetKey:'sv/escape-room-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true,secretLinks:['quantum-01']},
    {id:'race-01',title:'Street Circuit',kind:'street_race',glbAssetKey:'sv/street-circuit-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true,secretLinks:['escape-01']},
    {id:'creator-01',title:'Creator Block Party',kind:'creator_event',glbAssetKey:'sv/block-party-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true},
    {id:'job-01',title:'District Job Hub',kind:'job_activity',glbAssetKey:'sv/job-hub-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:false},
    {id:'mystery-01',title:'11:47 Mystery',kind:'mystery',glbAssetKey:'sv/mystery-site-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true,secretLinks:['quantum-01']},
    {id:'quantum-01',title:'Hidden Quantum Portal',kind:'quantum_portal',glbAssetKey:'sv/quantum-portal-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true},
    {id:'live-01',title:'District LIVE Plaza',kind:'live_location',glbAssetKey:'sv/live-plaza-v1',worldPulseReactive:true,multiplayer:true,liveEnabled:true},
  ],
  characters: <DistrictCharacter[]>[
    {id:'npc-01',displayName:'Transit Worker',brain:'npc',role:'predictable schedule/crowd utility',workVenueId:'job-01',explainableAI:true},
    {id:'mpc-01',displayName:'Local Creator',brain:'mpc',role:'memory/emotion/social missions',homeVenueId:'home-01',workVenueId:'music-01',explainableAI:true},
    {id:'wc-01',displayName:'District Steward',brain:'world_citizen',role:'world-aware story and discovery anchor',workVenueId:'live-01',explainableAI:true},
  ],
  requiredSystems: [
    'canonical_player_state','server_authoritative_multiplayer','world_pulse','living_expression','character_intelligence',
    'discovery_director','dynamic_missions','passport_mastery','glb_asset_streaming','quantum_cone_lens','live_chat',
    'reels','save_rejoin','panic_mode','accessibility','adaptive_quality'
  ],
  qualityGates: [
    '30_second_hook','5_minute_fun_loop','30_minute_session_arc','one_clip_worthy_moment','one_secret_cross_world_portal',
    '60fps_target_on_supported_desktop','stable_mobile_quality_fallback','skin_tone_lighting_qa','teeth_highlight_qa','hair_edge_qa',
    'no_black_crush_on_dark_skin','no_face_washout_under_stage_lights','no_pure_white_teeth','save_rejoin_restores_world',
    'panic_mode_preserves_checkpoint'
  ]
} as const

export const DISTRICT_ASSET_GENERATION_PIPELINE = [
  'prompt_or_template',
  'holoforge_quantum_asset_candidate',
  'rights_and_moderation_check',
  'glb_validation',
  'lod_generation',
  'collision_mesh',
  'material_budget',
  'inclusive_character_rendering_qa_if_character',
  'quantum_cone_lens_presentation_qa',
  'mobile_xr_performance_qa',
  'approved_global_asset_library',
  'district_streaming_manifest',
] as const
