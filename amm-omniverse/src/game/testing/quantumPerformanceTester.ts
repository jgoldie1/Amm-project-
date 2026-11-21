export type ProofStatus = 'GREEN'|'YELLOW'|'RED'
export type DeviceTier = 'mobile_lite'|'mobile_high'|'desktop'|'xr'|'holo5dx'

export interface PerformanceSample {
  ts: number
  deviceTier: DeviceTier
  fps: number
  frameTimeMs: number
  gpuMemoryMb?: number
  drawCalls?: number
  particles?: number
  shaderCompileMs?: number
  droppedFrames?: number
  inputLatencyMs?: number
  xrFrameRate?: number
  xrLatencyMs?: number
  networkRttMs?: number
  aiUpdateMs?: number
  audioPropagationMs?: number
  glbStreamingMs?: number
  thermalState?: 'nominal'|'fair'|'serious'|'critical'
}

export interface PerformanceBudget {
  deviceTier: DeviceTier
  minFps: number
  maxFrameTimeMs: number
  maxInputLatencyMs: number
  maxNetworkRttMs: number
  maxAiUpdateMs: number
  maxAudioPropagationMs: number
  maxGlbStreamingMs: number
  maxDroppedFramesPerMinute: number
  maxGpuMemoryMb?: number
  maxDrawCalls?: number
  minXrFrameRate?: number
  maxXrLatencyMs?: number
}

export const DEFAULT_BUDGETS: Record<DeviceTier, PerformanceBudget> = {
  mobile_lite:{deviceTier:'mobile_lite',minFps:30,maxFrameTimeMs:33.4,maxInputLatencyMs:120,maxNetworkRttMs:220,maxAiUpdateMs:8,maxAudioPropagationMs:5,maxGlbStreamingMs:2500,maxDroppedFramesPerMinute:120,maxGpuMemoryMb:900,maxDrawCalls:1200},
  mobile_high:{deviceTier:'mobile_high',minFps:45,maxFrameTimeMs:22.3,maxInputLatencyMs:90,maxNetworkRttMs:180,maxAiUpdateMs:8,maxAudioPropagationMs:5,maxGlbStreamingMs:1800,maxDroppedFramesPerMinute:90,maxGpuMemoryMb:1600,maxDrawCalls:1800},
  desktop:{deviceTier:'desktop',minFps:60,maxFrameTimeMs:16.7,maxInputLatencyMs:60,maxNetworkRttMs:150,maxAiUpdateMs:6,maxAudioPropagationMs:4,maxGlbStreamingMs:1200,maxDroppedFramesPerMinute:60,maxGpuMemoryMb:5000,maxDrawCalls:3000},
  xr:{deviceTier:'xr',minFps:72,maxFrameTimeMs:13.9,maxInputLatencyMs:50,maxNetworkRttMs:120,maxAiUpdateMs:5,maxAudioPropagationMs:4,maxGlbStreamingMs:1200,maxDroppedFramesPerMinute:30,maxGpuMemoryMb:3500,maxDrawCalls:2200,minXrFrameRate:72,maxXrLatencyMs:30},
  holo5dx:{deviceTier:'holo5dx',minFps:90,maxFrameTimeMs:11.2,maxInputLatencyMs:40,maxNetworkRttMs:100,maxAiUpdateMs:4,maxAudioPropagationMs:3,maxGlbStreamingMs:900,maxDroppedFramesPerMinute:20,maxGpuMemoryMb:7000,maxDrawCalls:3500,minXrFrameRate:90,maxXrLatencyMs:24},
}

export interface ProofGateResult {
  gate: string
  status: 'PASS'|'FAIL'|'UNPROVEN'
  evidence?: string
  detail?: string
}

export interface QuantumTestReport {
  status: ProofStatus
  performanceStatus: ProofStatus
  requiredGateStatus: ProofStatus
  reasons: string[]
  downgradeRecommended: boolean
  nextQualityTier?: 'ultra'|'high'|'standard'|'lite'
}

