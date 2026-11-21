export type NetworkMode = 'normal'|'congested'|'degraded'|'critical'

export interface NetworkSample {
  rttMs: number
  jitterMs: number
  packetLossPct: number
  downlinkMbps?: number
  uplinkMbps?: number
  timestamp: number
}

export interface NetworkDecision {
  mode: NetworkMode
  preserve: string[]
  degrade: string[]
  reasonCodes: string[]
  revision: string
}

export const QUANTUM_WIFI_PRIORITY = [
  'player_input',
  'server_authoritative_state',
  'voice_chat',
  'panic_mode',
  'safety_and_accessibility_events',
  'live_presence',
  'mission_state',
  'nearby_character_state',
  'nearby_world_streaming',
  'ambient_audio',
  'distant_world_updates',
  'cosmetic_effects',
] as const

export function classifyNetwork(sample: NetworkSample): NetworkMode {
  if (sample.packetLossPct >= 10 || sample.rttMs >= 350 || sample.jitterMs >= 120) return 'critical'
  if (sample.packetLossPct >= 5 || sample.rttMs >= 220 || sample.jitterMs >= 80) return 'degraded'
  if (sample.packetLossPct >= 2 || sample.rttMs >= 140 || sample.jitterMs >= 45) return 'congested'
  return 'normal'
}

export function buildNetworkDecision(sample: NetworkSample): NetworkDecision {
  const mode = classifyNetwork(sample)
  const preserve = ['player_input','server_authoritative_state','voice_chat','panic_mode','safety_and_accessibility_events']
  const degrade: string[] = []
  const reasonCodes: string[] = []

  if (mode === 'congested') {
    degrade.push('distant_world_updates','high_density_particles','far_lod_updates')
    reasonCodes.push('NETWORK_CONGESTION')
  }
  if (mode === 'degraded') {
    degrade.push('distant_world_updates','high_density_particles','far_lod_updates','nonessential_ambient_audio','background_mpc_frequency')
    reasonCodes.push('NETWORK_DEGRADED')
  }
  if (mode === 'critical') {
    degrade.push('distant_world_updates','high_density_particles','far_lod_updates','nonessential_ambient_audio','background_mpc_frequency','noncritical_live_video_quality','decorative_streaming')
    reasonCodes.push('NETWORK_CRITICAL')
  }

  return { mode, preserve, degrade, reasonCodes, revision: 'quantum-network-v1' }
}

export const QUANTUM_LAG_BUSTER_RULES = [
  'never_claim_to_increase_physical_wifi_speed_without_measured_evidence',
  'optimize_application_traffic_not_isp_or_router_firmware_by_default',
  'prioritize_controls_authoritative_state_voice_safety_and_accessibility',
  'prefetch_nearby_glbs_and_world_state_based_on_player_heading_and_velocity',
  'coalesce_noncritical_state_updates_under_congestion',
  'use_interpolation_and_server_reconciliation_for_remote_entities',
  'lower_visual_and_ambient_bandwidth_before_gameplay_or_voice',
  'preserve_money_security_and_age_gate_authority',
  'log_every_network_mode_change_and_quality_degradation',
  'restore_quality_gradually_after_connection_recovers',
] as const

export const QUANTUM_WIFI_PROOF_GATES = [
  'latency_jitter_packet_loss_probe_runs',
  'authoritative_state_survives_degraded_network',
  'voice_chat_preserved_under_congestion',
  'panic_mode_delivered_under_critical_network',
  'save_rejoin_recovers_after_disconnect',
  'glb_prefetch_reduces_visible_pop_in_without_memory_regression',
  'quality_downgrade_is_logged_and_reversible',
  'mobile_network_test_passes_wifi_and_cellular_profiles',
  'xr_network_test_passes_without_motion_state_desync',
] as const
