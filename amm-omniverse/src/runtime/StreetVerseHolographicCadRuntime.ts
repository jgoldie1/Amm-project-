import {
  createCadDocument,
  saveCadDocument,
  loadCadDocument,
  applyCadPatch,
  createHolographicCadBuild,
  exportCadDxf,
  exportCadJson,
} from './StreetVerseCadExchange'
import type {
  CadElevator,
  CadFixture,
  CadPipeRun,
  CadRoom,
  CadStair,
  CadWall,
  StreetVerseCadDocument,
} from './StreetVerseCadBuildingCompiler'

type CadCommand =
  | {action:'create';id:string;buildingPassportId:string;name:string;levels:StreetVerseCadDocument['levels']}
  | {action:'add-wall';cadId:string;wall:CadWall}
  | {action:'add-room';cadId:string;room:CadRoom}
  | {action:'add-stair';cadId:string;stair:CadStair}
  | {action:'add-elevator';cadId:string;elevator:CadElevator}
  | {action:'add-pipe-run';cadId:string;pipeRun:CadPipeRun}
  | {action:'add-fixture';cadId:string;fixture:CadFixture}
  | {action:'build';cadId:string}
  | {action:'export-json';cadId:string}
  | {action:'export-dxf';cadId:string}

let installed=false

function downloadText(filename:string,text:string,mime:string){
  const blob=new Blob([text],{type:mime})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url
  a.download=filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function requireDoc(id:string){
  const doc=loadCadDocument(id)
  if(!doc)throw new Error(`cad-document-not-found:${id}`)
  return doc
}

function patchAndSave(doc:StreetVerseCadDocument,patch:Parameters<typeof applyCadPatch>[1]){
  const next=applyCadPatch(doc,patch)
  const validation=saveCadDocument(next)
  return{doc:next,validation}
}

export function executeCadCommand(command:CadCommand){
  if(command.action==='create'){
    const doc=createCadDocument(command)
    const validation=saveCadDocument(doc)
    return{doc,validation}
  }
  const doc=requireDoc(command.cadId)
  if(command.action==='add-wall')return patchAndSave(doc,{kind:'wall',value:command.wall})
  if(command.action==='add-room')return patchAndSave(doc,{kind:'room',value:command.room})
  if(command.action==='add-stair')return patchAndSave(doc,{kind:'stair',value:command.stair})
  if(command.action==='add-elevator')return patchAndSave(doc,{kind:'elevator',value:command.elevator})
  if(command.action==='add-pipe-run')return patchAndSave(doc,{kind:'pipe-run',value:command.pipeRun})
  if(command.action==='add-fixture')return patchAndSave(doc,{kind:'fixture',value:command.fixture})
  if(command.action==='build')return{doc,plan:createHolographicCadBuild(doc)}
  if(command.action==='export-json'){
    downloadText(`${doc.id}.tryamm-cad.json`,exportCadJson(doc),'application/json')
    return{doc,exported:'json'}
  }
  if(command.action==='export-dxf'){
    downloadText(`${doc.id}.dxf`,exportCadDxf(doc),'application/dxf')
    return{doc,exported:'dxf'}
  }
}

export function installStreetVerseHolographicCadRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true

  const onCommand=(event:Event)=>{
    const command=(event as CustomEvent<CadCommand>).detail
    if(!command?.action)return
    try{
      const result=executeCadCommand(command)
      window.dispatchEvent(new CustomEvent('tryamm:cad-command-result',{detail:{ok:true,action:command.action,cadId:'cadId' in command?command.cadId:command.id,result}}))
      window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:`CAD ${command.action.replaceAll('-',' ')} complete.`}}))
    }catch(error){
      window.dispatchEvent(new CustomEvent('tryamm:cad-command-result',{detail:{ok:false,action:command.action,error:error instanceof Error?error.message:String(error)}}))
    }
  }

  window.addEventListener('tryamm:cad-command',onCommand as EventListener)
  ;(window as Window&{__tryammCad?:unknown;__showCad?:()=>void}).__tryammCad={
    execute:executeCadCommand,
    load:loadCadDocument,
    build:(cadId:string)=>createHolographicCadBuild(requireDoc(cadId)),
    exportDxf:(cadId:string)=>exportCadDxf(requireDoc(cadId)),
    exportJson:(cadId:string)=>exportCadJson(requireDoc(cadId)),
  }
  ;(window as Window&{__showCad?:()=>void}).__showCad=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:cad-workbench-open',{detail:{source:'hologpt-or-command'}}))
    window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:'Open StreetVerse Holographic CAD. Help me build the selected building from authorized references: structure, floors, rooms, stairs, elevators where applicable, plumbing simulation, accessibility, collision/navigation, then authorized photorealistic facade wrap and mobile LODs. Google Street View remains reference-navigation-only and must not be embedded as a persistent texture.'}}))
  }
  window.dispatchEvent(new CustomEvent('tryamm:cad-ready',{detail:{
    systems:['structure','architecture','stairs','elevator','plumbing','electrical','hvac','fire-safety','accessibility','collision','navigation','facade','lighting'],
    exchange:['TRYAMM CAD JSON','DXF'],
    holographicBuild:true,
    photorealisticWrapRequiresAuthorizedPersistentSource:true,
    googleStreetViewReferenceOnly:true,
  }}))

  return()=>{
    window.removeEventListener('tryamm:cad-command',onCommand as EventListener)
    delete (window as Window&{__tryammCad?:unknown}).__tryammCad
    delete (window as Window&{__showCad?:unknown}).__showCad
    installed=false
  }
}
