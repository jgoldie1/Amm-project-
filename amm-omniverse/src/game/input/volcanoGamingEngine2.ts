export type InputDevice = 'bluetooth_gamepad'|'usb_gamepad'|'keyboard_mouse'|'touch'|'one_hand_touch'|'xr_controller'|'hand_tracking'|'wheel'|'adaptive_controller'
export type InputAction = 'move'|'look'|'jump'|'interact'|'accelerate'|'brake'|'steer'|'menu'|'push_to_talk'|'panic'|'accessibility_shortcut'|'custom'

export interface DeviceProfile {
  id: string
  deviceType: InputDevice
  displayName: string
  connected: boolean
  batteryPercent?: number
  latencyMs?: number
  supportsHaptics: boolean
  supportsMotion: boolean
  deadZone: number
  sensitivity: number
  oneHandMode: boolean
}

export interface InputBinding {
  action: InputAction
  physicalControl: string
  scale: number
  invert?: boolean
  holdMs?: number
  doubleTapWindowMs?: number
}

export interface InputFrame {
  deviceId: string
  sequence: number
  clientTimeMs: number
  actions: Record<string, number | boolean>
  checksum: string
}

export interface HapticCommand {
  deviceId: string
  intensity: number
  durationMs: number
  channel: 'gameplay'|'accessibility'|'vehicle'|'music'|'xr'
}

export interface VolcanoInputState {
  activeDeviceId?: string
  connectedDevices: DeviceProfile[]
  lastAcceptedSequence: number
  reconnecting: boolean
  inputLatencyMs: number
  droppedInputFrames: number
  activeLayout: 'standard'|'southpaw'|'one_hand_left'|'one_hand_right'|'custom'
}

export const VOLCANO_2_RULES = [
  'input_is_normalized_before_gameplay_systems_receive_it',
  'server_authority_validates_multiplayer_actions_and_state_changes',
  'never_trust_client_input_for_money_inventory_paid_rewards_or_security_privileges',
  'panic_action_has_priority_over_nonessential_input',
  'controller_disconnect_neutralizes_movement_and_haptics_before_reconnect',
  'bluetooth_reconnect_must_not_repeat_stale_buttons_or_axes',
  'input_sequence_numbers_prevent_replay_and_out_of_order_actions',
  'haptics_are_rate_limited_intensity_limited_duration_limited_and_disconnect_to_zero',
  'one_hand_and_remappable_layouts_are_first_class_not_fallbacks',
  'important_audio_only_actions_have_visual_or_haptic_equivalents',
  'no_llm_or_remaster_agent_is_authoritative_for_raw_player_input',
] as const

export const VOLCANO_2_FEATURES = [
  'bluetooth_gamepad_auto_detect',
  'usb_gamepad_support',
  'touch_and_one_hand_touch',
  'keyboard_mouse',
  'xr_controller_and_hand_tracking',
  'adaptive_controller_profiles',
  'driving_wheel_profiles',
  'per_game_and_per_world_remapping',
  'dead_zone_calibration',
  'sensitivity_curves',
  'gyro_motion_optional',
  'haptic_feedback',
  'low_latency_polling',
  'input_prediction_for_local_feel_only',
  'server_reconciliation_for_multiplayer',
  'hot_swap_between_devices',
  'safe_reconnect',
  'controller_battery_warning',
] as const

export const VOLCANO_2_PERFORMANCE_GATES = [
  'median_input_latency_under_target_for_device_class',
  'p95_input_latency_recorded',
  'no_stuck_input_after_disconnect',
  'no_stale_input_replay_after_reconnect',
  'server_reconciliation_visible_under_packet_loss',
  'panic_action_works_during_network_degradation',
  'one_hand_profile_completes_core_movement_and_interaction_path',
  'haptic_disconnect_returns_output_to_zero',
  'hot_swap_preserves_session_without_duplicate_actions',
  'bluetooth_mobile_and_desktop_device_matrix_tested',
] as const

export const VOLCANO_2_INTEGRATION_STACK = [
  'volcano_input_normalizer',
  'quantum_speed_engine',
  'quantum_lag_buster',
  'quantum_wifi_optimizer',
  'server_authoritative_movement',
  'quantum_tester',
  'evidence_collector',
  'district_proof_orchestrator',
] as const
