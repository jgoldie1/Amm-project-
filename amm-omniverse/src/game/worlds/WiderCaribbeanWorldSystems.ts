export type CaribbeanActivity='island-hop'|'sailing'|'ferry'|'flight'|'road-trip'|'sports'|'creator'|'music'|'festival'|'food'|'history'|'nature'|'marine'|'business'|'community'|'rescue'|'racing'|'holo'
export type CaribbeanTransport='walk'|'bike'|'car'|'bus'|'rail'|'ferry'|'boat'|'plane'|'holo-portal'

export interface RegionalPlayerState {
  playerId:string
  worldId:string
  language:string
  accessibilityProfileId?:string
  teenSafetyProfileId?:string
  xp:number
  inventoryIds:string[]
  entitlementIds:string[]
  missionIds:string[]
  relationshipIds:string[]
}

export interface IslandRoute {
  id:string
  from:string
  to:string
  modes:CaribbeanTransport[]
  passportOrTravelRules:'world-rule-data'
  preservesPlayerState:true
  supportsPartyTravel:true
}

export interface CaribbeanWorldFeature {
  id:string
  title:string
  activities:CaribbeanActivity[]
  dynamicWeather:boolean
  dayNight:boolean
  copySmartNpc:boolean
  secretMissions:boolean
  teenTakeover:boolean
  sportsUniverse:boolean
  creatorEconomy:boolean
  localBusinessSimulation:boolean
  holoPortal:boolean
}

export const widerCaribbeanFeatures:CaribbeanWorldFeature[]=[
  {id:'caribbean-island-hop',title:'Caribbean Island-Hop Adventure',activities:['island-hop','sailing','ferry','flight','nature','marine','history','food'],dynamicWeather:true,dayNight:true,copySmartNpc:true,secretMissions:true,teenTakeover:true,sportsUniverse:true,creatorEconomy:true,localBusinessSimulation:true,holoPortal:true},
  {id:'caribbean-champions',title:'Caribbean Champions Circuit',activities:['sports','racing','community'],dynamicWeather:true,dayNight:true,copySmartNpc:true,secretMissions:true,teenTakeover:true,sportsUniverse:true,creatorEconomy:true,localBusinessSimulation:true,holoPortal:true},
  {id:'caribbean-sound-clash',title:'Caribbean Sound & Creator Circuit',activities:['creator','music','festival','food','community'],dynamicWeather:true,dayNight:true,copySmartNpc:true,secretMissions:true,teenTakeover:true,sportsUniverse:true,creatorEconomy:true,localBusinessSimulation:true,holoPortal:true},
  {id:'caribbean-blue-world',title:'Blue World Marine Adventure',activities:['marine','nature','rescue','sailing','holo'],dynamicWeather:true,dayNight:true,copySmartNpc:true,secretMissions:true,teenTakeover:true,sportsUniverse:false,creatorEconomy:true,localBusinessSimulation:true,holoPortal:true}
]

export const regionalSystems={
  engines:['unreal','unity','godot','web-holo'] as const,
  ai:['Stubbs AI','HoloGPT','Copy Smart NPC'] as const,
  shared:['identity','avatar','cloud-save','party','matchmaking','missions','relationships','inventory','entitlements','accessibility','localization','moderation','teen-safety','replays'] as const,
  worldSimulation:['weather','day-night','traffic','pedestrians','marine-traffic','air-traffic','events','festivals','sports-calendar','business-hours'] as const,
  presentation:['holographic-overlay','spatial-audio','Quantum Beat','Lottie 2.0','broadcast-camera','photo-mode','replay'] as const
}

export function transferRegionalState(state:RegionalPlayerState,destinationWorldId:string):RegionalPlayerState{
  return {...state,worldId:destinationWorldId}
}

export function canTeenEnterWorld(feature:CaribbeanWorldFeature){
  return feature.teenTakeover
}

export function buildRegionalMissionTags(worldId:string,activity:CaribbeanActivity){
  return ['caribbean',worldId,activity,'dynamic-world','copy-smart-npc']
}
