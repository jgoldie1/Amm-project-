export type StreetVerseChicagoPremiumSystem = {
  id: string
  label: string
  phase: 0|1|2|3|4|5|6
  status: 'planned'|'building'|'ready'
  releaseDependency: boolean
  dependsOn: string[]
  qualityGate: string
}

export const STREETVERSE_CHICAGO_PREMIUM_SYSTEMS: StreetVerseChicagoPremiumSystem[] = [
  {id:'world-director',label:'Chicago World Director',phase:1,status:'planned',releaseDependency:false,dependsOn:['living-world','ambient-life'],qualityGate:'One shared bounded world-state snapshot drives time, weather, density, audio and event state.'},
  {id:'role-states',label:'Resident / Creator / Driver / Business / Investigator / Responder / Athlete / Performer / After Dark',phase:1,status:'planned',releaseDependency:false,dependsOn:['world-director'],qualityGate:'Role changes behavior and opportunities without requiring a separate Chicago load.'},
  {id:'premium-light-audio',label:'Premium Lighting + Spatial City Audio',phase:1,status:'planned',releaseDependency:false,dependsOn:['world-director','ambient-life'],qualityGate:'Lighting/audio respond to time, weather, traffic and events with mobile fallbacks.'},
  {id:'resident-simulation',label:'Resident Schedules, Memory and Reactions',phase:2,status:'planned',releaseDependency:false,dependsOn:['role-states'],qualityGate:'Residents have bounded schedules, reaction state and privacy-safe summarized memory.'},
  {id:'interaction-polish',label:'Animation + Interaction Polish',phase:2,status:'planned',releaseDependency:false,dependsOn:['resident-simulation'],qualityGate:'Walk/talk/enter/exit/object interactions are responsive and accessible.'},
  {id:'camera-profiles',label:'First / Third / Vehicle / Accessibility Camera Profiles',phase:3,status:'planned',releaseDependency:false,dependsOn:['interaction-polish'],qualityGate:'Camera changes preserve controls, audio perspective, UI and mission state.'},
  {id:'mission-director',label:'Mission Tension / Release Director',phase:3,status:'planned',releaseDependency:false,dependsOn:['role-states','resident-simulation'],qualityGate:'Missions use deliberate pacing and avoid repetitive filler loops.'},
  {id:'city-event-fabric',label:'Reactive Chicago Activity Fabric',phase:4,status:'planned',releaseDependency:false,dependsOn:['world-director','resident-simulation'],qualityGate:'One bounded event can safely affect traffic, crowds, venues, audio, missions and creator opportunities.'},
  {id:'creator-cinematic',label:'Creator Replay / Highlights / Product Placement',phase:4,status:'planned',releaseDependency:false,dependsOn:['mission-director'],qualityGate:'Creator moments use rights-aware placement and preserve physical-device save proof requirements.'},
  {id:'business-simulation',label:'Venue + Business Simulation',phase:5,status:'planned',releaseDependency:false,dependsOn:['city-event-fabric'],qualityGate:'Business actions are persistent and economy mutations remain server-authoritative.'},
  {id:'district-replication',label:'Repeatable Premium District Pipeline',phase:6,status:'planned',releaseDependency:false,dependsOn:['world-director','resident-simulation','mission-director','city-event-fabric'],qualityGate:'A second district can meet the same performance, accessibility, gameplay and certification gates without bespoke rewrites.'},
]

export const STREETVERSE_CHICAGO_PREMIUM_RULES = {
  pilotDistrict: 'Hyde Park',
  strategy: 'density-before-map-size',
  mobileSafeWorldIsFirstClass: true,
  economyMustBeServerAuthoritative: true,
  unnecessaryIdentifiableActivityRetention: false,
  auraAi: {
    mode: 'prototype-only',
    autoMerge: false,
    requiredReviews: ['code-quality','asset-rights','security','accessibility','performance','architecture-compatibility'],
  },
} as const
