'use strict';

const DEFAULT_LAYERS = [
  'BOUNDARY','ROADS','SIDEWALKS','BUILDINGS','LANDMARKS','TRANSIT','BUSINESSES','PROPERTIES','NPC_POPULATION','TRAFFIC','MISSIONS','CREATOR_LOCATIONS','MARKETPLACE','JOBS','DAY_NIGHT','ACCESSIBILITY','ECONOMY','STREAMING_LOD'
];

const SOURCE_POLICY = Object.freeze({
  boundary:{preferred:'CITY_OF_CHICAGO_COMMUNITY_AREAS',use:'authoritative geographic slice boundary'},
  roadsAndBuildings:{preferred:['OPENSTREETMAP','CITY_OF_CHICAGO_OPEN_DATA','OTHER_PROPERLY_LICENSED_DATA'],use:'compiler geometry inputs subject to source license and attribution'},
  transit:{preferred:['CTA_GTFS','CTA_PUBLIC_API','OTHER_AUTHORIZED_TRANSIT_FEEDS'],use:'stations, routes, service state and mobility mission anchors'},
  businesses:{preferred:['TRYAMM_BUSINESS_PASSPORT','CITY_LICENSE_DATA','AUTHORIZED_PLACE_PROVIDER'],use:'business discovery, merchant onboarding, jobs, delivery and digital twins'},
  properties:{preferred:['PUBLIC_PARCEL_DATA','AUTHORIZED_PROPERTY_PROVIDER','TRYAMM_OWNER_INPUT'],use:'property/gameplay anchors only when licensing and privacy requirements permit'},
  googleMaps:{
    products:['ROADMAP','SATELLITE','STREET_VIEW','PHOTOREALISTIC_3D_TILES'],
    role:'VISUALIZATION_REFERENCE_ONLY',
    allowed:['interactive basemap or panorama shown to the user','manual visual QA by authorized editors','orientation, wayfinding and location context','Street View panorama handoff with required attribution and report-problem link','overlay of independently-created TRYAMM objects where Google policy permits'],
    prohibited:['machine vision or image analysis of Google Map Tiles or Street View','object detection or feature extraction from Google imagery','tracing Google building outlines or creating derivative geometry from Google imagery','pre-fetching, bulk caching or offline replication of Google map content','using Google imagery as owned game textures or reselling it'],
    attributionRequired:true,
    extractionAllowed:false
  }
});

function normalizeArea(area){
  if(!area||!area.name) throw new Error('Neighborhood Compiler requires a community area');
  const number=Number(area.number);
  if(!Number.isInteger(number)||number<1||number>77) throw new Error('Chicago community area number must be 1-77');
  return {id:area.id||`CHI-${String(number).padStart(2,'0')}`,number,name:String(area.name),boundary:area.boundary||null};
}

function buildStreetViewReference(area,options={}){
  const normalized=normalizeArea(area);
  return {enabled:options.enabled!==false,mode:'VISUAL_REFERENCE',provider:'GOOGLE_MAPS_PLATFORM',product:'STREET_VIEW',areaId:normalized.id,areaName:normalized.name,panoramaSearch:{strategy:'ON_DEMAND_NEAR_SELECTED_LOCATION',maxCandidatesPerRequest:100,persistOnly:['panoId','lat','lng','heading','date','copyright','reportProblemLink']},editorUses:['confirm street character and orientation','visually review entrances, storefront context and streetscape','compare generated TRYAMM scene against current public-facing context','flag generated-scene mismatches for human correction'],compilerInput:false,machineInterpretation:false,deriveGeometry:false,attributionRequired:true,reportProblemLinkRequired:true};
}

