export type HostPlatform = 'windows'|'macos'|'linux'|'chromebook'|'android'|'ios'|'web'
export type ControllerFamily = 'xbox'|'playstation'|'switch'|'generic_xinput'|'generic_hid'|'adaptive'|'wheel'|'arcade_stick'|'touch'
export type ConnectionType = 'bluetooth'|'usb'|'wireless_dongle'|'built_in'|'virtual'

export interface GamingHost {
  id: string
  platform: HostPlatform
  bluetoothAvailable: boolean
  usbAvailable: boolean
  browserGamepadApiAvailable: boolean
  lowLatencyModeSupported: boolean
}

export interface PhysicalController {
  id: string
  family: ControllerFamily
  connection: ConnectionType
  vendorId?: string
  productId?: string
  batteryPercent?: number
  rumbleSupported: boolean
  gyroSupported: boolean
  connected: boolean
}

export interface NormalizedControllerState {
  sequence: number
  timestampMs: number
  leftX: number
  leftY: number
  rightX: number
  rightY: number
  leftTrigger: number
  rightTrigger: number
  buttons: Record<string, boolean>
}

export const STANDARD_CONTROLLER_PROFILES: Record<ControllerFamily, string[]> = {
  xbox: ['a','b','x','y','lb','rb','lt','rt','view','menu','ls','rs','dpad_up','dpad_down','dpad_left','dpad_right'],
  playstation: ['cross','circle','square','triangle','l1','r1','l2','r2','create','options','l3','r3','dpad_up','dpad_down','dpad_left','dpad_right'],
  switch: ['a','b','x','y','l','r','zl','zr','minus','plus','ls','rs','dpad_up','dpad_down','dpad_left','dpad_right'],
  generic_xinput: ['a','b','x','y','lb','rb','lt','rt','back','start','ls','rs','dpad_up','dpad_down','dpad_left','dpad_right'],
  generic_hid: ['button_0','button_1','button_2','button_3','shoulder_left','shoulder_right','trigger_left','trigger_right','select','start','stick_left','stick_right'],
  adaptive: ['action_1','action_2','menu','pause','assist_1','assist_2'],
  wheel: ['accelerate','brake','clutch','shift_up','shift_down','handbrake','menu'],
  arcade_stick: ['punch_1','punch_2','punch_3','kick_1','kick_2','kick_3','start','select'],
  touch: ['virtual_stick_left','virtual_stick_right','action_1','action_2','menu'],
}

export const VOLCANO_2_BRIDGE_RULES = [
  'pairing_occurs_through_host_os_or_supported_browser_capability',
  'standard_controllers_are_normalized_before_gameplay_mapping',
  'bluetooth_usb_and_dongle_paths_share_one_normalized_input_contract',
  'disconnect_neutralizes_controls_and_stops_haptics',
  'stale_or_replayed_sequences_are_rejected',
  'controller_input_never_overrides_server_authority',
  'money_inventory_paid_rewards_and_age_gates_are_not_controller_authority',
  'one_hand_and_adaptive_profiles_remain_first_class',
] as const

export const VOLCANO_2_GAMING_COMPUTER_FLOW = [
  'detect_host_capabilities',
  'discover_or_accept_connected_controller',
  'identify_controller_family',
  'load_standard_profile',
  'calibrate_dead_zones_and_sensitivity',
  'normalize_input_state',
  'send_sequenced_actions_to_game_client',
  'server_validates_authoritative_actions',
  'quantum_speed_and_lag_layers_monitor_latency',
  'quantum_tester_records_evidence',
] as const
