export type QuantumBeatMode = 'music' | 'live' | 'game' | 'cinema' | 'holo'

export type QuantumBeatEvent = {
  beat: number
  bar: number
  phase: number
  bpm: number
  mode: QuantumBeatMode
  timestamp: number
  targetTimestamp: number
  driftMs: number
}

export type QuantumBeatOptions = {
  bpm?: number
  beatsPerBar?: number
  mode?: QuantumBeatMode
  latencyCompensationMs?: number
}

const EVENT_NAME = 'tryamm:quantum-beat'

export class QuantumBeatClock {
  private bpm: number
  private beatsPerBar: number
  private mode: QuantumBeatMode
  private latencyCompensationMs: number
  private timer: number | null = null
  private startedAt = 0
  private beat = 0

  constructor(options: QuantumBeatOptions = {}) {
    this.bpm = options.bpm ?? 120
    this.beatsPerBar = options.beatsPerBar ?? 4
    this.mode = options.mode ?? 'music'
    this.latencyCompensationMs = options.latencyCompensationMs ?? 0
  }

  configure(options: QuantumBeatOptions) {
    if (options.bpm) this.bpm = Math.max(30, Math.min(300, options.bpm))
    if (options.beatsPerBar) this.beatsPerBar = Math.max(1, Math.min(16, options.beatsPerBar))
    if (options.mode) this.mode = options.mode
    if (typeof options.latencyCompensationMs === 'number') this.latencyCompensationMs = Math.max(-1000, Math.min(1000, options.latencyCompensationMs))
  }

  start() {
    if (this.timer !== null) return
    this.startedAt = performance.now()
    this.beat = 0
    this.tick()
  }

  stop() {
    if (this.timer !== null) window.clearTimeout(this.timer)
    this.timer = null
  }

  private tick = () => {
    const interval = 60000 / this.bpm
    const now = performance.now()
    const ideal = this.startedAt + this.beat * interval
    const target = ideal + this.latencyCompensationMs
    const drift = now - target
    const bar = Math.floor(this.beat / this.beatsPerBar) + 1
    const phase = this.beat % this.beatsPerBar

    const detail: QuantumBeatEvent = {
      beat: this.beat + 1,
      bar,
      phase,
      bpm: this.bpm,
      mode: this.mode,
      timestamp: now,
      targetTimestamp: target,
      driftMs: drift,
    }

    window.dispatchEvent(new CustomEvent<QuantumBeatEvent>(EVENT_NAME, { detail }))
    this.beat += 1
    const nextIdeal = this.startedAt + this.beat * interval + this.latencyCompensationMs
    const delay = Math.max(0, nextIdeal - performance.now())
    this.timer = window.setTimeout(this.tick, delay)
  }
}

export const quantumBeatClock = new QuantumBeatClock()
export const quantumBeatEventName = EVENT_NAME

export function onQuantumBeat(handler: (event: QuantumBeatEvent) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<QuantumBeatEvent>).detail)
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
