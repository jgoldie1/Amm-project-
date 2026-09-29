import {STREETVERSE_GLOBAL_CITIES,STREETVERSE_GLOBALIZATION_WAVES,GLOBAL_CONVERGENCE_REQUIREMENTS,type StreetVerseCity} from './StreetVerseGlobalRegistry'

export type WorldCompilerStage=
 |'registry'|'geospatial'|'environment'|'mobility'|'population'
 |'business'|'missions'|'media'|'economy'|'accessibility'|'certification'

export interface GlobalWorldModule{
 stage:WorldCompilerStage
 required:string[]
 outputs:string[]
 parallelSafe:boolean
}

export interface CompiledWorldPlan{
 cityId:string
 cityName:string
 status:StreetVerseCity['status']
 modules:GlobalWorldModule[]
 sharedSystems:string[]
 citySpecificSystems:string[]
 releaseGates:string[]
}

const MODULES:GlobalWorldModule[]=[
 {stage:'registry',required:['city id','country','region'],outputs:['city manifest','spawn profile','feature flags'],parallelSafe:true},
 {stage:'geospatial',required:['licensed/open map sources','source metadata'],outputs:['roads','district graph','landmark anchors','terrain/water masks'],parallelSafe:true},
 {stage:'environment',required:['city manifest','geospatial outputs'],outputs:['sky/weather hooks','vegetation profile','building LOD rules','day/night profile'],parallelSafe:true},
 {stage:'mobility',required:['road graph'],outputs:['walk graph','traffic lanes','transit abstractions','vehicle spawn rules'],parallelSafe:true},
 {stage:'population',required:['district graph','privacy rules'],outputs:['synthetic NPC populations','crowd zones','activity schedules'],parallelSafe:true},
 {stage:'business',required:['Business Passport schema','owner authorization'],outputs:['business anchors','QR entry points','Business Twin slots','marketplace hooks'],parallelSafe:true},
 {stage:'missions',required:['city systems','content rules'],outputs:['city missions','jobs','creator/business challenges','tourism/culture missions'],parallelSafe:true},
 {stage:'media',required:['TRYAMM media registry'],outputs:['StreetVerse Radio','local/global news slots','Holo LIVE surfaces','TRYAMM TV placement'],parallelSafe:true},
 {stage:'economy',required:['verified checkout','rights/split policies','ledger'],outputs:['Holo Ads inventory','commerce hooks','creator/business revenue events','settlement references'],parallelSafe:true},
 {stage:'accessibility',required:['shared accessibility platform'],outputs:['one-hand controls','captions','voice hooks','translation hooks','reduced-motion/LOD profiles'],parallelSafe:true},
 {stage:'certification',required:['module outputs','automated tests','mobile performance checks'],outputs:['release manifest','known limitations','go/no-go evidence'],parallelSafe:false},
]

const SHARED_SYSTEMS=[
 'TRYAMM Passport','auth','entitlements','internal ledger','Holo Ads',
 'TRYAMM TV','StreetVerse Radio','News','Holo LIVE','Reels',
 'Marketplace','QR Scout attribution','rights router','accessibility platform',
]

const CITY_SPECIFIC=[
 'map/road geometry','landmarks','weather profile','transport flavor','vegetation',
 'local businesses','missions/jobs','local media programming','culture/language configuration',
]

export const compileGlobalWorld=(cityId:string):CompiledWorldPlan=>{
 const city=STREETVERSE_GLOBAL_CITIES.find(c=>c.id===cityId)
 if(!city)throw new Error(`Unknown StreetVerse city: ${cityId}`)
 return{
  cityId:city.id,cityName:city.name,status:city.status,
  modules:MODULES,
  sharedSystems:SHARED_SYSTEMS,
  citySpecificSystems:CITY_SPECIFIC,
  releaseGates:[
   'source and rights metadata present',
   'no sensitive infrastructure or private-resident leakage',
   'mobile navigation/playability test passes',
   'city-specific media/business hooks resolve',
   'payments/revenue remain server-authoritative',
   'accessibility baseline passes',
   'performance and crash gates pass before production label',
  ],
 }
}

export const compileAllGlobalWorlds=()=>STREETVERSE_GLOBAL_CITIES.map(city=>compileGlobalWorld(city.id))

export const GLOBAL_WORLD_COMPILER={
 mode:'parallel-city-build',
 referenceCity:'chicago',
 firstGlobalWave:['lagos','abuja','accra','nairobi','johannesburg','addis-ababa'],
 waves:STREETVERSE_GLOBALIZATION_WAVES,
 convergenceRequirements:GLOBAL_CONVERGENCE_REQUIREMENTS,
 principle:'One shared engine and service fabric; city manifests provide local identity rather than forking separate games.',
 modules:MODULES,
 sharedSystems:SHARED_SYSTEMS,
 citySpecificSystems:CITY_SPECIFIC,
} as const
