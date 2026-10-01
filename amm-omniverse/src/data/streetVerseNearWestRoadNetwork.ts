import type {StreetVerseVec3} from './streetVerseCartesianNeighborhood'

export type RoadNode=Readonly<{id:string;label:string;position:StreetVerseVec3}>
export type RoadSegment=Readonly<{id:string;from:string;to:string;street:string;lanes:2|4;sidewalks:true;driveable:true;walkable:true}>

export const CHICAGO_NEAR_WEST_ROAD_NODES:readonly RoadNode[]=[
 {id:'roosevelt-halsted',label:'Roosevelt & Halsted',position:{x:-650,y:0,z:900}},
 {id:'taylor-halsted',label:'Taylor & Halsted',position:{x:-650,y:0,z:700}},
 {id:'harrison-halsted',label:'Harrison & Halsted',position:{x:-760,y:0,z:420}},
 {id:'taylor-uic-west',label:'Taylor / UIC West connector',position:{x:0,y:0,z:900}},
 {id:'polk-uic-med',label:'Polk / UIC Medical connector',position:{x:160,y:0,z:940}},
 {id:'ogden-stroger',label:'Ogden / Stroger connector',position:{x:430,y:0,z:1120}},
]

export const CHICAGO_NEAR_WEST_ROADS:readonly RoadSegment[]=[
 {id:'taylor-east-west-01',from:'taylor-halsted',to:'taylor-uic-west',street:'Taylor Street',lanes:2,sidewalks:true,driveable:true,walkable:true},
 {id:'halsted-south-01',from:'harrison-halsted',to:'taylor-halsted',street:'Halsted Street',lanes:4,sidewalks:true,driveable:true,walkable:true},
 {id:'halsted-south-02',from:'taylor-halsted',to:'roosevelt-halsted',street:'Halsted Street',lanes:4,sidewalks:true,driveable:true,walkable:true},
 {id:'medical-link-01',from:'taylor-uic-west',to:'polk-uic-med',street:'UIC Medical Connector',lanes:2,sidewalks:true,driveable:true,walkable:true},
 {id:'medical-link-02',from:'polk-uic-med',to:'ogden-stroger',street:'Medical District Connector',lanes:2,sidewalks:true,driveable:true,walkable:true},
]

export type GeneratedRoadMesh=Readonly<{id:string;center:StreetVerseVec3;length:number;headingRadians:number;width:number;sidewalkWidth:number}>
const node=(id:string)=>CHICAGO_NEAR_WEST_ROAD_NODES.find(n=>n.id===id)

export function compileNearWestRoadMeshes():GeneratedRoadMesh[]{
 return CHICAGO_NEAR_WEST_ROADS.flatMap(r=>{
  const a=node(r.from),b=node(r.to); if(!a||!b)return []
  const dx=b.position.x-a.position.x,dz=b.position.z-a.position.z
  return [{id:r.id,center:{x:(a.position.x+b.position.x)/2,y:0,z:(a.position.z+b.position.z)/2},length:Math.hypot(dx,dz),headingRadians:Math.atan2(dz,dx),width:r.lanes===4?14:9,sidewalkWidth:3}]
 })
}

export function nearestRoadNode(position:StreetVerseVec3):RoadNode|undefined{
 return CHICAGO_NEAR_WEST_ROAD_NODES.reduce<RoadNode|undefined>((best,n)=>{
  if(!best)return n
  const d=(p:StreetVerseVec3)=>Math.hypot(p.x-position.x,p.z-position.z)
  return d(n.position)<d(best.position)?n:best
 },undefined)
}
