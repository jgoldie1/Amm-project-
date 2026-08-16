export type USRegionKind='state'|'federal-district'|'territory'
export type RegionalTravelMode='car'|'bus'|'subway'|'train'|'plane'|'boat'|'holo-portal'|'walk'|'bike'

export interface RegionalWorldHub {
  id:string
  name:string
  code:string
  kind:USRegionKind
  capitalOrHub:string
  languages:string[]
  travelModes:RegionalTravelMode[]
  portalSceneId:string
  worldSceneId:string
  teenTakeover:boolean
  sports:string[]
  creatorCulture:string[]
  environmentTags:string[]
  missionTags:string[]
}

export const hawaiiHub:RegionalWorldHub={
  id:'us-hi',
  name:'Hawaii',
  code:'HI',
  kind:'state',
  capitalOrHub:'Honolulu',
  languages:['en','haw'],
  travelModes:['plane','boat','holo-portal','car','bus','walk','bike'],
  portalSceneId:'portal-us-hi-honolulu',
  worldSceneId:'living-world-us-hi',
  teenTakeover:true,
  sports:['basketball','football','soccer','surfing','track-field','volleyball'],
  creatorCulture:['music','dance','film','food','fashion','island-arts'],
  environmentTags:['islands','beaches','mountains','volcanic','tropical','urban-honolulu'],
  missionTags:['island-travel','sports','creator','community','rescue','exploration','racing']
}

export const puertoRicoHub:RegionalWorldHub={
  id:'us-pr',
  name:'Puerto Rico',
  code:'PR',
  kind:'territory',
  capitalOrHub:'San Juan',
  languages:['es','en'],
  travelModes:['plane','boat','holo-portal','car','bus','walk','bike'],
  portalSceneId:'portal-us-pr-san-juan',
  worldSceneId:'living-world-us-pr',
  teenTakeover:true,
  sports:['basketball','baseball','boxing','volleyball','soccer','track-field'],
  creatorCulture:['music','dance','film','food','fashion','visual-arts'],
  environmentTags:['caribbean','coast','mountains','rainforest','historic-san-juan','urban'],
  missionTags:['island-travel','sports','music','creator','business','community','exploration','racing']
}

export const regionalWorldExtensions=[hawaiiHub,puertoRicoHub]

export function getRegionalWorld(code:string){
  return regionalWorldExtensions.find(r=>r.code.toLowerCase()===code.toLowerCase())
}

export function canUseRegionalMode(code:string,mode:RegionalTravelMode){
  const region=getRegionalWorld(code)
  return !!region?.travelModes.includes(mode)
}

export function regionalPortalDestination(code:string){
  const region=getRegionalWorld(code)
  if(!region) return null
  return {regionId:region.id,portalSceneId:region.portalSceneId,worldSceneId:region.worldSceneId,hub:region.capitalOrHub}
}
