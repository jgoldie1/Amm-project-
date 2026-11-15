export type RuntimeDomain = 'render'|'physics'|'network'|'ai'|'streaming'|'audio'|'xr'|'ui'|'commerce'|'live'
export type DeviceTier = 'mobile_lite'|'mobile_high'|'desktop'|'xr'|'holo'

export interface SpeedBudget {
  targetFps: number
  maxP95FrameMs: number
  maxInputLatencyMs: number
  maxNetworkRttMs: number
  maxJitterMs: number
  maxPacketLossPct: number
  maxAiMsPerFrame: number
  maxStreamingMsPerFrame: number
  maxAudioMsPerFrame: number
}

export interface RuntimeTelemetry {
  fps: number
  p95FrameMs: number
  inputLatencyMs: number
  networkRttMs: number
  jitterMs: number
  packetLossPct: number
  aiMsPerFrame: number
  streamingMsPerFrame: number
  audioMsPerFrame: number
  thermalPressure?: number
  gpuMemoryPressure?: number
}

export interface SpeedDecision {
  id: string
  domain: RuntimeDomain
  action: string
  reason: string
  reversible: boolean
  preservesAuthority: true
}

export const SPEED_BUDGETS: Record<DeviceTier, SpeedBudget> = {
  mobile_lite:{targetFps:30,maxP95FrameMs:33.4,maxInputLatencyMs:100,maxNetworkRttMs:180,maxJitterMs:40,maxPacketLossPct:3,maxAiMsPerFrame:3,maxStreamingMsPerFrame:5,maxAudioMsPerFrame:3},
  mobile_high:{targetFps:60,maxP95FrameMs:16.7,maxInputLatencyMs:75,maxNetworkRttMs:160,maxJitterMs:35,maxPacketLossPct:2.5,maxAiMsPerFrame:3,maxStreamingMsPerFrame:4,maxAudioMsPerFrame:2.5},
  desktop:{targetFps:60,maxP95FrameMs:16.7,maxInputLatencyMs:60,maxNetworkRttMs:140,maxJitterMs:30,maxPacketLossPct:2,maxAiMsPerFrame:4,maxStreamingMsPerFrame:4,maxAudioMsPerFrame:3},
  xr:{targetFps:72,maxP95FrameMs:13.9,maxInputLatencyMs:45,maxNetworkRttMs:120,maxJitterMs:25,maxPacketLossPct:1.5,maxAiMsPerFrame:2.5,maxStreamingMsPerFrame:3,maxAudioMsPerFrame:2},
  holo:{targetFps:90,maxP95FrameMs:11.2,maxInputLatencyMs:40,maxNetworkRttMs:110,maxJitterMs:20,maxPacketLossPct:1,maxAiMsPerFrame:2,maxStreamingMsPerFrame:2.5,maxAudioMsPerFrame:2},
}

export const QUANTUM_SPEED_PRIORITIES = [
  'player_input_and_camera',
  'server_authoritative_state',
  'panic_mode_and_safety',
  'voice_chat_and_accessibility',
  'nearby_multiplayer',
  'collision_and_physics',
  'mission_state',
  'nearby_characters',
  'world_streaming',
  'live_presence',
  'audio_propagation',
  'visual_quality',
  'distant_crowds_and_wildlife',
  'decorative_particles_and_post_fx',
] as const

export function evaluateQuantumSpeed(tier: DeviceTier, t: RuntimeTelemetry): SpeedDecision[] {
  const b=SPEED_BUDGETS[tier]
  const out: SpeedDecision[]=[]
  if(t.p95FrameMs>b.maxP95FrameMs || t.fps<b.targetFps){
    out.push({id:'render-pressure',domain:'render',action:'reduce_particles_reflections_shadows_then_lod',reason:`frame budget exceeded: ${t.p95FrameMs}ms p95 at ${t.fps}fps`,reversible:true,preservesAuthority:true})
  }
  if(t.aiMsPerFrame>b.maxAiMsPerFrame){
    out.push({id:'ai-pressure',domain:'ai',action:'reduce_background_mpc_update_frequency_keep_nearby_world_citizens',reason:'AI frame budget exceeded',reversible:true,preservesAuthority:true})
  }
  if(t.streamingMsPerFrame>b.maxStreamingMsPerFrame){
    out.push({id:'stream-pressure',domain:'streaming',action:'lower_distant_glb_lod_prefetch_travel_direction',reason:'streaming frame budget exceeded',reversible:true,preservesAuthority:true})
  }
  if(t.audioMsPerFrame>b.maxAudioMsPerFrame){
    out.push({id:'audio-pressure',domain:'audio',action:'reduce_distant_ambient_emitters_keep_voice_and_gameplay_cues',reason:'audio frame budget exceeded',reversible:true,preservesAuthority:true})
  }
  if(t.networkRttMs>b.maxNetworkRttMs || t.jitterMs>b.maxJitterMs || t.packetLossPct>b.maxPacketLossPct){
    out.push({id:'network-pressure',domain:'network',action:'prioritize_input_authority_voice_and_nearby_state_reduce_cosmetic_and_distant_updates',reason:'network quality below target',reversible:true,preservesAuthority:true})
  }
  if((t.thermalPressure??0)>.8 || (t.gpuMemoryPressure??0)>.85){
    out.push({id:'device-pressure',domain:'render',action:'step_down_quality_tier_without_disconnecting_session',reason:'thermal or GPU memory pressure',reversible:true,preservesAuthority:true})
  }
  return out
}

export const QUANTUM_SPEED_ENGINE_RULES = [
  'this_is_runtime_orchestration_not_quantum_computing_claim',
  'all_decisions_are_logged_with_observed_metrics_and_revision_id',
  'quality_may_degrade_but_money_security_age_gate_and_server_authority_never_do',
  'never_retry_non_idempotent_money_movements_because_of_lag',
  'panic_mode_and_accessibility_override_cosmetic_performance_goals',
  'fallback_is_deterministic_when_ai_or_provider_is_unavailable',
  'every_automatic_change_is_reversible_and_benchmarkable',
  'quantum_tester_must_verify_before_release_promotion',
] as const

export const QUANTUM_SPEED_GREEN_GATES = [
  'mobile_lite_30fps_p95_budget',
  'mobile_high_60fps_p95_budget',
  'desktop_60fps_p95_budget',
  'xr_72fps_latency_budget',
  'holo_target_budget_when_supported',
  'server_authority_survives_frame_pressure',
  'voice_and_accessibility_survive_network_pressure',
  'panic_mode_survives_cpu_gpu_network_pressure',
  'glb_prefetch_and_lod_reduce_pop_in_without_state_loss',
  'ai_throttling_does_not_break_character_fallback',
  'audio_throttling_preserves_important_cues',
  'save_rejoin_survives_forced_quality_changes',
  'commerce_and_live_boundaries_remain_authoritative',
] as const
