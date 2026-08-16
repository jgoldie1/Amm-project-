export type ScaleRealm='micro'|'earth'|'space'
export type ScaleTransition='microscope-zoom'|'earth-globe'|'telescope-zoom'|'holo-portal'

export interface ScalePlayerState {
  playerId:string
  xp:number
  discoveries:string[]
  inventory:string[]
  missions:string[]
  accessibility:Record<string,boolean|string|number>
  language:string
  teenSafe:boolean
}

export interface ScaleDestination {
  id:string
  realm:ScaleRealm
  title:string
  transition:ScaleTransition
  unlockXp:number
  requiredDiscoveries?:string[]
  teenSafe:boolean
}

export const SCALE_DESTINATIONS:ScaleDestination[]=[
  {id:'cell-city',realm:'micro',title:'Cell City',transition:'microscope-zoom',unlockXp:0,teenSafe:true},
  {id:'material-lab',realm:'micro',title:'Material Lab',transition:'microscope-zoom',unlockXp:0,teenSafe:true},
  {id:'living-earth',realm:'earth',title:'Living Earth',transition:'earth-globe',unlockXp:0,teenSafe:true},
  {id:'earth-orbit',realm:'space',title:'Earth Orbit',transition:'telescope-zoom',unlockXp:500,requiredDiscoveries:['first-light'],teenSafe:true},
  {id:'moon-nearside',realm:'space',title:'Moon Near Side',transition:'holo-portal',unlockXp:1000,requiredDiscoveries:['orbital-gateway'],teenSafe:true},
  {id:'mars',realm:'space',title:'Mars',transition:'holo-portal',unlockXp:2500,requiredDiscoveries:['lunar-route'],teenSafe:true}
]

export function canEnterScaleDestination(player:ScalePlayerState,destination:ScaleDestination){
  if(player.xp<destination.unlockXp) return false
  if(player.teenSafe&&!destination.teenSafe) return false
  return (destination.requiredDiscoveries??[]).every(d=>player.discoveries.includes(d))
}

export interface CrossScaleMission {
  id:string
  title:string
  realms:ScaleRealm[]
  steps:{realm:ScaleRealm;text:string;discovery?:string;xp:number}[]
}

export const CROSS_SCALE_MISSIONS:CrossScaleMission[]=[
  {
    id:'dust-to-stars',
    title:'Dust to Stars',
    realms:['micro','earth','space'],
    steps:[
      {realm:'micro',text:'Inspect a simulated mineral sample in Material Lab.',discovery:'mineral-signature',xp:120},
      {realm:'earth',text:'Travel to a geology research hub and compare the sample with terrestrial references.',discovery:'earth-comparison',xp:180},
      {realm:'space',text:'Use HoloScope data to compare the mineral signature with a lunar or asteroid dataset.',discovery:'space-match',xp:300}
    ]
  },
  {
    id:'signal-across-scale',
    title:'Signal Across Scale',
    realms:['micro','earth','space'],
    steps:[
      {realm:'micro',text:'Trace a fictional signal through Chip World.',discovery:'micro-signal',xp:150},
      {realm:'earth',text:'Restore the matching relay in a Living Earth city mission.',discovery:'earth-relay',xp:220},
      {realm:'space',text:'Locate the orbital counterpart using the Quantum Telescope.',discovery:'orbital-relay',xp:350}
    ]
  }
]

export interface ScaleTransitionPlan {
  from:ScaleRealm
  to:ScaleRealm
  transition:ScaleTransition
  preserve:['xp','discoveries','inventory','missions','accessibility','language','teenSafe']
  lensMode:'portal'|'cinematic'|'ar-depth'
}

export function buildScaleTransition(from:ScaleRealm,to:ScaleRealm):ScaleTransitionPlan{
  let transition:ScaleTransition='holo-portal'
  if(to==='micro') transition='microscope-zoom'
  else if(from==='micro'&&to==='earth') transition='earth-globe'
  else if(to==='space') transition='telescope-zoom'
  return {from,to,transition,preserve:['xp','discoveries','inventory','missions','accessibility','language','teenSafe'],lensMode:transition==='holo-portal'?'portal':'cinematic'}
}

export const SCALE_NEXUS_RUNTIME={
  engines:['unreal','unity','godot','webxr'],
  systems:['quantum-microscope','living-earth','quantum-telescope','living-space','quantum-cone-lens','hologpt'],
  principle:'One player identity and progression across microscopic, planetary, and space scales.',
  medicalBoundary:'Microscope gameplay and AI annotations are educational/simulated and not medical diagnosis.',
  physicalHardwareRequired:false
} as const
