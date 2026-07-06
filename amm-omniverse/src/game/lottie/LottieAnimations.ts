// Lottie Animation Engine
// All animations for AMM Omniverse defined here as inline JSON
// (no external files needed — animations are embedded as code)
// Uses lottie-web for rendering

import lottie, { type AnimationItem } from 'lottie-web'

export type LottieAnimKey =
  | 'portal_swirl'       // Realm portal spinning holographic ring
  | 'xp_burst'           // XP gain celebration
  | 'cash_rain'          // Cash earned rain effect
  | 'wanted_alert'       // Flashing police siren for wanted level
  | 'upload_progress'    // Music upload animated progress ring
  | 'live_pulse'         // Red live indicator pulse
  | 'faith_glow'         // Faith realm divine light rays
  | 'blockchain_spin'    // Blockchain chain link spinning
  | 'hologram_flicker'   // Holographic screen flicker/glitch
  | 'avatar_select'      // Avatar selection sparkle burst
  | 'mission_complete'   // Mission complete banner + stars
  | 'radio_wave'         // Radio station sound wave
  | 'face_scan'
  | 'passover_glow' | 'bread_glow' | 'harvest_glow' | 'flame_scroll'
  | 'shofar_wave' | 'white_glow' | 'sukkah_stars' | 'menorah_light'
  | 'crown_scroll' | 'moon_phases'
  | 'card_summon' | 'life_drain' | 'heal_burst' | 'realm_shift'
  | 'fusion_burst' | 'scroll_victory' | 'trap_activate' | 'crystal_gain'          // Face scanning animation for avatar

// All animations are generated procedurally as Lottie JSON
// This avoids needing any external .json files

function makeCirclePulse(color: string, loops = true) {
  // Minimal Lottie JSON — circle that pulses in/out
  return {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100,
    layers: [{
      ty: 4, nm: 'pulse', sr: 1, ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [30] }, { t: 60, s: [100] }] },
        s: { a: 1, k: [{ t: 0, s: [100,100] }, { t: 30, s: [130,130] }, { t: 60, s: [100,100] }] },
        p: { a: 0, k: [50, 50] }, a: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }
      },
      shapes: [{
        ty: 'gr', it: [
          { ty: 'el', s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } },
          { ty: 'fl', c: { a: 0, k: hexToLottieColor(color) }, o: { a: 0, k: 80 } },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } }
        ]
      }],
      ip: 0, op: 60, st: 0
    }],
    assets: [], markers: []
  }
}

function makeRotatingStar(color: string, points = 6) {
  return {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 100, h: 100,
    layers: [{
      ty: 4, nm: 'star', sr: 1,
      ks: {
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [50, 50] }, s: { a: 0, k: [100, 100] }, o: { a: 0, k: 90 }, a: { a: 0, k: [0,0] }
      },
      shapes: [{
        ty: 'gr', it: [
          { ty: 'sr', sy: 1, pt: { a: 0, k: points }, p: { a: 0, k: [0,0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 20 }, or: { a: 0, k: 40 }, is: { a: 0, k: 0 }, os: { a: 0, k: 0 } },
          { ty: 'fl', c: { a: 0, k: hexToLottieColor(color) }, o: { a: 0, k: 90 } },
          { ty: 'tr', p: { a: 0, k: [0,0] }, s: { a: 0, k: [100,100] } }
        ]
      }],
      ip: 0, op: 60, st: 0
    }],
    assets: [], markers: []
  }
}

function makeWave(color: string) {
  return {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 200, h: 80,
    layers: [{
      ty: 4, nm: 'wave', sr: 1,
      ks: { p: { a: 0, k: [100,40] }, s: { a: 0, k: [100,100] }, o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, a: { a: 0, k: [0,0] } },
      shapes: [{
        ty: 'gr', it: [
          {
            ty: 'sh', ks: { a: 1, k: [
              { t: 0,  s: [{ c: false, v: [[-80,0],[-40,-20],[0,0],[40,20],[80,0]], i: [[0,0],[0,0],[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0],[0,0],[0,0]] }] },
              { t: 15, s: [{ c: false, v: [[-80,0],[-40,20],[0,0],[40,-20],[80,0]], i: [[0,0],[0,0],[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0],[0,0],[0,0]] }] },
              { t: 30, s: [{ c: false, v: [[-80,0],[-40,-20],[0,0],[40,20],[80,0]], i: [[0,0],[0,0],[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0],[0,0],[0,0]] }] },
              { t: 60, s: [{ c: false, v: [[-80,0],[-40,-20],[0,0],[40,20],[80,0]], i: [[0,0],[0,0],[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0],[0,0],[0,0]] }] },
            ]}
          },
          { ty: 'st', c: { a: 0, k: hexToLottieColor(color) }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2 },
          { ty: 'tr', p: { a: 0, k: [0,0] }, s: { a: 0, k: [100,100] } }
        ]
      }],
      ip: 0, op: 60, st: 0
    }],
    assets: [], markers: []
  }
}

