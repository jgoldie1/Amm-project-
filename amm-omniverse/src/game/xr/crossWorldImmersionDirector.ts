export type ExperienceMode = 'screen'|'ar'|'vr'|'mr'|'holo5dx'
export type WorldId = 'streetverse'|'my_world'|'we_are_the_world'|'kingdom'|'starverse'|'holoverse'|'mars'
export type ChallengePortal = 'escape_room'|'pressure_gauntlet'|'holo_pinball'|'race'|'creator_story'|'mystery'|'living_history'|'quantum_jump'

export interface CrossWorldJourney {
  originWorld: WorldId
  trigger: string
  portals: ChallengePortal[]
  destinationWorld: WorldId
  checkpointRequired: boolean
  preserveCrew: boolean
  preservePassport: boolean
  preserveInventory: boolean
  preserveAccessibility: boolean
  recordable: boolean
  reelEligible: boolean
}

export const STREETVERSE_HIDDEN_JOURNEY: CrossWorldJourney = {
  originWorld: 'streetverse',
  trigger: 'race_crash_hidden_mission',
  portals: ['escape_room','pressure_gauntlet','quantum_jump','holo_pinball','creator_story'],
  destinationWorld: 'starverse',
  checkpointRequired: true,
  preserveCrew: true,
  preservePassport: true,
  preserveInventory: true,
  preserveAccessibility: true,
  recordable: true,
  reelEligible: true,
}

export interface ImmersionProfile {
  mode: ExperienceMode
  spatialAudio: boolean
  handTracking: boolean
  roomScale: boolean
  passthrough: boolean
  captions: boolean
  haptics: boolean
  scentEnhancement: boolean
  comfortMode: boolean
}

export function resolveImmersionProfile(mode: ExperienceMode, supported: Partial<ImmersionProfile>): ImmersionProfile {
  return {
    mode,
    spatialAudio: supported.spatialAudio ?? true,
    handTracking: mode !== 'screen' && (supported.handTracking ?? false),
    roomScale: (mode === 'vr' || mode === 'mr' || mode === 'holo5dx') && (supported.roomScale ?? false),
    passthrough: (mode === 'ar' || mode === 'mr') && (supported.passthrough ?? false),
    captions: supported.captions ?? true,
    haptics: supported.haptics ?? false,
    scentEnhancement: supported.scentEnhancement ?? false,
    comfortMode: supported.comfortMode ?? true,
  }
}

export interface AdultAfterDarkGate {
  ageVerified18Plus: boolean
  adultProfileEnabled: boolean
  explicitSessionConsent: boolean
  privateSpaceAcknowledged: boolean
  devicePairingAuthorized: boolean
  recordingStateVisible: boolean
  emergencyStopAvailable: boolean
  panicModeAvailable: boolean
  minorAccountPresent: boolean
}

export function canEnterAdultAfterDark(gate: AdultAfterDarkGate) {
  const blockers: string[] = []
  if (!gate.ageVerified18Plus) blockers.push('18+ verification required.')
  if (!gate.adultProfileEnabled) blockers.push('Adult profile must be enabled.')
  if (!gate.explicitSessionConsent) blockers.push('Explicit session consent required.')
  if (!gate.privateSpaceAcknowledged) blockers.push('Private-space acknowledgement required for immersive adult mode.')
  if (!gate.devicePairingAuthorized) blockers.push('External device pairing must be explicitly authorized.')
  if (!gate.recordingStateVisible) blockers.push('Recording state must remain visible.')
  if (!gate.emergencyStopAvailable || !gate.panicModeAvailable) blockers.push('Emergency stop and Panic Mode must be available.')
  if (gate.minorAccountPresent) blockers.push('Adult After Dark cannot run with a minor account/session present.')
  return { allowed: blockers.length === 0, blockers }
}

export interface HapticEvent {
  eventId: string
  source: 'pinball'|'race'|'music'|'world'|'adult_after_dark'
  intensity: number
  durationMs: number
  consentToken: string
}

export function validateHapticEvent(event: HapticEvent) {
  return event.eventId.length > 0 && event.consentToken.length > 0 && event.intensity >= 0 && event.intensity <= 1 && event.durationMs > 0 && event.durationMs <= 30_000
}

export const EXTERNAL_HAPTIC_ADAPTER_RULES = [
  'explicit_pairing_and_consent',
  'server_authorized_event_only',
  'age_gate_for_adult_after_dark',
  'rate_intensity_duration_limits',
  'local_stop_always_available',
  'panic_mode_stops_all_device_commands',
  'disconnect_timeout_returns_output_to_zero',
  'no_background_device_control_after_session_end',
  'immutable_security_audit_event',
] as const

export const CROSS_WORLD_PIPELINE = [
  'checkpoint',
  'trigger_hidden_mission',
  'enter_escape_room',
  'solve_puzzles',
  'pressure_gauntlet',
  'optional_quantum_jump',
  'secret_holo_pinball_or_creator_branch',
  'unlock_starverse_or_other_world_portal',
  'restore_canonical_identity_passport_inventory_crew',
  'record_reel_if_authorized',
  'save_world_consequence',
] as const

export const IMMERSION_QUALITY_GATES = [
  'screen_ar_vr_mr_equivalent_objective',
  'no_scent_required_for_progress',
  'caption_and_visual_equivalent_for_audio_clues',
  'comfort_turning_and_recenter',
  'seated_and_one_hand_control_path',
  'stable_xr_frame_budget',
  'passthrough_boundary_warning',
  'haptic_disconnect_fails_safe',
  'adult_mode_isolated_from_minor_profiles',
  'panic_mode_restores_known_good_checkpoint',
] as const
