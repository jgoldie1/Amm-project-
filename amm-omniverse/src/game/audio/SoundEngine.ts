// AMM Omniverse Sound Engine
// ALL sound effects generated procedurally via Web Audio API — 100% free, no audio files needed
// Works in browser on Chromebook, phone, desktop
// Based on Howler.js patterns + Web Audio synthesis

export type SoundKey =
  // City / Navigation
  | 'engine_start' | 'engine_idle' | 'engine_rev' | 'car_crash' | 'tire_screech'
  | 'portal_enter' | 'portal_whoosh' | 'footstep' | 'door_open'
  // Combat / Laser Tag
  | 'laser_fire' | 'laser_hit' | 'shield_up' | 'shield_break' | 'explosion'
  | 'health_pickup' | 'revive' | 'wanted_siren' | 'police_radio'
  // UI / Notifications
  | 'xp_gain' | 'level_up' | 'cash_earn' | 'mission_start' | 'mission_complete'
  | 'button_click' | 'tab_switch' | 'notification' | 'error' | 'success'
  // Sports
  | 'crowd_roar' | 'whistle' | 'ball_hit' | 'score' | 'buzzer'
  // Music Realm
  | 'vinyl_scratch' | 'beat_drop' | 'mic_check' | 'applause' | 'boo'
  | 'stream_live' | 'upload_complete' | 'royalty_earned'
  // Faith Realm
  | 'church_bell' | 'prayer_submit' | 'blessing' | 'choir_hit'
  // Blockchain / Wallet
  | 'wallet_connect' | 'nft_mint' | 'token_earn' | 'transaction_complete' | 'dao_vote'
  // Battle Realms
  | 'card_draw' | 'card_play' | 'card_destroy' | 'creature_catch' | 'ghost_detect'
  | 'ghost_capture' | 'zone_capture' | 'battle_start' | 'battle_win' | 'battle_lose'
  // Avatar
  | 'face_scan_beep' | 'avatar_select' | 'avatar_confirm'
  // Ambient
  | 'city_ambient' | 'crowd_ambient' | 'rain' | 'wind'

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientNodes: Map<string, AudioNode> = new Map()
  private enabled = true
  private volume = 0.7

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  private getMaster(): GainNode {
    this.getCtx()
    return this.masterGain!
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.masterGain) this.masterGain.gain.value = this.volume
  }

  setEnabled(e: boolean) { this.enabled = e }

  // ── Core synthesis helpers ──────────────────────────────────────────────

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3, decay = 0.8): void {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      g.gain.setValueAtTime(gain, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * decay)
      osc.connect(g); g.connect(this.getMaster())
      osc.start(); osc.stop(ctx.currentTime + duration)
    } catch { /* silent fail */ }
  }

  private sweep(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3): void {
    try {
      const ctx = this.getCtx()
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration)
      g.gain.setValueAtTime(gain, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(g); g.connect(this.getMaster())
      osc.start(); osc.stop(ctx.currentTime + duration)
    } catch { /* silent fail */ }
  }

  private noise(duration: number, gain = 0.15, filterFreq = 2000): void {
    try {
      const ctx = this.getCtx()
      const bufSize = ctx.sampleRate * duration
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = filterFreq
      const g = ctx.createGain()
      g.gain.setValueAtTime(gain, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      src.connect(filter); filter.connect(g); g.connect(this.getMaster())
      src.start(); src.stop(ctx.currentTime + duration)
    } catch { /* silent fail */ }
  }

  private chord(freqs: number[], duration: number, type: OscillatorType = 'sine', gain = 0.2): void {
    freqs.forEach((f, i) => setTimeout(() => this.tone(f, duration, type, gain / freqs.length), i * 20))
  }

  private sequence(notes: [number, number, number][], type: OscillatorType = 'square'): void {
    // notes = [freq, duration, delay]
    notes.forEach(([freq, dur, delay]) => setTimeout(() => this.tone(freq, dur, type, 0.25), delay))
  }

  // ── PLAY ────────────────────────────────────────────────────────────────

  play(key: SoundKey): void {
    if (!this.enabled) return
    try {
      this.sounds[key]?.()
    } catch { /* silent fail */ }
  }

  // ── SOUND DEFINITIONS ───────────────────────────────────────────────────

  private sounds: Record<SoundKey, () => void> = {
    // City
    engine_start:  () => { this.sweep(80, 200, 0.3, 'sawtooth', 0.4); setTimeout(() => this.sweep(200, 120, 0.5, 'sawtooth', 0.25), 300) },
    engine_idle:   () => { this.tone(85, 0.2, 'sawtooth', 0.08) },
    engine_rev:    () => { this.sweep(100, 400, 0.4, 'sawtooth', 0.35); this.sweep(400, 150, 0.3, 'sawtooth', 0.2) },
    car_crash:     () => { this.noise(0.5, 0.5, 800); this.tone(60, 0.4, 'sawtooth', 0.4) },
    tire_screech:  () => { this.noise(0.6, 0.3, 3000) },
    portal_enter:  () => { this.sweep(200, 2000, 0.6, 'sine', 0.4); this.chord([400,600,800,1200], 0.8, 'sine', 0.3) },
    portal_whoosh: () => { this.sweep(400, 100, 0.5, 'sine', 0.3); this.noise(0.4, 0.1, 1500) },
    footstep:      () => { this.noise(0.08, 0.2, 500) },
    door_open:     () => { this.sweep(300, 150, 0.2, 'square', 0.15); this.noise(0.1, 0.08, 1000) },

    // Combat
    laser_fire:    () => { this.sweep(800, 200, 0.15, 'square', 0.35); this.sweep(1600, 400, 0.1, 'sawtooth', 0.2) },
    laser_hit:     () => { this.noise(0.12, 0.3, 2000); this.tone(300, 0.1, 'square', 0.3) },
    shield_up:     () => { this.sweep(400, 800, 0.2, 'sine', 0.3); this.chord([600,900,1200], 0.3, 'sine', 0.15) },
    shield_break:  () => { this.noise(0.3, 0.4, 1200); this.sweep(800, 100, 0.4, 'sawtooth', 0.35) },
    explosion:     () => { this.noise(0.8, 0.6, 400); this.tone(50, 0.6, 'sawtooth', 0.5); this.sweep(300, 30, 0.8, 'sine', 0.4) },
    health_pickup: () => { this.sequence([[523,0.1,0],[659,0.1,100],[784,0.15,200]], 'sine') },
    revive:        () => { this.sweep(300, 800, 0.4, 'sine', 0.35); this.chord([400,600,800], 0.5, 'sine', 0.2) },
    wanted_siren:  () => {
      this.sweep(800, 1200, 0.3, 'square', 0.25)
      setTimeout(() => this.sweep(1200, 800, 0.3, 'square', 0.25), 350)
      setTimeout(() => this.sweep(800, 1200, 0.3, 'square', 0.25), 700)
    },
    police_radio:  () => { this.noise(0.15, 0.15, 2000); this.tone(900, 0.05, 'square', 0.1) },

    // UI
    xp_gain:          () => { this.sequence([[440,0.1,0],[554,0.1,80],[659,0.15,160]], 'sine') },
    level_up:         () => { this.chord([261,329,392,523], 0.6, 'sine', 0.3); this.sequence([[523,0.1,200],[659,0.1,350],[784,0.2,500]], 'sine') },
    cash_earn:        () => { this.tone(880, 0.1, 'sine', 0.3); this.tone(1108, 0.12, 'sine', 0.25) },
    mission_start:    () => { this.sequence([[392,0.15,0],[523,0.15,150],[659,0.2,300]], 'square') },
    mission_complete: () => { this.chord([523,659,784,1047], 0.8, 'sine', 0.35); setTimeout(() => this.chord([659,784,1047,1319], 0.6, 'sine', 0.25), 400) },
    button_click:     () => { this.tone(600, 0.06, 'square', 0.15) },
    tab_switch:       () => { this.tone(440, 0.08, 'sine', 0.1) },
    notification:     () => { this.sequence([[880,0.08,0],[1108,0.1,100]], 'sine') },
    error:            () => { this.sequence([[220,0.15,0],[196,0.2,150]], 'square') },
    success:          () => { this.sequence([[523,0.1,0],[659,0.1,100],[784,0.15,200]], 'sine') },

    // Sports
    crowd_roar:  () => { this.noise(1.5, 0.4, 600); this.noise(1.5, 0.2, 400) },
    whistle:     () => { this.sweep(1800, 2200, 0.2, 'sine', 0.3); this.sweep(2200, 1600, 0.3, 'sine', 0.25) },
    ball_hit:    () => { this.noise(0.08, 0.35, 1500); this.tone(200, 0.05, 'sine', 0.2) },
    score:       () => { this.sequence([[523,0.1,0],[659,0.1,100],[784,0.1,200],[1047,0.2,300]], 'sine') },
    buzzer:      () => { this.tone(220, 0.6, 'square', 0.4) },

    // Music
    vinyl_scratch:  () => { this.noise(0.2, 0.4, 4000); this.sweep(2000, 500, 0.2, 'sawtooth', 0.2) },
    beat_drop:      () => { this.tone(60, 0.3, 'sine', 0.6); this.noise(0.1, 0.3, 800) },
    mic_check:      () => { this.tone(400, 0.1, 'sine', 0.2); this.noise(0.05, 0.1, 3000) },
    applause:       () => { for(let i=0;i<8;i++) setTimeout(() => this.noise(0.15, 0.25, 1200 + Math.random()*600), i*80) },
    boo:            () => { this.noise(0.8, 0.3, 300) },
    stream_live:    () => { this.sweep(200, 800, 0.3, 'sine', 0.25); this.tone(1200, 0.15, 'sine', 0.2) },
    upload_complete:() => { this.sequence([[784,0.1,0],[1047,0.15,120]], 'sine') },
    royalty_earned: () => { this.tone(880, 0.1, 'sine', 0.25); setTimeout(() => this.tone(1108, 0.12, 'sine', 0.2), 100) },

    // Faith
    church_bell:  () => {
      const freqs = [523, 659, 784, 1047, 1319]
      freqs.forEach((f, i) => setTimeout(() => this.tone(f, 1.5, 'sine', 0.3, 0.95), i * 120))
    },
    prayer_submit: () => { this.chord([392,494,587,784], 0.8, 'sine', 0.2) },
    blessing:      () => { this.sweep(400, 1200, 0.6, 'sine', 0.3); this.chord([523,659,784,1047], 1.0, 'sine', 0.15) },
    choir_hit:     () => { this.chord([261,329,392,523,659], 1.2, 'sine', 0.25) },

    // Blockchain
    wallet_connect:       () => { this.sweep(400, 1200, 0.3, 'sine', 0.3); this.chord([600,800,1000], 0.4, 'sine', 0.2) },
    nft_mint:             () => { this.sequence([[523,0.1,0],[659,0.1,100],[784,0.1,200],[1047,0.2,300],[1319,0.3,500]], 'sine') },
    token_earn:           () => { this.tone(1047, 0.1, 'sine', 0.2); this.tone(1319, 0.12, 'sine', 0.15) },
    transaction_complete: () => { this.chord([659,784,1047], 0.5, 'sine', 0.25) },
    dao_vote:             () => { this.tone(440, 0.1, 'sine', 0.2); this.tone(554, 0.12, 'sine', 0.15) },

    // Battle Realms
    card_draw:      () => { this.noise(0.08, 0.2, 3000); this.sweep(600, 1200, 0.1, 'sine', 0.15) },
    card_play:      () => { this.sweep(800, 400, 0.15, 'sawtooth', 0.25); this.noise(0.1, 0.15, 2000) },
    card_destroy:   () => { this.noise(0.3, 0.4, 800); this.sweep(400, 100, 0.3, 'sawtooth', 0.3) },
    creature_catch: () => { this.sweep(1200, 400, 0.4, 'sine', 0.35); this.chord([400,600,800], 0.6, 'sine', 0.2) },
    ghost_detect:   () => { this.sweep(200, 800, 0.2, 'sine', 0.2); this.noise(0.1, 0.1, 2000) },
    ghost_capture:  () => { this.sweep(1200, 200, 0.5, 'sawtooth', 0.35); this.chord([300,500,700], 0.6, 'sine', 0.2) },
    zone_capture:   () => { this.chord([392,523,659,784], 1.0, 'sine', 0.3); this.noise(0.2, 0.15, 600) },
    battle_start:   () => { this.sequence([[196,0.2,0],[247,0.2,200],[294,0.3,400],[392,0.4,650]], 'square') },
    battle_win:     () => { this.chord([523,659,784,1047], 0.8, 'sine', 0.3); setTimeout(() => this.chord([659,784,1047,1319], 1.0, 'sine', 0.25), 500) },
    battle_lose:    () => { this.sequence([[294,0.3,0],[247,0.3,300],[196,0.5,600]], 'square') },

    // Avatar
    face_scan_beep: () => { this.tone(1200, 0.05, 'sine', 0.2); setTimeout(() => this.tone(1600, 0.05, 'sine', 0.15), 200) },
    avatar_select:  () => { this.sweep(400, 800, 0.15, 'sine', 0.2) },
    avatar_confirm: () => { this.chord([523,659,784,1047], 0.5, 'sine', 0.25) },

    // Ambient (looping)
    city_ambient:  () => { this.noise(0.5, 0.04, 200) },
    crowd_ambient: () => { this.noise(0.4, 0.05, 400) },
    rain:          () => { this.noise(0.3, 0.03, 3000) },
    wind:          () => { this.noise(0.4, 0.03, 150) },
  }

  // ── Ambient loop ────────────────────────────────────────────────────────

  startAmbient(key: 'city_ambient' | 'crowd_ambient' | 'rain' | 'wind', intervalMs = 400): void {
    if (this.ambientNodes.has(key)) return
    const id = setInterval(() => { if (this.enabled) this.play(key) }, intervalMs)
    this.ambientNodes.set(key, id as unknown as AudioNode)
  }

  stopAmbient(key: string): void {
    const id = this.ambientNodes.get(key)
    if (id) { clearInterval(id as unknown as ReturnType<typeof setInterval>); this.ambientNodes.delete(key) }
  }

  stopAllAmbient(): void {
    this.ambientNodes.forEach((_, k) => this.stopAmbient(k))
  }

  // ── Music generation (procedural backing tracks) ─────────────────────────

  playBackingTrack(genre: 'gospel' | 'hiphop' | 'electronic' | 'jazz' | 'rnb'): ReturnType<typeof setInterval> {
    const patterns: Record<string, () => void> = {
      gospel:     () => { this.chord([261,329,392], 0.4, 'sine', 0.08); setTimeout(() => this.chord([294,370,440], 0.3, 'sine', 0.06), 500) },
      hiphop:     () => { this.tone(80, 0.1, 'sine', 0.25); setTimeout(() => this.noise(0.08, 0.15, 2500), 300); setTimeout(() => this.tone(60, 0.08, 'sine', 0.2), 600) },
      electronic: () => { this.tone(120, 0.08, 'square', 0.2); setTimeout(() => this.tone(240, 0.04, 'square', 0.15), 250); setTimeout(() => this.noise(0.05, 0.1, 3000), 500) },
      jazz:       () => { this.chord([261,311,392,466], 0.5, 'sine', 0.06); setTimeout(() => this.chord([247,294,370,440], 0.4, 'sine', 0.05), 600) },
      rnb:        () => { this.tone(130, 0.15, 'sine', 0.15); setTimeout(() => this.chord([261,329,392], 0.3, 'sine', 0.07), 400) },
    }
    const fn = patterns[genre] ?? patterns.gospel
    fn()
    return setInterval(fn, 800)
  }
}

// Singleton export
export const soundEngine = new SoundEngine()

// React hook
export function useSound() {
  return {
    play: (key: SoundKey) => soundEngine.play(key),
    setVolume: (v: number) => soundEngine.setVolume(v),
    setEnabled: (e: boolean) => soundEngine.setEnabled(e),
    startAmbient: soundEngine.startAmbient.bind(soundEngine),
    stopAmbient: soundEngine.stopAmbient.bind(soundEngine),
    stopAllAmbient: soundEngine.stopAllAmbient.bind(soundEngine),
    playBackingTrack: soundEngine.playBackingTrack.bind(soundEngine),
  }
}
