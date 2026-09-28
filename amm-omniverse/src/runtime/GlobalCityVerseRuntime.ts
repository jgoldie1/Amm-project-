import {STREETVERSE_GLOBAL_CITIES,getStreetVerseCity,type StreetVerseCity} from '../data/StreetVerseGlobalRegistry'
import {SERVER_SETTLEMENT_SEQUENCE,SETTLEMENT_SECURITY_RULES} from '../game/economy/RevenueSettlementContract'
export type CityProfile={city:string;country:string;region?:string;theme:string;districts:string[];landmarks:string[];transit:string[];cultureTags:string[];creatorTags:string[];safetyFocus:string[];diasporaTags?:string[]}
const CITY_KEY='tryamm_global_city_profile_v2'
const CURATED:Record<string,CityProfile>={
'chicago|united states':{city:'Chicago',country:'United States',region:'Illinois',theme:'lakefront-neon',districts:['Downtown','South Side','West Side','North Side','Lakefront'],landmarks:['Lake Michigan','downtown skyline','community arts corridors'],transit:['rail','bus','bike','rideshare'],cultureTags:['house','blues','gospel','hip-hop','architecture','food'],creatorTags:['music','film','fashion','sports','tech'],safetyFocus:['safe passage','youth mentorship','community events'],diasporaTags:['African American','Caribbean','African diaspora']},
'lagos|nigeria':{city:'Lagos',country:'Nigeria',theme:'afrofuture-coast',districts:['Island','Mainland','Lekki','Yaba','Surulere'],landmarks:['lagoon','markets','creative districts','coast'],transit:['bus','ferry','rideshare'],cultureTags:['afrobeats','fashion','film','food','tech'],creatorTags:['music','film','fashion','startup'],safetyFocus:['safe transit','youth opportunity','community events'],diasporaTags:['West African','global African diaspora']},
'abuja|nigeria':{city:'Abuja',country:'Nigeria',region:'Federal Capital Territory',theme:'afrofuture-capital',districts:['Central Area','Wuse','Garki','Maitama','Gwarinpa'],landmarks:['Aso Rock','central business district','markets','cultural districts'],transit:['bus','rideshare','car','walking'],cultureTags:['business','government','fashion','food','music','technology'],creatorTags:['business','music','film','fashion','startup'],safetyFocus:['safe transit','business navigation','youth opportunity','community events'],diasporaTags:['West African','global African diaspora']},
'accra|ghana':{city:'Accra',country:'Ghana',theme:'gold-coast-future',districts:['Osu','Jamestown','Airport','East Legon','Arts Centre'],landmarks:['coast','markets','historic districts','creative venues'],transit:['bus','rideshare','walking'],cultureTags:['highlife','afrobeats','fashion','food','heritage'],creatorTags:['music','fashion','film','tourism'],safetyFocus:['safe events','community routes','youth opportunity'],diasporaTags:['West African','returning diaspora','Caribbean connections']},
'new york|united states':{city:'New York',country:'United States',region:'New York',theme:'vertical-metropolis',districts:['Manhattan','Brooklyn','Queens','Bronx','Staten Island'],landmarks:['skyline','parks','bridges','arts districts'],transit:['subway','bus','rail','ferry','bike'],cultureTags:['hip-hop','fashion','theater','finance','food'],creatorTags:['music','film','fashion','media'],safetyFocus:['safe transit','youth activities','public-space support'],diasporaTags:['African American','Caribbean','African','Latino']},
'hollywood|united states':{city:'Hollywood',country:'United States',region:'California',theme:'studio-neon',districts:['Hollywood','East Hollywood','Sunset','Studio District','Hills'],landmarks:['studio lots','boulevards','theaters','hills'],transit:['metro','bus','rideshare','car'],cultureTags:['film','television','music','fashion','entertainment'],creatorTags:['film','tv','acting','music','broadcast'],safetyFocus:['creator safety','event safety','night travel','youth arts'],diasporaTags:['African American','Latino','Caribbean','African diaspora']},
'los angeles|united states':{city:'Los Angeles',country:'United States',region:'California',theme:'sunset-cinematic',districts:['Downtown','South LA','Hollywood','Westside','Valley'],landmarks:['hills','studios','beaches','boulevards'],transit:['rail','bus','rideshare','car'],cultureTags:['film','music','streetwear','food'],creatorTags:['film','music','video','fashion'],safetyFocus:['safe events','youth arts','neighborhood support'],diasporaTags:['African American','Latino','Caribbean','African diaspora']},
'san diego|united states':{city:'San Diego',country:'United States',region:'California',theme:'pacific-future',districts:['Downtown','Southeast San Diego','North Park','La Jolla','Harbor'],landmarks:['Pacific coast','harbor','parks','creative districts'],transit:['trolley','bus','bike','rideshare'],cultureTags:['surf','military','biotech','music','food'],creatorTags:['film','music','sports','tech','tourism'],safetyFocus:['coastal safety','safe transit','youth mentorship','event support'],diasporaTags:['African American','Latino','Pacific diaspora']},
'atlanta|united states':{city:'Atlanta',country:'United States',region:'Georgia',theme:'southern-future',districts:['Downtown','Midtown','West End','Eastside','Arts District'],landmarks:['city skyline','music corridors','historic neighborhoods'],transit:['rail','bus','rideshare'],cultureTags:['hip-hop','film','black business','food'],creatorTags:['music','film','fashion','entrepreneurship'],safetyFocus:['mentorship','event safety','community building'],diasporaTags:['African American','Caribbean','African diaspora']},
'mexico city|mexico':{city:'Mexico City',country:'Mexico',theme:'historic-neon',districts:['Centro','Roma','Condesa','Coyoacán','Polanco'],landmarks:['historic center','parks','markets','arts corridors'],transit:['metro','bus','bike','rideshare'],cultureTags:['music','art','food','football','history'],creatorTags:['music','film','art','food'],safetyFocus:['safe transit','family routes','community events'],diasporaTags:['Mexican','Afro-Mexican','Latin American']},
'tijuana|mexico':{city:'Tijuana',country:'Mexico',region:'Baja California',theme:'border-future',districts:['Centro','Zona Río','Playas','Otay','Creative District'],landmarks:['border gateway','coast','markets','arts corridors'],transit:['bus','rideshare','walking'],cultureTags:['border culture','music','food','art','entrepreneurship'],creatorTags:['music','film','food','cross-border business'],safetyFocus:['safe transit','family reunification','cross-border resource navigation'],diasporaTags:['Mexican','Afro-Mexican','US-Mexico diaspora']},
'guadalajara|mexico':{city:'Guadalajara',country:'Mexico',region:'Jalisco',theme:'jalisco-future',districts:['Centro','Americana','Zapopan','Tlaquepaque','Tech District'],landmarks:['historic core','markets','creative corridors','tech hubs'],transit:['rail','bus','bike','rideshare'],cultureTags:['music','film','food','technology','heritage'],creatorTags:['music','film','tech','design'],safetyFocus:['youth opportunity','safe events','community routes'],diasporaTags:['Mexican','Afro-Mexican','Latin American']},
'london|united kingdom':{city:'London',country:'United Kingdom',theme:'royal-future',districts:['Central','East','South','West','North'],landmarks:['river','historic core','markets','arts districts'],transit:['tube','rail','bus','bike'],cultureTags:['grime','fashion','football','theater'],creatorTags:['music','fashion','film','design'],safetyFocus:['night travel','youth mentorship','event safety'],diasporaTags:['Black British','Caribbean','African','South Asian']},
'birmingham|united kingdom':{city:'Birmingham',country:'United Kingdom',region:'England',theme:'midlands-future',districts:['City Centre','Handsworth','Digbeth','Jewellery Quarter','Aston'],landmarks:['canals','markets','music venues','creative districts'],transit:['rail','tram','bus','bike'],cultureTags:['music','football','food','manufacturing','arts'],creatorTags:['music','film','fashion','business'],safetyFocus:['youth mentorship','night travel','community events'],diasporaTags:['Black British','Caribbean','African','South Asian']},
'manchester|united kingdom':{city:'Manchester',country:'United Kingdom',region:'England',theme:'northern-future',districts:['City Centre','Moss Side','Northern Quarter','Salford','Sports District'],landmarks:['music venues','stadiums','canals','media district'],transit:['tram','rail','bus','bike'],cultureTags:['music','football','media','fashion'],creatorTags:['music','sports','broadcast','film'],safetyFocus:['event safety','night travel','youth activities'],diasporaTags:['Black British','Caribbean','African']},
'toronto|canada':{city:'Toronto',country:'Canada',region:'Ontario',theme:'lake-city-future',districts:['Downtown','Scarborough','North York','Etobicoke','Waterfront'],landmarks:['waterfront','tower','arts districts','markets'],transit:['subway','streetcar','bus','bike'],cultureTags:['music','film','sports','food','multicultural'],creatorTags:['music','film','tech','sports'],safetyFocus:['safe transit','youth activities','event safety'],diasporaTags:['Black Canadian','Caribbean','African','South Asian']},
'montreal|canada':{city:'Montreal',country:'Canada',region:'Quebec',theme:'bilingual-neon',districts:['Downtown','Little Burgundy','Plateau','Old Montreal','Creative District'],landmarks:['river','historic core','festivals','arts venues'],transit:['metro','bus','bike'],cultureTags:['music','film','fashion','food','bilingual culture'],creatorTags:['music','film','games','design'],safetyFocus:['festival safety','safe transit','youth opportunity'],diasporaTags:['Black Canadian','Haitian','Caribbean','African']},
'vancouver|canada':{city:'Vancouver',country:'Canada',region:'British Columbia',theme:'pacific-glass',districts:['Downtown','East Vancouver','Richmond','Burnaby','Waterfront'],landmarks:['mountains','harbor','film districts','parks'],transit:['skytrain','bus','ferry','bike'],cultureTags:['film','tech','music','outdoors'],creatorTags:['film','games','tech','music'],safetyFocus:['safe transit','event safety','community support'],diasporaTags:['Black Canadian','African','Caribbean','Pacific diaspora']},
'kingston|jamaica':{city:'Kingston',country:'Jamaica',theme:'island-sound-system',districts:['Downtown','New Kingston','Trench Town','Half Way Tree','Waterfront'],landmarks:['harbor','music landmarks','markets','hills'],transit:['bus','taxi','rideshare'],cultureTags:['reggae','dancehall','food','sports','history'],creatorTags:['music','film','fashion','sports'],safetyFocus:['youth mentorship','event safety','safe routes'],diasporaTags:['Caribbean','African diaspora']},
'port of spain|trinidad and tobago':{city:'Port of Spain',country:'Trinidad and Tobago',theme:'carnival-future',districts:['Downtown','Woodbrook','St James','Savannah','Waterfront'],landmarks:['savannah','waterfront','carnival corridors','markets'],transit:['bus','taxi','rideshare'],cultureTags:['soca','calypso','carnival','food','steelpan'],creatorTags:['music','fashion','events','film'],safetyFocus:['festival safety','crowd safety','safe routes'],diasporaTags:['Caribbean','African diaspora','Indian diaspora']},
'johannesburg|south africa':{city:'Johannesburg',country:'South Africa',region:'Gauteng',theme:'afropolitan-future',districts:['CBD','Soweto','Braamfontein','Sandton','Maboneng'],landmarks:['skyline','township heritage','arts districts','business hubs'],transit:['rail','bus','rideshare'],cultureTags:['amapiano','fashion','business','art','history'],creatorTags:['music','film','fashion','tech'],safetyFocus:['safe transit','youth opportunity','community events'],diasporaTags:['Southern African','continental African diaspora']},
'nairobi|kenya':{city:'Nairobi',country:'Kenya',theme:'savanna-tech',districts:['CBD','Westlands','Kibera','Kilimani','Tech District'],landmarks:['city skyline','markets','parks','innovation hubs'],transit:['bus','rideshare','walking'],cultureTags:['music','tech','fashion','food','wildlife'],creatorTags:['tech','film','music','business'],safetyFocus:['safe transit','youth opportunity','community support'],diasporaTags:['East African','global African diaspora']},
'tokyo|japan':{city:'Tokyo',country:'Japan',theme:'precision-neon',districts:['Shibuya','Shinjuku','Akihabara','Ginza','Asakusa'],landmarks:['crossings','towers','temples','creative districts'],transit:['rail','metro','bus','bike'],cultureTags:['anime','games','fashion','music','food'],creatorTags:['games','animation','music','fashion'],safetyFocus:['safe transit','crowd safety','youth activities']}
}
function key(city:string,country:string){return `${city.trim().toLowerCase()}|${country.trim().toLowerCase()}`}
function generic(city:string,country:string,region?:string):CityProfile{return{city,country,region,theme:'global-living-city',districts:['City Center','Arts District','Market District','Residential District','Transit District'],landmarks:['local landmarks','community spaces','creator venues'],transit:['public transit','walking','bike','rideshare'],cultureTags:['local culture','food','music','history'],creatorTags:['music','film','art','business'],safetyFocus:['safe routes','community support','youth mentorship'],diasporaTags:['local diaspora communities']}}
function save(profile:CityProfile){try{localStorage.setItem(CITY_KEY,JSON.stringify(profile))}catch{}}
function publish(profile:CityProfile){save(profile);document.documentElement.dataset.streetverseCity=profile.city;document.documentElement.dataset.streetverseCityTheme=profile.theme;window.dispatchEvent(new CustomEvent('tryamm:global-city-state',{detail:profile}));window.dispatchEvent(new CustomEvent('tryamm:world-city-changed',{detail:profile}));window.dispatchEvent(new CustomEvent('tryamm:world-location-changed',{detail:{city:profile.city,country:profile.country,region:profile.region,theme:profile.theme}}))}
let installed=false
export function installGlobalCityVerseRuntime(){if(installed||typeof window==='undefined')return;installed=true;let initial:CityProfile|null=null;try{initial=JSON.parse(localStorage.getItem(CITY_KEY)||'null')}catch{};const start=(initial&&typeof initial.city==='string'&&typeof initial.country==='string')?initial:CURATED['chicago|united states'];queueMicrotask(()=>publish(start));window.addEventListener('tryamm:global-city-select',(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},city=String(d.city||'Chicago').trim(),country=String(d.country||'United States').trim(),region=d.region?String(d.region):undefined;publish(CURATED[key(city,country)]||generic(city,country,region))});window.addEventListener('tryamm:global-city-request',()=>publish(start))}

