import {
  buildCadConstructionPlan,
  validateCadDocument,
  type CadElevator,
  type CadFixture,
  type CadPipeRun,
  type CadRoom,
  type CadStair,
  type CadWall,
  type StreetVerseCadDocument,
} from './StreetVerseCadBuildingCompiler'

const KEY='tryamm.streetverse.cad.documents.v1'

type CadPatch =
  | {kind:'wall';value:CadWall}
  | {kind:'room';value:CadRoom}
  | {kind:'stair';value:CadStair}
  | {kind:'elevator';value:CadElevator}
  | {kind:'pipe-run';value:CadPipeRun}
  | {kind:'fixture';value:CadFixture}

function readStore():Record<string,StreetVerseCadDocument>{
  if(typeof localStorage==='undefined')return{}
  try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}
}
function writeStore(store:Record<string,StreetVerseCadDocument>){
  if(typeof localStorage==='undefined')return
  localStorage.setItem(KEY,JSON.stringify(store))
}

export function createCadDocument(input:{
  id:string
  buildingPassportId:string
  name:string
  levels:{id:string;label:string;elevation:number;floorToFloorHeight:number;slabThickness:number}[]
}):StreetVerseCadDocument{
  return{
    schema:'tryamm.streetverse.cad.v1',
    id:input.id,
    buildingPassportId:input.buildingPassportId,
    name:input.name,
    unit:'m',
    levels:input.levels,
    walls:[],
    openings:[],
    rooms:[],
    stairs:[],
    elevators:[],
    pipeRuns:[],
    fixtures:[],
    facadeWraps:[],
    sources:[],
    systems:['structure','architecture','stairs','elevator','plumbing','electrical','hvac','fire-safety','accessibility','collision','navigation','facade','lighting'],
    metadata:{
      authoringMode:'holographic-cad',
      exactCurrentSecuritySystemsNeverPublish:true,
      currentPrivateInteriorsNeverAutoPublish:true,
      googleStreetViewReferenceOnly:true,
    },
  }
}

export function saveCadDocument(doc:StreetVerseCadDocument){
  const validation=validateCadDocument(doc)
  const store=readStore();store[doc.id]=doc;writeStore(store)
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:cad-document-saved',{detail:{cadId:doc.id,buildingPassportId:doc.buildingPassportId,validation}}))
  return validation
}

export function loadCadDocument(id:string){
  return readStore()[id]
}

export function applyCadPatch(doc:StreetVerseCadDocument,patch:CadPatch):StreetVerseCadDocument{
  if(patch.kind==='wall')return{...doc,walls:[...doc.walls.filter(v=>v.id!==patch.value.id),patch.value]}
  if(patch.kind==='room')return{...doc,rooms:[...doc.rooms.filter(v=>v.id!==patch.value.id),patch.value]}
  if(patch.kind==='stair')return{...doc,stairs:[...doc.stairs.filter(v=>v.id!==patch.value.id),patch.value]}
  if(patch.kind==='elevator')return{...doc,elevators:[...doc.elevators.filter(v=>v.id!==patch.value.id),patch.value]}
  if(patch.kind==='pipe-run')return{...doc,pipeRuns:[...doc.pipeRuns.filter(v=>v.id!==patch.value.id),patch.value]}
  return{...doc,fixtures:[...doc.fixtures.filter(v=>v.id!==patch.value.id),patch.value]}
}

export function exportCadJson(doc:StreetVerseCadDocument){
  return JSON.stringify(doc,null,2)
}

function dxfLine(x1:number,y1:number,x2:number,y2:number,layer:string){
  return[
    '0','LINE','8',layer,
    '10',String(x1),'20',String(y1),'30','0',
    '11',String(x2),'21',String(y2),'31','0',
  ].join('\n')
}

function dxfRect(x:number,y:number,w:number,h:number,layer:string){
  return[
    dxfLine(x,y,x+w,y,layer),
    dxfLine(x+w,y,x+w,y+h,layer),
    dxfLine(x+w,y+h,x,y+h,layer),
    dxfLine(x,y+h,x,y,layer),
  ].join('\n')
}

export function exportCadDxf(doc:StreetVerseCadDocument){
  const entities:string[]=[]
  for(const wall of doc.walls)entities.push(dxfLine(wall.from.x,wall.from.y,wall.to.x,wall.to.y,`WALL_${wall.levelId}`))
  for(const room of doc.rooms){
    for(let i=0;i<room.polygon.length;i++){
      const a=room.polygon[i],b=room.polygon[(i+1)%room.polygon.length]
      entities.push(dxfLine(a.x,a.y,b.x,b.y,`ROOM_${room.levelId}`))
    }
  }
  for(const stair of doc.stairs)entities.push(dxfRect(stair.origin.x,stair.origin.z,stair.width,Math.max(stair.run*stair.treadCount,.01),`STAIR_${stair.fromLevelId}`))
  for(const elevator of doc.elevators)entities.push(dxfRect(elevator.shaftOrigin.x,elevator.shaftOrigin.z,elevator.shaftSize.width,elevator.shaftSize.depth,'ELEVATOR_SHAFT'))
  for(const run of doc.pipeRuns){
    for(let i=0;i<run.points.length-1;i++){
      const a=run.points[i],b=run.points[i+1]
      entities.push(dxfLine(a.x,a.z,b.x,b.z,`PIPE_${run.kind.toUpperCase().replaceAll('-','_')}`))
    }
  }
  return['0','SECTION','2','ENTITIES',...entities,'0','ENDSEC','0','EOF'].join('\n')
}

export function createHolographicCadBuild(doc:StreetVerseCadDocument){
  const plan=buildCadConstructionPlan(doc)
  if(typeof window!=='undefined'){
    window.dispatchEvent(new CustomEvent('tryamm:cad-build-plan',{detail:plan}))
    window.dispatchEvent(new CustomEvent('tryamm:holographic-building-build',{detail:{cad:doc,plan,source:'streetverse-cad'}}))
  }
  return plan
}

export const STREETVERSE_CAD_EXCHANGE={
  formats:['TRYAMM CAD JSON','DXF 2D plan exchange'] as const,
  authoring:'holographic CAD commands',
  buildOutputs:['game geometry','collision','navigation','interaction graph','LOD','holographic preview'] as const,
  physicalConstructionDocuments:false,
  note:'Game/world CAD is not automatically a permit-ready architectural/engineering drawing set.',
} as const
