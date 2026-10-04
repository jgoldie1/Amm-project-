export type ExpansionStatus='live'|'building'|'planned'
export type ExpansionNode=Readonly<{
 id:string
 label:string
 level:'illinois'|'state'
 region:string
 status:ExpansionStatus
 detail:string
}>

export const ILLINOIS_STREETVERSE_HUBS:readonly ExpansionNode[]=[
 {id:'chicago',label:'Chicago',level:'illinois',region:'Northeast Illinois',status:'live',detail:'Reference city with all 77 community areas, transit, campuses, businesses, missions and creator systems.'},
 {id:'rockford',label:'Rockford',level:'illinois',region:'Northern Illinois',status:'planned',detail:'City compiler target for neighborhoods, manufacturing, business, culture, mobility and creator missions.'},
 {id:'aurora',label:'Aurora',level:'illinois',region:'Northeast Illinois',status:'planned',detail:'Fox Valley city build with neighborhoods, business, transit and community missions.'},
 {id:'joliet',label:'Joliet',level:'illinois',region:'Northeast Illinois',status:'planned',detail:'Southwest metro city build with logistics, neighborhoods, business and mobility.'},
 {id:'naperville',label:'Naperville',level:'illinois',region:'Northeast Illinois',status:'planned',detail:'Suburban city build with business, residential, education and mobility systems.'},
 {id:'elgin',label:'Elgin',level:'illinois',region:'Northeast Illinois',status:'planned',detail:'Fox River city build with business, housing, culture and transit missions.'},
 {id:'peoria',label:'Peoria',level:'illinois',region:'Central Illinois',status:'planned',detail:'Central Illinois city build with healthcare, manufacturing, riverfront, business and community missions.'},
 {id:'springfield',label:'Springfield',level:'illinois',region:'Central Illinois',status:'building',detail:'State-capital build with UIS, civic districts, business, history and public-service missions.'},
 {id:'champaign-urbana',label:'Champaign-Urbana',level:'illinois',region:'East-Central Illinois',status:'building',detail:'UIUC campus-city network with research, business, creator, agriculture and technology missions.'},
 {id:'bloomington-normal',label:'Bloomington-Normal',level:'illinois',region:'Central Illinois',status:'planned',detail:'Twin-city build with education, business, insurance, transport and community missions.'},
 {id:'quad-cities',label:'Illinois Quad Cities',level:'illinois',region:'Northwest Illinois',status:'planned',detail:'Rock Island/Moline regional build with river, manufacturing, business and mobility systems.'},
 {id:'decatur',label:'Decatur',level:'illinois',region:'Central Illinois',status:'planned',detail:'Industry, agriculture, neighborhoods and workforce mission build.'},
 {id:'metro-east',label:'Metro East',level:'illinois',region:'Southwest Illinois',status:'building',detail:'SIUE, East St. Louis, Alton and regional business/community mission network.'},
 {id:'carbondale',label:'Carbondale',level:'illinois',region:'Southern Illinois',status:'building',detail:'SIU Carbondale campus-city network with education, research, business and outdoor missions.'},
 {id:'southern-illinois',label:'Southern Illinois',level:'illinois',region:'Southern Illinois',status:'planned',detail:'Regional compiler for towns, counties, parks, agriculture, tourism, business and community missions.'},
]

export const US_STATE_NAMES=[
 'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
 'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
 'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
 'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
 'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
] as const

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export const US_STREETVERSE_STATES:readonly ExpansionNode[]=US_STATE_NAMES.map(label=>({
 id:slug(label),
 label,
 level:'state' as const,
 region:'United States',
 status:(label==='Illinois'?'building':label==='California'||label==='New York'?'planned':'planned') as ExpansionStatus,
 detail:label==='Illinois'
  ?'Primary state expansion anchored by Chicago, statewide Illinois hubs and CampusVerse.'
  :`${label} state compiler target: cities, neighborhoods, roads, mobility, businesses, campuses, missions, media, economy and accessibility.`,
}))

export const STREETVERSE_EXPANSION_RULES={
 hierarchy:['west-side','chicago-77','illinois','united-states','global'] as const,
 reuseOneSharedEngine:true,
 cityAndNeighborhoodDataRemainManifestDriven:true,
 noClaimThatPlannedRegionsAreAlreadyBuilt:true,
 sourceBackedGeospatialReconstructionRequiredForCertification:true,
 mobileAndAccessibilityCertificationRequired:true,
} as const
