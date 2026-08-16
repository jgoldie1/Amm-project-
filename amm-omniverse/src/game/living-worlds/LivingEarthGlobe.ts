export type GlobeLayer='earth'|'continent'|'region'|'country'|'territory'|'city'|'district'|'property'|'interior'
export type TravelMode='walk'|'bike'|'car'|'bus'|'subway'|'rail'|'high-speed-rail'|'plane'|'boat'|'ferry'|'river'|'holo-portal'

export interface GeoPoint { lat:number; lon:number }
export interface LivingDestination {
 id:string; name:string; layer:GlobeLayer; parentId?:string; center:GeoPoint; languages:string[];
 travel:TravelMode[]; sceneId:string; teenTakeover:boolean; smartNpc:boolean; secretMissions:boolean;
}
export interface PlayerWorldState {
 playerId:string; destinationId:string; avatarId:string; xp:number; inventoryIds:string[];
 propertyIds:string[]; businessIds:string[]; relationshipIds:string[]; discoveredSecretIds:string[];
 locale:string; accessibilityProfileId:string; teenProfileId?:string;
}
export interface GlobeCamera { lat:number; lon:number; altitudeKm:number; zoom:number }

export const EARTH_RADIUS_KM=6371
export const globeLayers:GlobeLayer[]=['earth','continent','region','country','territory','city','district','property','interior']

export function clampCamera(c:GlobeCamera):GlobeCamera {
 return {...c,lat:Math.max(-90,Math.min(90,c.lat)),lon:((c.lon+540)%360)-180,altitudeKm:Math.max(.05,c.altitudeKm),zoom:Math.max(0,Math.min(24,c.zoom))}
}

export function haversineKm(a:GeoPoint,b:GeoPoint){
 const r=Math.PI/180,dLat=(b.lat-a.lat)*r,dLon=(b.lon-a.lon)*r
 const x=Math.sin(dLat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2
 return 2*EARTH_RADIUS_KM*Math.asin(Math.sqrt(x))
}

export function recommendedTravel(distanceKm:number):TravelMode[]{
 if(distanceKm<2) return ['walk','bike','car','bus','holo-portal']
 if(distanceKm<50) return ['bike','car','bus','subway','rail','holo-portal']
 if(distanceKm<800) return ['car','bus','rail','high-speed-rail','plane','boat','holo-portal']
 return ['plane','boat','holo-portal']
}

export function beginWorldTransfer(state:PlayerWorldState,to:LivingDestination){
 return {phase:'save' as const,from:state.destinationId,to:to.id,sceneId:to.sceneId,preserve:['avatarId','xp','inventoryIds','propertyIds','businessIds','relationshipIds','discoveredSecretIds','locale','accessibilityProfileId','teenProfileId']}
}

export function enterDestination(state:PlayerWorldState,to:LivingDestination):PlayerWorldState {
 return {...state,destinationId:to.id}
}

export const globeRuntime={
 renderer:'streamed-3d-globe',
 engineTargets:['unreal','unity','godot','web-holo'],
 selection:['rotate','pan','zoom','search','voice-search','accessible-list'],
 overlays:['countries','territories','cities','transit','sports','missions','businesses','properties','teen-takeover','holo-portals'],
 streaming:{planetLod:true,countryLod:true,cityCells:true,interiorOnDemand:true,predictivePreload:true},
 continuity:{cloudSave:true,multiplayerPartyTravel:true,npcRelationships:true,missionConsequences:true},
 accessibility:['one-hand','voice-navigation','screen-reader-map-list','captions','audio-description','high-contrast','reduced-motion','translation'],
 safety:{teenLaneIsolation:true,privateLocationByDefault:true,ageAppropriateMissions:true,moderatedSocial:true},
 status:'runtime-foundation'
} as const