export interface GlobalCityRuntimeEvidence{
 cityId:string
 profileSource:'curated'|'registry-fallback'
 registryStatus:StreetVerseCity['status']
 runtimeProfileReady:boolean
 evidence:string[]
}

const profileForRegistryCity=(city:StreetVerseCity):{profile:CityProfile;source:'curated'|'registry-fallback'}=>{
 const curated=CURATED[key(city.name,city.country)]
 return curated?{profile:curated,source:'curated'}:{profile:generic(city.name,city.country,city.region),source:'registry-fallback'}
}

export const getGlobalCityRuntimeEvidence=(cityId:string):GlobalCityRuntimeEvidence=>{
 const city=getStreetVerseCity(cityId)
 const resolved=profileForRegistryCity(city)
 return{
  cityId:city.id,
  profileSource:resolved.source,
  registryStatus:city.status,
  runtimeProfileReady:Boolean(resolved.profile.city&&resolved.profile.country&&resolved.profile.theme),
  evidence:[
   'global registry city resolves to a runtime profile',
   resolved.source==='curated'?'curated city profile present':'safe generic runtime fallback used',
   'runtime selection does not require precise user location',
   'registry status remains authoritative; runtime profile does not imply production certification',
  ],
 }
}

export const GLOBAL_CITY_RUNTIME_MANIFESTS=STREETVERSE_GLOBAL_CITIES.map(city=>({
 city,
 ...profileForRegistryCity(city),
 evidence:getGlobalCityRuntimeEvidence(city.id),
}))


