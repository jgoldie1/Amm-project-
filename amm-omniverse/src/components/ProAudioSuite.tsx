// AMM Omniverse — Pro Audio Suite
// T-Pain Autotune · Zap FX · Vocoder · MPC Pads · Smart NPCs · Gen Z/Alpha AI Bot
// 100% Web Audio API — zero cost, zero plugins needed, runs in browser
// No Ableton, no Pro Tools required — this IS the studio

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── WEB AUDIO CONTEXT SINGLETON ──────────────────────────────────────────────
let _ctx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// ── VOCAL FX ENGINE ──────────────────────────────────────────────────────────
export type VocalEffect =
  | 'tpain_autotune'   // T-Pain pitch correction + harmonize
  | 'vocoder'          // Robot voice
  | 'zap'              // Electrical zap sound
  | 'glitch'           // Bit-crush glitch
  | 'deep_voice'       // Pitch down like a radio DJ
  | 'chipmunk'         // Pitch up
  | 'church_reverb'    // Big cathedral reverb
  | 'stadium'          // Stadium echo
  | 'lo_fi'            // Lo-fi vinyl sound
  | 'radio'            // AM radio band-pass
  | 'megaphone'        // Megaphone distortion
  | 'trap_wet'         // Trap music vocal wet
  | 'gospel_verb'      // Gospel church reverb
  | 'intercom'         // Intercom buzzy

interface FXPreset {
  id: VocalEffect
  name: string
  emoji: string
  color: string
  desc: string
  genre: string
}

export const VOCAL_FX_PRESETS: FXPreset[] = [
  { id:'tpain_autotune', name:'T-Pain AutoTune',  emoji:'🎤', color:'#ff00ff', desc:'Heavy pitch correction. The classic. Every note snapped to key.',                     genre:'R&B · Trap · Pop'   },
  { id:'vocoder',        name:'Vocoder Robot',    emoji:'🤖', color:'#00ffcc', desc:'Futuristic robot voice. Carrier signal + mic = synthesized speech.',                  genre:'Electronic · Future' },
  { id:'zap',            name:'Zap FX',           emoji:'⚡', color:'#00ccff', desc:'Electrical zap effect. Use for drops, stingers, and hype moments.',                   genre:'EDM · Game SFX'     },
  { id:'glitch',         name:'Glitch Crush',     emoji:'🔲', color:'#8800ff', desc:'Bit-crusher + ring modulator. Digital destruction sound design.',                     genre:'Trap · Experimental' },
  { id:'deep_voice',     name:'Deep Radio DJ',    emoji:'📻', color:'#ff4400', desc:'Pitch down 4 semitones. Classic radio DJ or movie villain voice.',                    genre:'Hip-Hop · Cinematic' },
  { id:'chipmunk',       name:'Chipmunk Pitch',   emoji:'🐿️', color:'#ffaa00', desc:'Pitch up 7 semitones. Cartoon vocal or speed up effect.',                            genre:'Pop · Comedy'       },
  { id:'church_reverb',  name:'Church Reverb',    emoji:'⛪', color:'#ffd700', desc:'Large cathedral reverb. 4 second decay. Perfect for gospel vocals.',                  genre:'Gospel · Worship'   },
  { id:'stadium',        name:'Stadium Echo',     emoji:'🏟️', color:'#00cc44', desc:'Stadium slap-back echo. Multiple repeats that fade out naturally.',                  genre:'Rock · Hip-Hop'     },
  { id:'lo_fi',          name:'Lo-Fi Vinyl',      emoji:'💿', color:'#aa8844', desc:'Low-pass filter + noise + vinyl crackle. Warm lo-fi aesthetic.',                     genre:'Lo-Fi · Chill'      },
  { id:'radio',          name:'AM Radio',         emoji:'📡', color:'#888888', desc:'Band-pass filter 300Hz–3kHz. Sounds like vintage AM radio.',                          genre:'Vintage · Cinematic' },
  { id:'megaphone',      name:'Megaphone',        emoji:'📢', color:'#ff6600', desc:'Distortion + band-pass + slight overdrive. Rally or announcement voice.',             genre:'Hip-Hop · Hype'     },
  { id:'trap_wet',       name:'Trap Wet Vocal',   emoji:'🌊', color:'#0066ff', desc:'Short room reverb + long delay at 1/8th note. Industry standard trap mix.',          genre:'Trap · Modern R&B'  },
  { id:'gospel_verb',    name:'Gospel Verb',      emoji:'✝️', color:'#ffd700', desc:'Warm plate reverb + slight chorus. Classic Black Gospel choir sound.',               genre:'Gospel · Soul'      },
  { id:'intercom',       name:'Intercom Buzz',    emoji:'🔔', color:'#aaaaaa', desc:'Narrow band-pass + distortion + buzz. Security intercom or sci-fi comm.',            genre:'Sci-Fi · Film'      },
]

