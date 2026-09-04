import { useGameStore, type Screen } from '../game/state/useGameStore'
import { installStreetVerseMobileMissionRewardRuntime } from './StreetVerseMobileMissionRewardRuntime'

const KEY='tryamm_streetverse_checkpoint_v1'
const MAX_AGE_MS=1000*60*60*24*14

type Position={x:number;y:number;z:number}
type Checkpoint={
  savedAt:number
  screen:Screen
  position?:Position
  player:{
    name:string
    avatar:string
    xp:number
    level:number
    rep:number
    faith:number
    health:number
    wantedLevel:number
    activeVehicle:string|null
    ownedVehicles:string[]
    completedMissions:string[]
  }
  missions:Array<{id:string;status:string}>
  radioStation:number
  activeMusic:string|null
}

let installed=false
let lastSerialized=''
let saveTimer:number|undefined
let lastPosition:Position|undefined

function validPosition(value:any):value is Position{
  return value&&[value.x,value.y,value.z].every(Number.isFinite)
}

function read():Checkpoint|null{
  try{
    const value=JSON.parse(localStorage.getItem(KEY)||'null') as Checkpoint|null
    if(!value||!Number.isFinite(value.savedAt))return null
    if(Date.now()-value.savedAt>MAX_AGE_MS){localStorage.removeItem(KEY);return null}
    if(value.position&&!validPosition(value.position))delete value.position
    return value
  }catch{return null}
}

function snapshot():Checkpoint{
  const state=useGameStore.getState()
  const {player}=state
  return {
    savedAt:Date.now(),screen:state.screen,position:lastPosition?{...lastPosition}:undefined,
    player:{
      name:player.name,avatar:player.avatar,xp:player.xp,level:player.level,rep:player.rep,faith:player.faith,
      health:player.health,wantedLevel:player.wantedLevel,activeVehicle:player.activeVehicle,
      ownedVehicles:[...player.ownedVehicles],completedMissions:[...player.completedMissions],
    },
    missions:state.missions.map(m=>({id:m.id,status:m.status})),
    radioStation:state.radioStation,activeMusic:state.activeMusic,
  }
}

function persist(){
  const value=snapshot()
  const serialized=JSON.stringify(value)
  if(serialized===lastSerialized)return
  lastSerialized=serialized
  try{localStorage.setItem(KEY,serialized)}catch{}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint-saved',{detail:{savedAt:value.savedAt,screen:value.screen,position:value.position||null}}))
}

function schedulePersist(){
  if(saveTimer)clearTimeout(saveTimer)
  saveTimer=window.setTimeout(persist,250)
}

function emitPositionRestore(value:Checkpoint){
  if(!validPosition(value.position))return
  lastPosition={...value.position}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-position-restore',{detail:{position:{...value.position},savedAt:value.savedAt,source:'checkpoint'}}))
}

function restore(value:Checkpoint){
  const state=useGameStore.getState()
  state.setPlayer(value.player as any)
  useGameStore.setState(current=>({
    ...current,
    missions:current.missions.map(m=>{
      const saved=value.missions.find(x=>x.id===m.id)
      return saved?{...m,status:saved.status as any}:m
    }),
    radioStation:Number.isInteger(value.radioStation)?value.radioStation:current.radioStation,
    activeMusic:value.activeMusic??current.activeMusic,
  }))
  emitPositionRestore(value)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint-restored',{detail:{savedAt:value.savedAt,screen:value.screen,position:value.position||null}}))
}

export function installStreetVerseCheckpointRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  installStreetVerseMobileMissionRewardRuntime()

  const checkpoint=read()
  if(checkpoint)queueMicrotask(()=>restore(checkpoint))

  useGameStore.subscribe(()=>schedulePersist())
  window.addEventListener('tryamm:world-player-signal',(event:Event)=>{
    const position=(event as CustomEvent<any>).detail?.position
    if(validPosition(position)){lastPosition={x:position.x,y:position.y,z:position.z};schedulePersist()}
  })
  window.addEventListener('tryamm:streetverse-enter',()=>{
    const value=read()
    if(value)emitPositionRestore(value)
  })
  window.addEventListener('tryamm:streetverse-leave',persist)
  window.addEventListener('pagehide',persist)
  window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persist()})
  window.addEventListener('tryamm:streetverse-checkpoint-clear',()=>{
    lastSerialized='';lastPosition=undefined
    try{localStorage.removeItem(KEY)}catch{}
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-checkpoint-cleared',{detail:{at:Date.now()}}))
  })
}