export interface GlobalCitySystemsEvidence{
 cityId:string
 environment:{ready:boolean;weatherMode:'city-level-provider';rules:string[]}
 mobility:{ready:boolean;modes:string[];rules:string[]}
 accessibility:{ready:boolean;capabilities:string[];rules:string[]}
}

export const getGlobalCitySystemsEvidence=(cityId:string):GlobalCitySystemsEvidence=>{
 const manifest=GLOBAL_CITY_RUNTIME_MANIFESTS.find(item=>item.city.id===cityId)
 if(!manifest)throw new Error(`Unknown StreetVerse city: ${cityId}`)
 const {city,profile}=manifest
 return{
  cityId,
  environment:{
   ready:Boolean(profile.theme&&profile.landmarks.length),
   weatherMode:'city-level-provider',
   rules:[
    'weather must come from a current city-level provider before presentation as current conditions',
    'weather may alter atmosphere, lighting and effects but never certifies a city by itself',
    'persistent environment assets require source and rights metadata',
   ],
  },
  mobility:{
   ready:profile.transit.length>0,
   modes:[...profile.transit],
   rules:[
    'mobility routes use public or authorized source data',
    'no private or sensitive access routes are exposed',
    'one-hand and reduced-motion navigation alternatives remain available',
   ],
  },
  accessibility:{
   ready:true,
   capabilities:['one-hand navigation','keyboard navigation','screen-reader labels','captions','reduced motion','high-contrast compatible UI'],
   rules:[
    'accessibility evidence is required before production certification',
    'city-specific visuals cannot remove shared accessibility controls',
    'runtime readiness does not substitute for device-level accessibility testing',
   ],
  },
 }
}

