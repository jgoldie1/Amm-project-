import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

type Look = 'natural'|'studio'|'cinema'|'golden'|'night'|'mono'|'holo'|'vivid'
type BackgroundMode = 'real'|'soft-blur'|'deep-blur'|'virtual'|'holo-stage'
type AudioPreset = 'natural'|'voice-clean'|'podcast'|'music'|'crowd'|'low-bandwidth'

type StreamFX = {
  look: Look
  intensity: number
  exposure: number
  saturation: number
  contrast: number
  mirror: boolean
  background: BackgroundMode
  audioPreset: AudioPreset
  captions: boolean
  translation: boolean
  signCompanion: boolean
  moderationShield: boolean
  lottieOverlay: boolean
  lowerThirds: boolean
  reactions: boolean
  lowPower: boolean
}

const DEFAULTS: StreamFX = {
  look:'natural', intensity:100, exposure:100, saturation:100, contrast:100, mirror:true,
  background:'real', audioPreset:'voice-clean', captions:true, translation:false, signCompanion:false,
  moderationShield:true, lottieOverlay:true, lowerThirds:true, reactions:true, lowPower:false,
}

const LOOKS: Record<Look,string> = {
  natural:'none',
  studio:'brightness(1.08) contrast(1.06) saturate(1.05)',
  cinema:'contrast(1.16) saturate(.92) brightness(.97)',
  golden:'sepia(.16) saturate(1.15) brightness(1.05)',
  night:'brightness(.86) contrast(1.2) saturate(1.12) hue-rotate(6deg)',
  mono:'grayscale(1) contrast(1.08)',
  holo:'contrast(1.1) saturate(1.38) hue-rotate(8deg) drop-shadow(0 0 12px rgba(79,227,255,.55))',
  vivid:'contrast(1.12) saturate(1.28) brightness(1.04)',
}

function applyFX(fx: StreamFX) {
  const root = document.documentElement
  root.dataset.streamBackground = fx.background
  root.dataset.streamLowPower = fx.lowPower ? 'true' : 'false'
  root.dataset.streamModeration = fx.moderationShield ? 'true' : 'false'
  root.dataset.streamCaptions = fx.captions ? 'true' : 'false'
  root.dataset.streamTranslation = fx.translation ? 'true' : 'false'
  root.dataset.streamSign = fx.signCompanion ? 'true' : 'false'

  const base = LOOKS[fx.look]
  const intensity = Math.max(0, Math.min(150, fx.intensity)) / 100
  const exposure = Math.max(50, Math.min(150, fx.exposure)) / 100
  const saturation = Math.max(0, Math.min(180, fx.saturation)) / 100
  const contrast = Math.max(50, Math.min(180, fx.contrast)) / 100
  const composite = `${base === 'none' ? '' : base + ' '}brightness(${exposure}) saturate(${saturation}) contrast(${contrast}) opacity(${Math.min(1, .65 + intensity * .35)})`.trim()

  document.querySelectorAll('[aria-label="TryAMM LIVE Center"] video').forEach(node => {
    const video = node as HTMLVideoElement
    video.style.filter = composite || 'none'
    const isLocal = video.dataset.local === 'true'
    if (isLocal) video.style.transform = fx.mirror ? 'scaleX(-1)' : 'none'
    video.style.transition = fx.lowPower ? 'none' : 'filter 160ms ease'
  })

  window.dispatchEvent(new CustomEvent('tryamm:stream-fx', { detail: fx }))
}

