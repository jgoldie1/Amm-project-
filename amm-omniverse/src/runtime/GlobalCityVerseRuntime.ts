export type CityProfile={city:string;country:string;region?:string;theme:string;districts:string[];landmarks:string[];transit:string[];cultureTags:string[];creatorTags:string[];safetyFocus:string[]}

const CITY_KEY='tryamm_global_city_profile_v1'
const CURATED:Record<string,CityProfile>={
  'chicago|united states':{city:'Chicago',country:'United States',region:'Illinois',theme:'lakefront-neon',districts:['Downtown','South Side','West Side','North Side','Lakefront'],landmarks:['Lake Michigan','downtown skyline','community arts corridors'],transit:['rail','bus','bike','rideshare'],cultureTags:['house','blues','gospel','hip-hop','architecture','food'],creatorTags:['music','film','fashion','sports','tech'],safetyFocus:['safe passage','youth mentorship','community events']},
  'atlanta|united states':{city:'Atlanta',country:'United States',region:'Georgia',theme:'southern-future',districts:['Downtown','Midtown','West End','Eastside','Arts District'],landmarks:['city skyline','music corridors','historic neighborhoods'],transit:['rail','bus','rideshare'],cultureTags:['hip-hop','film','black business','food'],creatorTags:['music','film','fashion','entrepreneurship'],safetyFocus:['mentorship','event safety','community building']},
  'new york|united states':{city:'New York',country:'United States',region:'New York',theme:'vertical-metropolis',districts:['Manhattan','Brooklyn','Queens','Bronx','Staten Island'],landmarks:['skyline','parks','bridges','arts districts'],transit:['subway','bus','rail','ferry','bike'],cultureTags:['hip-hop','fashion','theater','finance','food'],creatorTags:['music','film','fashion','media'],safetyFocus:['safe transit','youth activities','public-space support']},
  'los angeles|united states':{city:'Los Angeles',country:'United States',region:'California',theme:'sunset-cinematic',districts:['Downtown','South LA','Hollywood','Westside','Valley'],landmarks:['hills','studios','beaches','boulevards'],transit:['rail','bus','rideshare','car'],cultureTags:['film','music','streetwear','food'],creatorTags:['film','music','video','fashion'],safetyFocus:['safe events','youth arts','neighborhood support']},
  'london|united kingdom':{city:'London',country:'United Kingdom',theme:'royal-future',districts:['Central','East','South','West','North'],landmarks:['river','historic core','markets','arts districts'],transit:['tube','rail','bus','bike'],cultureTags:['grime','fashion','football','theater'],creatorTags:['music','fashion','film','design'],safetyFocus:['night travel','youth mentorship','event safety']},
  'lagos|nigeria':{city:'Lagos',country:'Nigeria',theme:'afrofuture-coast',districts:['Island','Mainland','Lekki','Yaba','Surulere'],landmarks:['lagoon','markets','creative districts','coast'],transit:['bus','ferry','rideshare'],cultureTags:['afrobeats','fashion','film','food','tech'],creatorTags:['music','film','fashion','startup'],safetyFocus:['safe transit','youth opportunity','community events']},
  'tokyo|japan':{city:'Tokyo',country:'Japan',theme:'precision-neon',districts:['Shibuya','Shinjuku','Akihabara','Ginza','Asakusa'],landmarks:['crossings','towers','temples','creative districts'],transit:['rail','metro','bus','bike'],cultureTags:['anime','games','fashion','music','food'],creatorTags:['games','animation','music','fashion'],safetyFocus:['safe transit','crowd safety','youth activities']},
  'mexico city|mexico':{city:'Mexico City',country:'Mexico',theme:'historic-neon',districts:['Centro','Roma','Condesa','Coyoacán','Polanco'],landmarks:['historic center','parks','markets','arts corridors'],transit:['metro','bus','bike','rideshare'],cultureTags:['music','art','food','football','history'],creatorTags:['music','film','art','food'],safetyFocus:['safe transit','family routes','community events']},
  'toronto|canada':{city:'Toronto',country:'Canada',region:'Ontario',theme:'lake-city-future',districts:['Downtown','Scarborough','North York','Etobicoke','Waterfront'],landmarks:['waterfront','tower','arts districts','markets'],transit:['subway','streetcar','bus','bike'],cultureTags:['music','film','sports','food','multicultural'],creatorTags:['music','film','tech','sports'],safetyFocus:['safe transit','youth activities','event safety']},
}

function key(city:string,country:string){return `${city.trim().toLowerCase()}|${country.trim().toLowerCase()}`}
function generic(city:string,country:string,region?:string):CityProfile{return {city,country,region,theme:'global-living-city',districts:['City Center','Arts District','Market District','Residential District','Transit District'],landmarks:['local landmarks','community spaces','creator venues'],transit:['public transit','walking','bike','rideshare'],cultureTags:['local culture','food','music','history'],creatorTags:['music','film','art','business'],safetyFocus:['safe routes','community support','youth mentorship']}}
function save(profile:CityProfile){try{localStorage.setItem(CITY_KEY,JSON.stringify(profile))}catch{}}
function publish(profile:CityProfile){save(profile);document.documentElement.dataset.streetverseCity=profile.city;document.documentElement.dataset.streetverseCityTheme=profile.theme;window.dispatchEvent(new CustomEvent('tryamm:global-city-state',{detail:profile}));window.dispatchEvent(new CustomEvent('tryamm:world-city-changed',{detail:profile}))}

let installed=false
export function installGlobalCityVerseRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let initial:CITYProfileFix|null=null
  try{initial=JSON.parse(localStorage.getItem(CITY_KEY)||'null')}catch{}
  const start=(initial&&typeof initial.city==='string'&&typeof initial.country==='string')?initial as unknown as CityProfile:CURATED['chicago|united states']
  queueMicrotask(()=>publish(start))
  window.addEventListener('tryamm:global-city-select',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const city=String(d.city||'Chicago').trim();const country=String(d.country||'United States').trim();const region=d.region?String(d.region):undefined
    publish(CURATED[key(city,country)]||generic(city,country,region))
  })
  window.addEventListener('tryamm:global-city-request',()=>publish(start))
}

type CITYProfileFix=CityProfile
