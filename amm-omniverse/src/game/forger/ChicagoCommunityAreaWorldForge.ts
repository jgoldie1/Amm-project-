export interface ChicagoCommunityAreaForgeEntry{
  number:number
  name:string
  forgePhase:'west-side-first-wave'|'citywide-expansion'
  status:'registered'|'planned'
  geometrySource:'official-open-boundary-pending-ingest'
  streetViewReferenceOnly:true
  interiors:'authorization-required'
}

const NAMES=[
  'Rogers Park','West Ridge','Uptown','Lincoln Square','North Center','Lake View','Lincoln Park','Near North Side',
  'Edison Park','Norwood Park','Jefferson Park','Forest Glen','North Park','Albany Park','Portage Park','Irving Park',
  'Dunning','Montclare','Belmont Cragin','Hermosa','Avondale','Logan Square','Humboldt Park','West Town',
  'Austin','West Garfield Park','East Garfield Park','Near West Side','North Lawndale','South Lawndale','Lower West Side',
  'Loop','Near South Side','Armour Square','Douglas','Oakland','Fuller Park','Grand Boulevard','Kenwood','Washington Park',
  'Hyde Park','Woodlawn','South Shore','Chatham','Avalon Park','South Chicago','Burnside','Calumet Heights','Roseland',
  'Pullman','South Deering','East Side','West Pullman','Riverdale','Hegewisch','Garfield Ridge','Archer Heights',
  'Brighton Park','McKinley Park','Bridgeport','New City','West Elsdon','Gage Park','Clearing','West Lawn','Chicago Lawn',
  'West Englewood','Englewood','Greater Grand Crossing','Ashburn','Auburn Gresham','Beverly','Washington Heights',
  'Mount Greenwood','Morgan Park','O’Hare','Edgewater',
] as const

const WEST_SIDE_FIRST_WAVE=new Set([
  'Humboldt Park','Austin','West Garfield Park','East Garfield Park','Near West Side','North Lawndale','South Lawndale','Lower West Side',
])

export const CHICAGO_COMMUNITY_AREA_WORLD_FORGE:ChicagoCommunityAreaForgeEntry[]=NAMES.map((name,index)=>({
  number:index+1,
  name,
  forgePhase:WEST_SIDE_FIRST_WAVE.has(name)?'west-side-first-wave':'citywide-expansion',
  status:WEST_SIDE_FIRST_WAVE.has(name)?'registered':'planned',
  geometrySource:'official-open-boundary-pending-ingest',
  streetViewReferenceOnly:true,
  interiors:'authorization-required',
}))

export const CHICAGO_WORLD_FORGE_CITYWIDE_POLICY={
  communityAreaCount:77,
  sourcePlan:'Use an official/open Chicago community-area boundary dataset for persistent geography after license/provenance review.',
  streetView:'Reference/navigation only; never scrape imagery into TRYAMM-owned textures or geometry.',
  buildingDetail:'Authorized/open footprint and exterior sources first. Private or sensitive interiors require permission.',
  mobileStrategy:'Compile each community area into streaming cells, mobile LODs and bounded population/traffic/mission budgets.',
  rollout:'West Side first wave → adjoining cells → citywide expansion → Global cities reuse the same compiler.',
} as const

export function getChicagoCommunityAreaForge(numberOrName:number|string){
  if(typeof numberOrName==='number')return CHICAGO_COMMUNITY_AREA_WORLD_FORGE.find(area=>area.number===numberOrName)
  const key=String(numberOrName).toLowerCase().replace(/['’]/g,"'")
  return CHICAGO_COMMUNITY_AREA_WORLD_FORGE.find(area=>area.name.toLowerCase().replace(/['’]/g,"'")===key)
}
