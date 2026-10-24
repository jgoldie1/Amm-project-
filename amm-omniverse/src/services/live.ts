import { getAccessToken } from './supabaseClient'
import { installCallSafeLive } from './protectedLive'

// LIVE routes deploy with amm-omniverse. Do not inherit legacy VITE_API_URL.
const LIVE_API_URL = (import.meta.env.VITE_LIVE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export type LiveRole = 'host' | 'viewer' | 'guest'

export interface LiveTokenResponse {
  token: string
  url: string
  room: string
  role: LiveRole
  participant: string
  videoProfile?: { label: string; width: number; height: number; frameRate: number; maxBitrate: number }
  capacity?: { maxParticipants: number }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new Error('Sign in is required for LIVE')
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${LIVE_API_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || `LIVE request failed (${response.status})`)
  return body as T
}

export async function getLiveStatus() {
  let response: Response
  try{
    response=await fetch(`${LIVE_API_URL}/api/live/status`,{cache:'no-store'})
  }catch{
    throw new Error('LIVE API is unreachable. Verify website/API project routing, VITE_LIVE_API_URL (optional) and HTTPS/CORS.')
  }
  if(!response.ok)throw new Error(`LIVE API request failed (HTTP ${response.status}). Verify the backend deployment.`)
  const contentType=response.headers.get('content-type')||''
  if(!contentType.toLowerCase().includes('application/json'))
    throw new Error('LIVE API returned a website page instead of JSON. Check Vercel /api routing and VITE_LIVE_API_URL (optional).')
  const data:unknown=await response.json()
  if(!data||typeof data!=='object'||!('configured' in data)||typeof data.configured!=='boolean')
    throw new Error('LIVE API returned an invalid status. The correct server code may not be deployed.')
  return data as {configured:boolean;readyForPublic?:boolean;url?:string}
}

export type LivePanelRequest={id:string;room_name:string;requester_user_id:string;display_name?:string|null;status:string;approved_at?:string|null;guardian_approval_required?:boolean;guardian_approved_at?:string|null;stage_position?:number|null}
export type LivePanelSnapshot={room:{room_name:string;status:string;host_user_id:string;max_panelists:number}|null;requests:LivePanelRequest[];canManage:boolean}
export async function getLivePanel(room:string){
  return api<LivePanelSnapshot>('/api/live/panel?room='+encodeURIComponent(room),{method:'GET'})
}
export async function sendLivePanelAction(room:string,action:'request_panel'|'approve'|'reject'|'remove',requestId?:string){
  return api<{request:LivePanelRequest}>('/api/live/panel',{method:'POST',body:JSON.stringify({room,action,requestId,micReady:false,cameraReady:false})})
}
export async function registerLiveHostRoom(room: string, title: string) {
  return api<{room:{room_name:string;host_user_id:string}}>('/api/live/panel',{
    method:'POST',
    body:JSON.stringify({action:'create_room',room,title,maxPanel:8})
  })
}
export async function setLiveHostRoomState(room:string,action:'start_room'|'end_room'){
  return api<{room:{room_name:string;status:'planned'|'live'|'ended'}}>('/api/live/panel',{
    method:'POST',body:JSON.stringify({action,room})
  })
}
export async function createLiveToken(room: string, role: LiveRole, displayName?: string) {
  return api<LiveTokenResponse>('/api/live/token', {
    method: 'POST',
    body: JSON.stringify({ room, role, displayName }),
  })
}

export async function connectLiveRoom(opts: {
  roomName: string
  role: LiveRole
  displayName?: string
  onParticipants?: (count: number) => void
  onTrack?: (element: HTMLMediaElement, participantIdentity: string) => void
}) {
  const [{ Room, RoomEvent, Track }, session] = await Promise.all([
    import('livekit-client'),
    createLiveToken(opts.roomName, opts.role, opts.displayName),
  ])
  const room = new Room({ adaptiveStream: true, dynacast: true })

  const updateCount = () => opts.onParticipants?.(room.remoteParticipants.size + 1)
  room.on(RoomEvent.ParticipantConnected, updateCount)
  room.on(RoomEvent.ParticipantDisconnected, updateCount)
  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    if (track.kind === Track.Kind.Audio || track.kind === Track.Kind.Video) {
      const element = track.attach()
      opts.onTrack?.(element, participant.identity)
    }
  })

  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    for (const element of track.detach()) element.remove()
  })

  let protectedLive: ReturnType<typeof installCallSafeLive> | null = null
  try {
    await room.connect(session.url, session.token)
    updateCount()
    if (opts.role === 'host' || opts.role === 'guest') {
      await room.localParticipant.setMicrophoneEnabled(true)
      const v=session.videoProfile
      await room.localParticipant.setCameraEnabled(true,v
        ? {resolution:{width:v.width,height:v.height},frameRate:v.frameRate}
        : {resolution:{width:640,height:360},frameRate:15})

      let restoreMic = true
      let restoreCamera = true
      protectedLive = installCallSafeLive(opts.roomName, {
        muteMicrophone: async () => {
          restoreMic = room.localParticipant.isMicrophoneEnabled
          if (restoreMic) await room.localParticipant.setMicrophoneEnabled(false)
        },
        disableCamera: async () => {
          restoreCamera = room.localParticipant.isCameraEnabled
          if (restoreCamera) await room.localParticipant.setCameraEnabled(false)
        },
        restoreMicrophone: async () => {
          if (restoreMic) await room.localParticipant.setMicrophoneEnabled(true)
        },
        restoreCamera: async () => {
          if (restoreCamera) await room.localParticipant.setCameraEnabled(true)
        },
      })

      room.once(RoomEvent.Disconnected, () => protectedLive?.destroy())
    }

    return { room, session, protectedLive }
  } catch (error) {
    // Camera publication can fail after the microphone and room are connected.
    // Stop every attached local track and leave before reporting the error.
    for (const publication of room.localParticipant.trackPublications.values()) {
      try { publication.track?.stop() } catch { /* Continue cleaning up other tracks. */ }
    }
    try { await room.disconnect() } catch { /* Preserve the original setup error. */ }
    throw error
  }
}
