import type {HoloLabHardwareCapability,HoloLabReadiness,VolcanoDisplayCapability,VolcanoExperienceSession} from './volcanoExperienceRuntime'
import {assessHoloLabReadiness,createVolcanoExperienceSession,volcanoRoomLoad} from './volcanoExperienceRuntime'
import {chooseQuantumSpeedMode,quantumLagActions,type QuantumLagSignal,type QuantumSpeedSample} from './quantumSpeedEngine'

export type HoloLabAiTask='discover-devices'|'calibrate-room'|'place-anchors'|'track-participants'|'sync-rendering'|'tune-spatial-audio'|'enforce-safety-boundary'|'handoff-session'|'optimize-performance'
export type HoloLabAiDecision={task:HoloLabAiTask;approved:boolean;reason:string;humanApprovalRequired:boolean}
export type HoloLabRoomProfile={id:string;widthM:number;lengthM:number;heightM:number;safeMarginM:number;maxParticipants:number;calibratedAt?:string}
export type HoloLabSpatialAnchor={id:string;x:number;y:number;z:number;kind:'display'|'player'|'portal'|'vehicle'|'stage'|'safety-boundary'}
export type HoloLabParticipant={id:string;role:'player'|'spectator'|'operator';tracking:'none'|'three-dof'|'six-dof'|'room-scale';active:boolean}

export type HoloLabAiState={
 hardware:HoloLabHardwareCapability
 readiness:HoloLabReadiness
 room?:HoloLabRoomProfile
 anchors:HoloLabSpatialAnchor[]
 participants:HoloLabParticipant[]
 displays:VolcanoDisplayCapability[]
 decisions:HoloLabAiDecision[]
}

export function createHoloLabAiState(hardware:HoloLabHardwareCapability,displays:VolcanoDisplayCapability[]=[]):HoloLabAiState{
 return{hardware,readiness:assessHoloLabReadiness(hardware),anchors:[],participants:[],displays,decisions:[]}
}

export function validateRoomProfile(room:HoloLabRoomProfile){
 const usableWidth=room.widthM-room.safeMarginM*2
 const usableLength=room.lengthM-room.safeMarginM*2
 return{valid:usableWidth>=1.5&&usableLength>=1.5&&room.heightM>=2,usableWidth,usableLength}
}

export function aiHoloLabPlan(state:HoloLabAiState,speed:QuantumSpeedSample,lag:QuantumLagSignal){
 const room=state.room?validateRoomProfile(state.room):undefined
 const speedMode=chooseQuantumSpeedMode(speed)
 const lagActions=quantumLagActions(lag)
 const load=volcanoRoomLoad(state.displays)
 const decisions:HoloLabAiDecision[]=[
  {task:'discover-devices',approved:true,reason:`${state.displays.length} display endpoint(s) registered`,humanApprovalRequired:false},
  {task:'calibrate-room',approved:!!room?.valid,reason:room?.valid?'room dimensions pass minimum safety envelope':'valid room calibration required',humanApprovalRequired:true},
  {task:'place-anchors',approved:!!room?.valid,reason:'spatial anchors require a calibrated safe room',humanApprovalRequired:true},
  {task:'track-participants',approved:state.hardware.tracking!=='none',reason:`tracking mode: ${state.hardware.tracking}`,humanApprovalRequired:false},
  {task:'sync-rendering',approved:state.readiness.ready,reason:`display mode: ${state.readiness.mode}`,humanApprovalRequired:false},
  {task:'tune-spatial-audio',approved:state.hardware.spatialAudio,reason:state.hardware.spatialAudio?'spatial audio available':'fallback to conventional audio',humanApprovalRequired:false},
  {task:'enforce-safety-boundary',approved:!!room?.valid,reason:'boundary must remain authoritative and cannot be disabled by AI',humanApprovalRequired:true},
  {task:'handoff-session',approved:state.readiness.ready,reason:'handoff allowed only to capability-validated endpoints',humanApprovalRequired:false},
  {task:'optimize-performance',approved:true,reason:`Quantum mode ${speedMode}; lag actions ${lagActions.join(',')}; spatial endpoints ${load.spatialEndpoints}`,humanApprovalRequired:false},
 ]
 return{speedMode,lagActions,load,decisions}
}

export function buildHoloLabSession(primary:VolcanoDisplayCapability,companions:VolcanoDisplayCapability[]):VolcanoExperienceSession{
 return createVolcanoExperienceSession(primary,companions)
}


export type HoloLabAuthorityState={operatorId:string;simulationRunning:boolean;emergencyStopped:boolean;aiAutonomy:'advisory-only'|'bounded';lastStopAt?:string}

export function createHoloLabAuthority(operatorId:string):HoloLabAuthorityState{
 return{operatorId,simulationRunning:false,emergencyStopped:false,aiAutonomy:'advisory-only'}
}

export function startHoloLabSimulation(state:HoloLabAuthorityState,operatorId:string){
 if(state.operatorId!==operatorId||state.emergencyStopped)return state
 return{...state,simulationRunning:true}
}

export function stopHoloLabSimulation(state:HoloLabAuthorityState,operatorId:string){
 if(state.operatorId!==operatorId)return state
 return{...state,simulationRunning:false,lastStopAt:new Date().toISOString()}
}

export function emergencyStopHoloLab(state:HoloLabAuthorityState,operatorId:string){
 if(state.operatorId!==operatorId)return state
 return{...state,simulationRunning:false,emergencyStopped:true,lastStopAt:new Date().toISOString()}
}

export function resetHoloLabEmergencyStop(state:HoloLabAuthorityState,operatorId:string){
 if(state.operatorId!==operatorId)return state
 return{...state,emergencyStopped:false,simulationRunning:false}
}
