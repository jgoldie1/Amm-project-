// LiveKit Streaming Engine
// Real WebRTC audio/video streaming via LiveKit Cloud
// Falls back to mock mode when no LIVEKIT_URL is set — so it always runs
//
// To enable real streaming:
//   1. Create free account at livekit.io
//   2. Add to your .env:
//      VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
//      VITE_LIVEKIT_API_KEY=your_api_key
//      VITE_LIVEKIT_API_SECRET=your_api_secret
//   3. Add a simple token endpoint to your Express backend (see TOKEN_ENDPOINT below)

import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
  LocalParticipant,
  createLocalTracks,
  type ConnectionState,
} from 'livekit-client'

export type StreamType = 'music' | 'podcast' | 'debate' | 'livestream'

export interface StreamParticipant {
  identity: string
  name: string
  isSpeaking: boolean
  audioLevel: number
  hasVideo: boolean
  hasAudio: boolean
}

export interface StreamState {
  connected: boolean
  connecting: boolean
  error: string | null
  participants: StreamParticipant[]
  isPublishing: boolean
  roomName: string
  viewerCount: number
  mockMode: boolean
}

export type StreamEventCallback = (state: StreamState) => void

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL as string | undefined
const TOKEN_ENDPOINT = '/api/livekit-token' // Your Express backend provides this

export class StreamingEngine {
  private room: Room | null = null
  private state: StreamState = {
    connected: false,
    connecting: false,
    error: null,
    participants: [],
    isPublishing: false,
    roomName: '',
    viewerCount: 0,
    mockMode: !LIVEKIT_URL,
  }
  private onChange: StreamEventCallback
  private mockInterval: ReturnType<typeof setInterval> | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null

  constructor(onChange: StreamEventCallback) {
    this.onChange = onChange
  }

  // ── Join a room as viewer or broadcaster ────────────────────────────────

