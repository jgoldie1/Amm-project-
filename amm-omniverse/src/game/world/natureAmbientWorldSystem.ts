export type Biome = 'urban_park'|'woodland'|'riverfront'|'wetland'|'prairie'|'community_garden'|'rooftop_garden'|'mars_habitat'
export type AmbientSource = 'traffic'|'voices'|'birds'|'insects'|'wind'|'rain'|'water'|'trees'|'music_bleed'|'construction'|'train'|'sirens'|'dogs'|'sports'|'festival'

export interface NatureZone {
  id: string
  biome: Biome
  publicAccess: boolean
  trails: boolean
  accessibleRouteRequired: boolean
  wildlifeEnabled: boolean
  weatherReactive: boolean
  dayNightReactive: boolean
  worldPulseReactive: boolean
  scentOptional: boolean
  activities: string[]
}

export interface WildlifeAgent {
  speciesId: string
  category: 'bird'|'mammal'|'insect'|'fish'|'reptile'
  behavior: 'ambient'|'forage'|'flee'|'rest'|'migrate'|'nest'
  playerCollision: false
  attackPlayer: false
  worldPulseReactive: boolean
  audioCue?: string
}

export interface AmbientAudioEmitter {
  id: string
  source: AmbientSource
  position: [number, number, number]
  radiusMeters: number
  baseGain: number
  occlusion: boolean
  reverbZone?: string
  dayNightReactive: boolean
  weatherReactive: boolean
  worldPulseReactive: boolean
}

export interface OutdoorSoundscapeState {
  emitters: AmbientAudioEmitter[]
  masterGain: number
  accessibilityCaptions: boolean
  importantCueVisualEquivalent: boolean
  audioOnlyRequiredForProgress: false
}

export const DISTRICT_01_NATURE_ZONES: NatureZone[] = [
  {id:'judah-community-park',biome:'urban_park',publicAccess:true,trails:true,accessibleRouteRequired:true,wildlifeEnabled:true,weatherReactive:true,dayNightReactive:true,worldPulseReactive:true,scentOptional:true,activities:['basketball','walking','creator_pop_up','festival','photography','reel_challenge','picnic','mystery_clue']},
  {id:'echo-woods',biome:'woodland',publicAccess:true,trails:true,accessibleRouteRequired:true,wildlifeEnabled:true,weatherReactive:true,dayNightReactive:true,worldPulseReactive:true,scentOptional:true,activities:['trail_walk','wildlife_observation','quantum_echo','escape_clue','time_portal','photography']},
  {id:'creator-garden',biome:'community_garden',publicAccess:true,trails:true,accessibleRouteRequired:true,wildlifeEnabled:true,weatherReactive:true,dayNightReactive:true,worldPulseReactive:true,scentOptional:true,activities:['gardening','education','food_event','creator_market','community_mission']},
]

export const DISTRICT_01_WILDLIFE: WildlifeAgent[] = [
  {speciesId:'songbird',category:'bird',behavior:'ambient',playerCollision:false,attackPlayer:false,worldPulseReactive:true,audioCue:'birdsong'},
  {speciesId:'squirrel',category:'mammal',behavior:'forage',playerCollision:false,attackPlayer:false,worldPulseReactive:true},
  {speciesId:'butterfly',category:'insect',behavior:'migrate',playerCollision:false,attackPlayer:false,worldPulseReactive:true},
  {speciesId:'urban-rabbit',category:'mammal',behavior:'flee',playerCollision:false,attackPlayer:false,worldPulseReactive:true},
]

export const AMBIENT_AUDIO_RULES = [
  'outside_is_never_silent_without_story_reason',
  'sound_sources_have_world_positions_distance_and_occlusion',
  'walls_windows_tunnels_and_floors_change_occlusion_and_reverb',
  'traffic_crowds_weather_wildlife_and_events_follow_world_pulse',
  'indoor_audio_can_bleed_outdoors_and_outdoor_audio_can_bleed_through_windows',
  'night_soundscape_differs_from_day_soundscape',
  'rain_wind_snow_and_heat_change_ambient_mix_and_population_behavior',
  'important_gameplay_audio_has_caption_visual_or_haptic_equivalent',
  'ambient_audio_quality_scales_down before_gameplay_or_voice_chat',
  'panic_mode_can_mute_nonessential_automation_and_preserve_voice_safety_channels',
] as const

export const NATURE_WORLD_QUALITY_GATES = [
  'park_and_woodland_glbs_stream_with_lod',
  'vegetation_wind_animation_with_mobile_fallback',
  'wildlife_population_budget_enforced',
  'wildlife_never_blocks_accessible_route',
  'spatial_audio_occlusion_tested_indoor_outdoor',
  'day_night_ambient_transition_tested',
  'weather_ambient_transition_tested',
  'world_pulse_event_changes_crowd_wildlife_and_soundscape',
  'important_audio_cues_have_accessible_equivalents',
  'xr_audio_latency_and_frame_budget_pass',
] as const

export const LOCKED_WORLD_STACK = [
  'identity','avatar','passport','inventory','canonical_state','world_pulse',
  'character_intelligence','discovery_director','dynamic_missions','live_chat',
  'checkpoints','panic_mode','accessibility','render_quality','quantum_cone_lens',
  'holoforge_glb','spaceos_digital_twins','parks_woods_wildlife','spatial_ambient_audio',
] as const
