// LiveKit Streaming Engine
// Real WebRTC audio/video streaming via LiveKit Cloud
// No production mock fallback. Failed streams report errors, never simulated viewers.
//
// Configure server-only LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.

import {createLiveToken} from '../../services/live'

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

// Token endpoint is POST /api/live/token using authenticated server LiveKit settings.

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
    mockMode: false,
  }
  private onChange: StreamEventCallback
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null

  constructor(onChange: StreamEventCallback) {
    this.onChange = onChange
  }

  // ── Join a room as viewer or broadcaster ────────────────────────────────

  async join(roomName: string, userName: string, asHost: boolean): Promise<void> {
    this.emit({ connecting: true, error: null, roomName })

    try {
      // Get token from your backend
      const session=await createLiveToken(roomName,asHost?'host':'viewer',userName)

      this.room = new Room({ adaptiveStream: true, dynacast: true })
      this.setupRoomEvents()

      await this.room.connect(session.url,session.token)
      this.emit({ connected: true, connecting: false, roomName })

      if (asHost) {
        await this.startPublishing()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      this.emit({ error: msg, connecting: false })
      // Fail closed: a provider/auth error is not a real broadcast.
      try{await this.room?.disconnect()}catch{}
      this.room=null
      this.emit({connected:false,isPublishing:false,viewerCount:0,participants:[],mockMode:false})
    }
  }

  // ── Publish audio (and optionally video) ───────────────────────────────

  async startPublishing(withVideo = false): Promise<void> {
    if (!this.room) throw new Error('Cannot publish before connecting to a real LIVE room')

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
      if(pub.track){await lp.unpublishTrack(pub.track);pub.track.stop()}
    }
    this.emit({ isPublishing: false })
  }

  // ── Leave room ──────────────────────────────────────────────────────────

  async leave(): Promise<void> {
    if (this.room) {
      await this.room.disconnect()
      this.room = null
    }
    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }
    this.mediaStream?.getTracks().forEach(t=>t.stop())
    this.mediaStream=null
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

  // ── State helper ────────────────────────────────────────────────────────

  private emit(patch: Partial<StreamState>) {
    this.state = { ...this.state, ...patch }
    this.onChange({ ...this.state })
  }

  getState(): StreamState { return { ...this.state } }
}

// Tokens come from the authenticated TRYAMM /api/live/token route.