export function evaluatePerformance(sample: PerformanceSample, budget = DEFAULT_BUDGETS[sample.deviceTier]): QuantumTestReport {
  const reasons: string[] = []
  const failures = [
    sample.fps < budget.minFps && `fps ${sample.fps} < ${budget.minFps}`,
    sample.frameTimeMs > budget.maxFrameTimeMs && `frame time ${sample.frameTimeMs}ms > ${budget.maxFrameTimeMs}ms`,
    sample.inputLatencyMs != null && sample.inputLatencyMs > budget.maxInputLatencyMs && 'input latency over budget',
    sample.networkRttMs != null && sample.networkRttMs > budget.maxNetworkRttMs && 'network RTT over budget',
    sample.aiUpdateMs != null && sample.aiUpdateMs > budget.maxAiUpdateMs && 'character intelligence update cost over budget',
    sample.audioPropagationMs != null && sample.audioPropagationMs > budget.maxAudioPropagationMs && 'spatial audio propagation cost over budget',
    sample.glbStreamingMs != null && sample.glbStreamingMs > budget.maxGlbStreamingMs && 'GLB streaming over budget',
    sample.gpuMemoryMb != null && budget.maxGpuMemoryMb != null && sample.gpuMemoryMb > budget.maxGpuMemoryMb && 'GPU memory over budget',
    sample.drawCalls != null && budget.maxDrawCalls != null && sample.drawCalls > budget.maxDrawCalls && 'draw calls over budget',
    sample.xrFrameRate != null && budget.minXrFrameRate != null && sample.xrFrameRate < budget.minXrFrameRate && 'XR frame rate under budget',
    sample.xrLatencyMs != null && budget.maxXrLatencyMs != null && sample.xrLatencyMs > budget.maxXrLatencyMs && 'XR latency over budget',
    (sample.thermalState === 'serious' || sample.thermalState === 'critical') && `thermal state ${sample.thermalState}`,
  ].filter(Boolean) as string[]
  reasons.push(...failures)
  const failed = failures.length > 0
  return {
    status: failed ? 'RED' : 'GREEN',
    performanceStatus: failed ? 'RED' : 'GREEN',
    requiredGateStatus: 'YELLOW',
    reasons,
    downgradeRecommended: failed,
    nextQualityTier: failed ? (sample.deviceTier === 'mobile_lite' ? 'lite' : 'standard') : undefined,
  }
}

export function evaluateDistrictProof(gates: ProofGateResult[], perf: QuantumTestReport): QuantumTestReport {
  const failedGate = gates.some(g=>g.status==='FAIL')
  const unproven = gates.some(g=>g.status==='UNPROVEN' || !g.evidence)
  const requiredGateStatus: ProofStatus = failedGate ? 'RED' : unproven ? 'YELLOW' : 'GREEN'
  const status: ProofStatus = perf.performanceStatus==='RED' || requiredGateStatus==='RED' ? 'RED' : perf.performanceStatus==='GREEN' && requiredGateStatus==='GREEN' ? 'GREEN' : 'YELLOW'
  return {...perf,status,requiredGateStatus,reasons:[...perf.reasons,...gates.filter(g=>g.status!=='PASS'||!g.evidence).map(g=>`${g.gate}: ${g.status}`)]}
}

export const DISTRICT_01_REQUIRED_GATES = [
  'glb_load','district_render','player_spawn','authoritative_movement','spaceos_buildings','window_door_acoustics','vehicle_acoustics','parks_woods_wildlife','npc_mpc_world_citizen','race','arcade_pinball','escape_room','starverse_stage','world_pulse','two_device_live','save_rejoin','mask_cosmetic_sandbox_purchase','panic_mode','mobile_performance','xr_performance','black_poc_render_qa','quantum_cone_lens_qa','open_wild_activity',
] as const

export const ADAPTIVE_DEGRADATION_ORDER = [
  'reduce_particles',
  'reduce_crowd_density',
  'reduce_wildlife_density',
  'switch_lower_glb_lod',
  'reduce_shadow_quality',
  'reduce_reflections',
  'reduce_volumetrics',
  'reduce_far_ambient_audio_emitters',
  'reduce_nonessential_mpc_update_frequency',
  'disable_nonessential_post_processing',
  'preserve_player_input_voice_chat_safety_panic_mode',
] as const

export const QUANTUM_TESTER_RULES = [
  'never_claim_green_without_evidence',
  'never_improve_frame_rate_by_disabling_security_or_panic_mode',
  'never_disable_accessibility_equivalents_to_save_performance',
  'degrade_visual_density_before_core_gameplay',
  'degrade_ai_frequency_before_authoritative_rules',
  'degrade_ambient_audio_before_voice_chat_or_critical_audio',
  'store_reproducible_failure_trace',
  'retest_after_every_repair',
  'promotion_requires_green_performance_and_green_required_gates',
] as const
