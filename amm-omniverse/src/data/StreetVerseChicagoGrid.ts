export type ChicagoStreetVersePlace={
 id:string;label:string;kind:'spawn'|'street'|'district'|'gateway';x:number;z:number;radius:number
}
export const CHICAGO_WORLD_MIN=-82
export const CHICAGO_WORLD_MAX=82
export const CIRCLE_PARK_SPAWN:ChicagoStreetVersePlace={id:'circle-park-abla',label:'CIRCLE PARK / ABLA',kind:'spawn',x:0,z:54,radius:14}
export const CHICAGO_STREETVERSE_PLACES:ChicagoStreetVersePlace[]=[
 CIRCLE_PARK_SPAWN,
 {id:'circle-park-apartments',label:'Circle Park Apartments',kind:'district',x:-48,z:40,radius:16},
 {id:'circle-park-drive',label:'Circle Park Drive / Laflin',kind:'street',x:-24,z:16,radius:10},
 {id:'taylor-street',label:'Taylor Street',kind:'street',x:0,z:34,radius:10},
 {id:'fillmore-street',label:'Fillmore Street',kind:'street',x:0,z:23,radius:9},
 {id:'grenshaw-street',label:'Grenshaw Street',kind:'street',x:0,z:15,radius:9},
 {id:'roosevelt-road',label:'Roosevelt Road',kind:'street',x:0,z:7,radius:10},
 {id:'ashland-avenue',label:'Ashland Avenue',kind:'street',x:-48,z:12,radius:10},
 {id:'loomis-street',label:'Loomis Street',kind:'street',x:0,z:12,radius:10},
 {id:'throop-street',label:'Throop Street',kind:'street',x:24,z:12,radius:10},
 {id:'racine-avenue',label:'Racine Avenue',kind:'street',x:48,z:12,radius:10},
 {id:'jane-addams-museum',label:'Jane Addams / Public Housing Museum',kind:'district',x:24,z:42,radius:14},
 {id:'roosevelt-square',label:'Roosevelt Square',kind:'district',x:34,z:24,radius:16},
 {id:'pilsen-gateway',label:'Pilsen Gateway',kind:'gateway',x:-42,z:-34,radius:20},
 {id:'pilsen-arts',label:'Pilsen Arts Corridor',kind:'district',x:-50,z:-50,radius:18},
]
export const CHICAGO_ROAD_CORRIDORS=[
 {id:'taylor-street',label:'TAYLOR ST',axis:'x' as const,at:34,width:12},
 {id:'fillmore-street',label:'FILLMORE ST',axis:'x' as const,at:23,width:9},
 {id:'grenshaw-street',label:'GRENSHAW ST',axis:'x' as const,at:15,width:9},
 {id:'roosevelt-road',label:'ROOSEVELT RD',axis:'x' as const,at:7,width:14},
 {id:'ashland-avenue',label:'ASHLAND AVE',axis:'z' as const,at:-48,width:12},
 {id:'circle-park-drive',label:'CIRCLE PARK DR / LAFLIN',axis:'z' as const,at:-24,width:10},
 {id:'loomis-street',label:'LOOMIS ST',axis:'z' as const,at:0,width:10},
 {id:'throop-street',label:'THROOP ST',axis:'z' as const,at:24,width:10},
 {id:'racine-avenue',label:'RACINE AVE',axis:'z' as const,at:48,width:12},
 {id:'pilsen-connector',label:'PILSEN CONNECTOR',axis:'z' as const,at:-70,width:10},
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
