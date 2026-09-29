export type ChicagoGridZone={
 id:string;label:string;grid:string;kind:'spawn'|'corridor'|'district'|'landmark';x:number;z:number;
 radius:number;buildable:boolean;description:string
}
export const CIRCLE_PARK_SPAWN={x:0,z:54,label:'Circle Park',grid:'CP-01'} as const
export const CHICAGO_BUILD_GRID:ChicagoGridZone[]=[
 {id:'circle-park',label:'Circle Park',grid:'CP-01',kind:'spawn',x:0,z:54,radius:16,buildable:true,description:'Default StreetVerse Chicago neighborhood spawn and onboarding hub.'},
 {id:'roosevelt-road',label:'Roosevelt Road',grid:'RR-01',kind:'corridor',x:0,z:38,radius:34,buildable:true,description:'East-west business, transit, delivery and story corridor.'},
 {id:'taylor-street',label:'Taylor Street',grid:'TS-01',kind:'corridor',x:0,z:12,radius:32,buildable:true,description:'Neighborhood food, business, family, creator and history corridor.'},
 {id:'pilsen',label:'Pilsen',grid:'PL-01',kind:'district',x:-48,z:-20,radius:28,buildable:true,description:'Arts, music, food, murals, small-business and community mission district.'},
 {id:'near-west',label:'Near West Side',grid:'NW-01',kind:'district',x:-8,z:18,radius:34,buildable:true,description:'Connector district for Circle Park, Roosevelt, Taylor and downtown routes.'},
]
export function nearestChicagoGridZone(x:number,z:number){
 return [...CHICAGO_BUILD_GRID].map(zone=>({...zone,distance:Math.hypot(zone.x-x,zone.z-z)})).sort((a,b)=>a.distance-b.distance)[0]
}
export function gameGridCell(x:number,z:number){
 const col=Math.floor((x+88)/22),row=Math.floor((z+88)/22)
 return `${String.fromCharCode(65+Math.max(0,Math.min(7,col)))}${Math.max(1,Math.min(8,row+1))}`
}
