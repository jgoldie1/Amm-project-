import {detectRepairLayer,normalizeErrorSignature,type RepairLayer} from './HoloGPTAutonomousRepairEngine'
import type {TryammSystemFabricSnapshot} from './TRYAMMSystemFabricRuntime'

export type GameFlowStageId=
  |'boot'
  |'world'
  |'character'
  |'movement'
  |'mission'
  |'vehicle'
  |'reward'
  |'reel'
  |'global'

export type GameFlowStageState='WAITING'|'ACTIVE'|'PASS'|'DEGRADED'|'BLOCKED'

export interface GameFlowStage{
  id:GameFlowStageId
  label:string
  state:GameFlowStageState
  evidence:string[]
  lastSignalAt?:string
  reason?:string
}

export interface GameRepairTicket{
  id:string
  stage:GameFlowStageId
  severity:'LOW'|'MEDIUM'|'HIGH'|'BLOCKING'
  layer:RepairLayer
  signature:string
  summary:string
  evidence:string[]
  recommendedOwner:'HoloGPT'|'Stubbs AI'|'Lyons Tech AI'|'Guardian'
  reversibleOnly:true
  authorityRequired:boolean
  createdAt:string
}

export interface GameOpsSnapshot{
  schema:'tryamm.game-ops.v1'
  health:'GREEN'|'YELLOW'|'ORANGE'|'RED'
  flow:GameFlowStage[]
  actualBlocker:GameFlowStage|null
  systemFabric?:Pick<TryammSystemFabricSnapshot,'overall'|'dependencyProblems'|'updatedAt'>
  repairQueue:GameRepairTicket[]
  ai:{
    literalConsciousness:false
    model:'operational self-model'
    roles:typeof GAME_AI_ROLES
  }
  updatedAt:string
}

export const GAME_AI_ROLES={
  hologpt:'Player/founder command desk: explain what is broken, what changed, what to test next, and open the right surface.',
  stubbsAi:'Game director: manage gameplay flow, mission dependencies, priorities, acceptance criteria and cross-world continuity.',
  lyonsTechAi:'Engineering brain: diagnose runtime, Three.js, asset, animation, collision, performance, bundle and device problems.',
  guardian:'Evidence and authority gate: prevent false completion claims, unsafe auto-actions, unverified deploys and destructive repair loops.',
} as const

export const GAME_AGI_BOUNDARY={
  requested:'AI/AGI-assisted game creation, management and repair',
  implementedMeaning:'operational self-model + evidence-first diagnostics + repair routing + gameplay-flow monitoring',
  literalConsciousness:false,
  mayWriteRecommendations:true,
  mayRequestReversibleRepair:true,
  mayMergeOrDeployWithoutApproval:false,
  mayClaimDeviceSuccessWithoutDeviceEvidence:false,
  rule:'More intelligence does not create more authority. AI may diagnose and coordinate; exact code/deployment changes still require evidence and the existing authority gates.',
} as const

const STAGE_ORDER:GameFlowStageId[]=['boot','world','character','movement','mission','vehicle','reward','reel','global']
const LABELS:Record<GameFlowStageId,string>={
  boot:'App boots',
  world:'Circle Park / world renders',
  character:'Playable character materializes',
  movement:'One-hand movement works',
  mission:'Mission starts and objective updates',
  vehicle:'Repair / enter / drive / exit loop works',
  reward:'Mission completion and reward evidence',
  reel:'Reel capture / output works',
  global:'StreetVerse Global transition works',
}

let installed=false
let fabric:TryammSystemFabricSnapshot|undefined
let repairs:GameRepairTicket[]=[]
let flow:Record<GameFlowStageId,GameFlowStage>

const now=()=>new Date().toISOString()
const freshFlow=()=>Object.fromEntries(STAGE_ORDER.map((id,index)=>[id,{
  id,label:LABELS[id],state:index===0?'ACTIVE':'WAITING',evidence:[],
}])) as Record<GameFlowStageId,GameFlowStage>

function safeDetail(event:Event){
  const detail=(event as CustomEvent<Record<string,unknown>>).detail
  return detail&&typeof detail==='object'?detail:{}
}

function addEvidence(stage:GameFlowStageId,eventName:string,detail:Record<string,unknown>,state:GameFlowStageState='PASS',reason?:string){
  const node=flow[stage]
  const evidence=[...node.evidence,eventName].slice(-12)
  flow[stage]={...node,state,evidence,lastSignalAt:now(),reason}
  const current=STAGE_ORDER.indexOf(stage)
  const next=STAGE_ORDER[current+1]
  if(next&&flow[next].state==='WAITING')flow[next]={...flow[next],state:'ACTIVE'}
  publish()
}

