export type WildActivityMode = 'tracking'|'photography'|'conservation'|'survival'|'exploration'|'fictional_hunt'

export interface WildZone {
  id: string
  name: string
  biome: 'woods'|'prairie'|'wetland'|'riverfront'|'park_edge'
  modes: WildActivityMode[]
  ageRating: 'all'|'teen'|'adult'
  multiplayer: boolean
  worldPulseReactive: boolean
  checkpointEnabled: boolean
}

export interface WildMission {
  id: string
  mode: WildActivityMode
  title: string
  objective: string
  rewards: Array<'passport_xp'|'mastery_xp'|'cosmetic'|'lore'|'creator_collectible'>
  accessibilityEquivalentRequired: boolean
  serverValidationRequired: boolean
}

export const DISTRICT_01_WILD_ZONES: WildZone[] = [
  {id:'echo-woods-wild',name:'Echo Woods',biome:'woods',modes:['tracking','photography','conservation','survival','exploration'],ageRating:'all',multiplayer:true,worldPulseReactive:true,checkpointEnabled:true},
  {id:'prairie-edge',name:'Prairie Edge',biome:'prairie',modes:['tracking','photography','conservation','fictional_hunt'],ageRating:'teen',multiplayer:true,worldPulseReactive:true,checkpointEnabled:true},
]

export const OPEN_WILD_MISSIONS: WildMission[] = [
  {id:'wild-tracks',mode:'tracking',title:'Read the Trail',objective:'Follow tracks, broken vegetation and audio/visual wildlife clues to locate the target area.',rewards:['passport_xp','mastery_xp'],accessibilityEquivalentRequired:true,serverValidationRequired:true},
  {id:'wild-photo',mode:'photography',title:'Perfect Wildlife Shot',objective:'Photograph approved wildlife without disturbing its behavior.',rewards:['passport_xp','cosmetic'],accessibilityEquivalentRequired:true,serverValidationRequired:true},
  {id:'wild-conservation',mode:'conservation',title:'Restore the Habitat',objective:'Remove hazards, restore habitat markers and verify wildlife returns.',rewards:['passport_xp','mastery_xp','lore'],accessibilityEquivalentRequired:true,serverValidationRequired:true},
  {id:'wild-survival',mode:'survival',title:'Night in the Woods',objective:'Navigate changing weather and World Pulse conditions to reach the checkpoint.',rewards:['passport_xp','mastery_xp'],accessibilityEquivalentRequired:true,serverValidationRequired:true},
  {id:'wild-hunt',mode:'fictional_hunt',title:'Open Wild Hunt',objective:'Complete the fictional game hunt objective under content/age settings and server rules.',rewards:['passport_xp','mastery_xp'],accessibilityEquivalentRequired:true,serverValidationRequired:true},
]

export const OPEN_WILD_RULES = [
  'wildlife_population_and_spawn_are_server_authoritative',
  'tracking_clues_have_visual_audio_caption_and_optional_haptic_equivalents',
  'fictional_hunt_mode_respects_age_and_content_settings',
  'no_real_world_wildlife_location_or_poaching_assistance',
  'world_pulse_changes_tracks_weather_behavior_and_visibility',
  'photography_and_conservation_are_equal_progression_paths',
  'panic_mode_and_safe_exit_remain_available',
  'paid_rewards_never_depend_on client_reported_wildlife_results',
] as const
