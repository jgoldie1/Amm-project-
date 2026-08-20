export type PinballMode = 'story'|'arcade'|'creator_event'|'secret_mission'|'adult_after_dark'
export type CreatorRightsState = 'original'|'licensed'|'creator_approved'|'blocked'

export interface StreamerCharacter {
  id: string
  displayName: string
  rights: CreatorRightsState
  likenessConsentId?: string
  voiceConsentId?: string
  storyRole: 'hero'|'rival'|'host'|'mentor'|'guest'|'boss'
  signatureMove: string
  worldLinks: string[]
}

export interface PinballChapter {
  id: string
  title: string
  objective: string
  tableState: string
  bossOrEvent?: string
  unlocks: string[]
  secretMissionIds: string[]
}

export interface SecretMission {
  id: string
  hint: string
  revealRule: string
  objective: string
  rewardType: 'xp'|'cosmetic'|'story'|'table_modifier'|'creator_collectible'
  adultOnly?: boolean
}

export interface HoloPinballTable {
  id: string
  title: string
  visualLanguage: 'original_anime_inspired'|'comic'|'cinematic'|'street'|'cosmic'|'holographic'
  chapters: PinballChapter[]
  creatorCharacters: StreamerCharacter[]
  secretMissions: SecretMission[]
  xr: {
    ar: boolean
    vr: boolean
    mr: boolean
    roomScale: boolean
    handTracking: boolean
    controller: boolean
    accessibilityFallback: boolean
  }
}

export const STREAMER_HOLO_PINBALL: HoloPinballTable = {
  id: 'streamer-holo-pinball',
  title: 'TRYAMM Holo Streamer Pinball',
  visualLanguage: 'original_anime_inspired',
  creatorCharacters: [], // Real streamers require explicit likeness/name/voice/content authorization before publication.
  chapters: [
    { id:'ch1', title:'First LIVE', objective:'Build the audience meter and light the LIVE lanes.', tableState:'neon studio', unlocks:['creator_lane'], secretMissionIds:['secret-backstage'] },
    { id:'ch2', title:'Rise of the Creator', objective:'Complete combo routes, collaborations and fan challenges.', tableState:'city rooftop', unlocks:['rival_mode','city_table'], secretMissionIds:['secret-collab'] },
    { id:'ch3', title:'World Tour', objective:'Travel through regional tables and complete global creator events.', tableState:'world portal network', unlocks:['world_tour'], secretMissionIds:['secret-portal'] },
    { id:'ch4', title:'Holo Championship', objective:'Survive multiball phases and defeat the championship table event.', tableState:'holographic arena', bossOrEvent:'Holo Championship', unlocks:['legend_table'], secretMissionIds:['secret-legend'] },
  ],
  secretMissions: [
    { id:'secret-backstage', hint:'The studio has another door.', revealRule:'Complete three clean skill shots without draining.', objective:'Find the backstage creator room.', rewardType:'story' },
    { id:'secret-collab', hint:'Two voices unlock one path.', revealRule:'Complete a co-op creator combo.', objective:'Unlock the hidden collaboration sequence.', rewardType:'creator_collectible' },
    { id:'secret-portal', hint:'Not every portal appears on the map.', revealRule:'Hit the world targets in the hidden sequence.', objective:'Enter the secret world table.', rewardType:'table_modifier' },
    { id:'secret-legend', hint:'Legends leave echoes.', revealRule:'Complete all chapter mastery objectives.', objective:'Reveal the final Echo story.', rewardType:'cosmetic' },
  ],
  xr: { ar:true, vr:true, mr:true, roomScale:true, handTracking:true, controller:true, accessibilityFallback:true },
}

export interface AdultXRSessionPolicy {
  ageVerified18Plus: boolean
  adultProfileEnabled: boolean
  privateSpaceAcknowledged: boolean
  recordingIndicatorRequired: boolean
  explicitDeviceConsent: boolean
  emergencyStopAvailable: boolean
  panicModeAvailable: boolean
  deviceControlServerAuthorized: boolean
}

export interface HapticCommand {
  deviceId: string
  patternId: string
  intensity: number
  durationMs: number
  source: 'pinball'|'music'|'world_event'|'adult_after_dark'
}

export function authorizeAdultXR(policy: AdultXRSessionPolicy) {
  return policy.ageVerified18Plus && policy.adultProfileEnabled && policy.privateSpaceAcknowledged && policy.recordingIndicatorRequired && policy.explicitDeviceConsent && policy.emergencyStopAvailable && policy.panicModeAvailable && policy.deviceControlServerAuthorized
}

export function validateHapticCommand(command: HapticCommand) {
  return command.deviceId.length > 0 && command.patternId.length > 0 && command.intensity >= 0 && command.intensity <= 1 && command.durationMs > 0 && command.durationMs <= 30_000
}

export const HAPTIC_SAFETY_PIPELINE = [
  'adult_or_general_mode_policy_check',
  'explicit_device_pairing_and_consent',
  'server_authorized_command',
  'rate_and_intensity_limit',
  'local_emergency_stop',
  'panic_mode_remote_stop',
  'disconnect_timeout_to_zero',
  'immutable_security_event',
] as const

export const PINBALL_QUALITY_GATES = [
  'sub_100ms_input_response_target',
  'stable_physics_timestep',
  'ball_collision_regression_suite',
  'multiball_performance_budget',
  'readable_table_without_color_only_cues',
  'spatial_audio_equivalent_captions',
  'xr_comfort_and_recenter',
  'creator_likeness_rights_verified',
  'secret_missions_have_non_scent_equivalents',
  'adult_mode_isolated_from_minor_profiles',
] as const
