export type HoloArenaMode='companion'|'npc'|'pk'|'boss'
export type HoloArenaPhase='streetverse'|'teleporting-in'|'battle'|'victory'|'defeat'|'retreat'|'teleporting-out'

export interface StreetVerseCheckpoint{
 worldId:string
 placeId?:string
 x:number
 y:number
 z:number
 heading?:number
 missionId?:string
 vehicleId?:string
 capturedAt:number
}

export interface HoloArenaSession{
 id:string
 mode:HoloArenaMode
 arenaId:string
 phase:HoloArenaPhase
 checkpoint:StreetVerseCheckpoint
 opponentId?:string
 companionId?:string
 startedAt:number
 finishedAt?:number
 result?:'victory'|'defeat'|'retreat'
}

const STORAGE_KEY='tryamm.holo-arena.session.v1'

const safeStorage=()=>{
 try{return typeof window!=='undefined'?window.sessionStorage:null}catch{return null}
}

export const createHoloArenaSession=(input:{
 mode:HoloArenaMode
 arenaId?:string
 checkpoint:StreetVerseCheckpoint
 opponentId?:string
 companionId?:string
}):HoloArenaSession=>({
 id:`arena-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
 mode:input.mode,
 arenaId:input.arenaId??'streetverse-holo-arena',
 phase:'teleporting-in',
 checkpoint:input.checkpoint,
 opponentId:input.opponentId,
 companionId:input.companionId,
 startedAt:Date.now(),
})

export const saveHoloArenaSession=(session:HoloArenaSession)=>{
 safeStorage()?.setItem(STORAGE_KEY,JSON.stringify(session))
 return session
}

export const loadHoloArenaSession=():HoloArenaSession|null=>{
 const raw=safeStorage()?.getItem(STORAGE_KEY)
 if(!raw)return null
 try{return JSON.parse(raw) as HoloArenaSession}catch{return null}
}

export const beginHoloArenaBattle=(session:HoloArenaSession)=>
 saveHoloArenaSession({...session,phase:'battle'})

export const finishHoloArenaBattle=(session:HoloArenaSession,result:'victory'|'defeat'|'retreat')=>
 saveHoloArenaSession({...session,phase:result,result,finishedAt:Date.now()})

export const beginHoloArenaReturn=(session:HoloArenaSession)=>
 saveHoloArenaSession({...session,phase:'teleporting-out'})

export const completeHoloArenaReturn=(session:HoloArenaSession)=>{
 safeStorage()?.removeItem(STORAGE_KEY)
 return session.checkpoint
}

export const buildHoloArenaUrl=(session:HoloArenaSession)=>{
 const q=new URLSearchParams({arena:session.arenaId,session:session.id,mode:session.mode})
 return `/streetverse/holo-arena?${q.toString()}`
}

export const buildStreetVerseReturnUrl=(checkpoint:StreetVerseCheckpoint)=>{
 const q=new URLSearchParams({
  world:checkpoint.worldId,
  x:String(checkpoint.x),
  y:String(checkpoint.y),
  z:String(checkpoint.z),
 })
 if(checkpoint.placeId)q.set('place',checkpoint.placeId)
 if(checkpoint.missionId)q.set('mission',checkpoint.missionId)
 if(checkpoint.vehicleId)q.set('vehicle',checkpoint.vehicleId)
 if(checkpoint.heading!==undefined)q.set('heading',String(checkpoint.heading))
 return `/streetverse?${q.toString()}`
}

/**
 * Holo Arena owns only transport/session state.
 * Combat simulation and valuable rewards must be validated separately.
 */
export const HOLO_ARENA_RULES={
 preserveExactStreetVerseCheckpoint:true,
 oneActiveArenaSession:true,
 citySimulationMaySleepDuringArena:true,
 valuableRewardsRequireServerValidation:true,
 realWorldAnimalAttackTraining:false,
 fictionalCombatOnly:true,
} as const