export const GLOBAL_CITY_SYSTEMS_EVIDENCE=STREETVERSE_GLOBAL_CITIES.map(city=>getGlobalCitySystemsEvidence(city.id))


export interface GlobalCityActivityEvidence{
 cityId:string
 population:{ready:boolean;rules:string[]}
 business:{ready:boolean;capabilities:string[];rules:string[]}
 media:{ready:boolean;channels:string[];rules:string[]}
}

export const getGlobalCityActivityEvidence=(cityId:string):GlobalCityActivityEvidence=>{
 const manifest=GLOBAL_CITY_RUNTIME_MANIFESTS.find(item=>item.city.id===cityId)
 if(!manifest)throw new Error(`Unknown StreetVerse city: ${cityId}`)
 const {profile}=manifest
 return{
  cityId,
  population:{
   ready:profile.districts.length>0,
   rules:[
    'synthetic population represents gameplay activity and is not presented as real resident tracking',
    'population density uses aggregated or licensed city-level evidence only',
    'no private-resident identity, home-location or sensitive movement profile is generated from runtime data',
   ],
  },
  business:{
   ready:true,
   capabilities:['Business Passport','owner-authorized digital twin','QR onboarding','Scout attribution','Marketplace hooks','Delivery hooks'],
   rules:[
    'persistent business twins require owner authorization or a lawful public-data basis',
    'Scout attribution records consent and provenance',
    'business status and offers require server verification before monetized presentation',
   ],
  },
  media:{
   ready:true,
   channels:['local news','national news','global news','entertainment','weather','StreetVerse Radio','TRYAMM TV','Holo LIVE','Reels'],
   rules:[
    'current news and weather require timestamped source-backed provider data',
    'persistent media assets require rights metadata',
    'synthetic hosts must not imply that generated reporting is eyewitness reporting',
    'localization preserves source attribution and does not change factual meaning',
   ],
  },
 }
}