function buildNeighborhoodSlice(area,options={}){
  const normalized=normalizeArea(area);
  const quality=options.quality||'MOBILE_FIRST';
  const populationBudget=Number.isInteger(options.populationBudget)?options.populationBudget:48;
  const trafficBudget=Number.isInteger(options.trafficBudget)?options.trafficBudget:24;
  return {
    schemaVersion:1,compiler:'TRYAMM_NEIGHBORHOOD_COMPILER',city:'Chicago',communityArea:normalized,
    target:{status:options.targetStatus||'PLAYABLE',quality,mobileFirst:true,oneHandedControls:true,reducedMotionFallback:true},
    sourcePolicy:SOURCE_POLICY,
    reference:{googleStreetView:buildStreetViewReference(normalized,{enabled:options.streetView!==false}),googlePhotorealistic3D:{enabled:options.googlePhotorealistic3D!==false,role:'OPTIONAL_VISUALIZATION_BASEMAP',deriveTryammGeometry:false,attributionRequired:true}},
    ingest:{boundary:['CITY_OF_CHICAGO_COMMUNITY_AREAS'],roads:['OPENSTREETMAP','CITY_OF_CHICAGO_OPEN_DATA'],buildings:['OPENSTREETMAP','PERMITTED_BUILDING_FOOTPRINTS'],transit:['CTA_GTFS','CTA_PUBLIC_API'],businesses:['TRYAMM_BUSINESS_PASSPORT','CITY_BUSINESS_LICENSES','AUTHORIZED_PLACE_PROVIDER'],properties:['PUBLIC_PARCEL_DATA','AUTHORIZED_PROPERTY_PROVIDER','TRYAMM_OWNER_INPUT']},
    compile:{layers:[...DEFAULT_LAYERS],geometry:{roads:'generate navigable road graph from permitted vector data',sidewalks:'derive playable sidewalk graph from permitted geometry and procedural rules',buildings:'generate TRYAMM-owned building meshes from permitted footprints + procedural facade kits',interiors:'lazy-load only for mission/property/business interiors',landmarks:'use original or properly licensed assets only'},simulation:{npcPopulationBudget:populationBudget,trafficVehicleBudget:trafficBudget,pedestrianLod:true,vehicleLod:true,dayNight:true,weatherHooks:true},economy:{businessPassport:true,marketplace:true,delivery:true,middleverseJobs:true,creatorCommerce:true,propertyHooks:true,authoritativeRewards:true,clientCashAwards:false},gameplay:{missionAnchors:['TRANSIT','BUSINESS','CREATOR','DELIVERY','PROPERTY','COMMUNITY','SPORTS'],creatorCapture:true,reelHandoff:true,raceHooks:true,mobilityHooks:true}},
    stream:{strategy:'ACTIVE_AREA_PLUS_NEIGHBORS',activeCommunityArea:normalized.id,loadRadius:options.loadRadius||1,unloadOutsideRadius:true,preservePlayerState:true,preserveMissionState:true,preserveEconomyState:true},
    certification:{required:['BOUNDARY_LOADED','ROAD_GRAPH_VALID','PLAYER_SPAWN_VALID','WALK_DRIVE_VALID','TRANSIT_HOOK_VALID','BUSINESS_HOOK_VALID','MISSION_COMPLETE_VALID','AUTHORITATIVE_REWARD_VALID','REEL_HANDOFF_VALID','MOBILE_VIEWPORT_VALID'],status:'NOT_CERTIFIED'}
  };
}

function buildChicago77Compilation(registry,options={}){
  if(!Array.isArray(registry)||registry.length!==77) throw new Error('Chicago 77 compilation requires all 77 community areas');
  return {city:'Chicago',compiler:'TRYAMM_NEIGHBORHOOD_COMPILER',slices:registry.map(area=>buildNeighborhoodSlice(area,options)),rollout:{proofOrder:options.proofOrder||['The Loop','Hyde Park','Austin','Rogers Park'],strategy:'CERTIFY_ONE_REUSABLE_PIPELINE_THEN_SCALE_TO_77',allAreasMustPassSameCertification:true}};
}

module.exports={DEFAULT_LAYERS,SOURCE_POLICY,normalizeArea,buildStreetViewReference,buildNeighborhoodSlice,buildChicago77Compilation};
