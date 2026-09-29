export type ChicagoStreetVersePlace={
 id:string;label:string;kind:'spawn'|'street'|'district'|'gateway';x:number;z:number;radius:number
}
export const CHICAGO_WORLD_MIN=-82
export const CHICAGO_WORLD_MAX=82
export const CIRCLE_PARK_SPAWN:ChicagoStreetVersePlace={id:'circle-park-abla',label:'Circle Park / ABLA',kind:'spawn',x:0,z:54,radius:14}
export const CHICAGO_STREETVERSE_PLACES:ChicagoStreetVersePlace[]=[
 CIRCLE_PARK_SPAWN,
 {id:'taylor-street',label:'Taylor Street',kind:'street',x:0,z:30,radius:10},
 {id:'roosevelt-road',label:'Roosevelt Road',kind:'street',x:0,z:8,radius:10},
 {id:'pilsen-gateway',label:'Pilsen Gateway',kind:'gateway',x:-42,z:-34,radius:20},
 {id:'pilsen-arts',label:'Pilsen Arts Corridor',kind:'district',x:-50,z:-50,radius:18},
]
export const CHICAGO_ROAD_CORRIDORS=[
 {id:'taylor-street',label:'TAYLOR ST',axis:'x' as const,at:30,width:12},
 {id:'roosevelt-road',label:'ROOSEVELT RD',axis:'x' as const,at:8,width:14},
 {id:'pilsen-connector',label:'PILSEN CONNECTOR',axis:'z' as const,at:-48,width:12},
]
export function worldToChicagoGridCell(x:number,z:number){
 const span=CHICAGO_WORLD_MAX-CHICAGO_WORLD_MIN
 const col=Math.max(0,Math.min(4,Math.floor(((x-CHICAGO_WORLD_MIN)/span)*5)))
 const row=Math.max(0,Math.min(4,Math.floor(((z-CHICAGO_WORLD_MIN)/span)*5)))
 return String.fromCharCode(65+col)+String(row+1)
}
export function nearestChicagoPlace(x:number,z:number){
 return CHICAGO_STREETVERSE_PLACES.map(place=>({...place,distance:Math.hypot(place.x-x,place.z-z)})).sort((a,b)=>a.distance-b.distance)[0]
}
