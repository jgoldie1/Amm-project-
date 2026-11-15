export type RequiredEvidence = 'ci'|'runtime'|'device'|'provider'|'reviewed-visual'

export interface DistrictGateManifestEntry {
  gateId: string
  label: string
  required: RequiredEvidence[]
  external: boolean
  blocksGreen: true
}

export const DISTRICT_01_RELEASE_MANIFEST: DistrictGateManifestEntry[] = [
  {gateId:'glb_load',label:'GLBs load and validate',required:['ci','runtime'],external:false,blocksGreen:true},
  {gateId:'district_render',label:'District renders',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'player_spawn',label:'Player spawns',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'authoritative_movement',label:'Server-authoritative movement',required:['ci','runtime'],external:false,blocksGreen:true},
  {gateId:'spaceos_buildings',label:'SpaceOS interiors/stairs/elevators',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'building_acoustics',label:'Window/door/floor/building acoustics',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'vehicle_acoustics',label:'Vehicle cabin/window acoustic transitions',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'parks_woods_wildlife',label:'Parks, woods and wildlife systems',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'character_intelligence',label:'NPC/MPC/World Citizen behavior and trace',required:['ci','runtime'],external:false,blocksGreen:true},
  {gateId:'race',label:'Race gameplay loop',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'arcade_pinball',label:'Arcade and Holo Pinball gameplay',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'escape_room',label:'Escape Room gameplay',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'starverse_stage',label:'StarVerse stage interaction',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'world_pulse',label:'World Pulse changes district state',required:['ci','runtime'],external:false,blocksGreen:true},
  {gateId:'two_device_live',label:'Two-device authenticated LIVE',required:['device'],external:true,blocksGreen:true},
  {gateId:'save_rejoin',label:'Save/rejoin persistence',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'commerce_sandbox_10usd',label:'$10 cosmetic sandbox purchase and entitlement',required:['provider'],external:true,blocksGreen:true},
  {gateId:'panic_mode',label:'Panic Mode safe-state transition',required:['ci','runtime'],external:false,blocksGreen:true},
  {gateId:'mobile_performance',label:'Mobile FPS/latency/thermal budget',required:['device'],external:true,blocksGreen:true},
  {gateId:'xr_performance',label:'XR FPS/latency budget',required:['device'],external:true,blocksGreen:true},
  {gateId:'black_poc_render_qa',label:'Black/POC skin, hair, eyes, lips and teeth QA',required:['runtime','reviewed-visual'],external:false,blocksGreen:true},
  {gateId:'quantum_cone_lens',label:'Quantum Cone Lens rendering QA',required:['runtime','reviewed-visual'],external:false,blocksGreen:true},
  {gateId:'open_wild',label:'Open Wild exploration/tracking gameplay',required:['runtime'],external:false,blocksGreen:true},
  {gateId:'money_security_boundaries',label:'Money/security authority boundaries',required:['ci','provider'],external:true,blocksGreen:true},
]

export const DISTRICT_01_EXTERNAL_GATES = DISTRICT_01_RELEASE_MANIFEST.filter(g => g.external).map(g => g.gateId)
export const DISTRICT_01_INTERNAL_GATES = DISTRICT_01_RELEASE_MANIFEST.filter(g => !g.external).map(g => g.gateId)

export const RELEASE_LAW = 'RECOVER → ADAPT → WIRE → MIGRATE → TEST → REPAIR → BENCHMARK → DEPLOY' as const