export const GLOBAL_CITY_ACTIVITY_EVIDENCE=STREETVERSE_GLOBAL_CITIES.map(city=>getGlobalCityActivityEvidence(city.id))


export interface GlobalCityMissionEconomyEvidence{
 cityId:string
 missions:{ready:boolean;capabilities:string[];rules:string[]}
 economy:{ready:boolean;sequence:readonly string[];verification:string[]}
}

export const getGlobalCityMissionEconomyEvidence=(cityId:string):GlobalCityMissionEconomyEvidence=>{
 const manifest=GLOBAL_CITY_RUNTIME_MANIFESTS.find(item=>item.city.id===cityId)
 if(!manifest)throw new Error(`Unknown StreetVerse city: ${cityId}`)
 const {profile}=manifest
 return{
  cityId,
  missions:{
   ready:profile.districts.length>0,
   capabilities:['city missions','jobs','creator challenges','business challenges','tourism and culture missions'],
   rules:[
    'missions use synthetic gameplay actors unless a participant has explicitly opted in',
    'jobs and paid challenges must disclose eligibility, compensation and sponsor terms before acceptance',
    'culture and tourism missions require source and rights review for persistent assets',
    'mission completion never directly creates a payable balance on the client',
   ],
  },
  economy:{
   ready:Boolean(
    SETTLEMENT_SECURITY_RULES.webhookMustBeSignatureVerified&&
    SETTLEMENT_SECURITY_RULES.webhookMustBeIdempotent&&
    SETTLEMENT_SECURITY_RULES.browserCannotPostLedgerEntries&&
    SETTLEMENT_SECURITY_RULES.browserCannotCreatePayableBalance
   ),
   sequence:SERVER_SETTLEMENT_SEQUENCE,
   verification:[
    'checkout is only an initiation signal and does not prove payment',
    'processor webhook signature and event idempotency are server verified',
    'amount, currency, product and approved split contract are server validated',
    'entitlements are created only after verified transaction evidence',
    'ledger entries and payable balances are server-authoritative',
    'refunds, disputes and chargebacks can reverse ledger state',
   ],
  },
 }
}

export const GLOBAL_CITY_MISSION_ECONOMY_EVIDENCE=STREETVERSE_GLOBAL_CITIES.map(city=>getGlobalCityMissionEconomyEvidence(city.id))


export type GlobalCityCertificationStatus='BUILDING'|'READY'|'CERTIFIABLE'
export interface GlobalCityConvergenceCertification{
 cityId:string
 status:GlobalCityCertificationStatus
 checks:{runtime:boolean;environment:boolean;mobility:boolean;accessibility:boolean;population:boolean;business:boolean;media:boolean;missions:boolean;economy:boolean}
 blockers:string[]
 rule:string
}

