export type HoloGridMode='grid'|'portal'|'studio'|'vehicle'|'avatar'|'cursor'
export type CursorAction='point'|'select'|'drag'|'interact'|'stop'

export type HoloPresence={
  id:string
  displayName:string
  worldId:string
  sessionId:string
  position:{x:number;y:number;z:number}
  facing:{x:number;y:number;z:number}
  voiceEnabled:boolean
  faceEnabled:boolean
  consent:{voice:boolean;face:boolean}
}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

function holoPublish(payload:unknown,channel:'presence'|'construct'|'world-state'|'control',priority:'critical'|'realtime'|'interactive'='interactive'){
  const api=(window as any).__holoInternet
  return api?.publish?.({
    sessionId:'local',
    worldId:channel==='construct'?'construct-lab':'streetverse',
    channel,
    priority,
    source:'construct-holo-grid',
    payload,
    ttlMs:channel==='control'?500:5000,
  })??null
}

export function spawnHoloPresence(input:HoloPresence){
  const presence={...input,voiceEnabled:input.voiceEnabled&&input.consent.voice,faceEnabled:input.faceEnabled&&input.consent.face}
  holoPublish(presence,'presence','realtime')
  emit('tryamm:holo-presence',presence)
  return presence
}

export function moveAutonomousCursor(action:CursorAction,position:{x:number;y:number;z?:number},targetId?:string){
  const command={action,position:{x:position.x,y:position.y,z:position.z??0},targetId:targetId??null,timestamp:performance.now()}
  holoPublish(command,'control',action==='stop'?'critical':'realtime')
  emit('tryamm:holo-cursor',command)
  if(action==='select'||action==='interact'){
    emit('tryamm:streetverse-action',{action:action==='select'?'primary':'interact',pressed:true,source:'holo-cursor',timestamp:performance.now()})
  }
  return command
}

export function projectConstructToGrid(request:{id:string;shape:string;sizeMm:{x:number;y:number;z:number};positionMm:{x:number;y:number;z:number};mode?:HoloGridMode}){
  const compile=(window as any).__compileSECSConstruct as undefined|((input:unknown)=>unknown)
  if(!compile)return{ok:false,reason:'secs-runtime-not-installed'}
  const allowedShapes=new Set(['cube','sphere','button','steering-wheel'])
  const shape=allowedShapes.has(request.shape)?request.shape:'cube'
  const frame=compile({
    id:request.id,
    shape,
    sizeMm:request.sizeMm,
    positionMm:request.positionMm,
    visual:{color:'#4cc9ff',opacity:.82},
    haptics:{enabled:false,intensity:0},
    mode:'simulation',
  })
  const projection={requestId:request.id,gridMode:request.mode??'grid',frame,physicalization:'simulation-until-hardware-validation'}
  holoPublish(projection,'construct','realtime')
  emit('tryamm:construct-grid-projection',projection)
  return{ok:true,projection}
}

export function runConstructHoloGridSelfTest(){
  const cursor=moveAutonomousCursor('point',{x:.5,y:.5,z:0})
  const construct=projectConstructToGrid({id:'holo-grid-self-test',shape:'cube',sizeMm:{x:100,y:100,z:100},positionMm:{x:0,y:0,z:250},mode:'grid'})
  const result={passed:Boolean(cursor)&&construct.ok,construct,cursor}
  emit('tryamm:construct-holo-grid:self-test',result)
  return result
}

let installed=false
export function installConstructHoloGridRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  ;(window as any).__constructHoloGrid={
    spawnPresence:spawnHoloPresence,
    cursor:moveAutonomousCursor,
    project:projectConstructToGrid,
    selfTest:runConstructHoloGridSelfTest,
    capabilities:{spatialGrid:true,autonomousCursor:true,consentGatedPresence:true,constructProjection:true,holographicInternetBridge:true},
    note:'Software bridge for spatial grid, cursor automation and consent-based digital presence. Physical holograms and tactile constructs still require validated display/haptic hardware.'
  }
  emit('tryamm:construct-holo-grid:ready',{status:'software-runtime',modes:['grid','portal','studio','vehicle','avatar','cursor']})
}
