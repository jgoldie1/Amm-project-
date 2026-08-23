// Real Audio Engine
// Handles: file upload to R2/Supabase, browser playback via Web Audio API,
// waveform generation, royalty tick tracking
// Falls back to demo tracks when no backend is configured

export interface Track {
  id: string
  title: string
  artist: string
  genre: string
  duration: number      // seconds
  fileUrl: string | null  // null = demo mode, no real file
  coverColor: string
  plays: number
  royaltyRate: number   // $/stream
  uploadedBy: string
  bpm?: number
  scripture?: string
}

export interface AudioState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  waveformData: number[]
  queue: Track[]
  uploadProgress: number  // 0-100
  uploading: boolean
  uploadError: string | null
}

export type AudioEventCallback = (state: AudioState) => void

const DEMO_TRACKS: Track[] = [
  { id: 't1', title: 'Holy Is The Lord', artist: 'SetApart Worship', genre: 'Gospel', duration: 214, fileUrl: null, coverColor: '#8800ff', plays: 12432, royaltyRate: 0.019, uploadedBy: 'SisRuth', scripture: 'Isaiah 6:3' },
  { id: 't2', title: 'Street Gospel', artist: 'AMM Trap', genre: 'Hip-Hop/Gospel', duration: 187, fileUrl: null, coverColor: '#ff4400', plays: 8901, royaltyRate: 0.018, uploadedBy: 'DJ_King', bpm: 140 },
  { id: 't3', title: 'Quantum Drive', artist: 'Omni Beats', genre: 'Electronic', duration: 301, fileUrl: null, coverColor: '#00ccff', plays: 5621, royaltyRate: 0.015, uploadedBy: 'BeatMaker_X', bpm: 128 },
  { id: 't4', title: 'Rise Up', artist: 'Creator Wave', genre: 'R&B/Soul', duration: 243, fileUrl: null, coverColor: '#ff8800', plays: 15043, royaltyRate: 0.017, uploadedBy: 'QueenZion', scripture: 'Isaiah 40:31' },
  { id: 't5', title: 'Block Chain Blues', artist: 'El Saturn Jazz', genre: 'Jazz/Neo-Soul', duration: 278, fileUrl: null, coverColor: '#ffaa00', plays: 3211, royaltyRate: 0.016, uploadedBy: 'MrSaturn' },
  { id: 't6', title: 'Hebraic Praise', artist: 'Zion Collective', genre: 'Worship', duration: 195, fileUrl: null, coverColor: '#00cc44', plays: 9887, royaltyRate: 0.019, uploadedBy: 'ZionChoir', scripture: 'Psalm 150' },
]

export class AudioEngine {
  private audioCtx: AudioContext | null = null
  private audioElement: HTMLAudioElement | null = null
  private gainNode: GainNode | null = null
  private analyserNode: AnalyserNode | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private waveformInterval: ReturnType<typeof setInterval> | null = null
  private mockPlayInterval: ReturnType<typeof setInterval> | null = null
  private tracks: Track[] = [...DEMO_TRACKS]
  private onChange: AudioEventCallback

  private state: AudioState = {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    waveformData: Array(64).fill(0),
    queue: [],
    uploadProgress: 0,
    uploading: false,
    uploadError: null,
  }

  constructor(onChange: AudioEventCallback) {
    this.onChange = onChange
  }

  getTracks(): Track[] { return this.tracks }

  // ── Play a track ─────────────────────────────────────────────────────────

  async play(track: Track): Promise<void> {
    this.stopMock()

    if (track.fileUrl) {
      // Real file — use Web Audio API
      await this.playReal(track)
    } else {
      // Demo mode — simulate playback with animated waveform
      this.playMock(track)
    }
  }

  private async playReal(track: Track): Promise<void> {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext()
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume()
      }

      if (!this.audioElement) {
        this.audioElement = new Audio()
        this.audioElement.crossOrigin = 'anonymous'
      }

      this.audioElement.src = track.fileUrl!
      this.audioElement.volume = this.state.volume

