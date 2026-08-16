export type WorldRegion='north-america'|'latin-america-caribbean'|'south-america'|'europe'|'africa'|'asia'|'oceania'|'polar'
export type GlobalTravelMode='walk'|'bike'|'car'|'bus'|'subway'|'train'|'high-speed-rail'|'plane'|'boat'|'ferry'|'river'|'holo-portal'
export interface WorldHub { id:string; name:string; region:WorldRegion; countryOrArea:string; kind:'country'|'territory'|'city'|'regional-hub'; travel:GlobalTravelMode[]; languages:string[]; features:string[] }
export interface GlobalTravelerState { avatarId:string; xp:number; inventory:string[]; entitlements:string[]; businesses:string[]; properties:string[]; careers:string[]; missionFlags:string[]; npcRelationshipIds:string[]; accessibilityProfileId?:string; language:string; teenProfileId?:string }

export const GLOBAL_REGIONS:Record<WorldRegion,{label:string;gatewayExamples:string[]}>={
 'north-america':{label:'North America',gatewayExamples:['Chicago','New York','Los Angeles','Toronto','Mexico City']},
 'latin-america-caribbean':{label:'Latin America & Caribbean',gatewayExamples:['San Juan','Kingston','Belize City','Havana','Panama City']},
 'south-america':{label:'South America',gatewayExamples:['Georgetown','Paramaribo','Bogota','Lima','Sao Paulo','Buenos Aires']},
 europe:{label:'Europe',gatewayExamples:['London','Paris','Madrid','Rome','Berlin']},
 africa:{label:'Africa',gatewayExamples:['Lagos','Accra','Dakar','Nairobi','Johannesburg','Cairo']},
 asia:{label:'Asia',gatewayExamples:['Tokyo','Seoul','Singapore','Delhi','Dubai']},
 oceania:{label:'Oceania',gatewayExamples:['Sydney','Auckland','Honolulu','Suva']},
 polar:{label:'Polar & Research Worlds',gatewayExamples:['Antarctic Research Nexus','Arctic Research Nexus']}
}

export const GLOBAL_GAMEPLAY=['StreetVerse / Kingdom Press Living World','Copy Smart NPC','Dynamic + Secret Mission Director','Teen Takeover','SportsOS','Volcano Racers','Creator/Record Label careers','All American Showcase','OmniPlayer + AI TV','live streaming + podcasting','business/property ownership','HoloGPT + Stubbs AI','Quantum Beat','Holographic Overlay','AR/VR/MR','multiplayer parties','cloud save/resume','accessibility','translation','moderation']

export const GLOBAL_TRAVEL_RULES={
 preserve:['avatar','xp','inventory','entitlements','businesses','properties','careers','mission flags','NPC relationships','accessibility','language','teen safety'],
 physicalRoutes:['road','urban transit','rail','high-speed rail','commercial flight','ferry','boat','river'],
 portalRules:['save authoritative state','validate destination entitlement','fade to Holo transition','stream destination scene','restore traveler state','reconnect multiplayer party','resume world simulation'],
 worldStreaming:['country/area registry','regional gateway','city cells','district cells','interior cells','event instances'],
 engineTargets:['Unreal','Unity','Godot','Web/Holo']
}

export const GLOBAL_CAMPAIGNS=[
 {id:'around-world',title:'Around the Living World',regions:Object.keys(GLOBAL_REGIONS),features:['multi-continent story','travel passport achievements','regional sports','creator tour','business expansion','secret missions']},
 {id:'world-champions',title:'World Champions Circuit',regions:Object.keys(GLOBAL_REGIONS),features:['basketball','football','soccer','boxing','MMA','racing','track','baseball','cricket','surfing','regional sports']},
 {id:'world-stage',title:'All American World Stage',regions:Object.keys(GLOBAL_REGIONS),features:['music','dance','film','podcast','live stream','debate','fashion','creator showcases']},
 {id:'world-trade',title:'Living Worlds Business Route',regions:Object.keys(GLOBAL_REGIONS),features:['shops','studios','clubs','garages','properties','logistics','marketplaces','creator businesses']},
 {id:'world-secrets',title:'World Secrets',regions:Object.keys(GLOBAL_REGIONS),features:['rumors','environment clues','Copy Smart NPC knowledge','night/weather gates','hidden portals','multi-country mission chains']}
]

export function canGlobalTravel(state:GlobalTravelerState,destination:WorldHub){
 if(!state.avatarId) return {ok:false,reason:'avatar-required'}
 if(destination.kind==='regional-hub'&&destination.region==='polar'&&!state.entitlements.includes('research-world-access')) return {ok:false,reason:'research-access-required'}
 return {ok:true,reason:'ready'}
}

export function buildTravelTransition(state:GlobalTravelerState,from:WorldHub,to:WorldHub,mode:GlobalTravelMode){
 const allowed=to.travel.includes(mode)||mode==='holo-portal'
 return {allowed,from:from.id,to:to.id,mode,preserve:GLOBAL_TRAVEL_RULES.preserve,stateSnapshot:allowed?state:undefined}
}
