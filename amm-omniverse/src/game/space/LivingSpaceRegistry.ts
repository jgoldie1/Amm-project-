export type SpaceRegion='earth-orbit'|'moon'|'mars'|'inner-solar'|'outer-solar'|'deep-space'
export type SpaceTravelMode='rocket'|'orbital-shuttle'|'lunar-lander'|'surface-rover'|'holo-portal-sim'|'observatory-link'
export type SpaceMissionKind='science'|'exploration'|'engineering'|'rescue'|'survey'|'astronomy'|'logistics'|'sports-zero-g'|'creator'|'education'|'secret'

export interface SpaceDestination {
  id:string
  name:string
  region:SpaceRegion
  kind:'orbit'|'moon'|'planet'|'dwarf-planet'|'station'|'observatory'|'asteroid-zone'
  parent?:string
  playable:boolean
  gravityG:number
  atmosphere:'none'|'thin'|'earthlike'|'dense'|'gas-giant'
  travel:SpaceTravelMode[]
  activities:string[]
  engineScenes:{unreal:string;unity:string;godot:string;webHolo:string}
}

export interface SpacePlayerState {
  playerId:string
  currentDestinationId:string
  suitLevel:number
  engineeringXP:number
  scienceXP:number
  flightXP:number
  discovered:string[]
  unlockedDestinations:string[]
  inventory:string[]
  earthProgressSnapshotId?:string
}

export const SPACE_DESTINATIONS:SpaceDestination[]=[
  {id:'earth-orbit',name:'Earth Orbit',region:'earth-orbit',kind:'orbit',parent:'earth',playable:true,gravityG:0,atmosphere:'none',travel:['rocket','orbital-shuttle','observatory-link'],activities:['orbital photography','satellite servicing simulation','zero-g training','Earth observation','broadcast studio'],engineScenes:{unreal:'Space/EarthOrbit',unity:'Space/EarthOrbit',godot:'space/earth_orbit',webHolo:'space-earth-orbit'}},
  {id:'gateway-station',name:'Living Worlds Orbital Gateway',region:'earth-orbit',kind:'station',parent:'earth',playable:true,gravityG:0,atmosphere:'earthlike',travel:['orbital-shuttle','holo-portal-sim'],activities:['multiplayer hub','mission control','creator studio','zero-g sports','training'],engineScenes:{unreal:'Space/Gateway',unity:'Space/Gateway',godot:'space/gateway',webHolo:'space-gateway'}},
  {id:'moon-nearside',name:'Moon — Near Side',region:'moon',kind:'moon',parent:'earth',playable:true,gravityG:0.165,atmosphere:'none',travel:['lunar-lander','surface-rover','holo-portal-sim'],activities:['rover exploration','crater survey','base building','astronomy','low-gravity sports'],engineScenes:{unreal:'Space/MoonNearSide',unity:'Space/MoonNearSide',godot:'space/moon_nearside',webHolo:'space-moon-nearside'}},
  {id:'moon-farside',name:'Moon — Far Side',region:'moon',kind:'moon',parent:'earth',playable:true,gravityG:0.165,atmosphere:'none',travel:['surface-rover','holo-portal-sim'],activities:['radio-quiet astronomy','secret exploration','relay missions'],engineScenes:{unreal:'Space/MoonFarSide',unity:'Space/MoonFarSide',godot:'space/moon_farside',webHolo:'space-moon-farside'}},
  {id:'mars',name:'Mars',region:'mars',kind:'planet',playable:true,gravityG:0.38,atmosphere:'thin',travel:['rocket','surface-rover','holo-portal-sim'],activities:['rover expeditions','habitat engineering','canyon exploration','science missions','racing'],engineScenes:{unreal:'Space/Mars',unity:'Space/Mars',godot:'space/mars',webHolo:'space-mars'}},
  {id:'mercury',name:'Mercury',region:'inner-solar',kind:'planet',playable:false,gravityG:0.38,atmosphere:'none',travel:['observatory-link','holo-portal-sim'],activities:['observation','education'],engineScenes:{unreal:'Space/Mercury',unity:'Space/Mercury',godot:'space/mercury',webHolo:'space-mercury'}},
  {id:'venus',name:'Venus',region:'inner-solar',kind:'planet',playable:false,gravityG:0.9,atmosphere:'dense',travel:['observatory-link','holo-portal-sim'],activities:['upper-atmosphere observation','education'],engineScenes:{unreal:'Space/Venus',unity:'Space/Venus',godot:'space/venus',webHolo:'space-venus'}},
  {id:'asteroid-belt',name:'Asteroid Belt',region:'inner-solar',kind:'asteroid-zone',playable:true,gravityG:0,atmosphere:'none',travel:['rocket','holo-portal-sim'],activities:['navigation','resource survey simulation','rescue','racing'],engineScenes:{unreal:'Space/AsteroidBelt',unity:'Space/AsteroidBelt',godot:'space/asteroid_belt',webHolo:'space-asteroid-belt'}},
  {id:'jupiter-system',name:'Jupiter System',region:'outer-solar',kind:'planet',playable:false,gravityG:2.53,atmosphere:'gas-giant',travel:['observatory-link','holo-portal-sim'],activities:['moon observation','storm science','education'],engineScenes:{unreal:'Space/Jupiter',unity:'Space/Jupiter',godot:'space/jupiter',webHolo:'space-jupiter'}},
  {id:'saturn-system',name:'Saturn System',region:'outer-solar',kind:'planet',playable:false,gravityG:1.07,atmosphere:'gas-giant',travel:['observatory-link','holo-portal-sim'],activities:['ring observation','moon missions','education'],engineScenes:{unreal:'Space/Saturn',unity:'Space/Saturn',godot:'space/saturn',webHolo:'space-saturn'}},
  {id:'uranus',name:'Uranus',region:'outer-solar',kind:'planet',playable:false,gravityG:0.89,atmosphere:'gas-giant',travel:['observatory-link','holo-portal-sim'],activities:['observation','education'],engineScenes:{unreal:'Space/Uranus',unity:'Space/Uranus',godot:'space/uranus',webHolo:'space-uranus'}},
  {id:'neptune',name:'Neptune',region:'outer-solar',kind:'planet',playable:false,gravityG:1.14,atmosphere:'gas-giant',travel:['observatory-link','holo-portal-sim'],activities:['observation','education'],engineScenes:{unreal:'Space/Neptune',unity:'Space/Neptune',godot:'space/neptune',webHolo:'space-neptune'}},
  {id:'pluto',name:'Pluto',region:'deep-space',kind:'dwarf-planet',playable:false,gravityG:0.063,atmosphere:'thin',travel:['observatory-link','holo-portal-sim'],activities:['observation','education','deep-space quest'],engineScenes:{unreal:'Space/Pluto',unity:'Space/Pluto',godot:'space/pluto',webHolo:'space-pluto'}}
]

