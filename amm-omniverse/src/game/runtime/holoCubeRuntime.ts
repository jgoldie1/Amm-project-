import type {VolcanoDisplayCapability} from './volcanoExperienceRuntime'

export const VOLCANO_SESSION_MAX_USERS=10 as const

export type VolcanoServerUserRole='host'|'player'|'spectator'|'operator'
export type VolcanoServerUser={id:string;role:VolcanoServerUserRole;displayId?:string;controllerIndex?:number;joinedAt:string}
export type HoloCubeFace='front'|'back'|'left'|'right'|'top'|'floor'
export type HoloCubeMode='tabletop'|'room'|'spectator'|'portal'

export type HoloCubeSession={
 id:string
 mode:HoloCubeMode
 faces:HoloCubeFace[]
 users:VolcanoServerUser[]
 displays:VolcanoDisplayCapability[]
 hostUserId:string
 simulationStopped:boolean
}

export function createHoloCubeSession(id:string,hostUserId:string,mode:HoloCubeMode='room'):HoloCubeSession{
 return{id,mode,faces:['front','back','left','right','top','floor'],users:[{id:hostUserId,role:'host',joinedAt:new Date().toISOString()}],displays:[],hostUserId,simulationStopped:false}
}

export function joinHoloCubeSession(session:HoloCubeSession,user:Omit<VolcanoServerUser,'joinedAt'>){
 if(session.simulationStopped)return{session,joined:false,reason:'simulation-stopped' as const}
 if(session.users.some(x=>x.id===user.id))return{session,joined:true,reason:'already-joined' as const}
 if(session.users.length>=VOLCANO_SESSION_MAX_USERS)return{session,joined:false,reason:'server-capacity' as const}
 return{session:{...session,users:[...session.users,{...user,joinedAt:new Date().toISOString()}]},joined:true,reason:'joined' as const}
}

export function stopHoloCubeSession(session:HoloCubeSession,operatorId:string){
 const authorized=operatorId===session.hostUserId||session.users.some(u=>u.id===operatorId&&u.role==='operator')
 return authorized?{...session,simulationStopped:true}:session
}

export function assignHoloCubeDisplay(session:HoloCubeSession,display:VolcanoDisplayCapability){
 const displays=[...session.displays.filter(d=>d.id!==display.id),display]
 return{...session,displays}
}

export function holoCubeLoadPlan(session:HoloCubeSession){
 const players=session.users.filter(u=>u.role==='player'||u.role==='host').length
 const spectators=session.users.filter(u=>u.role==='spectator').length
 return{
  users:session.users.length,
  players,
  spectators,
  maxUsers:VOLCANO_SESSION_MAX_USERS,
  reserveSlots:Math.max(0,VOLCANO_SESSION_MAX_USERS-session.users.length),
  prioritizeInput:true,
  synchronizeFaces:session.faces.length,
 }
}
