import {RoomServiceClient} from 'livekit-server-sdk';

// Never pass credentials to the client or infer a LIVE host from a request body.
// The check is performed by the server against LiveKit's room service.
const serverHost=()=>String(process.env.LIVEKIT_URL||'').trim().replace(/^wss:/i,'https:').replace(/^ws:/i,'http:')
const apiKey=()=>String(process.env.LIVEKIT_API_KEY||'').trim()
const apiSecret=()=>String(process.env.LIVEKIT_API_SECRET||'').trim()
export const liveKitServerReady=()=>Boolean(serverHost()&&apiKey()&&apiSecret())
export function liveKitRoomService(){
 if(!liveKitServerReady())throw new Error('livekit_room_service_not_configured')
 const endpoint=new URL(serverHost())
 if(!['https:','http:'].includes(endpoint.protocol))throw new Error('invalid_livekit_server_url')
 return new RoomServiceClient(endpoint.toString(),apiKey(),apiSecret())
}
export async function isLiveKitHostPublishing(room,userId){
 if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(String(room)))return false
 if(!userId)return false
 const identity=String(userId)+':host'
 const service=liveKitRoomService()
 let participant
 try{participant=await service.getParticipant(room,identity)}
 catch(error){
  // LiveKit room/participant not found: fail closed. Other outages should
  // produce a 503 from the caller rather than pretending there is a host.
  const message=String(error?.message||'').toLowerCase()
  if(error?.status===404||error?.code===404||/\bnot found\b|\bnot_found\b/.test(message))return false
  throw error
 }
 return Boolean(participant?.identity===identity && Array.isArray(participant.tracks) &&
  participant.tracks.some(track=>track && !track.muted))
}