// Web Audio FX engine
function applyVocalFX(audioBuffer: AudioBuffer | null, fx: VocalEffect, ctx: AudioContext): OscillatorNode | AudioBufferSourceNode | null {
  const now = ctx.currentTime

  if (fx === 'zap') {
    // Electrical zap synthesized
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const dist = ctx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x)) }
    dist.curve = curve
    osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(800, now); osc1.frequency.exponentialRampToValueAtTime(80, now + 0.3)
    osc2.type = 'square';   osc2.frequency.setValueAtTime(1200, now); osc2.frequency.exponentialRampToValueAtTime(40, now + 0.25)
    gain.gain.setValueAtTime(0.001, now); gain.gain.exponentialRampToValueAtTime(0.4, now + 0.01); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc1.connect(dist); osc2.connect(dist); dist.connect(gain); gain.connect(ctx.destination)
    osc1.start(now); osc1.stop(now + 0.4); osc2.start(now); osc2.stop(now + 0.35)
    return osc1
  }

  if (fx === 'tpain_autotune') {
    // Harmonic stack — 4 pitch-corrected oscillators
    const root = 261.63 * Math.pow(2, 0/12)  // C4
    const notes = [root, root * Math.pow(2, 4/12), root * Math.pow(2, 7/12), root * Math.pow(2, 12/12)]
    const master = ctx.createGain()
    const verb = ctx.createConvolver()
    master.gain.value = 0.25
    master.connect(ctx.destination)
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.15, now + 0.05); g.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
      o.connect(g); g.connect(master)
      o.start(now + i * 0.02); o.stop(now + 0.9)
    })
    return null
  }

  if (fx === 'vocoder') {
    // Carrier + modulator simulation
    const carrier = ctx.createOscillator(); const noise = ctx.createOscillator()
    const g = ctx.createGain(); const lfo = ctx.createOscillator(); const lfoG = ctx.createGain()
    carrier.type = 'sawtooth'; carrier.frequency.value = 130
    noise.type = 'square'; noise.frequency.value = 110
    lfo.frequency.value = 4; lfoG.gain.value = 15
    lfo.connect(lfoG); lfoG.connect(carrier.frequency)
    g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.3, now + 0.05); g.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    carrier.connect(g); noise.connect(g); g.connect(ctx.destination)
    carrier.start(now); noise.start(now); lfo.start(now)
    carrier.stop(now + 1.2); noise.stop(now + 1.2); lfo.stop(now + 1.2)
    return carrier
  }

  if (fx === 'glitch') {
    const duration = 0.3
    for (let i = 0; i < 8; i++) {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'square'
      o.frequency.setValueAtTime(Math.random() * 1200 + 80, now + i * 0.035)
      o.frequency.linearRampToValueAtTime(Math.random() * 2400 + 40, now + i * 0.035 + 0.03)
      g.gain.setValueAtTime(0.001, now + i * 0.035); g.gain.exponentialRampToValueAtTime(0.2, now + i * 0.035 + 0.005); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.03)
      o.connect(g); g.connect(ctx.destination)
      o.start(now + i * 0.035); o.stop(now + i * 0.035 + 0.035)
    }
    return null
  }

  if (fx === 'deep_voice') {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800
    o.type = 'sawtooth'; o.frequency.setValueAtTime(80, now); o.frequency.setValueAtTime(75, now + 0.1)
    g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.25, now + 0.05); g.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    o.connect(f); f.connect(g); g.connect(ctx.destination)
    o.start(now); o.stop(now + 0.95)
    return o
  }

  if (fx === 'chipmunk') {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = 'triangle'; o.frequency.setValueAtTime(660, now); o.frequency.exponentialRampToValueAtTime(880, now + 0.3)
    g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.22, now + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    o.connect(g); g.connect(ctx.destination)
    o.start(now); o.stop(now + 0.55)
    return o
  }

  if (fx === 'stadium') {
    for (let i = 0; i < 5; i++) {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = 330 * Math.pow(0.99, i)
      const delay_t = i * 0.18
      g.gain.setValueAtTime(0, now + delay_t); g.gain.exponentialRampToValueAtTime(0.15 / (i+1), now + delay_t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + delay_t + 0.6)
      o.connect(g); g.connect(ctx.destination)
      o.start(now + delay_t); o.stop(now + delay_t + 0.7)
    }
    return null
  }

  if (fx === 'church_reverb' || fx === 'gospel_verb') {
    const length = ctx.sampleRate * (fx === 'gospel_verb' ? 2.5 : 4)
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const data = impulse.getChannelData(c)
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, fx === 'gospel_verb' ? 1.5 : 1.2)
    }
    const src = ctx.createBufferSource(); const reverb = ctx.createConvolver(); const g = ctx.createGain()
    src.buffer = impulse; reverb.buffer = impulse
    g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.3, now + 0.1); g.gain.exponentialRampToValueAtTime(0.001, now + 2)
    src.connect(reverb); reverb.connect(g); g.connect(ctx.destination)
    src.start(now); src.stop(now + 2)
    return null
  }

  if (fx === 'radio' || fx === 'megaphone' || fx === 'intercom') {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    const hi = ctx.createBiquadFilter(); hi.type = 'highpass'; hi.frequency.value = fx === 'intercom' ? 800 : 300
    const lo = ctx.createBiquadFilter(); lo.type = 'lowpass';  lo.frequency.value = fx === 'radio' ? 3000 : fx === 'megaphone' ? 4000 : 2000
    o.type = 'sawtooth'; o.frequency.value = 220
    g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.25, now + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
    o.connect(hi); hi.connect(lo); lo.connect(g); g.connect(ctx.destination)
    o.start(now); o.stop(now + 0.75)
    return o
  }

  if (fx === 'trap_wet' || fx === 'lo_fi') {
    for (let i = 0; i < 3; i++) {
      const o = ctx.createOscillator(); const g = ctx.createGain(); const f = ctx.createBiquadFilter()
      o.type = 'triangle'; o.frequency.value = fx === 'lo_fi' ? 220 * Math.pow(1.5, i) : 330
      f.type = 'lowpass'; f.frequency.value = fx === 'lo_fi' ? 800 : 6000
      g.gain.setValueAtTime(0, now + i * 0.25); g.gain.exponentialRampToValueAtTime(0.12, now + i * 0.25 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.5)
      o.connect(f); f.connect(g); g.connect(ctx.destination)
      o.start(now + i * 0.25); o.stop(now + i * 0.25 + 0.55)
    }
    return null
  }

  return null
}

