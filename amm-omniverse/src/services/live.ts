import { Room, RoomEvent, Track } from 'livekit-client'
import { getAccessToken } from './supabaseClient'
import { installCallSafeLive } from './protectedLive'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

export type LiveRole = 'host' | 'viewer'

export interface LiveTokenResponse {
  token: string
  url: string
  room: string
  role: LiveRole
  participant: string
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const token = await getAccessToken()
  if (!token) throw new Error('Sign in is required for LIVE')
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error || `LIVE request failed (${response.status})`)
  return body as T
}

export async function getLiveStatus() {
  if (!API_URL) return { configured: false }
  const response = await fetch(`${API_URL}/api/live/status`)
  return response.json() as Promise<{ configured: boolean; url?: string }>
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
  const session = await createLiveToken(opts.roomName, opts.role, opts.displayName)
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

  await room.connect(session.url, session.token)
  updateCount()

  let protectedLive: ReturnType<typeof installCallSafeLive> | null = null
  if (opts.role === 'host') {
    await room.localParticipant.setMicrophoneEnabled(true)
    await room.localParticipant.setCameraEnabled(true)

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
}
