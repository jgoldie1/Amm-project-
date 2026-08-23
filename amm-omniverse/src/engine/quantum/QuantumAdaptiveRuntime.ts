export type QuantumTierId =
  | 'T0_IMMEDIATE'
  | 'T1_NEAR'
  | 'T2_DISTRICT'
  | 'T3_CITY'
  | 'T4_REGION'
  | 'T5_CONTINENT'
  | 'T6_PLANET'
  | 'T7_SYSTEM'
  | 'T8_OMNIVERSE'
  | 'T9_ARCHIVE'

export interface QuantumTier {
  id: QuantumTierId
  label: string
  targetHz: number
  radiusMeters: number | null
  simulation: string[]
}

export const QUANTUM_TIERS: QuantumTier[] = [
  { id:'T0_IMMEDIATE', label:'Immediate / Reflex', targetHz:120, radiusMeters:25, simulation:['input','camera','combat','sports','vehicle-control','haptics','near-physics'] },
  { id:'T1_NEAR', label:'Near / Interactive', targetHz:60, radiusMeters:150, simulation:['npc-ai','animation','audio','traffic','interiors','wildlife-individuals','holo-ui'] },
  { id:'T2_DISTRICT', label:'District', targetHz:15, radiusMeters:1500, simulation:['traffic-groups','pedestrians','businesses','deliveries','police-fire-ems','weather-local'] },
  { id:'T3_CITY', label:'City', targetHz:2, radiusMeters:25000, simulation:['economy','transit','warehouses','events','construction','schools','jobs'] },
  { id:'T4_REGION', label:'Regional', targetHz:0.2, radiusMeters:250000, simulation:['logistics','ecology-populations','power-water','regional-weather','migration'] },
  { id:'T5_CONTINENT', label:'Continental', targetHz:0.033, radiusMeters:5000000, simulation:['trade','macro-economy','population','supply-chain','environment'] },
  { id:'T6_PLANET', label:'Planetary', targetHz:0.0083, radiusMeters:50000000, simulation:['climate','global-economy','civilization','biosphere','transport-network'] },
  { id:'T7_SYSTEM', label:'Solar / Space System', targetHz:0.001, radiusMeters:null, simulation:['orbital-logistics','colonies','missions','resource-networks','celestial-events'] },
  { id:'T8_OMNIVERSE', label:'Omniverse / Timeline', targetHz:0.00028, radiusMeters:null, simulation:['world-history','generations','creator-worlds','timeline-state','legacy'] },
  { id:'T9_ARCHIVE', label:'Cold Archive', targetHz:0, radiusMeters:null, simulation:['snapshot-only','event-replay','restore-on-demand'] },
]

export interface QuantumEntity {
  id: string
  kind: string
  position?: { x:number; y:number; z:number }
  importance?: number
  currentTier: QuantumTierId
  lastActiveAt: number
  metadata?: Record<string, unknown>
}

export interface PlayerSignal {
  position: { x:number; y:number; z:number }
  velocity?: { x:number; y:number; z:number }
  destination?: { x:number; y:number; z:number }
  activeWorld?: string
  activeMission?: string
  portalTarget?: string
  uiIntent?: string
}

export interface Prediction {
  key: string
  confidence: number
  reason: string
  preload: string[]
  promoteEntities?: string[]
  expiresAt: number
}

const distance = (a:{x:number;y:number;z:number}, b:{x:number;y:number;z:number}) =>
  Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z)

