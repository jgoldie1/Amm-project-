import {DEFAULT_STREAM_DESTINATIONS,type StreamDestination,type StreamPlatform} from './UniversalCreatorStreamBridge'

export type CreatorStreamSession={id:string;gameSessionId:string;roomName:string;startedAt:string;destinations:StreamDestination[];status:'ready'|'live'|'degraded'|'ended'}
export type DestinationHealth={platform:StreamPlatform;connected:boolean;publishing:boolean;lastEventAt?:string;error?:string}

export function createCreatorStreamSession(gameSessionId:string,roomName:string):CreatorStreamSession{
 return{id:'stream_'+crypto.randomUUID(),gameSessionId,roomName,startedAt:new Date().toISOString(),destinations:DEFAULT_STREAM_DESTINATIONS.map(d=>({...d})),status:'ready'}
}

export function patchDestination(session:CreatorStreamSession,platform:StreamPlatform,patch:Partial<Pick<StreamDestination,'enabled'|'connected'>>){
 return{...session,destinations:session.destinations.map(d=>d.platform===platform?{...d,...patch}:d)}
}

export function computeStreamHealth(health:readonly DestinationHealth[]){
 const active=health.filter(h=>h.connected)
 const publishing=active.filter(h=>h.publishing)
 return{connected:active.length,publishing:publishing.length,degraded:active.some(h=>!h.publishing||h.error),errors:active.filter(h=>h.error).map(h=>({platform:h.platform,error:h.error!}))}
}

export const CREATOR_GAMECAST_REQUIREMENTS={
 oneCapturePipeline:true,
 gameInputNeverBlockedByStreamReconnect:true,
 backgroundReconnect:true,
 perDestinationKillSwitch:true,
 unifiedEventOverlay:true,
 platformNativeGiftSettlement:true,
 tryammGiftSettlementServerAuthoritative:true,
 accessibleOneHandControls:true,
 captionsAndTranslationHooks:true,
 replayHandoff:true,
} as const