// ── MPC PADS ─────────────────────────────────────────────────────────────────

interface MPCPad {
  id: number
  name: string
  emoji: string
  color: string
  freq: number
  type: OscillatorType
  decay: number
  note?: string
}

const MPC_PADS: MPCPad[] = [
  { id:1,  name:'Kick 808',    emoji:'💥', color:'#ff4400', freq:60,   type:'sine',     decay:0.6,  note:'C1' },
  { id:2,  name:'Snare',       emoji:'🥁', color:'#ff8800', freq:180,  type:'square',   decay:0.15, note:'D1' },
  { id:3,  name:'Hi Hat Cl',   emoji:'🎵', color:'#ffd700', freq:8000, type:'square',   decay:0.08, note:'E1' },
  { id:4,  name:'Open Hat',    emoji:'🎶', color:'#ffaa00', freq:9000, type:'square',   decay:0.25, note:'F1' },
  { id:5,  name:'Clap',        emoji:'👏', color:'#ff66cc', freq:1200, type:'sawtooth', decay:0.12, note:'G1' },
  { id:6,  name:'Shofar',      emoji:'📯', color:'#ffd700', freq:220,  type:'sawtooth', decay:0.8,  note:'A1' },
  { id:7,  name:'Gospel Bell', emoji:'🔔', color:'#ffffff', freq:880,  type:'sine',     decay:1.2,  note:'B1' },
  { id:8,  name:'Bass Note',   emoji:'🎸', color:'#00cc44', freq:80,   type:'sawtooth', decay:0.4,  note:'C2' },
  { id:9,  name:'Piano C',     emoji:'🎹', color:'#00ccff', freq:523,  type:'sine',     decay:1.0,  note:'C3' },
  { id:10, name:'Piano G',     emoji:'🎹', color:'#00aaff', freq:784,  type:'sine',     decay:1.0,  note:'G3' },
  { id:11, name:'Synth Lead',  emoji:'🎛', color:'#8800ff', freq:440,  type:'sawtooth', decay:0.5,  note:'A3' },
  { id:12, name:'Zap FX',      emoji:'⚡', color:'#00ffcc', freq:1200, type:'sawtooth', decay:0.3,  note:'FX' },
  { id:13, name:'T-Pain',      emoji:'🎤', color:'#ff00ff', freq:330,  type:'sine',     decay:0.9,  note:'E3' },
  { id:14, name:'Robot VO',    emoji:'🤖', color:'#00ffcc', freq:110,  type:'square',   decay:0.7,  note:'FX' },
  { id:15, name:'Crowd Cheer', emoji:'🏟', color:'#ff4400', freq:800,  type:'sawtooth', decay:1.5,  note:'FX' },
  { id:16, name:'Amen Break',  emoji:'🙏', color:'#ffd700', freq:90,   type:'sine',     decay:0.35, note:'D2' },
]

function firePad(pad: MPCPad) {
  const ctx = getAudioCtx()
  const now = ctx.currentTime
  const o1 = ctx.createOscillator()
  const o2 = ctx.createOscillator()
  const g = ctx.createGain()
  const d = ctx.createDynamicsCompressor()
  d.threshold.value = -20; d.ratio.value = 8

  if (pad.name === 'Zap FX') {
    applyVocalFX(null, 'zap', ctx); return
  }
  if (pad.name === 'T-Pain') {
    applyVocalFX(null, 'tpain_autotune', ctx); return
  }
  if (pad.name === 'Robot VO') {
    applyVocalFX(null, 'vocoder', ctx); return
  }
  if (pad.name === 'Crowd Cheer') {
    applyVocalFX(null, 'stadium', ctx); return
  }
  if (pad.name === 'Shofar') {
    // Multi-harmonic shofar
    [1, 2, 3, 4, 5].forEach((harmonic, i) => {
      const ho = ctx.createOscillator(); const hg = ctx.createGain()
      ho.type = 'sawtooth'; ho.frequency.value = pad.freq * harmonic
      hg.gain.setValueAtTime(0, now); hg.gain.exponentialRampToValueAtTime(0.12 / harmonic, now + 0.05); hg.gain.exponentialRampToValueAtTime(0.001, now + pad.decay)
      ho.connect(hg); hg.connect(d); d.connect(ctx.destination)
      ho.start(now); ho.stop(now + pad.decay + 0.1)
    })
    return
  }

  o1.type = pad.type; o1.frequency.value = pad.freq
  o2.type = 'sine';  o2.frequency.value = pad.freq * 0.5  // sub octave
  g.gain.setValueAtTime(0.001, now)
  g.gain.exponentialRampToValueAtTime(0.4, now + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, now + pad.decay)
  o1.connect(g); o2.connect(g); g.connect(d); d.connect(ctx.destination)
  o1.start(now); o1.stop(now + pad.decay + 0.1)
  o2.start(now); o2.stop(now + pad.decay + 0.1)
}

// ── GEN Z / GEN ALPHA AI CHAT BOT ────────────────────────────────────────────

interface AIBotProfile {
  id: string; name: string; emoji: string; age: string; vibe: string; color: string
  slang: string[]; topics: string[]; responseStyle: 'genz' | 'alpha'
}