function makeScanner() {
  // Horizontal scan bar sweeping down — for face scan animation
  return {
    v: '5.7.4', fr: 30, ip: 0, op: 60, w: 200, h: 200,
    layers: [
      // Outer frame
      {
        ty: 4, nm: 'frame', sr: 1,
        ks: { p: { a: 0, k: [100,100] }, s: { a: 0, k: [100,100] }, o: { a: 0, k: 80 }, r: { a: 0, k: 0 }, a: { a: 0, k: [0,0] } },
        shapes: [{
          ty: 'gr', it: [
            { ty: 'rc', s: { a: 0, k: [180,180] }, p: { a: 0, k: [0,0] }, r: { a: 0, k: 8 } },
            { ty: 'st', c: { a: 0, k: [0,1,0.8,1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
            { ty: 'tr', p: { a: 0, k: [0,0] }, s: { a: 0, k: [100,100] } }
          ]
        }],
        ip: 0, op: 60, st: 0
      },
      // Scan line
      {
        ty: 4, nm: 'scanline', sr: 1,
        ks: {
          p: { a: 1, k: [{ t: 0, s: [100,10] }, { t: 50, s: [100,190] }, { t: 60, s: [100,10] }] },
          s: { a: 0, k: [100,100] }, o: { a: 0, k: 70 }, r: { a: 0, k: 0 }, a: { a: 0, k: [0,0] }
        },
        shapes: [{
          ty: 'gr', it: [
            { ty: 'rc', s: { a: 0, k: [180,3] }, p: { a: 0, k: [0,0] }, r: { a: 0, k: 1 } },
            { ty: 'fl', c: { a: 0, k: [0,1,0.8,1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0,0] }, s: { a: 0, k: [100,100] } }
          ]
        }],
        ip: 0, op: 60, st: 0
      }
    ],
    assets: [], markers: []
  }
}

// Animation data map
const ANIMATIONS: Record<LottieAnimKey, object> = {
  portal_swirl:      makeRotatingStar('#00ffcc', 8),
  xp_burst:          makeRotatingStar('#ffd700', 6),
  cash_rain:         makeRotatingStar('#00cc44', 5),
  wanted_alert:      makeCirclePulse('#ff4400'),
  upload_progress:   makeRotatingStar('#00ccff', 12),
  live_pulse:        makeCirclePulse('#ff0000'),
  faith_glow:        makeRotatingStar('#8800ff', 8),
  blockchain_spin:   makeRotatingStar('#ffaa00', 6),
  hologram_flicker:  makeCirclePulse('#00ffcc'),
  avatar_select:     makeRotatingStar('#ffffff', 8),
  mission_complete:  makeRotatingStar('#ffd700', 5),
  radio_wave:        makeWave('#00ccff'),
  face_scan:         makeScanner(),

  // Hebrew Israelite Feast Lottie Animations
  passover_glow:    makeRotatingStar('#c8a000', 12),   // Golden lamb / parted sea glow
  bread_glow:       makeCirclePulse('#fffacd'),          // Unleavened bread white glow
  harvest_glow:     makeRotatingStar('#f0c060', 8),     // First Fruits wheat golden
  flame_scroll:     makeRotatingStar('#ff6600', 6),     // Shavuot Torah flame
  shofar_wave:      makeWave('#ffaa00'),                  // Shofar sound wave
  white_glow:       makeCirclePulse('#ffffff'),           // Atonement white light
  sukkah_stars:     makeRotatingStar('#4488ff', 7),     // Tabernacles star field
  menorah_light:    makeRotatingStar('#4488ff', 8),     // Hanukkah 8-point menorah
  crown_scroll:     makeRotatingStar('#8800ff', 5),     // Purim crown animation
  moon_phases:      makeCirclePulse('#aaaaff'),           // New Moon silver glow

  // Card battle Lottie animations
  card_summon:      makeRotatingStar('#ffd700', 8),
  life_drain:       makeCirclePulse('#ff4400'),
  heal_burst:       makeCirclePulse('#00cc44'),
  realm_shift:      makeRotatingStar('#8800ff', 6),
  fusion_burst:     makeRotatingStar('#00ffcc', 10),
  scroll_victory:   makeRotatingStar('#ffffff', 12),
  trap_activate:    makeCirclePulse('#ff8800'),
  crystal_gain:     makeRotatingStar('#00ccff', 4),
}

// ── Public API ──────────────────────────────────────────────────────────────

export function playLottie(
  container: HTMLElement,
  key: LottieAnimKey,
  options: { loop?: boolean; autoplay?: boolean; speed?: number } = {}
): AnimationItem {
  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: options.loop ?? true,
    autoplay: options.autoplay ?? true,
    animationData: ANIMATIONS[key] as object,
  })
  if (options.speed) anim.setSpeed(options.speed)
  return anim
}

export function stopLottie(anim: AnimationItem | null) {
  if (anim) { anim.stop(); anim.destroy() }
}

// React hook for Lottie
export function useLottie(key: LottieAnimKey, loop = true, speed = 1) {
  const ref = (el: HTMLDivElement | null) => {
    if (!el) return
    // Clean up previous
    while (el.firstChild) el.removeChild(el.firstChild)
    playLottie(el, key, { loop, speed })
  }
  return ref
}

// Helper
function hexToLottieColor(hex: string): [number, number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0,2),16)/255,
    parseInt(h.slice(2,4),16)/255,
    parseInt(h.slice(4,6),16)/255,
    1
  ]
}
