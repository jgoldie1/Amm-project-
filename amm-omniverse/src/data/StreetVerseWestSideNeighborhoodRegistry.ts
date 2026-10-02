export type WestSideCommunityAreaId=23|24|25|26|27|28|29|30|31

export interface WestSideCommunityArea{
  id:WestSideCommunityAreaId
  slug:string
  name:string
  phase:1|2|3
  gameplayFocus:string[]
  signature:string[]
  syntheticWorldAnchor:{x:number;z:number}
  sourceStatus:'registry-ready'|'source-ingest-next'
}

export const WEST_SIDE_COMMUNITY_AREAS:WestSideCommunityArea[]=[
  {id:28,slug:'near-west-side',name:'Near West Side',phase:1,gameplayFocus:['Circle Park / ABLA','Taylor Street','Roosevelt Road','UIC / Medical District','school','creator/business missions'],signature:['brick residential','institutional campuses','mixed-use corridors','parks','CTA/transit'],syntheticWorldAnchor:{x:-18,z:8},sourceStatus:'registry-ready'},
  {id:31,slug:'lower-west-side',name:'Lower West Side',phase:1,gameplayFocus:['Pilsen','arts','murals','music','food','small business'],signature:['murals','two-flats','industrial/mixed-use','storefront corridors'],syntheticWorldAnchor:{x:8,z:28},sourceStatus:'registry-ready'},
  {id:29,slug:'north-lawndale',name:'North Lawndale',phase:1,gameplayFocus:['community restoration','schools','jobs','business','transit'],signature:['boulevards','brick homes','vacant-lot redevelopment','community institutions'],syntheticWorldAnchor:{x:-42,z:28},sourceStatus:'source-ingest-next'},
  {id:30,slug:'south-lawndale',name:'South Lawndale',phase:1,gameplayFocus:['Little Village corridor','business','family','food','community events'],signature:['dense storefronts','brick housing','commercial corridors','community gathering spaces'],syntheticWorldAnchor:{x:-42,z:52},sourceStatus:'source-ingest-next'},
  {id:27,slug:'east-garfield-park',name:'East Garfield Park',phase:2,gameplayFocus:['Garfield Park','transit','community missions','restoration'],signature:['park edge','boulevards','brick residential','institutional/community buildings'],syntheticWorldAnchor:{x:-68,z:6},sourceStatus:'source-ingest-next'},
  {id:26,slug:'west-garfield-park',name:'West Garfield Park',phase:2,gameplayFocus:['business','jobs','housing','public safety','community support'],signature:['brick residential','commercial corridors','rail/viaduct edges','community facilities'],syntheticWorldAnchor:{x:-68,z:30},sourceStatus:'source-ingest-next'},
  {id:25,slug:'austin',name:'Austin',phase:2,gameplayFocus:['large neighborhood hub','business','housing','schools','transit','sports'],signature:['residential blocks','commercial avenues','parks','schools','transit corridors'],syntheticWorldAnchor:{x:-92,z:18},sourceStatus:'source-ingest-next'},
  {id:23,slug:'humboldt-park',name:'Humboldt Park',phase:3,gameplayFocus:['park','culture','music','food','community events'],signature:['large park','boulevards','brick residential','storefront corridors'],syntheticWorldAnchor:{x:-88,z:-14},sourceStatus:'source-ingest-next'},
  {id:24,slug:'west-town',name:'West Town',phase:3,gameplayFocus:['creator economy','nightlife','restaurants','retail','music'],signature:['dense mixed-use','storefronts','apartments','industrial conversions'],syntheticWorldAnchor:{x:-46,z:-16},sourceStatus:'source-ingest-next'},
]

export const WEST_SIDE_STORY_ANCHORS=[
  {id:'circle-park-abla',label:'Circle Park / ABLA',communityAreaId:28,kind:'spawn'},
  {id:'taylor-street',label:'Taylor Street',communityAreaId:28,kind:'corridor'},
  {id:'roosevelt-road',label:'Roosevelt Road',communityAreaId:28,kind:'corridor'},
  {id:'uic-medical',label:'UIC / Medical District',communityAreaId:28,kind:'institutional'},
  {id:'pilsen',label:'Pilsen',communityAreaId:31,kind:'district'},
  {id:'little-village',label:'Little Village',communityAreaId:30,kind:'district'},
  {id:'garfield-park',label:'Garfield Park',communityAreaId:27,kind:'park'},
] as const

export const WEST_SIDE_BUILD_ORDER=[
  'Near West Side / Circle Park visible quality pass',
  'Lower West Side / Pilsen visible quality pass',
  'North Lawndale + South Lawndale streaming cells',
  'East Garfield Park + West Garfield Park streaming cells',
  'Austin streaming cells',
  'Humboldt Park + West Town streaming cells',
  'source-backed storefront/business population',
  'citywide mission and transit continuity',
] as const

export const WEST_SIDE_SOURCE_POLICY={
  geometry:['City of Chicago open data','OpenStreetMap-compatible geometry with attribution'],
  transit:['CTA/GTFS or other authorized transit data'],
  visualReference:['founder/user-owned photos','licensed photos','Google Street View as human reference/QA only'],
  streetViewRule:'Do not scrape, download, trace into distributable textures, or treat Street View imagery as a game asset. Use it only as a visual QA/reference unless a separate licensed integration is approved.',
  generatedAssets:'Meshy/TRYAMM-generated assets must be original and source/provenance tagged.',
  realBusinesses:'Use current business data only where authorized; otherwise use clearly fictionalized storefronts.',
  realPeople:'No tracked resident likenesses; named real-person characters require the separate likeness authorization lane.',
} as const

export function westSideAreaById(id:number){
  return WEST_SIDE_COMMUNITY_AREAS.find(area=>area.id===id)
}

export function westSideAreasForPhase(phase:1|2|3){
  return WEST_SIDE_COMMUNITY_AREAS.filter(area=>area.phase===phase)
}