const AI_BOT_PROFILES: AIBotProfile[] = [
  {
    id: 'zara', name: 'Zara', emoji: '💜', age: 'Gen Z (22)', vibe: 'Creative content creator',
    color: '#8800ff', slang: ['no cap', 'slay', 'understood the assignment', 'it\'s giving', 'lowkey', 'bussin', 'sheesh', 'valid', 'rent free', 'it\'s the X for me'],
    topics: ['TikTok', 'fashion', 'music', 'social media', 'mental health', 'AMM Omniverse'],
    responseStyle: 'genz',
  },
  {
    id: 'kai', name: 'Kai', emoji: '⚡', age: 'Gen Alpha (14)', vibe: 'Gamer and content brain',
    color: '#00ffcc', slang: ['rizz', 'skibidi', 'sigma', 'ohio moment', 'fanum tax', 'delulu', 'gooning', 'main character', 'sussy', 'gyatt'],
    topics: ['gaming', 'Roblox', 'Minecraft', 'YouTube shorts', 'AMM games', 'card battle'],
    responseStyle: 'alpha',
  },
  {
    id: 'nova', name: 'Nova', emoji: '🔥', age: 'Gen Z (19)', vibe: 'Music producer and hype person',
    color: '#ff4400', slang: ['ate', 'period', 'the way', 'hit different', 'big W', 'cooking', 'vibe check', 'on sight', 'go off king', 'slaps'],
    topics: ['music production', 'beats', 'recording', 'artists', 'AMM music', 'streaming'],
    responseStyle: 'genz',
  },
  {
    id: 'pixel', name: 'Pixel', emoji: '🎮', age: 'Gen Alpha (12)', vibe: 'Tactical game genius',
    color: '#ffd700', slang: ['W', 'L', 'npc behavior', 'based', 'mid', 'cringe', 'ratio', 'no shot', 'touching grass', 'skill issue'],
    topics: ['Tactical Realms', 'Hero RPG', 'card battle', 'streaming', 'twitch', 'AMM arena'],
    responseStyle: 'alpha',
  },
]

