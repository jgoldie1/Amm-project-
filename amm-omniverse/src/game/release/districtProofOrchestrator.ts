export type GateStatus = 'YELLOW'|'RED'|'GREEN'
export type ProofResult = 'PASS'|'FAIL'|'UNPROVEN'

export interface EvidenceRecord {
  gateId: string
  result: ProofResult
  evidenceUri?: string
  measuredAt?: string
  notes?: string[]
}

export interface DistrictProofGate {
  id: string
  label: string
  required: boolean
}

export const DISTRICT_01_GATES: DistrictProofGate[] = [
  {id:'glb_load',label:'GLBs load and LOD correctly',required:true},
  {id:'district_render',label:'District renders without critical errors',required:true},
  {id:'player_spawn',label:'Player spawns at valid checkpoint',required:true},
  {id:'authoritative_movement',label:'Server-authoritative movement passes',required:true},
  {id:'spaceos_buildings',label:'SpaceOS buildings/interiors/stairs/elevators pass',required:true},
  {id:'building_acoustics',label:'Doors/windows/floors acoustic propagation passes',required:true},
  {id:'vehicle_acoustics',label:'Vehicle cabin/window acoustic propagation passes',required:true},
  {id:'parks_wildlife',label:'Parks/woods/wildlife systems pass',required:true},
  {id:'character_intelligence',label:'NPC/MPC/World Citizen explainable behavior passes',required:true},
  {id:'race',label:'Street race loop passes',required:true},
  {id:'arcade_pinball',label:'Arcade/Holo Pinball loop passes',required:true},
  {id:'escape_room',label:'Escape Room loop passes',required:true},
  {id:'starverse_stage',label:'StarVerse stage loop passes',required:true},
  {id:'world_pulse',label:'World Pulse changes district behavior',required:true},
  {id:'two_device_live',label:'Two-device LIVE audio/video/chat passes',required:true},
  {id:'save_rejoin',label:'Save/rejoin restores canonical state',required:true},
  {id:'mask_purchase',label:'$10 mask sandbox purchase and entitlement passes',required:true},
  {id:'panic_mode',label:'Panic Mode halts unsafe/nonessential systems',required:true},
  {id:'mobile_perf',label:'Mobile performance budget passes',required:true},
  {id:'xr_perf',label:'XR performance and latency budget passes',required:true},
  {id:'black_poc_render',label:'Black/POC skin/hair/eyes/teeth lighting QA passes',required:true},
  {id:'quantum_cone_lens',label:'Quantum Cone Lens quality/performance passes',required:true},
  {id:'open_wild',label:'Open Wild exploration/tracking/conservation loop passes',required:true},
  {id:'security_money',label:'Money/security boundaries remain intact',required:true},
]

export interface DistrictProofReport {
  districtId: string
  status: GateStatus
  passed: number
  failed: number
  unproven: number
  promotionAllowed: boolean
  blockingGateIds: string[]
  evidence: EvidenceRecord[]
}

export function evaluateDistrictProof(
  districtId: string,
  evidence: EvidenceRecord[],
  gates: DistrictProofGate[] = DISTRICT_01_GATES,
): DistrictProofReport {
  const byGate = new Map(evidence.map(item => [item.gateId, item]))
  let passed = 0
  let failed = 0
  let unproven = 0
  const blockingGateIds: string[] = []

  for (const gate of gates) {
    if (!gate.required) continue
    const record = byGate.get(gate.id)
    if (!record || record.result === 'UNPROVEN') {
      unproven += 1
      blockingGateIds.push(gate.id)
      continue
    }
    if (record.result === 'FAIL') {
      failed += 1
      blockingGateIds.push(gate.id)
      continue
    }
    passed += 1
  }

  const status: GateStatus = failed > 0 ? 'RED' : unproven > 0 ? 'YELLOW' : 'GREEN'
  return {
    districtId,
    status,
    passed,
    failed,
    unproven,
    promotionAllowed: status === 'GREEN',
    blockingGateIds,
    evidence,
  }
}

export function assertPromotionAllowed(report: DistrictProofReport): void {
  if (!report.promotionAllowed) {
    throw new Error(`District ${report.districtId} cannot promote: ${report.status}; blockers=${report.blockingGateIds.join(',')}`)
  }
}

export const LOCKED_RELEASE_SEQUENCE = [
  'RECOVER','ADAPT','WIRE','MIGRATE','TEST','REPAIR','BENCHMARK','DEPLOY',
] as const
