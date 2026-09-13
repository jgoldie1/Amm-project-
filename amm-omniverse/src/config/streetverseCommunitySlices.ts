export type StreetVerseMissionAnchor={id:string;label:string;x:number;y:number;kind:'transit'|'business-district'|'landmark'|'creator';reference:string}
export type StreetVerseCommunitySlice={communityAreaNumber:string;name:string;status:'BUILDING'|'CERTIFIED';missions:StreetVerseMissionAnchor[]}

export const CHICAGO_77_NAMES=[
 'Rogers Park','West Ridge','Uptown','Lincoln Square','North Center','Lake View','Lincoln Park','Near North Side','Edison Park','Norwood Park','Jefferson Park','Forest Glen','North Park','Albany Park','Portage Park','Irving Park','Dunning','Montclare','Belmont Cragin','Hermosa','Avondale','Logan Square','Humboldt Park','West Town','Austin','West Garfield Park','East Garfield Park','Near West Side','North Lawndale','South Lawndale','Lower West Side','The Loop','Near South Side','Armour Square','Douglas','Oakland','Fuller Park','Grand Boulevard','Kenwood','Washington Park','Hyde Park','Woodlawn','South Shore','Chatham','Avalon Park','South Chicago','Burnside','Calumet Heights','Roseland','Pullman','South Deering','East Side','West Pullman','Riverdale','Hegewisch','Garfield Ridge','Archer Heights','Brighton Park','McKinley Park','Bridgeport','New City','West Elsdon','Gage Park','Clearing','West Lawn','Chicago Lawn','West Englewood','Englewood','Greater Grand Crossing','Ashburn','Auburn Gresham','Beverly','Washington Heights','Mount Greenwood','Morgan Park',"O'Hare",'Edgewater',
] as const

function defaultMissions(areaNumber:string,name:string):StreetVerseMissionAnchor[]{
 return [
  {id:'business-scout',label:`${name} Business Scout`,x:28,y:36,kind:'business-district',reference:`Community Area ${areaNumber} • local business district`},
  {id:'transit',label:`${name} Mobility Hub`,x:70,y:38,kind:'transit',reference:`Community Area ${areaNumber} • transit / rideshare handoff`},
  {id:'creator',label:`${name} Creator Stage`,x:36,y:72,kind:'creator',reference:`Community Area ${areaNumber} • creator mission`},
  {id:'community',label:`${name} Community Mission`,x:72,y:70,kind:'landmark',reference:`Community Area ${areaNumber} • neighborhood checkpoint`},
 ]
}

export const HYDE_PARK_SLICE:StreetVerseCommunitySlice={
 communityAreaNumber:'41',
 name:'Hyde Park',
 status:'BUILDING',
 missions:[
  {id:'studio',label:'53rd Street Creator District',x:32,y:38,kind:'creator',reference:'E 53rd St • Hyde Park'},
  {id:'market',label:'53rd Street Business District',x:70,y:42,kind:'business-district',reference:'E 53rd St • Hyde Park'},
  {id:'river',label:'Lake Park & 53rd Transit Stop',x:52,y:22,kind:'transit',reference:'CTA corridor • Lake Park & 53rd'},
  {id:'stage',label:'Hyde Park Lakefront Creator Stage',x:68,y:72,kind:'landmark',reference:'Hyde Park lakefront'},
 ],
}

export const CHICAGO_77_SLICES:StreetVerseCommunitySlice[]=CHICAGO_77_NAMES.map((name,index)=>{
 const communityAreaNumber=String(index+1)
 if(communityAreaNumber==='41')return HYDE_PARK_SLICE
 return {communityAreaNumber,name,status:'BUILDING',missions:defaultMissions(communityAreaNumber,name)}
})

export const CHICAGO_77_BY_NUMBER:Record<string,StreetVerseCommunitySlice>=Object.fromEntries(CHICAGO_77_SLICES.map(slice=>[slice.communityAreaNumber,slice]))

export function readSelectedCommunityArea(){
 try{
  const destination=JSON.parse(localStorage.getItem('tryamm.streetverse.chicago-destination.v2')||'null')
  return String(destination?.communityAreaNumber??destination?.id?.replace(/^ca-/,'')??'')
 }catch{return''}
}

export function getStreetVerseMissionSlice(){return CHICAGO_77_BY_NUMBER[readSelectedCommunityArea()]}
export function getStreetVerseCommunitySlice(areaNumber:string|number){return CHICAGO_77_BY_NUMBER[String(areaNumber)]}
export const CHICAGO_77_TOTAL=CHICAGO_77_SLICES.length
