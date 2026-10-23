// Lottie Animation Engine
// All animations for AMM Omniverse defined here as inline JSON
// (no external files needed — animations are embedded as code)
// Uses lottie-web for rendering

import lottie, { type AnimationItem } from 'lottie-web'
import {useCallback,useEffect,useState} from 'react'

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
  | 'fusion_burst' | 'scroll_victory' | 'trap_activate' | 'crystal_gain'
  | 'genii_orb' | 'wish_cast' | 'omnicare_pulse' | 'omnicash_flow'
  | 'holo_dragon' | 'holo_trophy' | 'holo_koi' | 'holo_kitsune'
  | 'holo_holiday' | 'holo_crown' | 'holo_galaxy' | 'holo_vehicle'
  | 'holo_dreidel' | 'holo_roses' | 'holo_treasure' | 'holo_dancers'          // Face scanning animation for avatar

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

// Original TRYAMM in-house holographic gift animations. Three SVG vector layers,
// no third-party assets or WebGL, suited to phones during LIVE/PK broadcasts.
function makeHoloGiftV2(primary:string,secondary:string,points:number){
 const hues=[primary,secondary,primary]
 const layers=hues.map((hex,index)=>{
  const core=index===2,size=core?58:118+index*42
  const shape=core
   ?{ty:'sr',sy:1,pt:{a:0,k:points},p:{a:0,k:[0,0]},r:{a:0,k:0},ir:{a:0,k:16},or:{a:0,k:30},is:{a:0,k:0},os:{a:0,k:0}}
   :{ty:'el',s:{a:0,k:[size,size]},p:{a:0,k:[0,0]}}
  const turn=index%2===0?360:-360
  return{
   ty:4,ind:index+1,nm:'TRYAMM original gift vector '+index,sr:1,
   ks:{
    a:{a:0,k:[0,0]},p:{a:0,k:[100,100]},
    s:{a:1,k:[{t:0,s:[48,48],e:[108,108]},{t:40,s:[108,108],e:[100,100]},{t:72,s:[100,100]}]},
    o:{a:1,k:[{t:0,s:[0],e:[90]},{t:18,s:[90],e:[77]},{t:60,s:[77],e:[0]},{t:72,s:[0]}]},
    r:{a:1,k:[{t:0,s:[0],e:[turn]},{t:72,s:[turn]}]}
   },
   shapes:[{ty:'gr',it:[shape,
    {ty:'st',c:{a:0,k:hexToLottieColor(hex)},o:{a:0,k:core?94:72},w:{a:0,k:core?5:4},lc:2,lj:2},
    {ty:'tr',p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},r:{a:0,k:0},o:{a:0,k:100}}
   ]}],
   ip:0,op:72,st:0
  }
 })
 return {v:'5.7.4',fr:30,ip:0,op:72,w:200,h:200,nm:'TRYAMM original holo v2',layers,assets:[],markers:[]}
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
  genii_orb:         makeRotatingStar('#b989ff', 10),
  wish_cast:         makeCirclePulse('#f2b630'),
  omnicare_pulse:    makeCirclePulse('#78ffb4'),
  omnicash_flow:     makeWave('#e8b944'),
  holo_dragon:       makeHoloGiftV2('#0df2fa','#ac7fff',9),
  holo_trophy:       makeHoloGiftV2('#f5d15c','#fff0aa',8),
  holo_koi:          makeHoloGiftV2('#ffa34e','#ff3679',7),
  holo_kitsune:      makeHoloGiftV2('#fc3c86','#c18bff',9),
  holo_holiday:      makeHoloGiftV2('#f88337','#4ce0f9',8),
  holo_crown:        makeHoloGiftV2('#ffe28b','#a88bff',9),
  holo_galaxy:       makeHoloGiftV2('#29f2ff','#684cff',11),
  holo_vehicle:      makeHoloGiftV2('#fa4764','#32dfff',6),
  holo_dreidel:      makeHoloGiftV2('#ffe272','#5deafc',4),
  holo_roses:        makeHoloGiftV2('#fb5aa1','#ffc0c9',7),
  holo_treasure:     makeHoloGiftV2('#ffe86f','#40f6c5',8),
  holo_dancers:      makeHoloGiftV2('#df83ff','#5ce7fb',10),
}

// ── Public API ──────────────────────────────────────────────────────────────

export function playLottie(container:HTMLElement,key:LottieAnimKey,options:{loop?:boolean;autoplay?:boolean;speed?:number}={}):AnimationItem{
 const reduceMotion=typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
 // lottie-web can mutate its input data. Isolate simultaneous gift instances.
 const anim=lottie.loadAnimation({
  container,renderer:'svg',loop:!reduceMotion&&(options.loop??true),
  autoplay:!reduceMotion&&(options.autoplay??true),
  animationData:JSON.parse(JSON.stringify(ANIMATIONS[key])) as object
 })
 if(options.speed!==undefined)anim.setSpeed(Math.max(.25,Math.min(2,options.speed)))
 if(reduceMotion)anim.addEventListener('DOMLoaded',()=>anim.goToAndStop(0,true))
 return anim
}

export function stopLottie(anim:AnimationItem|null){
 if(anim){anim.stop();anim.destroy()}
}

// Proper hook lifecycle: avoids orphaned Lottie DOM/timers during phone routing.
export function useLottie(key:LottieAnimKey,loop=true,speed=1){
 const [host,setHost]=useState<HTMLDivElement|null>(null)
 const ref=useCallback((node:HTMLDivElement|null)=>setHost(node),[])
 useEffect(()=>{
  if(!host)return
  const animation=playLottie(host,key,{loop,speed})
  return()=>stopLottie(animation)
 },[host,key,loop,speed])
 return ref
}
export const OWNED_LOTTIE_KEY_COUNT=Object.keys(ANIMATIONS).length
export function hasOwnedLottie(key:string):key is LottieAnimKey{
 return Object.prototype.hasOwnProperty.call(ANIMATIONS,key)
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
