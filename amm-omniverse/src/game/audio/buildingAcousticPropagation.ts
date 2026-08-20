export type BarrierMaterial = 'single_glass'|'double_glass'|'brick'|'concrete'|'drywall'|'wood'|'metal'|'open_air'
export type OpeningState = 'closed'|'cracked'|'open'

export interface AcousticPortal {
  id: string
  kind: 'window'|'door'|'stairwell'|'elevator'|'hallway'|'vent'
  state: OpeningState
  material: BarrierMaterial
  transmission: number // 0..1
  position: [number, number, number]
}

export interface RoomAcousticZone {
  id: string
  floor: number
  reverb: number
  absorption: number
  portals: AcousticPortal[]
}

export interface PropagationContext {
  sourceGain: number
  distanceMeters: number
  sourceFloor: number
  listenerFloor: number
  portals: AcousticPortal[]
}

const stateFactor = (state: OpeningState) => state === 'open' ? 1 : state === 'cracked' ? .42 : .08
const materialFactor: Record<BarrierMaterial, number> = {
  single_glass:.38,double_glass:.22,brick:.08,concrete:.05,drywall:.14,wood:.18,metal:.1,open_air:1,
}

export function propagateThroughBuilding(ctx: PropagationContext) {
  const distanceFalloff = 1 / Math.max(1, 1 + ctx.distanceMeters * .08)
  const floorDelta = Math.abs(ctx.sourceFloor - ctx.listenerFloor)
  const floorLoss = Math.max(.12, 1 - floorDelta * .18)
  const portalGain = ctx.portals.length
    ? Math.max(...ctx.portals.map(p => Math.min(1, p.transmission * stateFactor(p.state) * materialFactor[p.material])))
    : .04
  return Math.min(1, Math.max(0, ctx.sourceGain * distanceFalloff * floorLoss * portalGain))
}

export const BUILDING_AUDIO_RULES = [
  'closed_windows_muffle_outside_sound_but_do_not_make_city_silent',
  'cracked_windows_increase_high_frequency_and_voice_music_bleed',
  'open_windows_create_strong_directional_outdoor_connection',
  'closed_doors_muffle_hallway_and_room_audio',
  'open_doors_create_smooth_room_to_room_transition',
  'stairwells_carry_sound_between_floors_with_reverb',
  'elevator_doors_change_lobby_cabin_audio_during_open_close',
  'glass_brick_concrete_drywall_and_wood_have_distinct_transmission',
  'rain_hits_windows_roofs_and_fire_escapes_contextually',
  'street_music_sirens_voices_trains_and_wildlife_can_be_heard_through_openings',
  'important_gameplay_cues_have_caption_visual_or_haptic_equivalents',
] as const

export const DISTRICT_01_ACOUSTIC_PROOF = [
  'apartment_closed_window_street_test',
  'apartment_open_window_street_test',
  'hallway_closed_door_test',
  'hallway_open_door_test',
  'stairwell_multi_floor_test',
  'elevator_open_close_test',
  'venue_music_bleed_test',
  'park_wildlife_through_window_test',
  'rain_on_window_and_roof_test',
  'mobile_and_xr_audio_budget_pass',
] as const