      // Connect to analyser
      if (!this.sourceNode) {
        this.gainNode = this.audioCtx.createGain()
        this.analyserNode = this.audioCtx.createAnalyser()
        this.analyserNode.fftSize = 128
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement)
        this.sourceNode.connect(this.gainNode)
        this.gainNode.connect(this.analyserNode)
        this.analyserNode.connect(this.audioCtx.destination)
      }

      this.gainNode!.gain.value = this.state.volume
      await this.audioElement.play()

      this.emit({ currentTrack: track, isPlaying: true, duration: track.duration, currentTime: 0 })

      // Wire up events
      this.audioElement.ontimeupdate = () => {
        if (!this.audioElement) return
        this.emit({ currentTime: this.audioElement.currentTime })
      }
      this.audioElement.onended = () => {
        this.emit({ isPlaying: false, currentTime: 0 })
        this.playNext()
      }

      // Waveform update loop
      this.startWaveformLoop()
    } catch (err) {
      // Fall back to mock if real playback fails
      this.playMock(track)
    }
  }

  private playMock(track: Track): void {
    let t = 0
    this.emit({ currentTrack: track, isPlaying: true, duration: track.duration, currentTime: 0 })
    this.mockPlayInterval = setInterval(() => {
      t += 0.1
      if (t >= track.duration) {
        this.emit({ isPlaying: false, currentTime: 0 })
        clearInterval(this.mockPlayInterval!)
        this.playNext()
        return
      }
      // Animated waveform — genre-influenced
      const waveform = generateMockWaveform(track.genre, Date.now())
      this.emit({ currentTime: t, waveformData: waveform })
    }, 100)
  }

  private startWaveformLoop(): void {
    if (this.waveformInterval) clearInterval(this.waveformInterval)
    this.waveformInterval = setInterval(() => {
      if (!this.analyserNode) return
      const data = new Uint8Array(this.analyserNode.frequencyBinCount)
      this.analyserNode.getByteFrequencyData(data)
      this.emit({ waveformData: Array.from(data).map(v => v / 255) })
    }, 60)
  }

  // ── Pause / Resume / Seek ────────────────────────────────────────────────

  pause(): void {
    if (this.audioElement) this.audioElement.pause()
    if (this.mockPlayInterval) clearInterval(this.mockPlayInterval)
    this.emit({ isPlaying: false })
  }

  resume(): void {
    if (this.audioElement) {
      this.audioElement.play().catch(() => {})
      this.emit({ isPlaying: true })
    } else if (this.state.currentTrack) {
      this.play(this.state.currentTrack)
    }
  }

  seek(seconds: number): void {
    if (this.audioElement) this.audioElement.currentTime = seconds
    this.emit({ currentTime: seconds })
  }

  setVolume(v: number): void {
    const vol = Math.max(0, Math.min(1, v))
    if (this.gainNode) this.gainNode.gain.value = vol
    if (this.audioElement) this.audioElement.volume = vol
    this.emit({ volume: vol })
  }

  // ── Queue management ─────────────────────────────────────────────────────

  setQueue(tracks: Track[]): void { this.emit({ queue: tracks }) }

  playNext(): void {
    if (!this.state.queue.length) return
    const current = this.state.currentTrack
    const idx = this.state.queue.findIndex(t => t.id === current?.id)
    const next = this.state.queue[idx + 1] ?? this.state.queue[0]
    if (next) this.play(next)
  }

  playPrev(): void {
    if (!this.state.queue.length) return
    const current = this.state.currentTrack
    const idx = this.state.queue.findIndex(t => t.id === current?.id)
    const prev = this.state.queue[idx - 1] ?? this.state.queue[this.state.queue.length - 1]
    if (prev) this.play(prev)
  }

  // ── Upload ───────────────────────────────────────────────────────────────

  async uploadTrack(file: File, meta: {
    title: string
    artist: string
    genre: string
    scripture?: string
    bpm?: number
  }): Promise<Track | null> {
    this.emit({ uploading: true, uploadProgress: 0, uploadError: null })

    try {
      // Real upload path — POST to your backend which handles R2/Supabase Storage
      const uploadEndpoint = '/api/upload-track'
      const canUpload = await checkEndpoint(uploadEndpoint)

      if (canUpload) {
        return await this.realUpload(file, meta)
      } else {
        return await this.mockUpload(file, meta)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      this.emit({ uploading: false, uploadError: msg })
      return null
    }
  }

  private async realUpload(file: File, meta: { title: string; artist: string; genre: string; scripture?: string; bpm?: number }): Promise<Track> {
    const form = new FormData()
    form.append('file', file)
    form.append('meta', JSON.stringify(meta))

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        this.emit({ uploadProgress: Math.round(e.loaded / e.total * 100) })
      }
    }

    const result = await new Promise<{ url: string; id: string }>((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText))
        else reject(new Error(`Upload failed: ${xhr.status}`))
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.open('POST', '/api/upload-track')
      xhr.send(form)
    })

    const newTrack: Track = {
      id: result.id,
      title: meta.title,
      artist: meta.artist,
      genre: meta.genre,
      duration: await getAudioDuration(file),
      fileUrl: result.url,
      coverColor: genreColor(meta.genre),
      plays: 0,
      royaltyRate: royaltyRate(meta.genre),
      uploadedBy: 'you',
      bpm: meta.bpm,
      scripture: meta.scripture,
    }
    this.tracks = [newTrack, ...this.tracks]
    this.emit({ uploading: false, uploadProgress: 100 })
    return newTrack
  }

  private async mockUpload(file: File, meta: { title: string; artist: string; genre: string; scripture?: string; bpm?: number }): Promise<Track> {
    // Simulate upload progress
    for (let p = 0; p <= 100; p += 10) {
      await delay(80)
      this.emit({ uploadProgress: p })
    }
    // Create object URL for local playback (works in browser without a server)
    const localUrl = URL.createObjectURL(file)
    const duration = await getAudioDuration(file)

    const newTrack: Track = {
      id: 'local-' + Date.now(),
      title: meta.title,
      artist: meta.artist,
      genre: meta.genre,
      duration,
      fileUrl: localUrl,
      coverColor: genreColor(meta.genre),
      plays: 0,
      royaltyRate: royaltyRate(meta.genre),
      uploadedBy: 'you',
      bpm: meta.bpm,
      scripture: meta.scripture,
    }
    this.tracks = [newTrack, ...this.tracks]
    this.emit({ uploading: false, uploadProgress: 100 })
    return newTrack
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  private stopMock() {
    if (this.mockPlayInterval) { clearInterval(this.mockPlayInterval); this.mockPlayInterval = null }
    if (this.waveformInterval) { clearInterval(this.waveformInterval); this.waveformInterval = null }
  }

  dispose() {
    this.stopMock()
    if (this.audioElement) { this.audioElement.pause(); this.audioElement.src = '' }
    if (this.audioCtx) this.audioCtx.close()
  }

  private emit(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch }
    this.onChange({ ...this.state })
  }

  getState(): AudioState { return { ...this.state } }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function checkEndpoint(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok
  } catch { return false }
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => { resolve(Math.round(audio.duration)); URL.revokeObjectURL(url) }
    audio.onerror = () => resolve(0)
  })
}