function stageForSystem(system:string):GameFlowStageId|undefined{
  if(system==='streetverse-world')return'world'
  if(system==='characters')return'character'
  if(system==='missions')return'mission'
  if(system==='vehicles')return'vehicle'
  if(system==='creator-media')return'reel'
  if(system==='global')return'global'
  return undefined
}

function health(){
  if(Object.values(flow).some(stage=>stage.state==='BLOCKED'))return'RED' as const
  if(Object.values(flow).some(stage=>stage.state==='DEGRADED'))return'ORANGE' as const
  if(STAGE_ORDER.some(id=>flow[id].state!=='PASS'))return'YELLOW' as const
  return'GREEN' as const
}

function blocker(){
  for(const id of STAGE_ORDER){
    const node=flow[id]
    if(node.state==='BLOCKED'||node.state==='DEGRADED')return node
    if(node.state!=='PASS')return node
  }
  return null
}

function buildSnapshot():GameOpsSnapshot{
  return{
    schema:'tryamm.game-ops.v1',
    health:health(),
    flow:STAGE_ORDER.map(id=>flow[id]),
    actualBlocker:blocker(),
    systemFabric:fabric?{overall:fabric.overall,dependencyProblems:fabric.dependencyProblems,updatedAt:fabric.updatedAt}:undefined,
    repairQueue:repairs.slice(-20),
    ai:{literalConsciousness:false,model:'operational self-model',roles:GAME_AI_ROLES},
    updatedAt:now(),
  }
}

function publish(){
  if(typeof window==='undefined')return
  const snapshot=buildSnapshot()
  try{sessionStorage.setItem('tryamm.game-ops.v1',JSON.stringify(snapshot))}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:game-ops-state',{detail:snapshot}))
}

export function getGameOpsSnapshot(){
  if(!flow)flow=freshFlow()
  return buildSnapshot()
}

