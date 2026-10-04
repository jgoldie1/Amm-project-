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
 {id:'west-side-expansion',label:'West Side Expansion',grid:'WS-02',kind:'district',x:-70,z:5,radius:70,buildable:true,description:'Expansion corridor for additional West Side neighborhoods, businesses, schools, housing and missions.'},
]
export function nearestChicagoGridZone(x:number,z:number){
 return [...CHICAGO_BUILD_GRID].map(zone=>({...zone,distance:Math.hypot(zone.x-x,zone.z-z)})).sort((a,b)=>a.distance-b.distance)[0]
}
export function gameGridCell(x:number,z:number){
 const col=Math.floor((x+88)/22),row=Math.floor((z+88)/22)
 return `${String.fromCharCode(65+Math.max(0,Math.min(7,col)))}${Math.max(1,Math.min(8,row+1))}`
}