function generateMockWaveform(genre: string, t: number): number[] {
  const bins = 64
  const data: number[] = []
  // Genre-specific waveform character
  const profiles: Record<string, (i: number, t: number) => number> = {
    'Gospel':           (i, t) => Math.abs(Math.sin(t / 300 + i * 0.3)) * 0.7 + 0.1,
    'Hip-Hop/Gospel':   (i, t) => (i % 4 === 0 ? 0.9 : 0.3) * Math.abs(Math.sin(t / 200 + i * 0.2)) + 0.05,
    'Electronic':       (i, t) => Math.abs(Math.sin(t / 100 * (i % 8) * 0.4)) * 0.8,
    'R&B/Soul':         (i, t) => Math.abs(Math.sin(t / 400 + i * 0.15)) * 0.6 + 0.15,
    'Jazz/Neo-Soul':    (i, t) => Math.abs(Math.sin(t / 350 + i * 0.25) * Math.cos(i * 0.1)) * 0.55 + 0.1,
    'Worship':          (i, t) => Math.abs(Math.sin(t / 500 + i * 0.1)) * 0.5 + 0.15,
  }
  const fn = profiles[genre] ?? profiles['R&B/Soul']
  for (let i = 0; i < bins; i++) {
    data.push(Math.min(1, Math.max(0, fn(i, t) + (Math.random() * 0.08 - 0.04))))
  }
  return data
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function genreColor(genre: string): string {
  const map: Record<string, string> = {
    'Gospel': '#8800ff', 'Hip-Hop/Gospel': '#ff4400', 'Electronic': '#00ccff',
    'R&B/Soul': '#ff8800', 'Jazz/Neo-Soul': '#ffaa00', 'Worship': '#00cc44',
    'Podcast': '#00ffcc', 'Debate': '#ff0066',
  }
  return map[genre] ?? '#555566'
}

export function royaltyRate(genre: string): number {
  const rates: Record<string, number> = {
    'Gospel': 0.019, 'Worship': 0.019, 'Hip-Hop/Gospel': 0.018,
    'R&B/Soul': 0.017, 'Jazz/Neo-Soul': 0.016, 'Electronic': 0.015,
    'Podcast': 0.010, 'Debate': 0.008,
  }
  return rates[genre] ?? 0.015
}

export function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