export class QuantumPredictiveScheduler {
  predict(signal: PlayerSignal): Prediction[] {
    const predictions: Prediction[] = []
    const now = Date.now()
    if (signal.destination) predictions.push({ key:'destination', confidence:.9, reason:'explicit destination', preload:['terrain','roads','traffic','interiors-near-destination','audio-zone'], expiresAt:now+60_000 })
    if (signal.portalTarget) predictions.push({ key:`portal:${signal.portalTarget}`, confidence:.98, reason:'portal selected', preload:['world-manifest','spawn-zone','critical-shaders','mission-state','holo-context'], expiresAt:now+120_000 })
    if (signal.activeMission) predictions.push({ key:`mission:${signal.activeMission}`, confidence:.85, reason:'active mission', preload:['mission-npcs','mission-vehicles','mission-interiors','voice-lines','effects'], expiresAt:now+120_000 })
    if (signal.uiIntent) predictions.push({ key:`intent:${signal.uiIntent}`, confidence:.7, reason:'recent UI intent', preload:['relevant-ui','related-service-data'], expiresAt:now+30_000 })
    return predictions.sort((a,b)=>b.confidence-a.confidence)
  }
}

export class QuantumTierManager {
  chooseTier(entity: QuantumEntity, player: PlayerSignal): QuantumTierId {
    if (!entity.position) return entity.importance && entity.importance > .9 ? 'T3_CITY' : 'T8_OMNIVERSE'
    const d = distance(entity.position, player.position)
    if (d <= 25) return 'T0_IMMEDIATE'
    if (d <= 150) return 'T1_NEAR'
    if (d <= 1500) return 'T2_DISTRICT'
    if (d <= 25000) return 'T3_CITY'
    if (d <= 250000) return 'T4_REGION'
    if (d <= 5000000) return 'T5_CONTINENT'
    return 'T6_PLANET'
  }

  rebalance(entities: QuantumEntity[], player: PlayerSignal): QuantumEntity[] {
    return entities.map(e => ({ ...e, currentTier:this.chooseTier(e,player) }))
  }
}

export interface TransferRequest {
  entityId?: string
  fromTier?: QuantumTierId
  toTier?: QuantumTierId
  fromWorld?: string
  toWorld?: string
  state: Record<string, unknown>
}

export interface TransferResult {
  transferId: string
  state: Record<string, unknown>
  phases: ('snapshot'|'preload'|'handoff'|'activate'|'cleanup')[]
  seamless: boolean
}

export class QuantumSeamlessTransfer {
  async transfer(req: TransferRequest): Promise<TransferResult> {
    // Adapter runtimes replace these logical phases with engine-specific streaming/fade/network handoff.
    return {
      transferId: crypto.randomUUID(),
      state: structuredClone(req.state),
      phases:['snapshot','preload','handoff','activate','cleanup'],
      seamless:true,
    }
  }
}

export type EngineTarget = 'unreal'|'unity'|'godot'|'webgpu-three'|'native-mobile'|'server-sim'

export interface EngineAdapter {
  target: EngineTarget
  loadWorld(manifest: Record<string,unknown>): Promise<void>
  promoteEntity(entity: QuantumEntity, tier: QuantumTierId): Promise<void>
  demoteEntity(entity: QuantumEntity, tier: QuantumTierId): Promise<void>
  preload(keys:string[]): Promise<void>
  snapshot(): Promise<Record<string,unknown>>
}

export interface QuantumRuntimeTelemetry {
  frameMs:number
  cpuBudget:number
  gpuBudget:number
  networkBudget:number
  memoryBudget:number
  activeCounts:Partial<Record<QuantumTierId,number>>
}

export class QuantumAdaptiveRuntime {
  readonly predictor = new QuantumPredictiveScheduler()
  readonly tiers = new QuantumTierManager()
  readonly transfer = new QuantumSeamlessTransfer()
  private adapters = new Map<EngineTarget,EngineAdapter>()

  registerAdapter(adapter:EngineAdapter) { this.adapters.set(adapter.target,adapter) }

  async tick(signal:PlayerSignal, entities:QuantumEntity[]) {
    const predictions = this.predictor.predict(signal)
    const rebalanced = this.tiers.rebalance(entities,signal)
    const preload = [...new Set(predictions.flatMap(p=>p.preload))]
    await Promise.all([...this.adapters.values()].map(a=>a.preload(preload).catch(()=>undefined)))
    return { predictions, entities:rebalanced }
  }
}