export const SPACE_MISSIONS:{id:string;title:string;kind:SpaceMissionKind;destinationId:string;secret?:boolean;requires?:string[];rewards?:{scienceXP?:number;engineeringXP?:number;flightXP?:number}}[]=[
  {id:'orbit-first-light',title:'First Light',kind:'astronomy',destinationId:'earth-orbit',rewards:{scienceXP:150,flightXP:50}},
  {id:'gateway-zero-g',title:'Zero-G Showcase',kind:'sports-zero-g',destinationId:'gateway-station',rewards:{flightXP:120}},
  {id:'moon-relay',title:'Far Side Relay',kind:'engineering',destinationId:'moon-farside',secret:true,requires:['moon-nearside-complete'],rewards:{engineeringXP:300,scienceXP:200}},
  {id:'mars-canyon-run',title:'Canyon Run',kind:'exploration',destinationId:'mars',rewards:{flightXP:250,scienceXP:180}},
  {id:'asteroid-rescue',title:'Drift Rescue',kind:'rescue',destinationId:'asteroid-belt',rewards:{engineeringXP:350,flightXP:300}}
]

export function destinationById(id:string){return SPACE_DESTINATIONS.find(d=>d.id===id)??null}
export function canEnterDestination(player:SpacePlayerState,destinationId:string){
  const d=destinationById(destinationId)
  if(!d) return {ok:false,reason:'unknown-destination'}
  if(!d.playable&& !player.unlockedDestinations.includes(destinationId)) return {ok:false,reason:'observation-only'}
  if(destinationId==='moon-farside'&&!player.discovered.includes('moon-nearside-complete')) return {ok:false,reason:'complete-nearside-first'}
  return {ok:true,reason:'ok'}
}

export function unlockDestination(player:SpacePlayerState,destinationId:string):SpacePlayerState{
  if(player.unlockedDestinations.includes(destinationId)) return player
  return {...player,unlockedDestinations:[...player.unlockedDestinations,destinationId]}
}

export const LIVING_SPACE_RULES={
  physicalSpaceflightRequired:false,
  scientificPresentation:'education-and-simulation-first',
  preserveEarthProgress:true,
  sharedSystems:['hologpt','quantum-telescope','quantum-cone-lens','omniplayer','copy-smart-npc','dynamic-missions','accessibility','translation','multiplayer','cloud-saves'],
  engines:['unreal','unity','godot','web-holo'],
  safety:'Space destinations are simulated game/education environments; real spacecraft operations require separate certified systems.'
} as const