  async join(roomName: string, userName: string, asHost: boolean): Promise<void> {
    this.emit({ connecting: true, error: null, roomName })

    if (this.state.mockMode) {
      await this.mockJoin(roomName, userName, asHost)
      return
    }

    try {
      // Get token from your backend
      const res = await fetch(`${TOKEN_ENDPOINT}?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(userName)}&host=${asHost}`)
      if (!res.ok) throw new Error('Could not get stream token')
      const { token } = await res.json() as { token: string }

      this.room = new Room({ adaptiveStream: true, dynacast: true })
      this.setupRoomEvents()

      await this.room.connect(LIVEKIT_URL!, token)
      this.emit({ connected: true, connecting: false, roomName })

      if (asHost) {
        await this.startPublishing()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      this.emit({ error: msg, connecting: false })
      // Fall through to mock mode on error
      await this.mockJoin(roomName, userName, asHost)
    }
  }

  // ── Publish audio (and optionally video) ───────────────────────────────

  async startPublishing(withVideo = false): Promise<void> {
    if (this.state.mockMode) {
      this.emit({ isPublishing: true })
      return
    }
    if (!this.room) return

    try {
      const tracks = await createLocalTracks({ audio: true, video: withVideo })
      for (const track of tracks) {
        await (this.room.localParticipant as LocalParticipant).publishTrack(track)
      }
      this.emit({ isPublishing: true })

      // Set up audio analyser for visualizer
      if (withVideo || true) {
        this.setupAudioAnalyser()
      }
    } catch (err) {
      this.emit({ error: 'Could not access microphone' })
    }
  }

  // ── Stop publishing ─────────────────────────────────────────────────────

  async stopPublishing(): Promise<void> {
    if (!this.room) return
    const lp = this.room.localParticipant as LocalParticipant
    for (const pub of lp.trackPublications.values()) {
      await pub.unmute()
      lp.unpublishTrack(pub.track!)
    }
    this.emit({ isPublishing: false })
  }

  // ── Leave room ──────────────────────────────────────────────────────────

  async leave(): Promise<void> {
    if (this.mockInterval) clearInterval(this.mockInterval)
    if (this.room) {
      await this.room.disconnect()
      this.room = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.emit({
      connected: false,
      connecting: false,
      participants: [],
      isPublishing: false,
      viewerCount: 0,
      roomName: '',
    })
  }

  // ── Audio analyser for waveform visualizer ──────────────────────────────

  private async setupAudioAnalyser() {
    try {
      this.audioContext = new AudioContext()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaStream = stream
      const src = this.audioContext.createMediaStreamSource(stream)
      src.connect(this.analyser)
    } catch {
      // Silently fail — visualizer just won't animate
    }
  }

  getWaveformData(): Uint8Array | null {
    if (!this.analyser) return null
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    return data
  }

  // ── Room event wiring ───────────────────────────────────────────────────

  private setupRoomEvents() {
    if (!this.room) return

    this.room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
      this.updateParticipants()
    })
    this.room.on(RoomEvent.ParticipantDisconnected, () => {
      this.updateParticipants()
    })
    this.room.on(RoomEvent.TrackSubscribed, (
      track: RemoteTrack,
      _pub: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach()
        document.body.appendChild(el)
      }
      if (track.kind === Track.Kind.Video) {
        // Caller attaches video to their own element
      }
      this.updateParticipants()
    })
    this.room.on(RoomEvent.ActiveSpeakersChanged, () => {
      this.updateParticipants()
    })
    this.room.on(RoomEvent.Disconnected, () => {
      this.emit({ connected: false })
    })
    this.room.on(RoomEvent.ConnectionStateChanged, (cs: ConnectionState) => {
      this.emit({ connecting: cs === 'connecting' })
    })
  }

  private updateParticipants() {
    if (!this.room) return
    const parts: StreamParticipant[] = []
    this.room.remoteParticipants.forEach((p: RemoteParticipant) => {
      let hasVideo = false
      let hasAudio = false
      p.trackPublications.forEach((pub) => {
        if (pub.kind === Track.Kind.Video) hasVideo = true
        if (pub.kind === Track.Kind.Audio) hasAudio = true
      })
      parts.push({
        identity: p.identity,
        name: p.name || p.identity,
        isSpeaking: p.isSpeaking,
        audioLevel: p.audioLevel,
        hasVideo,
        hasAudio,
      })
    })
    this.emit({ participants: parts, viewerCount: parts.length + 1 })
  }

  // ── Mock mode — full simulation of streaming UX ──────────────────────────

  private async mockJoin(roomName: string, userName: string, asHost: boolean): Promise<void> {
    await delay(800)
    const mockParticipants = buildMockParticipants(roomName)
    this.emit({
      connected: true,
      connecting: false,
      mockMode: true,
      roomName,
      isPublishing: asHost,
      participants: mockParticipants,
      viewerCount: Math.floor(Math.random() * 200) + 10,
    })

    // Simulate dynamic stream activity
    this.mockInterval = setInterval(() => {
      const updated = this.state.participants.map(p => ({
        ...p,
        isSpeaking: Math.random() > 0.6,
        audioLevel: Math.random(),
      }))
      // Random viewer count drift
      const drift = Math.floor((Math.random() - 0.4) * 5)
      this.emit({
        participants: updated,
        viewerCount: Math.max(1, this.state.viewerCount + drift),
      })
    }, 2000)
  }

  // ── State helper ────────────────────────────────────────────────────────

  private emit(patch: Partial<StreamState>) {
    this.state = { ...this.state, ...patch }
    this.onChange({ ...this.state })
  }

  getState(): StreamState { return { ...this.state } }
}

// ── Token generation (backend — Express) ────────────────────────────────────
// Add this route to your backend/api/index.js:
//
// const { AccessToken } = require('livekit-server-sdk')
// app.get('/api/livekit-token', (req, res) => {
//   const { room, user, host } = req.query
//   const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: user })
//   at.addGrant({ roomJoin: true, room, canPublish: host === 'true', canSubscribe: true })
//   res.json({ token: at.toJwt() })
// })

// ── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function buildMockParticipants(room: string): StreamParticipant[] {
  const pools: Record<string, { name: string; hasVideo: boolean }[]> = {
    'music-stage':   [{ name: 'DJ_SetApart', hasVideo: true }, { name: 'Producer_Omni', hasVideo: false }],
    'podcast-faith': [{ name: 'PastorEzra', hasVideo: true }, { name: 'SisRuth', hasVideo: true }, { name: 'BroSolomon', hasVideo: false }],
    'debate-room':   [{ name: 'ScholarMoses', hasVideo: true }, { name: 'TeacherDeborah', hasVideo: true }],
    'default':       [{ name: 'Creator_1', hasVideo: false }, { name: 'Creator_2', hasVideo: true }],
  }
  const pool = pools[room] ?? pools['default']
  return pool.map(p => ({
    identity: p.name,
    name: p.name,
    isSpeaking: Math.random() > 0.5,
    audioLevel: Math.random(),
    hasVideo: p.hasVideo,
    hasAudio: true,
  }))
}