export function createGameRepairTicket(input:{
  stage:GameFlowStageId
  summary:string
  log?:string
  severity?:GameRepairTicket['severity']
  evidence?:string[]
  authorityRequired?:boolean
}){
  if(!flow)flow=freshFlow()
  const log=input.log||input.summary
  const layer=detectRepairLayer(log)
  const ticket:GameRepairTicket={
    id:`game-repair-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    stage:input.stage,
    severity:input.severity||'MEDIUM',
    layer,
    signature:normalizeErrorSignature(log),
    summary:input.summary.slice(0,800),
    evidence:[...(input.evidence||[])].slice(-20),
    recommendedOwner:layer==='BUILD'||layer==='DEPENDENCY'||layer==='TYPECHECK'||layer==='CONFIG'?'Lyons Tech AI':layer==='TEST'||layer==='CI'?'Guardian':'Stubbs AI',
    reversibleOnly:true,
    authorityRequired:input.authorityRequired!==false,
    createdAt:now(),
  }
  repairs=[...repairs,ticket].slice(-50)
  const current=flow[input.stage]
  flow[input.stage]={...current,state:input.severity==='BLOCKING'?'BLOCKED':'DEGRADED',reason:input.summary,lastSignalAt:now(),evidence:[...current.evidence,...ticket.evidence].slice(-12)}
  if(typeof window!=='undefined'){
    window.dispatchEvent(new CustomEvent('tryamm:game-repair-request',{detail:ticket}))
    window.dispatchEvent(new CustomEvent('tryamm:hologpt-game-repair-ticket',{detail:ticket}))
  }
  publish()
  return ticket
}

function holoContext(){
  const snapshot=buildSnapshot()
  const failed=snapshot.flow.filter(stage=>stage.state==='BLOCKED'||stage.state==='DEGRADED')
  return[
    'TRYAMM GAME OPS',
    `Health: ${snapshot.health}`,
    `Actual blocker: ${snapshot.actualBlocker?.label||'none'}`,
    `Flow: ${snapshot.flow.map(stage=>`${stage.label}=${stage.state}`).join(' | ')}`,
    `System Fabric: ${snapshot.systemFabric?.overall||'not observed'}`,
    failed.length?`Degraded/blocked: ${failed.map(stage=>`${stage.label}: ${stage.reason||'no reason recorded'}`).join(' | ')}`:'Degraded/blocked: none recorded.',
    `Repair tickets: ${snapshot.repairQueue.length}`,
    'Use Stubbs AI for gameplay/mission orchestration, Lyons Tech AI for runtime/3D/performance diagnosis, HoloGPT for explanation/commands, and Guardian for evidence/authority.',
    'Do not claim success without exact CI/runtime/device evidence. Do not merge or deploy from this runtime.',
  ].join('\n')
}

function installAdapters(){
  const adapters:Array<[string,(event:Event)=>void]>=[
    ['tryamm:streetverse-runtime-health',event=>{
      const d=safeDetail(event)
      const unhealthy=d.ok===false||d.healthy===false||d.status==='failed'||d.status==='blocked'
      addEvidence('boot',event.type,d,unhealthy?'DEGRADED':'PASS',unhealthy?String(d.reason||d.status||'runtime health degraded'):undefined)
    }],
    ['tryamm:streetverse-native-mobile-ready',event=>{
      const d=safeDetail(event)
      const failed=Number(d.failed||0)
      addEvidence('boot',event.type,d,'PASS')
      addEvidence('world',event.type,d,failed>0?'DEGRADED':'PASS',failed>0?`${failed} world assets failed`:undefined)
    }],
    ['tryamm:streetverse-hero-visual-authority',event=>{
      const d=safeDetail(event)
      const ready=Boolean(d.authoritative3DMesh||d.active3DMesh)
      addEvidence('character',event.type,d,ready?'PASS':'DEGRADED',ready?undefined:'character is still using fallback/non-authoritative visual')
    }],
    ['tryamm:streetverse-checkpoint',event=>addEvidence('movement',event.type,safeDetail(event),'PASS')],
    ['tryamm:universal-mission-start',event=>addEvidence('mission',event.type,safeDetail(event),'PASS')],
    ['tryamm:universal-mission-objective',event=>addEvidence('mission',event.type,safeDetail(event),'PASS')],
    ['tryamm:streetverse-vehicle-controlled',event=>addEvidence('vehicle',event.type,safeDetail(event),'PASS')],
    ['tryamm:streetverse-mission-complete',event=>addEvidence('reward',event.type,safeDetail(event),'PASS')],
    ['tryamm:universal-mission-complete',event=>addEvidence('reward',event.type,safeDetail(event),'PASS')],
    ['tryamm:media-studio-output-ready',event=>addEvidence('reel',event.type,safeDetail(event),'PASS')],
    ['tryamm:media-publish-queued',event=>addEvidence('reel',event.type,safeDetail(event),'PASS')],
    ['tryamm:global-city-select',event=>addEvidence('global',event.type,safeDetail(event),'PASS')],
  ]
  adapters.forEach(([name,handler])=>window.addEventListener(name,handler))
  return()=>adapters.forEach(([name,handler])=>window.removeEventListener(name,handler))
}

export function installStreetVerseGameOpsRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true
  flow=freshFlow()
  const disposeAdapters=installAdapters()

  const onFabric=(event:Event)=>{
    const next=(event as CustomEvent<TryammSystemFabricSnapshot>).detail
    if(!next||next.schema!=='tryamm.system-fabric.v1')return
    fabric=next
    for(const problem of next.dependencyProblems||[]){
      const stage=stageForSystem(problem.system)
      if(!stage)continue
      const current=flow[stage]
      if(current.state==='PASS')continue
      flow[stage]={...current,state:'DEGRADED',reason:`${problem.system} is waiting on ${problem.dependency} (${problem.dependencyStatus})`,lastSignalAt:now()}
    }
    publish()
  }

  const onRuntimeError=(event:Event)=>{
    const d=safeDetail(event)
    const message=String(d.message||d.error||d.reason||'StreetVerse runtime error')
    const stage=(String(d.stage||'boot') as GameFlowStageId)
    createGameRepairTicket({
      stage:STAGE_ORDER.includes(stage)?stage:'boot',
      summary:message,
      log:String(d.stack||d.log||message),
      severity:d.fatal===true?'BLOCKING':'HIGH',
      evidence:[event.type,String(d.source||'runtime')],
    })
  }

  const onQuery=()=>publish()
  window.addEventListener('tryamm:system-fabric-state',onFabric)
  window.addEventListener('tryamm:streetverse-runtime-error',onRuntimeError)
  window.addEventListener('tryamm:game-ops-query',onQuery)

  ;(window as Window&{__tryammGameOps?:unknown;__showGameOps?:()=>void}).__tryammGameOps={
    snapshot:getGameOpsSnapshot,
    repair:createGameRepairTicket,
    context:holoContext,
  }
  ;(window as Window&{__showGameOps?:()=>void}).__showGameOps=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:`${holoContext()}\n\nExplain the actual StreetVerse blocker, the smallest reversible repair, and the exact evidence needed to call it fixed.`}}))
  }

  publish()
  window.dispatchEvent(new CustomEvent('tryamm:system-fabric-query'))

  return()=>{
    disposeAdapters()
    window.removeEventListener('tryamm:system-fabric-state',onFabric)
    window.removeEventListener('tryamm:streetverse-runtime-error',onRuntimeError)
    window.removeEventListener('tryamm:game-ops-query',onQuery)
    delete (window as Window&{__tryammGameOps?:unknown}).__tryammGameOps
    delete (window as Window&{__showGameOps?:unknown}).__showGameOps
    installed=false
  }
}
