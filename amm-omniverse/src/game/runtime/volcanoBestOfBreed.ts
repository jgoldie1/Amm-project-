export type VolcanoCompetitiveCapability=
 |'device-handoff'|'cloud-streaming'|'local-rendering'|'spatial-computing'
 |'room-mesh'|'depth-occlusion'|'head-hand-tracking'|'adaptive-controller'
 |'controller-remapping'|'multi-display'|'spectator-view'|'spatial-audio'
 |'dynamic-quality'|'session-reconnect'|'accessibility-profile'|'desktop-workspace'

export type VolcanoCapabilityPolicy={
 capability:VolcanoCompetitiveCapability
 enabled:boolean
 implementation:'open-standard'|'tryamm-original'|'provider-adapter'
 notes:string
}

export const VOLCANO_BEST_OF_BREED_CAPABILITIES:VolcanoCapabilityPolicy[]=[
 {capability:'device-handoff',enabled:true,implementation:'tryamm-original',notes:'move an authorized session between compatible screens without copying proprietary implementations'},
 {capability:'cloud-streaming',enabled:true,implementation:'provider-adapter',notes:'optional remote-render path alongside local execution'},
 {capability:'local-rendering',enabled:true,implementation:'tryamm-original',notes:'prefer capable local hardware when appropriate'},
 {capability:'spatial-computing',enabled:true,implementation:'open-standard',notes:'XR capability abstraction rather than vendor lock-in'},
 {capability:'room-mesh',enabled:true,implementation:'provider-adapter',notes:'consume supported room geometry APIs with explicit permission'},
 {capability:'depth-occlusion',enabled:true,implementation:'provider-adapter',notes:'use supported depth APIs for correct spatial layering'},
 {capability:'head-hand-tracking',enabled:true,implementation:'provider-adapter',notes:'capability-gated tracked input'},
 {capability:'adaptive-controller',enabled:true,implementation:'open-standard',notes:'support accessible and split-control profiles'},
 {capability:'controller-remapping',enabled:true,implementation:'tryamm-original',notes:'portable Volcano Controller Passport mappings'},
 {capability:'multi-display',enabled:true,implementation:'tryamm-original',notes:'TV tablet laptop XR and Holo Lab companion roles'},
 {capability:'spectator-view',enabled:true,implementation:'tryamm-original',notes:'independent spectator endpoint in the same session'},
 {capability:'spatial-audio',enabled:true,implementation:'provider-adapter',notes:'fallback cleanly when spatial audio is unavailable'},
 {capability:'dynamic-quality',enabled:true,implementation:'tryamm-original',notes:'Quantum Speed and Lag Buster control quality and background load'},
 {capability:'session-reconnect',enabled:true,implementation:'tryamm-original',notes:'design for safe resume after transient disconnects'},
 {capability:'accessibility-profile',enabled:true,implementation:'tryamm-original',notes:'portable one-hand sensitivity deadzone and assist settings'},
 {capability:'desktop-workspace',enabled:true,implementation:'tryamm-original',notes:'HoloOS keeps work creator media and gaming workloads in one workstation'},
]

export function enabledVolcanoCapabilities(){
 return VOLCANO_BEST_OF_BREED_CAPABILITIES.filter(x=>x.enabled)
}
