export type VehicleAcousticType = 'ev'|'ice'|'hybrid'|'motorcycle'|'bus'|'truck'|'spaceship'
export type VehicleOpeningState = 'closed'|'cracked'|'open'

export interface VehicleAcousticProfile {
  id: string
  type: VehicleAcousticType
  cabinIsolation: number // 0..1
  glassTransmission: number // 0..1
  bodyTransmission: number // 0..1
  roadNoiseGain: number // 0..1
  propulsionGain: number // 0..1
  windNoiseGain: number // 0..1
  rainRoofGain: number // 0..1
  interiorReverb: number // 0..1
}

export interface VehicleOpeningStateMap {
  frontLeftWindow: VehicleOpeningState
  frontRightWindow: VehicleOpeningState
  rearLeftWindow: VehicleOpeningState
  rearRightWindow: VehicleOpeningState
  driverDoorOpen: boolean
  passengerDoorOpen: boolean
  rearDoorOpen: boolean
  sunroof: VehicleOpeningState
}

export interface VehicleAcousticContext {
  speedKph: number
  rainIntensity: number
  outsideWorldGain: number
  musicGain: number
  voiceChatGain: number
  openings: VehicleOpeningStateMap
}

const openingFactor = (state: VehicleOpeningState) => state === 'open' ? 1 : state === 'cracked' ? .45 : .08

export function calculateVehicleCabinMix(profile: VehicleAcousticProfile, ctx: VehicleAcousticContext) {
  const windowLeak = Math.max(
    openingFactor(ctx.openings.frontLeftWindow), openingFactor(ctx.openings.frontRightWindow),
    openingFactor(ctx.openings.rearLeftWindow), openingFactor(ctx.openings.rearRightWindow), openingFactor(ctx.openings.sunroof)
  )
  const doorLeak = ctx.openings.driverDoorOpen || ctx.openings.passengerDoorOpen || ctx.openings.rearDoorOpen ? 1 : 0
  const exteriorLeak = Math.min(1, Math.max(windowLeak, doorLeak) + (1 - profile.cabinIsolation) * .35)
  const speed = Math.min(1, Math.max(0, ctx.speedKph / 160))
  return {
    outsideWorldGain: Math.min(1, ctx.outsideWorldGain * (profile.glassTransmission + exteriorLeak)),
    roadNoiseGain: Math.min(1, profile.roadNoiseGain * speed),
    propulsionGain: Math.min(1, profile.propulsionGain * (.2 + speed * .8)),
    windNoiseGain: Math.min(1, profile.windNoiseGain * speed * Math.max(.15, exteriorLeak)),
    rainRoofGain: Math.min(1, profile.rainRoofGain * Math.max(0, ctx.rainIntensity)),
    musicGain: Math.min(1, ctx.musicGain),
    voiceChatGain: Math.min(1, Math.max(.55, ctx.voiceChatGain)),
    interiorReverb: profile.interiorReverb,
    exteriorLeak,
  }
}

export const VEHICLE_AUDIO_RULES = [
  'open_windows_increase_outside_sound_and_wind',
  'closed_windows_reduce_but_do_not_remove_sirens_horns_and_nearby_traffic',
  'open_doors_create_full_outside_audio_transition',
  'rain_changes_roof_glass_tire_and_road_sound',
  'speed_changes_wind_road_and_propulsion_mix',
  'ev_and_combustion_profiles_have_distinct_propulsion_signatures',
  'music_inside_vehicle_can_bleed_outside_when_openings_are_open',
  'outside_music_and_crowds_can_bleed_into_vehicle',
  'tunnels_bridges_parking_garages_and_city_canyons_change_reverb',
  'voice_chat_and_safety_cues_take_priority_over_ambient_mix',
  'important_vehicle_audio_cues_have_caption_visual_or_haptic_equivalents',
  'panic_mode_can mute_nonessential_vehicle_audio_automation_without_disabling_safety_cues',
] as const

export const VEHICLE_AUDIO_QUALITY_GATES = [
  'parked_closed_cabin_test',
  'parked_open_window_test',
  'door_open_transition_test',
  'city_drive_traffic_siren_test',
  'rain_drive_test',
  'tunnel_reverb_test',
  'music_bleed_inside_outside_test',
  'voice_chat_priority_test',
  'mobile_audio_cpu_budget_pass',
  'xr_spatial_audio_latency_pass',
] as const