export const certifyGlobalCityConvergence=(cityId:string):GlobalCityConvergenceCertification=>{
 const runtime=getGlobalCityRuntimeEvidence(cityId)
 const systems=getGlobalCitySystemsEvidence(cityId)
 const activity=getGlobalCityActivityEvidence(cityId)
 const missionEconomy=getGlobalCityMissionEconomyEvidence(cityId)
 const checks={
  runtime:runtime.runtimeProfileReady,
  environment:systems.environment.ready,
  mobility:systems.mobility.ready,
  accessibility:systems.accessibility.ready,
  population:activity.population.ready,
  business:activity.business.ready,
  media:activity.media.ready,
  missions:missionEconomy.missions.ready,
  economy:missionEconomy.economy.ready,
 }
 const blockers=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>`${name} evidence incomplete`)
 const evidenceReady=blockers.length===0
 // Runtime evidence can make a city READY, but production certification still requires external release/device/source evidence.
 const status:GlobalCityCertificationStatus=!checks.runtime?'BUILDING':evidenceReady?'READY':'BUILDING'
 return{
  cityId,status,checks,blockers,
  rule:'CERTIFIABLE is reserved for a separate fail-closed release certification that verifies source/rights, privacy, security, accessibility, payments, ledger, device performance and deployment evidence; runtime evidence alone never promotes a city to CERTIFIABLE.',
 }
}

export const GLOBAL_CITY_CONVERGENCE_CERTIFICATIONS=STREETVERSE_GLOBAL_CITIES.map(city=>certifyGlobalCityConvergence(city.id))


export type TryammLoadMode='NORMAL'|'BUSY'|'HIGH_LOAD'|'SURVIVAL'|'RECOVERY'
export type TryammWorkloadClass='critical-transaction'|'realtime'|'interactive'|'background-heavy'

export const TRYAMM_LOAD_STABILITY_POLICY={
 priority:[
  'critical-transaction: auth, verified checkout, entitlements and ledger',
  'realtime: Holo LIVE, PK, safety and moderation',
  'interactive: StreetVerse gameplay, Marketplace and business onboarding',
  'background-heavy: AI generation, video transcode, 3D generation and world compilation',
 ],
 invariants:[
  'background-heavy work cannot consume capacity reserved for critical transactions',
  'queues are bounded and stale work expires instead of growing without limit',
  'retries use bounded exponential backoff with jitter',
  'dependency failures trigger circuit breaking and graceful degradation',
  'SURVIVAL mode preserves auth, payments, ledger, safety and core realtime functions first',
  'release certification requires mixed-workload load testing at established capacity limits',
 ],
 modes:{
  NORMAL:'all certified capabilities available within workload budgets',
  BUSY:'defer non-urgent background work and reduce speculative prefetch',
  HIGH_LOAD:'throttle expensive generation, reduce noncritical simulation and protect realtime capacity',
  SURVIVAL:'shed noncritical work and preserve critical transactions, safety and core realtime functions',
  RECOVERY:'restore capacity gradually while draining only valid queued work',
 } satisfies Record<TryammLoadMode,string>,
} as const

export interface TryammLoadCertificationEvidence{
 mode:TryammLoadMode
 boundedQueues:boolean
 workloadBudgets:boolean
 retryLimits:boolean
 gracefulDegradation:boolean
 criticalCapacityReserved:boolean
 mixedLoadTestPassed:boolean
 certifiable:boolean
}

export const certifyTryammLoadStability=(evidence:Omit<TryammLoadCertificationEvidence,'certifiable'>):TryammLoadCertificationEvidence=>({
 ...evidence,
 certifiable:evidence.boundedQueues&&evidence.workloadBudgets&&evidence.retryLimits&&evidence.gracefulDegradation&&evidence.criticalCapacityReserved&&evidence.mixedLoadTestPassed,
})


export const TRYAMM_PLATFORM_SURFACES={
 allAmericanAppStore:{
  status:'BUILDING',
  purpose:'TRYAMM discovery and distribution surface for approved apps, games, creator tools, business experiences and installable web experiences',
  requirements:[
   'developer identity and ownership verification',
   'package/version/signature metadata',
   'rights, privacy, security, accessibility and age-rating review',
   'malware and prohibited-content scanning before publication',
   'server-verified purchases, entitlements, refunds and ledger settlement',
   'clear distinction between TRYAMM catalog distribution and Apple App Store or Google Play publication',
  ],
 },
 gameVerse:{
  status:'BUILDING',
  purpose:'shared gaming hub for TRYAMM-native games, StreetVerse missions, tournaments, creator games and cross-verse play',
  sharedInfrastructure:[
   'TRYAMM Passport identity',
   'server-authoritative entitlements and ledger',
   'Holo LIVE and Reels',
   'creator and tournament services',
   'accessibility controls',
   'Quantum Load Governor workload protection',
  ],
  loadClass:'interactive',
  degradation:'preserve core gameplay and transactions; reduce background AI, spectators, effects and nonessential simulation under pressure',
 },
} as const


