import {createVolcanoDisplayCapability,createVolcanoExperienceSession,type VolcanoDisplayCapability,type VolcanoDisplayTarget} from './volcanoExperienceRuntime'
import {createHoloCubeSession,assignHoloCubeDisplay,type HoloCubeSession} from './holoCubeRuntime'

export type HoloCastWorldState={sessionId:string;worldId:string;missionId?:string;playerId:string;position?:[number,number,number];updatedAt:string}
export type HoloCastSession={volcano:ReturnType<typeof createVolcanoExperienceSession>;cube:HoloCubeSession;world:HoloCastWorldState;outputs:VolcanoDisplayCapability[]}

export function createHoloCastSession(playerId:string,worldId='streetverse-chicago'):HoloCastSession{
 const phone=createVolcanoDisplayCapability('holo-fon','phone','controller')
 const tv=createVolcanoDisplayCapability('primary-tv','tv','primary')
 const volcano=createVolcanoExperienceSession(tv,[phone])
 const cube=assignHoloCubeDisplay(createHoloCubeSession(volcano.id,playerId,'room'),tv)
 return{volcano:{...volcano,synchronized:true},cube,world:{sessionId:volcano.id,worldId,playerId,updatedAt:new Date().toISOString()},outputs:[tv,phone]}
}

export function addHoloCastOutput(session:HoloCastSession,id:string,target:VolcanoDisplayTarget){
 const role=target==='phone'||target==='tablet'?'controller':target==='ar'||target==='vr'||target==='mixed-reality'||target==='holo-lab'||target==='full-room'?'room-anchor':'companion'
 const display=createVolcanoDisplayCapability(id,target,role)
 return{...session,cube:assignHoloCubeDisplay(session.cube,display),outputs:[...session.outputs.filter(x=>x.id!==id),display]}
}

export function updateHoloCastWorld(session:HoloCastSession,patch:Partial<Omit<HoloCastWorldState,'sessionId'|'playerId'>>){
 return{...session,world:{...session.world,...patch,updatedAt:new Date().toISOString()}}
}

export const HOLOCAST_CONTINUITY={oneAuthoritativeWorldState:true,phoneCanRemainController:true,tvCanRemainPrimaryDisplay:true,holoCubeSharesSameSession:true,streamingCanRunInParallel:true,missionInventoryAccessibilityFollowPlayer:true,adaptivePerDisplayRendering:true} as const
