export type ChicagoGridZone={
 id:string;label:string;grid:string;kind:'spawn'|'corridor'|'district'|'landmark';x:number;z:number;
 radius:number;buildable:boolean;description:string
}
export const CIRCLE_PARK_SPAWN={x:0,z:54,label:'Circle Park',grid:'CP-01'} as const
export const CHICAGO_BUILD_GRID:ChicagoGridZone[]=[
 {id:'circle-park',label:'Circle Park',grid:'CP-01',kind:'spawn',x:0,z:54,radius:16,buildable:true,description:'Default StreetVerse Chicago neighborhood spawn and onboarding hub.'},
 {id:'jefferson-school',label:'Thomas Jefferson School',grid:'TJ-01',kind:'landmark',x:25,z:33,radius:16,buildable:true,description:'Playable school reconstruction, learning, school-life and community mission anchor.'},
 {id:'roosevelt-road',label:'Roosevelt Road',grid:'RR-01',kind:'corridor',x:0,z:38,radius:34,buildable:true,description:'East-west business, transit, delivery and story corridor.'},
 {id:'taylor-street',label:'Taylor Street / Little Italy',grid:'TS-01',kind:'corridor',x:0,z:12,radius:32,buildable:true,description:'Neighborhood food, business, family, creator and history corridor.'},
 {id:'pilsen',label:'Pilsen',grid:'PL-01',kind:'district',x:-48,z:-20,radius:28,buildable:true,description:'Arts, music, food, murals, small-business and community mission district.'},
 {id:'near-west',label:'Near West Side',grid:'NW-01',kind:'district',x:-8,z:18,radius:34,buildable:true,description:'Connector district for Circle Park, Roosevelt, Taylor, UIC and downtown routes.'},
 {id:'uic-east',label:'UIC East Campus',grid:'UIC-E',kind:'landmark',x:42,z:30,radius:28,buildable:true,description:'Student Center East, Daley Library, classroom, student-life and CollegeBook mission district.'},
 {id:'uic-west',label:'UIC West Campus',grid:'UIC-W',kind:'district',x:-40,z:34,radius:38,buildable:true,description:'Health-sciences campus with medicine, pharmacy, dentistry, nursing, hospital, outpatient care, fitness and transit.'},
 {id:'medical-district',label:'Illinois Medical District',grid:'IMD-01',kind:'district',x:-52,z:24,radius:42,buildable:true,description:'Hospital, emergency response, clinical education, health workforce and transport mission district.'},
 {id:'malcolm-x',label:'Malcolm X College',grid:'MXC-01',kind:'landmark',x:-62,z:40,radius:26,buildable:true,description:'Health sciences, nursing, virtual hospital, career and transfer mission campus.'},
 {id:'malcolm-x-west',label:'Malcolm X West Campus',grid:'MXW-01',kind:'landmark',x:-78,z:42,radius:24,buildable:true,description:'West Side workforce, adult education, community health and skills mission campus.'},
 {id:'north-lawndale',label:'North Lawndale',grid:'NL-01',kind:'district',x:-62,z:2,radius:42,buildable:true,description:'Housing, schools, parks, businesses, restoration, transit and community missions.'},
 {id:'east-garfield-park',label:'East Garfield Park',grid:'EGP-01',kind:'district',x:-72,z:20,radius:40,buildable:true,description:'Garfield Park gateway, housing, transit, commerce and neighborhood missions.'},
 {id:'west-garfield-park',label:'West Garfield Park',grid:'WGP-01',kind:'district',x:-82,z:20,radius:40,buildable:true,description:'Residential, business, public-service and mobility expansion district.'},
 {id:'austin',label:'Austin',grid:'AUS-01',kind:'district',x:-86,z:38,radius:52,buildable:true,description:'Large West Side residential/business district with schools, parks and transit.'},
 {id:'humboldt-park',label:'Humboldt Park',grid:'HP-01',kind:'district',x:-62,z:54,radius:44,buildable:true,description:'Park, cultural, residential, business and community-event expansion.'},
 {id:'west-town',label:'West Town',grid:'WT-01',kind:'district',x:-38,z:52,radius:42,buildable:true,description:'Businesses, housing, creator spaces, restaurants and nightlife routes.'},
 {id:'douglass-park',label:'Douglass Park',grid:'DP-01',kind:'landmark',x:-52,z:-8,radius:30,buildable:true,description:'Sports, recreation, community events and neighborhood mission anchor.'},
 {id:'union-park',label:'Union Park',grid:'UP-01',kind:'landmark',x:-28,z:34,radius:26,buildable:true,description:'Park, event, transit and Near West Side connector mission anchor.'},
 {id:'west-side-transit',label:'West Side CTA + Bus Network',grid:'CTA-W',kind:'corridor',x:-55,z:28,radius:76,buildable:true,description:'CTA rail, buses, stops, stations, transit jobs and mission connections.'},
 {id:'west-side-expansion',label:'West Side Expansion',grid:'WS-02',kind:'district',x:-70,z:5,radius:70,buildable:true,description:'Continuous neighborhood expansion through Garfield Park, North Lawndale, Austin and surrounding West Side districts.'},
]
export function nearestChicagoGridZone(x:number,z:number){
 return [...CHICAGO_BUILD_GRID].map(zone=>({...zone,distance:Math.hypot(zone.x-x,zone.z-z)})).sort((a,b)=>a.distance-b.distance)[0]
}
export function gameGridCell(x:number,z:number){
 const col=Math.floor((x+88)/22),row=Math.floor((z+88)/22)
 return `${String.fromCharCode(65+Math.max(0,Math.min(7,col)))}${Math.max(1,Math.min(8,row+1))}`
}


export type ChicagoVisualConnector={
 id:string
 from:string
 to:string
 mode:'street'|'walk'|'campus'
 label:string
 twoWay:boolean
 playable:boolean
}

export const CHICAGO_VISUAL_CONNECTORS:ChicagoVisualConnector[]=[
 {id:'cp-roosevelt',from:'circle-park',to:'roosevelt-road',mode:'street',label:'Circle Park → Roosevelt Road',twoWay:true,playable:true},
 {id:'roosevelt-taylor',from:'roosevelt-road',to:'taylor-street',mode:'street',label:'Roosevelt Road → Taylor Street',twoWay:true,playable:true},
 {id:'taylor-uic-east',from:'taylor-street',to:'uic-east',mode:'walk',label:'Taylor Street → UIC East',twoWay:true,playable:true},
 {id:'roosevelt-uic-west',from:'roosevelt-road',to:'uic-west',mode:'street',label:'Roosevelt Road → UIC West',twoWay:true,playable:true},
 {id:'uic-west-medical',from:'uic-west',to:'medical-district',mode:'campus',label:'UIC West → Illinois Medical District',twoWay:true,playable:true},
]

export const CHICAGO_VISUAL_BUILD_PHASE={
 id:'west-side-visible-v1',
 spawn:'circle-park',
 priorityDistricts:['circle-park','roosevelt-road','taylor-street','uic-east','uic-west','medical-district'],
 connectors:CHICAGO_VISUAL_CONNECTORS,
 requiredLayers:['roads','sidewalks','buildings','trees','residents','vehicles','traffic','missions','emergency-routing'],
 acceptance:['continuous traversal','two-way road intent','visible Chicago district identity','mobile-safe controls'],
} as const