export const KINGDOM_PRESS_RUNTIME={
 status:'BUILDING',
 purpose:'rights-aware TRYAMM publishing and distribution surface',
 formats:['books','magazines','articles','educational publications','faith publications','audiobooks','interactive editions'],
 distribution:['TRYAMM app','All American App Store','entitled web experiences'],
 sharedServices:['TRYAMM Passport','accessibility platform','verified checkout','entitlements','internal ledger','Holo LIVE','Reels','TRYAMM TV'],
 rights:{
  requiredBeforePublication:['publisher authority','author/contributor rights','asset provenance','territory and term'],
  separatelyLicensed:['audiobook','translation','film/video','game adaptation','music/sync','AI training','interactive/holographic adaptation'],
  rule:'publication rights never imply adaptation, AI-training, game, film, music, translation or audiobook rights',
 },
 commerce:{
  checkout:'server-authoritative',
  entitlement:'created only after verified transaction',
  settlement:'internal ledger records validated publisher/creator splits',
  reversals:'refunds, disputes and chargebacks can reverse entitlement and ledger state when contractually required',
 },
 accessibility:['screen-reader semantics','keyboard and one-hand navigation','captions/transcripts for timed media','reflowable text where format permits','reduced-motion alternatives'],
 certification:'BUILDING does not imply published, store-approved, rights-cleared or production-certified',
} as const


export const FAITHVERSE_IMMERSIVE_SCRIPTURE_LIBRARY={
 status:'BUILDING',
 purpose:'source-aware immersive scripture, manuscript comparison and language-learning experience',
 collections:[
  {id:'ethiopian-canon',label:'Ethiopian biblical canon',mode:'edition-and-canon-aware'},
  {id:'dead-sea-scrolls',label:'Dead Sea Scrolls study collection',mode:'licensed-source-and-fragment-aware'},
  {id:'kjv-1611',label:'1611 King James Bible edition',mode:'edition-aware'},
  {id:'paleo-hebrew',label:'Paleo-Hebrew script and language study',mode:'educational-comparative'},
 ],
 experiences:[
  'parallel passage and manuscript comparison',
  'read-along narration and pronunciation practice',
  'letter and script tracing',
  'historical maps, timelines and immersive reconstructed settings',
  'searchable study notes with source and edition labels',
  'HoloLab-authored XR lessons and device-neutral immersive presentation',
 ],
 scholarlyGuardrails:[
  'distinguish source text, transcription, translation, reconstruction, commentary and faith interpretation',
  'identify manuscript, edition, language, script, provenance and uncertainty where known',
  'do not present reconstructed pronunciation or translation choices as uniquely proven',
  'do not imply that Paleo-Hebrew script by itself establishes a single historically certain spoken pronunciation',
  'license or obtain permission for modern scans, photographs, translations, annotations and recordings when required',
 ],
 accessibility:[
  'screen-reader compatible text alternatives',
  'captions and transcripts',
  'one-hand and keyboard navigation',
  'adjustable text size and contrast',
  'non-XR equivalent for immersive lessons',
 ],
 distribution:['FaithVerse','Kingdom Press','All American App Store'],
 certification:'BUILDING does not imply that source texts, scans, translations, audio or XR scenes are rights-cleared or production-certified',
} as const


export type RightsLicenseState='NOT_NEEDED'|'NEEDED'|'AI_PREPARING'|'FOUNDER_REVIEW'|'SIGNATURE_REQUIRED'|'SUBMITTED'|'PENDING'|'APPROVED'|'EXPIRING'|'RENEWAL_DUE'|'DENIED'
export type PublicationSurface='Kingdom Press'|'FaithVerse'|'GameVerse'|'All American App Store'|'TRYAMM TV'|'Holo LIVE'|'Reels'

