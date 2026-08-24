export type Continent='Africa'|'Asia'|'Europe'|'North America'|'South America'|'Oceania'|'Antarctica'
export type WorldLocation={continent:Continent;country:string;region?:string;city:string;district?:string;language?:string;currency?:string;timeZone?:string}

const KEY='tryamm_global_world_location_v1'
let installed=false

const COUNTRY_CONTINENT:Record<string,Continent>={
  'united states':'North America','canada':'North America','mexico':'North America','jamaica':'North America','haiti':'North America','dominican republic':'North America','cuba':'North America','bahamas':'North America','belize':'North America','costa rica':'North America','panama':'North America','guatemala':'North America','honduras':'North America','el salvador':'North America','nicaragua':'North America','trinidad and tobago':'North America','barbados':'North America',
  'brazil':'South America','argentina':'South America','colombia':'South America','peru':'South America','chile':'South America','ecuador':'South America','venezuela':'South America','bolivia':'South America','paraguay':'South America','uruguay':'South America','guyana':'South America','suriname':'South America',
  'nigeria':'Africa','ghana':'Africa','south africa':'Africa','kenya':'Africa','ethiopia':'Africa','egypt':'Africa','morocco':'Africa','senegal':'Africa','tanzania':'Africa','uganda':'Africa','rwanda':'Africa','cameroon':'Africa','congo':'Africa','democratic republic of the congo':'Africa','angola':'Africa','zimbabwe':'Africa','zambia':'Africa','botswana':'Africa','namibia':'Africa','tunisia':'Africa','algeria':'Africa',
  'united kingdom':'Europe','ireland':'Europe','france':'Europe','germany':'Europe','spain':'Europe','portugal':'Europe','italy':'Europe','netherlands':'Europe','belgium':'Europe','sweden':'Europe','norway':'Europe','denmark':'Europe','finland':'Europe','poland':'Europe','greece':'Europe','switzerland':'Europe','austria':'Europe','czech republic':'Europe','romania':'Europe','ukraine':'Europe',
  'japan':'Asia','china':'Asia','south korea':'Asia','india':'Asia','philippines':'Asia','indonesia':'Asia','thailand':'Asia','vietnam':'Asia','singapore':'Asia','malaysia':'Asia','pakistan':'Asia','bangladesh':'Asia','israel':'Asia','saudi arabia':'Asia','united arab emirates':'Asia','qatar':'Asia','turkey':'Asia',
  'australia':'Oceania','new zealand':'Oceania','fiji':'Oceania','papua new guinea':'Oceania','samoa':'Oceania','tonga':'Oceania',
}

function continentFor(country:string,explicit?:string):Continent{
  if(explicit&&['Africa','Asia','Europe','North America','South America','Oceania','Antarctica'].includes(explicit))return explicit as Continent
  return COUNTRY_CONTINENT[country.trim().toLowerCase()]||'North America'
}
function normalize(detail:any):WorldLocation{
  const country=String(detail?.country||'United States').trim()
  return {continent:continentFor(country,detail?.continent),country,region:detail?.region?String(detail.region):undefined,city:String(detail?.city||'Chicago').trim(),district:detail?.district?String(detail.district):undefined,language:detail?.language?String(detail.language):undefined,currency:detail?.currency?String(detail.currency):undefined,timeZone:detail?.timeZone?String(detail.timeZone):undefined}
}
function publish(location:WorldLocation){
  try{localStorage.setItem(KEY,JSON.stringify(location))}catch{}
  document.documentElement.dataset.streetverseContinent=location.continent
  document.documentElement.dataset.streetverseCountry=location.country
  document.documentElement.dataset.streetverseCity=location.city
  window.dispatchEvent(new CustomEvent('tryamm:global-world-state',{detail:location}))
  window.dispatchEvent(new CustomEvent('tryamm:global-city-select',{detail:location}))
  window.dispatchEvent(new CustomEvent('tryamm:localization-context',{detail:location}))
}

export function installGlobalWorldHierarchyRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let current:WorldLocation={continent:'North America',country:'United States',region:'Illinois',city:'Chicago',district:'South Side',language:'en',currency:'USD',timeZone:'America/Chicago'}
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.country&&saved?.city)current=normalize(saved)}catch{}
  queueMicrotask(()=>publish(current))
  window.addEventListener('tryamm:global-world-select',(event:Event)=>{current=normalize((event as CustomEvent<any>).detail);publish(current)})
  window.addEventListener('tryamm:global-world-request',()=>publish(current))
}