export default function StreamStudioFX({onClose}:{onClose:()=>void}) {
  const [fx,setFx] = useState<StreamFX>(()=>{
    try { return {...DEFAULTS,...JSON.parse(localStorage.getItem('tryamm_stream_fx')||'{}')} } catch { return DEFAULTS }
  })

  useEffect(()=>{
    applyFX(fx)
    localStorage.setItem('tryamm_stream_fx',JSON.stringify(fx))
  },[fx])

  const switches = useMemo(()=>[
    ['captions','Live captions'],['translation','HoloLingo translation'],['signCompanion','Sign-language companion'],
    ['moderationShield','OmniShield moderation'],['lottieOverlay','Lottie / Holo overlays'],['lowerThirds','Creator lower-thirds'],
    ['reactions','Animated reactions'],['lowPower','Low-power / weak-device mode']
  ] as const,[])

  const patch = <K extends keyof StreamFX>(key:K,value:StreamFX[K])=>setFx(prev=>({...prev,[key]:value}))

  return <div role="dialog" aria-modal="true" aria-label="Stream Studio FX" style={s.shell}>
    <header style={s.header}>
      <div><div style={s.eyebrow}>TRYAMM CREATOR PRODUCTION</div><h2 style={{margin:'3px 0'}}>✨ Stream Studio FX</h2><div style={s.muted}>Production controls for LIVE, Showcase, Debate, StarVerse, podcasts, shopping and gamecasts.</div></div>
      <button onClick={onClose} aria-label="Close Stream Studio FX" style={s.close}>×</button>
    </header>

    <main style={s.main}>
      <section style={s.card}>
        <h3>Camera look</h3>
        <div style={s.chips}>{(Object.keys(LOOKS) as Look[]).map(look=><button key={look} onClick={()=>patch('look',look)} style={{...s.chip,...(fx.look===look?s.active:{})}}>{look.toUpperCase()}</button>)}</div>
        <Range label="Look intensity" value={fx.intensity} min={0} max={150} onChange={v=>patch('intensity',v)}/>
        <Range label="Exposure" value={fx.exposure} min={50} max={150} onChange={v=>patch('exposure',v)}/>
        <Range label="Saturation" value={fx.saturation} min={0} max={180} onChange={v=>patch('saturation',v)}/>
        <Range label="Contrast" value={fx.contrast} min={50} max={180} onChange={v=>patch('contrast',v)}/>
        <label style={s.toggle}><input type="checkbox" checked={fx.mirror} onChange={e=>patch('mirror',e.target.checked)}/> Mirror local camera</label>
      </section>

      <section style={s.card}>
        <h3>Scene + background</h3>
        <div style={s.chips}>{(['real','soft-blur','deep-blur','virtual','holo-stage'] as BackgroundMode[]).map(mode=><button key={mode} onClick={()=>patch('background',mode)} style={{...s.chip,...(fx.background===mode?s.active:{})}}>{mode.replace('-',' ')}</button>)}</div>
        <p style={s.note}>Real mode works without segmentation. Blur, replacement and Holo Stage are production hooks for a WebGL/segmentation processor; they stay visibly marked as hooks until that processor is connected and device-tested.</p>
      </section>

      <section style={s.card}>
        <h3>Audio intelligence</h3>
        <select value={fx.audioPreset} onChange={e=>patch('audioPreset',e.target.value as AudioPreset)} style={s.select}>
          <option value="natural">Natural</option><option value="voice-clean">Voice Clean</option><option value="podcast">Podcast</option><option value="music">Music / performance</option><option value="crowd">Crowd / event</option><option value="low-bandwidth">Low bandwidth</option>
        </select>
        <p style={s.note}>These profiles are now part of the stream contract. Echo cancellation, noise suppression, AGC and music-safe capture must be applied through LiveKit/browser capture options per device before we call them fully processed audio.</p>
      </section>

      <section style={s.card}>
        <h3>Audience intelligence + safety</h3>
        <div style={s.switchGrid}>{switches.map(([key,label])=><label key={key} style={s.toggle}><input type="checkbox" checked={Boolean(fx[key])} onChange={e=>patch(key,e.target.checked as never)}/><span>{label}</span></label>)}</div>
        <p style={s.note}>Lottie overlays can power gifts, applause, wins, Judah/Holo transitions and branded scene changes. Moderation should combine automated detection with creator/moderator controls and appeals rather than silently blocking people.</p>
      </section>

      <section style={{...s.card,border:'1px solid rgba(79,227,255,.35)'}}>
        <h3>What makes this a creator studio</h3>
        <div style={s.featureGrid}><span>Multi-format LIVE</span><span>Reusable filter stack</span><span>Lottie/Holo overlays</span><span>Accessible captions</span><span>All-language hooks</span><span>Sign companion</span><span>Moderation shield</span><span>Commerce overlays</span><span>OTT replay handoff</span><span>Weak-device mode</span></div>
      </section>
    </main>
  </div>
}

function Range({label,value,min,max,onChange}:{label:string;value:number;min:number;max:number;onChange:(n:number)=>void}){
  return <label style={{display:'grid',gap:5,marginTop:10,fontSize:12}}><span>{label}: <strong>{value}</strong></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>
}

const s: Record<string,CSSProperties> = {
  shell:{position:'fixed',inset:0,zIndex:10040,background:'linear-gradient(180deg,#030611,#0b1328)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'},
  header:{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'14px 18px',background:'rgba(5,8,20,.96)',borderBottom:'1px solid rgba(255,255,255,.12)'},
  eyebrow:{fontSize:10,letterSpacing:2,fontWeight:900,opacity:.65},muted:{fontSize:12,opacity:.7},close:{width:46,height:46,borderRadius:14,border:'1px solid #394566',background:'#10172b',color:'#fff',fontSize:28},
  main:{maxWidth:1050,margin:'0 auto',padding:16,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14},card:{padding:16,borderRadius:18,border:'1px solid rgba(255,255,255,.12)',background:'rgba(255,255,255,.055)'},
  chips:{display:'flex',flexWrap:'wrap',gap:7},chip:{padding:'8px 10px',borderRadius:999,border:'1px solid rgba(255,255,255,.16)',background:'#10172b',color:'#fff',fontSize:11,fontWeight:800},active:{border:'1px solid #4fe3ff',background:'#123145',boxShadow:'0 0 14px rgba(79,227,255,.18)'},
  toggle:{display:'flex',alignItems:'center',gap:9,minHeight:42,fontSize:13},switchGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:6},select:{width:'100%',padding:11,borderRadius:11,background:'#0b1124',color:'#fff',border:'1px solid #36405b'},
  note:{fontSize:11,lineHeight:1.45,opacity:.65},featureGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,fontSize:12}
}