export interface RightsLicenseRecord{
 id:string
 assetId:string
 owner:string
 source:string
 state:RightsLicenseState
 territories:string[]
 allowedUses:string[]
 prohibitedUses:string[]
 attribution?:string
 effectiveAt?:string
 expiresAt?:string
 evidenceRef?:string
 founderApproval:boolean
 surfaces:PublicationSurface[]
}

export interface PublicationGateResult{
 publishable:boolean
 blockers:string[]
}

export const evaluatePublicationRights=(records:RightsLicenseRecord[],surface:PublicationSurface,now=new Date()):PublicationGateResult=>{
 const applicable=records.filter(r=>r.surfaces.includes(surface))
 const blockers:string[]=[]
 if(!applicable.length) blockers.push('no rights record exists for publication surface')
 for(const r of applicable){
  if(r.state!=='APPROVED'&&r.state!=='NOT_NEEDED') blockers.push(`${r.id}: rights state is ${r.state}`)
  if(r.state==='APPROVED'&&!r.evidenceRef) blockers.push(`${r.id}: approved rights require evidence reference`)
  if(r.state==='APPROVED'&&!r.founderApproval) blockers.push(`${r.id}: founder approval missing`)
  if(r.expiresAt&&new Date(r.expiresAt)<=now) blockers.push(`${r.id}: license expired`)
  if(!r.territories.length) blockers.push(`${r.id}: territory not established`)
  if(!r.allowedUses.length) blockers.push(`${r.id}: allowed uses not established`)
 }
 return {publishable:blockers.length===0,blockers}
}

export const RIGHTS_LICENSING_REGISTRY_POLICY={
 failClosed:true,
 rule:'no verified rights record means no commercial publication',
 aiMay:['inventory assets','identify likely rights categories','prepare forms and permission requests','track evidence, expirations and renewals'],
 founderRequired:['legal signature','attestation','identity verification','contract acceptance','payment authorization','final publication approval'],
 separateRights:['source text','translation','scan/image','audio/narration','annotation','art/3D','film/video adaptation','game adaptation','XR adaptation','music/sync','AI training'],
 protectedSurfaces:['Kingdom Press','FaithVerse','GameVerse','All American App Store','TRYAMM TV','Holo LIVE','Reels'] as PublicationSurface[],
} as const


export type FounderActionKind='SIGNATURE'|'ATTESTATION'|'IDENTITY_VERIFICATION'|'PAYMENT_AUTHORIZATION'|'CONTRACT_ACCEPTANCE'|'FINAL_PUBLICATION_APPROVAL'|'COUNSEL_REVIEW'
export type ComplianceWorkflowState='DISCOVERED'|'AI_PREPARING'|'FOUNDER_ACTION'|'SUBMITTED'|'PENDING'|'APPROVED'|'REJECTED'|'RENEWAL_DUE'

export interface FounderComplianceItem{
 id:string
 title:string
 authorityOrRightsholder:string
 state:ComplianceWorkflowState
 founderAction?:FounderActionKind
 dueAt?:string
 evidenceRefs:string[]
 relatedRightsRecordIds:string[]
 releaseBlocking:boolean
}

export const getFounderActionQueue=(items:FounderComplianceItem[])=>items
 .filter(item=>item.state==='FOUNDER_ACTION'&&item.founderAction)
 .sort((a,b)=>{
  if(a.releaseBlocking!==b.releaseBlocking) return a.releaseBlocking?-1:1
  return (a.dueAt??'9999').localeCompare(b.dueAt??'9999')
 })

export const FOUNDER_COMPLIANCE_COMMAND_CENTER={
 status:'BUILDING',
 objective:'AI prepares and tracks compliance work while legally significant founder actions remain human-authorized',
 workflow:['DISCOVERED','AI_PREPARING','FOUNDER_ACTION','SUBMITTED','PENDING','APPROVED','REJECTED','RENEWAL_DUE'] as ComplianceWorkflowState[],
 founderActions:['SIGNATURE','ATTESTATION','IDENTITY_VERIFICATION','PAYMENT_AUTHORIZATION','CONTRACT_ACCEPTANCE','FINAL_PUBLICATION_APPROVAL','COUNSEL_REVIEW'] as FounderActionKind[],
 aiResponsibilities:[
  'discover likely licensing and compliance requirements',
  'assemble checklists and supporting evidence references',
  'prepare draft forms and permission requests',
  'surface only unresolved founder actions',
  'track submission, approval, expiration and renewal state',
  'keep publication and release gates locked while required evidence is unresolved',
 ],
 rule:'AI preparation never substitutes for a required legal signature, attestation, identity verification, payment authorization, contract acceptance, counsel review or final founder approval',
} as const
