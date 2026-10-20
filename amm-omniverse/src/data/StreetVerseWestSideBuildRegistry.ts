import type {BuildingPassport,BuildingSource} from '../game/runtime/holographicBuildingReconstruction'
import type {CADBuildRequest,FacadeWrapSource} from '../runtime/StreetVerseCADHoloBuildPipeline'

export type WestSideBuildZoneId=
  |'circle-park'
  |'jefferson-school'
  |'roosevelt-taylor'
  |'university-village-little-italy'
  |'pilsen'
  |'illinois-medical-district'
  |'near-west-side'

export type WestSideBuildZone={
  id:WestSideBuildZoneId
  label:string
  kind:'campus'|'school'|'corridor'|'neighborhood'|'district'
  priority:1|2|3
  mode:'generated-gameplay'|'reference-reconstruction'|'authorized-photoreal'
  streamingCells:string[]
  gameplay:['missions','residents','vehicles','businesses','emergency','creator']
  notes:string[]
}

export const WEST_SIDE_BUILD_ZONES:WestSideBuildZone[]=[
  {
    id:'circle-park',label:'Circle Park',kind:'campus',priority:1,mode:'generated-gameplay',
    streamingCells:['circle-park-core','circle-park-residential','circle-park-mobility'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Keep current resident interiors private.','Use generated gameplay geometry immediately; upgrade exterior accuracy only from cleared references.'],
  },
  {
    id:'jefferson-school',label:'Thomas Jefferson Legacy School Campus',kind:'school',priority:1,mode:'generated-gameplay',
    streamingCells:['jefferson-exterior','jefferson-classrooms','jefferson-gym'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Gameplay school includes classrooms, gym, hallways and accessibility routes.','Do not represent current security systems.'],
  },
  {
    id:'roosevelt-taylor',label:'Roosevelt / Taylor Street Gameplay Corridor',kind:'corridor',priority:1,mode:'generated-gameplay',
    streamingCells:['roosevelt-west','taylor-west','corridor-transit'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Prioritize drivable streets, storefront shells, transit, sidewalks and emergency access.'],
  },
  {
    id:'university-village-little-italy',label:'University Village / Little Italy',kind:'neighborhood',priority:2,mode:'reference-reconstruction',
    streamingCells:['uv-little-italy-west','uv-little-italy-east'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Build in streaming cells; exact facades require cleared sources.'],
  },
  {
    id:'pilsen',label:'Pilsen Gameplay District',kind:'neighborhood',priority:2,mode:'reference-reconstruction',
    streamingCells:['pilsen-north','pilsen-core','pilsen-south'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Preserve cultural specificity through reviewed, authorized references and original TRYAMM assets.'],
  },
  {
    id:'illinois-medical-district',label:'Illinois Medical District Gameplay Zone',kind:'district',priority:3,mode:'reference-reconstruction',
    streamingCells:['imd-west','imd-core','imd-east'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Use public-facing gameplay shells; do not model sensitive non-public operational/security details.'],
  },
  {
    id:'near-west-side',label:'Near West Side Expansion Grid',kind:'district',priority:3,mode:'generated-gameplay',
    streamingCells:['nws-grid-a','nws-grid-b','nws-grid-c','nws-grid-d'],
    gameplay:['missions','residents','vehicles','businesses','emergency','creator'],
    notes:['Fill gaps with original gameplay buildings, then progressively replace with verified reconstruction assets.'],
  },
]

const generatedSource=(id:string,label:string):BuildingSource=>({
  id:`tryamm-generated-${id}`,
  kind:'measurement',
  uri:`tryamm://streetverse/generated/${id}`,
  authorized:true,
  notes:`${label} generated gameplay/blockout source. This is not evidence of exact real-world facade or interior geometry.`,
})

function generatedPassport(zone:WestSideBuildZone):BuildingPassport{
  const levelCount=zone.kind==='school'?3:zone.kind==='campus'?4:zone.kind==='corridor'?2:3
  const levels=Array.from({length:levelCount},(_,index)=>({
    id:`level-${index}`,
    label:index===0?'Ground':`Level ${index+1}`,
    elevationM:index*3.4,
    heightM:3.4,
    roomIds:index===0?['public-lobby','gameplay-room-a','gameplay-room-b']:['gameplay-room-a','gameplay-room-b'],
  }))
  const behaviors:BuildingPassport['behaviors']=[
    {id:'main-door',kind:'door',levelId:'level-0',interactive:true,accessibility:{wheelchairReachable:true,oneHandOperable:true,visualCueRequired:true}},
    {id:'main-stairs',kind:'stairs',levelId:'level-0',interactive:true,accessibility:{visualCueRequired:true}},
    {id:'main-lighting',kind:'light',levelId:'level-0',interactive:true},
  ]
  if(zone.kind==='campus'||zone.kind==='school'){
    behaviors.push({id:'accessible-elevator',kind:'elevator',levelId:'level-0',interactive:true,accessibility:{wheelchairReachable:true,oneHandOperable:true,visualCueRequired:true}})
    behaviors.push({id:'public-restroom-sink',kind:'sink',levelId:'level-0',interactive:true,accessibility:{wheelchairReachable:true,oneHandOperable:true}})
    behaviors.push({id:'public-restroom-toilet',kind:'toilet',levelId:'level-0',interactive:true,accessibility:{wheelchairReachable:true,oneHandOperable:true}})
    behaviors.push({id:'main-hvac',kind:'hvac',levelId:'level-0',interactive:false})
  }
  return{
    id:`west-side-${zone.id}-generated-passport`,
    name:zone.label,
    city:'Chicago',
    communityArea:'West Side gameplay expansion',
    sourceProvenance:[generatedSource(zone.id,zone.label)],
    levels,
    behaviors,
    behaviorEdges:[
      {from:'main-door',to:'main-stairs',relation:'navigates-to'},
      ...(behaviors.some(item=>item.id==='accessible-elevator')?[{from:'main-door',to:'accessible-elevator',relation:'navigates-to' as const}]:[]),
      ...(behaviors.some(item=>item.id==='public-restroom-sink')?[{from:'public-restroom-sink',to:'public-restroom-toilet',relation:'drains-to' as const}]:[]),
    ],
    reconstruction:{
      geometryConfidence:zone.mode==='generated-gameplay'?0.35:0.2,
      facadeConfidence:0.1,
      interiorConfidence:0.15,
      uncertainRegions:['exact facade','exact footprint','exact interior dimensions','non-public building systems'],
    },
    optimization:{
      mobileTriangleBudget:45000,
      desktopTriangleBudget:140000,
      textureBudgetMb:48,
      lodLevels:3,
      streamingCell:zone.streamingCells[0],
    },
    safety:{
      emergencyExitNodeIds:['main-door'],
      accessibleRouteNodeIds:['main-door',...(behaviors.some(item=>item.id==='accessible-elevator')?['accessible-elevator']:[])],
      adultPrivateZonesRequireVerifiedAdultConsent:true,
    },
  }
}

export function westSideBuildRequest(zoneId:WestSideBuildZoneId):CADBuildRequest{
  const zone=WEST_SIDE_BUILD_ZONES.find(item=>item.id===zoneId)
  if(!zone)throw new Error('unknown-west-side-build-zone')
  const passport=generatedPassport(zone)
  const sources=passport.sourceProvenance
  const facadeWraps:FacadeWrapSource[]=[]
  return{
    id:`west-side-${zone.id}`,
    name:zone.label,
    city:'Chicago',
    district:'West Side',
    passport,
    sources,
    facadeWraps,
    target:'streetverse',
    fidelity:'balanced',
    includeInteriors:zone.kind==='campus'||zone.kind==='school',
    includeUtilities:zone.kind==='campus'||zone.kind==='school',
    includeInteractiveRigging:true,
    requestedBy:'system',
  }
}

export function westSideBuildWave(priority:1|2|3){
  return WEST_SIDE_BUILD_ZONES.filter(zone=>zone.priority<=priority).map(zone=>westSideBuildRequest(zone.id))
}

export const WEST_SIDE_BUILD_POLICY={
  progressiveReplacement:'Generated gameplay blockout → reviewed CAD shell → authorized facade wrap → interactive rig → optimized GLB.',
  googleStreetView:'Use for human navigation/reference only; do not scrape Street View pixels into persistent textures.',
  currentResidentPrivacy:'Do not reconstruct private current-resident interiors without authorization.',
  sensitiveInfrastructure:'Do not publish current non-public security or sensitive operational building systems.',
  photorealisticDefinition:'Photorealistic visual treatment may use original/authorized materials; exact real-world reproduction requires verified source truth.',
} as const