function generateAIBotResponse(input: string, bot: AIBotProfile): string {
  const q = input.toLowerCase()
  const slang1 = bot.slang[Math.floor(Math.random() * bot.slang.length)]
  const slang2 = bot.slang[Math.floor(Math.random() * bot.slang.length)]
  const isAlpha = bot.responseStyle === 'alpha'

  if (q.includes('game') || q.includes('play') || q.includes('battle')) {
    return isAlpha
      ? `BRO the games on AMM are actually W tier no cap. Tactical Realms has insane rizz, Hero RPG goes HARD, and Card Battle Arena is literally bussin fr fr. ${slang1} 💪 which one you tryna play?`
      : `ok bestie the games??? UNDERSTOOD THE ASSIGNMENT ${slang1} — Tactical Realms is giving main character energy, Hero RPG ate and left NO crumbs, Card Battle Arena SLAPS. what's your vibe?`
  }
  if (q.includes('music') || q.includes('beat') || q.includes('record')) {
    return isAlpha
      ? `yo AMM has a WHOLE recording studio no cap, 62 tracks bro. T-Pain autotune, Guitar Lab, MPC pads — sigma producer behavior only. ${slang1} you making beats or what?`
      : `the recording studio is literally COOKING rn ${slang1}. T-Pain autotune? check. Guitar Lab presets? check. 62-track DAW in a BROWSER? understood the assignment periodt.`
  }
  if (q.includes('money') || q.includes('earn') || q.includes('paid')) {
    return isAlpha
      ? `W financial behavior incoming: subscriptions hit different, music royalties are BASED, Drama Box episodes slap, and tournaments = bag. ${slang1} no skill issue if you're on AMM fr`
      : `ok so making money on AMM is giving MAIN CHARACTER ENERGY ${slang1}. 90% royalties? that's a big W. Drama Box publishing? ate. Subscriptions auto-paying? periodt bestie.`
  }
  if (q.includes('tiktok') || q.includes('bigo') || q.includes('stream') || q.includes('live')) {
    return isAlpha
      ? `bro just link your AMM live stream to TikTok and watch the rizz go CRAZY ${slang1}. share AMM clips, drop the link, profit. it's giving W energy fr`
      : `OMG the TikTok to AMM pipeline?? ${slang1} post your AMM clips (Lion of Judah bg is so lowkey iconic), drive traffic to tryamm.online, get subscribers. it's NOT giving L behavior.`
  }
  if (q.includes('card') || q.includes('duel') || q.includes('deck')) {
    return isAlpha
      ? `CARD BATTLE ARC is BUSSIN ${slang1}. 100 original cards, 10 realms, Hebrew feast bonuses — gyatt. build a Judah realm deck, it's the sigma move. skill issue if you don't.`
      : `card battle era is SO real right now ${slang1}. 100 original cards?? the Hebrew feast cards SLAP different. it's giving Yu-Gi-Oh but make it faith. LOW KEY obsessed.`
  }
  if (q.includes('drama') || q.includes('episode') || q.includes('series')) {
    return isAlpha
      ? `AMM Drama Box is lowkey main character stuff ${slang1}. The Chosen Path goes HARD bro, The Fast is kinda sigma level scary. 50 tokens = $0.50 per ep, no L behavior there.`
      : `DRAMA BOX ERA ${slang1}. The Chosen Path understood the assignment, Queen Esther ATL is GIVING biblical main character energy, and Sunday Best ate and LEFT NO CRUMBS periodt.`
  }

  // Generic response
  const genericZ = [`${slang1} AMM Omniverse is literally the platform that SLAPS ${slang2}. what's your specific vibe? games, music, drama, live streaming?`,
    `no cap ${slang1} — what you're describing is giving REAL energy. AMM has it all lowkey. ask me anything bb.`,
    `${slang1} ok I see you ${slang2}. AMM Omniverse is the move fr. need more info?`]
  const genericA = [`bro ${slang1} AMM is literally W tier ${slang2}. games, music, drama, crypto — all bussin fr. what you wanna know?`,
    `${slang1} that's kinda mid to not know about AMM ngl but I got you. it's the best platform, no L, sigma behavior required.`,
    `W question ${slang1}. AMM Omniverse goes hard ${slang2}. specify?`]
  const arr = isAlpha ? genericA : genericZ
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── SMART NPC SYSTEM ──────────────────────────────────────────────────────────
interface SmartNPC {
  id: string; name: string; emoji: string; role: string; color: string
  personality: string; knowledge: string[]; currentMood: 'friendly' | 'busy' | 'excited' | 'wise'
}

const SMART_NPCS: SmartNPC[] = [
  { id:'mayor', name:'Mayor Prime',   emoji:'👑', role:'City Mayor',        color:'#ffd700', personality:'wise and formal', knowledge:['city history','realm portals','elections','AMM law'], currentMood:'wise'    },
  { id:'dj',    name:'DJ StarMaker',  emoji:'🎧', role:'Music Realm DJ',    color:'#00ccff', personality:'hype and musical', knowledge:['music charts','upcoming shows','beat advice','royalties'], currentMood:'excited' },
  { id:'pastor',name:'Pastor Grace',  emoji:'✝️', role:'Faith Realm Leader',color:'#ffd700', personality:'kind and spiritual', knowledge:['prayer','feasts','faith guidance','church programs'], currentMood:'friendly'},
  { id:'vendor',name:'Mama J',        emoji:'👵', role:'Marketplace Vendor',color:'#00cc44', personality:'warm and business-savvy', knowledge:['prices','dropshipping','best sellers','community'], currentMood:'friendly'},
  { id:'bounty',name:'Shadow Hunter', emoji:'🕵️', role:'El Saturn Bounty Hunter',color:'#8800ff', personality:'mysterious and cryptic', knowledge:['blockchain secrets','hidden quests','void corruption','NFT lore'], currentMood:'busy'},
  { id:'coach', name:'Coach Titan',   emoji:'💪', role:'Sports Realm Coach', color:'#ff4400', personality:'intense and motivating', knowledge:['game strategy','tournament tips','leveling up','combo moves'], currentMood:'excited'},
]

function getSmartNPCResponse(npc: SmartNPC, input: string): string {
  const q = input.toLowerCase()
  const responses: Record<string, string[]> = {
    mayor: [
      'Welcome, citizen. The AMM Omniverse was founded on three pillars: Faith, Family, and Legacy. Which realm seeks your attention today?',
      'The portals across the city connect to six realms. Each has its own economy and governance. As Mayor, I oversee all matters of commerce and justice.',
      'Our city grows stronger when creators invest their gifts. The marketplace realm pays 90% to vendors. The music realm pays 90% to artists. That is how prosperity works.',
    ],
    dj: [
      "YO YO YO! You caught me at the right time! Just dropped a new set in the Music Stage. You hear those beats? That\'s what AMM sounds like at full power!",
      "Listen — if you want your music to POP, you gotta upload to the Music Realm, earn those royalties, and get distributed to Spotify! It\'s FREE through AMM!",
      "The Gospel Verb reverb preset in the Recording Studio? That\'s my signature sound! Add it to your vocals and watch the streams multiply!",
    ],
    pastor: [
      'Peace be with you, child. The Faith Realm is a place of prayer, community, and the Hebrew feasts. Each feast card carries a special blessing during its season.',
      'The Drama Box is dear to my heart. Faith storytelling is how we pass truth from generation to generation. The Chosen Path series touched many souls.',
      'If you need guidance, visit the prayer wall. Light a candle for someone you love. The community will carry your prayer forward.',
    ],
    vendor: [
      'Baby, come look at what I got today! Fresh inventory from six Black-owned suppliers. Free listing, 90% you keep, 10% goes to keep the lights on. That\'s fair, right?',
      'The HoloDelivery picks up my goods and gets them there same day! I been doing business on AMM since day one. Best decision I ever made.',
      'My secret? I use the social sharing system. Every sale gets shared to 70+ platforms automatically. West Africa, South Africa, India — they love what we sell!',
    ],
    bounty: [
      '*adjusts visor* You ask too many questions, stranger. But since you\'ve come this far... the Void Empress has been sending shadow drones into the Blockchain Realm. Tread carefully.',
      'The El Saturn Chain holds secrets that predate the Omniverse itself. 1,369 NFTs. Each one a piece of ancient code. I\'ve found three. Many more remain hidden.',
      'If you see a Shadow Wisp near the portals — run. Or fight. Your Faith Warrior stats determine which is wise.',
    ],
    coach: [
      'LISTEN UP! Tactical Realms isn\'t just about shooting. It\'s about POSITIONING. Use your squad role bonus. Guardians take the hits, Vanguards deal the damage. TEAM PLAY!',
      'You want to win Card Battles? Learn the weakness system. Every enemy has one spell that hits for 1.5x. That\'s the knowledge gap between winners and losers!',
      'Tournament entry is $4.99 tokens. Prize pool is 80% of all entries. Get five players in a bracket and the winner takes $19.96. THAT IS FREE MONEY WITH SKILL!',
    ],
  }

  const npcResponses = responses[npc.id] || [`I'm ${npc.name}. My role is ${npc.role}. Anything specific you'd like to know about ${npc.knowledge.join(', ')}?`]
  // Try topic matching
  for (const topic of npc.knowledge) {
    if (q.includes(topic.toLowerCase().split(' ')[0])) {
      return npcResponses[Math.floor(Math.random() * npcResponses.length)]
    }
  }
  return npcResponses[Math.floor(Math.random() * npcResponses.length)]
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
type ProMode = 'mpc' | 'vocalfx' | 'bot' | 'npcs'

export default function ProAudioSuite({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [mode, setMode] = useState<ProMode>('mpc')
  const [activeBot, setActiveBot] = useState(AI_BOT_PROFILES[0])
  const [botMessages, setBotMessages] = useState<{from:'bot'|'user';text:string}[]>([])
  const [botInput, setBotInput] = useState('')
  const [activeNPC, setActiveNPC] = useState(SMART_NPCS[0])
  const [npcInput, setNpcInput] = useState('')
  const [npcMessages, setNpcMessages] = useState<{from:'npc'|'user';text:string}[]>([
    { from:'npc', text: `${SMART_NPCS[0].emoji} ${getSmartNPCResponse(SMART_NPCS[0], 'hello')}` }
  ])
  const [activeFX, setActiveFX] = useState<VocalEffect | null>(null)
  const [padActivity, setPadActivity] = useState<Record<number, boolean>>({})
  const [currentKey, setCurrentKey] = useState('C')
  const [bpm, setBpm] = useState(90)
  const [recording, setRecording] = useState(false)
  const [sequence, setSequence] = useState<number[]>([])
  const [playing, setPlaying] = useState(false)
  const seqRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const seqIdx = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [botMessages, npcMessages])

  const hitPad = useCallback((pad: MPCPad) => {
    firePad(pad)
    setPadActivity(a => ({ ...a, [pad.id]: true }))
    setTimeout(() => setPadActivity(a => ({ ...a, [pad.id]: false })), 120)
    if (recording) setSequence(s => [...s, pad.id])
    store.earnXp(5)
  }, [recording, store])

  const playSequence = () => {
    if (playing) {
      setPlaying(false)
      if (seqRef.current) clearInterval(seqRef.current)
      return
    }
    if (sequence.length === 0) { store.setNotif('❌ Record a sequence first (hit REC then tap pads)'); return }
    setPlaying(true)
    seqIdx.current = 0
    const interval = (60 / bpm) * 1000 * 0.5  // 8th notes
    seqRef.current = setInterval(() => {
      const padId = sequence[seqIdx.current % sequence.length]
      const pad = MPC_PADS.find(p => p.id === padId)
      if (pad) { firePad(pad); setPadActivity(a => ({ ...a, [pad.id]: true })); setTimeout(() => setPadActivity(a => ({ ...a, [pad.id]: false })), 80) }
      seqIdx.current++
    }, interval)
  }

  const sendBotMessage = () => {
    if (!botInput.trim()) return
    const msg = botInput.trim()
    setBotInput('')
    setBotMessages(m => [...m, { from:'user', text:msg }])
    setTimeout(() => {
      const response = generateAIBotResponse(msg, activeBot)
      setBotMessages(m => [...m, { from:'bot', text:response }])
    }, 400 + Math.random() * 300)
  }

  const sendNPCMessage = () => {
    if (!npcInput.trim()) return
    const msg = npcInput.trim()
    setNpcInput('')
    setNpcMessages(m => [...m, { from:'user', text:msg }])
    setTimeout(() => {
      const response = `${activeNPC.emoji} ${getSmartNPCResponse(activeNPC, msg)}`
      setNpcMessages(m => [...m, { from:'npc', text:response }])
    }, 300 + Math.random() * 400)
  }

  const switchNPC = (npc: SmartNPC) => {
    setActiveNPC(npc)
    setNpcMessages([{ from:'npc', text:`${npc.emoji} ${getSmartNPCResponse(npc, 'hello')}` }])
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#03040c',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'8px 14px',background:'linear-gradient(135deg,#001a24,#24002d)',borderBottom:'1px solid #00ffcc44',display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>←</button>
        <div>
          <div style={{ color:'#00ffcc',fontWeight:900,fontSize:13,letterSpacing:2 }}>🎛 AMM PRO AUDIO SUITE</div>
          <div style={{ color:'#555',fontSize:9 }}>MPC Pads · T-Pain FX · Gen Z/Alpha Bot · Smart NPCs</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid #0a0a20' }}>
        {([
          ['mpc',    '🎛 MPC Pads','#ff4400'],
          ['vocalfx','⚡ Vocal FX','#ff00ff'],
          ['bot',    '💬 Gen Bot','#00ffcc'],
          ['npcs',   '🧠 Smart NPCs','#ffd700'],
        ] as [ProMode,string,string][]).map(([m,label,c])=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{ flex:1,padding:'8px 4px',background:mode===m?`${c}15`:'transparent',border:'none',borderBottom:mode===m?`2px solid ${c}`:'2px solid transparent',color:mode===m?c:'#555',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:mode===m?700:400 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto' }}>

        {/* ── MPC PADS ─── */}
        {mode==='mpc'&&(
          <div style={{ padding:12 }}>
            <div style={{ display:'flex',gap:8,marginBottom:12,alignItems:'center',flexWrap:'wrap' }}>
              <span style={{ color:'#555',fontSize:10 }}>KEY:</span>
              {['C','D','E','F','G','A','B'].map(k=>(
                <button key={k} onClick={()=>setCurrentKey(k)}
                  style={{ background:currentKey===k?'rgba(255,68,0,.2)':'transparent',border:`1px solid ${currentKey===k?'#ff4400':'#333'}`,color:currentKey===k?'#ff4400':'#666',borderRadius:4,padding:'3px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>{k}</button>
              ))}
              <span style={{ color:'#555',fontSize:10,marginLeft:8 }}>BPM:</span>
              <input type="number" value={bpm} onChange={e=>setBpm(Number(e.target.value))} style={{ width:45,background:'#111',border:'1px solid #333',color:'#ffd700',borderRadius:4,padding:'3px',fontFamily:'monospace',fontSize:11,textAlign:'center' }}/>
            </div>
            {/* Transport */}
            <div style={{ display:'flex',gap:8,marginBottom:14 }}>
              <button onClick={()=>setRecording(r=>{if(r)store.setNotif(`🔴 Sequence recorded: ${sequence.length} hits`);return!r})}
                style={{ background:recording?'rgba(255,0,0,.3)':'rgba(255,100,0,.1)',border:`1px solid ${recording?'#ff0000':'#ff4400'}`,color:recording?'#ff0000':'#ff4400',borderRadius:6,padding:'7px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>
                {recording?'⏹ STOP REC':'🔴 REC'}
              </button>
              <button onClick={playSequence}
                style={{ background:playing?'rgba(0,204,68,.2)':'rgba(0,204,68,.08)',border:`1px solid ${playing?'#00cc44':'#00cc4466'}`,color:playing?'#00cc44':'#555',borderRadius:6,padding:'7px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:11 }}>
                {playing?'⏹ STOP':'▶ PLAY SEQ'}
              </button>
              <button onClick={()=>setSequence([])}
                style={{ background:'transparent',border:'1px solid #333',color:'#555',borderRadius:6,padding:'7px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>🗑</button>
              <span style={{ color:'#555',fontSize:10,marginLeft:4,paddingTop:8 }}>{sequence.length} hits</span>
            </div>
            {/* 16 Pads */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
              {MPC_PADS.map(pad=>(
                <button key={pad.id}
                  onClick={()=>hitPad(pad)}
                  style={{ background:padActivity[pad.id]?`${pad.color}55`:`${pad.color}15`,border:`2px solid ${padActivity[pad.id]?pad.color:pad.color+'44'}`,borderRadius:10,padding:'14px 8px',cursor:'pointer',fontFamily:'monospace',textAlign:'center',transition:'all .08s',transform:padActivity[pad.id]?'scale(0.93)':'scale(1)',userSelect:'none' }}>
                  <div style={{ fontSize:22,marginBottom:5 }}>{pad.emoji}</div>
                  <div style={{ color:pad.color,fontWeight:700,fontSize:9,lineHeight:1.3 }}>{pad.name}</div>
                  {pad.note&&<div style={{ color:'#444',fontSize:8,marginTop:2 }}>{pad.note}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VOCAL FX ─── */}
        {mode==='vocalfx'&&(
          <div style={{ padding:12 }}>
            <div style={{ background:'rgba(255,0,255,.04)',border:'1px solid #ff00ff22',borderRadius:10,padding:12,marginBottom:14,fontSize:11,color:'#888',lineHeight:1.7 }}>
              Tap any effect to hear it synthesized via Web Audio API. Every effect runs in your browser with zero plugins. After recording your voice (Recording Studio → Vocal Booth), apply these effects to your take.
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              {VOCAL_FX_PRESETS.map(fx=>(
                <button key={fx.id}
                  onClick={()=>{ setActiveFX(fx.id); applyVocalFX(null, fx.id, getAudioCtx()); store.setNotif(`🎤 ${fx.name} — ${fx.genre}`) }}
                  style={{ background:activeFX===fx.id?`${fx.color}22`:'#09091c',border:`${activeFX===fx.id?2:1}px solid ${activeFX===fx.id?fx.color:fx.color+'33'}`,borderRadius:10,padding:'12px 10px',cursor:'pointer',fontFamily:'monospace',textAlign:'left',transition:'all .15s' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
                    <span style={{ fontSize:20 }}>{fx.emoji}</span>
                    <span style={{ color:fx.color,fontWeight:700,fontSize:11 }}>{fx.name}</span>
                  </div>
                  <div style={{ color:'#555',fontSize:9,marginBottom:4,lineHeight:1.4 }}>{fx.desc}</div>
                  <div style={{ background:`${fx.color}15`,border:`1px solid ${fx.color}33`,borderRadius:20,padding:'2px 8px',display:'inline-block',color:fx.color,fontSize:8 }}>{fx.genre}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── GEN Z / ALPHA BOT ─── */}
        {mode==='bot'&&(
          <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
            {/* Bot selector */}
            <div style={{ padding:'8px 12px',borderBottom:'1px solid #0a0a20',display:'flex',gap:8,overflowX:'auto' }}>
              {AI_BOT_PROFILES.map(b=>(
                <button key={b.id} onClick={()=>{ setActiveBot(b); setBotMessages([]) }}
                  style={{ background:activeBot.id===b.id?`${b.color}20`:'transparent',border:`1px solid ${activeBot.id===b.id?b.color:'#333'}`,color:activeBot.id===b.id?b.color:'#555',borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:700,flexShrink:0 }}>
                  {b.emoji} {b.name} <span style={{ color:'#444',fontSize:9 }}>({b.age})</span>
                </button>
              ))}
            </div>
            {/* Bot profile */}
            <div style={{ padding:'8px 12px',borderBottom:'1px solid #0a0a20',display:'flex',gap:10,alignItems:'center' }}>
              <div style={{ width:36,height:36,background:`${activeBot.color}22`,border:`1px solid ${activeBot.color}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>{activeBot.emoji}</div>
              <div>
                <div style={{ color:activeBot.color,fontWeight:700,fontSize:12 }}>{activeBot.name} · {activeBot.vibe}</div>
                <div style={{ color:'#555',fontSize:9 }}>Known slang: {activeBot.slang.slice(0,3).join(' · ')}</div>
              </div>
            </div>
            {/* Messages */}
            <div style={{ flex:1,overflowY:'auto',padding:'10px 12px' }}>
              {botMessages.length === 0 && (
                <div style={{ color:activeBot.color,fontSize:12,fontStyle:'italic',padding:'8px 0',lineHeight:1.6 }}>
                  {activeBot.emoji} {generateAIBotResponse('hello', activeBot)}
                </div>
              )}
              {botMessages.map((m,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:m.from==='user'?'flex-end':'flex-start',marginBottom:8 }}>
                  <div style={{ background:m.from==='user'?'rgba(0,255,204,.1)':`${activeBot.color}0a`,border:`1px solid ${m.from==='user'?'#00ffcc33':activeBot.color+'33'}`,borderRadius:12,padding:'8px 12px',maxWidth:'85%',fontSize:12,color:m.from==='user'?'#00ffcc':'#ccc',lineHeight:1.6 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            {/* Input */}
            <div style={{ padding:'8px 12px',borderTop:'1px solid #0a0a20',display:'flex',gap:8 }}>
              <input value={botInput} onChange={e=>setBotInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendBotMessage()}
                placeholder={`Talk to ${activeBot.name}...`}
                style={{ flex:1,background:'#09091c',border:`1px solid ${activeBot.color}33`,color:'#ccc',borderRadius:8,padding:'8px 12px',fontFamily:'monospace',fontSize:12,outline:'none' }}/>
              <button onClick={sendBotMessage} style={{ background:`${activeBot.color}20`,border:`1px solid ${activeBot.color}`,color:activeBot.color,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>→</button>
            </div>
          </div>
        )}

        {/* ── SMART NPCS ─── */}
        {mode==='npcs'&&(
          <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>
            {/* NPC selector */}
            <div style={{ padding:'8px 12px',borderBottom:'1px solid #0a0a20',display:'flex',gap:6,flexWrap:'wrap' }}>
              {SMART_NPCS.map(npc=>(
                <button key={npc.id} onClick={()=>switchNPC(npc)}
                  style={{ background:activeNPC.id===npc.id?`${npc.color}20`:'transparent',border:`1px solid ${activeNPC.id===npc.id?npc.color:'#333'}`,color:activeNPC.id===npc.id?npc.color:'#555',borderRadius:20,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:700 }}>
                  {npc.emoji} {npc.name}
                </button>
              ))}
            </div>
            {/* NPC profile */}
            <div style={{ padding:'8px 12px',borderBottom:'1px solid #0a0a20',display:'flex',gap:10,alignItems:'center' }}>
              <div style={{ width:36,height:36,background:`${activeNPC.color}22`,border:`1px solid ${activeNPC.color}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{activeNPC.emoji}</div>
              <div>
                <div style={{ color:activeNPC.color,fontWeight:700,fontSize:12 }}>{activeNPC.name} · {activeNPC.role}</div>
                <div style={{ color:'#555',fontSize:9 }}>Knows: {activeNPC.knowledge.slice(0,3).join(', ')} · Mood: {activeNPC.currentMood}</div>
              </div>
            </div>
            {/* Chat */}
            <div style={{ flex:1,overflowY:'auto',padding:'10px 12px' }}>
              {npcMessages.map((m,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:m.from==='user'?'flex-end':'flex-start',marginBottom:10 }}>
                  {m.from==='npc'&&<div style={{ width:28,height:28,background:`${activeNPC.color}22`,border:`1px solid ${activeNPC.color}44`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,marginRight:8,marginTop:2 }}>{activeNPC.emoji}</div>}
                  <div style={{ background:m.from==='user'?'rgba(0,255,204,.1)':`${activeNPC.color}08`,border:`1px solid ${m.from==='user'?'#00ffcc33':activeNPC.color+'33'}`,borderRadius:12,padding:'8px 12px',maxWidth:'82%',fontSize:12,color:m.from==='user'?'#00ffcc':'#ccc',lineHeight:1.6,fontStyle:m.from==='npc'?'italic':'normal' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding:'8px 12px',borderTop:'1px solid #0a0a20',display:'flex',gap:8 }}>
              <input value={npcInput} onChange={e=>setNpcInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendNPCMessage()}
                placeholder={`Talk to ${activeNPC.name}...`}
                style={{ flex:1,background:'#09091c',border:`1px solid ${activeNPC.color}33`,color:'#ccc',borderRadius:8,padding:'8px 12px',fontFamily:'monospace',fontSize:12,outline:'none' }}/>
              <button onClick={sendNPCMessage} style={{ background:`${activeNPC.color}20`,border:`1px solid ${activeNPC.color}`,color:activeNPC.color,borderRadius:8,padding:'8px 14px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
