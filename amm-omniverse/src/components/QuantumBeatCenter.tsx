import { useEffect, useMemo, useState } from 'react'
import { onQuantumBeat, quantumBeatClock, type QuantumBeatEvent, type QuantumBeatMode } from '../services/quantumBeat'

type Props = { onClose: () => void }
type SoundProfile = 'signature' | 'studio' | 'bass' | 'voice' | 'cinema' | 'game' | 'accessibility'

const MODES: Array<{ id: QuantumBeatMode; label: string; note: string }> = [
  { id: 'music', label: 'Music', note: 'Tracks, Aniyah Studio, concerts and creator performance' },
  { id: 'live', label: 'LIVE', note: 'LiveKit rooms, Showcase, Debate, StarVerse and podcasts' },
  { id: 'game', label: 'Game', note: 'GameVerse, Volcano and controller/haptic timing' },
  { id: 'cinema', label: 'Cinema', note: 'OTT, Isaiah AI TV, trailers and synchronized effects' },
  { id: 'holo', label: 'Holo', note: 'HoloTV, HoloCube, XR, Lottie and spatial effects' },
]

const SOUND_PROFILES: Array<{ id: SoundProfile; label: string; note: string; bass: number; clarity: number; space: number }> = [
  { id:'signature', label:'Quantum Signature', note:'Balanced everyday tuning', bass:55, clarity:60, space:55 },
  { id:'studio', label:'Creator Studio', note:'Flatter monitoring for recording and editing', bass:40, clarity:75, space:40 },
  { id:'bass', label:'Lion Bass', note:'Impact-forward music and performance profile', bass:85, clarity:55, space:58 },
  { id:'voice', label:'Voice / Podcast', note:'Dialogue, calls, debates and speech intelligibility', bass:30, clarity:90, space:32 },
  { id:'cinema', label:'Holo Cinema', note:'Wide spatial field for OTT and movies', bass:65, clarity:65, space:90 },
  { id:'game', label:'Volcano Competitive', note:'Footsteps, positional cues and low-latency game sound', bass:45, clarity:85, space:82 },
  { id:'accessibility', label:'Adaptive Hearing', note:'User-controlled speech emphasis and safer listening profile', bass:35, clarity:95, space:45 },
]

export default function QuantumBeatCenter({ onClose }: Props) {
  const [running, setRunning] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [mode, setMode] = useState<QuantumBeatMode>('music')
  const [compensation, setCompensation] = useState(0)
  const [last, setLast] = useState<QuantumBeatEvent | null>(null)
  const [haptics, setHaptics] = useState(false)
  const [visualPulse, setVisualPulse] = useState(true)
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('signature')
  const [anc, setAnc] = useState(false)
  const [transparency, setTransparency] = useState(false)
  const [spatial, setSpatial] = useState(true)
  const [headTracking, setHeadTracking] = useState(false)
  const [hearingAssist, setHearingAssist] = useState(false)
  const [safeListening, setSafeListening] = useState(true)
  const [deviceHandoff, setDeviceHandoff] = useState(true)

  useEffect(() => onQuantumBeat(event => {
    setLast(event)
    if (haptics && navigator.vibrate && event.phase === 0) navigator.vibrate([18, 18, 28])
    window.dispatchEvent(new CustomEvent('tryamm:quantum-beat-output', {
      detail: { ...event, haptics, visualPulse, soundProfile, spatial, headTracking }
    }))
  }), [haptics, visualPulse, soundProfile, spatial, headTracking])

  useEffect(() => {
    const lagHandler = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail
      const latency = Number(detail?.latencyMs ?? detail?.rttMs ?? 0)
      if (Number.isFinite(latency) && latency > 0) {
        const next = Math.max(-250, Math.min(250, Math.round(latency / 2)))
        setCompensation(next)
        quantumBeatClock.configure({ latencyCompensationMs: next })
      }
    }
    window.addEventListener('tryamm:quantum-lag-state', lagHandler)
    return () => window.removeEventListener('tryamm:quantum-lag-state', lagHandler)
  }, [])

  useEffect(() => {
    const profile = SOUND_PROFILES.find(p=>p.id===soundProfile)!
    window.dispatchEvent(new CustomEvent('tryamm:quantum-audio-profile',{detail:{
      profile:soundProfile,bass:profile.bass,clarity:profile.clarity,space:profile.space,
      anc,transparency,spatial,headTracking,hearingAssist,safeListening,deviceHandoff
    }}))
  },[soundProfile,anc,transparency,spatial,headTracking,hearingAssist,safeListening,deviceHandoff])

  const status = useMemo(() => {
    if (!last) return 'Idle'
    const drift = Math.round(last.driftMs)
    if (Math.abs(drift) <= 12) return `Locked · drift ${drift}ms`
    if (Math.abs(drift) <= 35) return `Tracking · drift ${drift}ms`
    return `Correcting · drift ${drift}ms`
  }, [last])

  function applyConfig(nextMode = mode, nextBpm = bpm, nextComp = compensation) {
    quantumBeatClock.configure({ mode: nextMode, bpm: nextBpm, latencyCompensationMs: nextComp })
  }

  function toggle() {
    applyConfig()
    if (running) quantumBeatClock.stop()
    else quantumBeatClock.start()
    setRunning(!running)
  }

  function close() {
    quantumBeatClock.stop()
    setRunning(false)
    onClose()
  }

  return <div role="dialog" aria-modal="true" aria-label="Quantum Beat Center" style={{position:'fixed',inset:0,zIndex:12050,background:'radial-gradient(circle at 50% 20%,#13243f,#050713 55%,#02030a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:16,padding:'18px 20px',borderBottom:'1px solid #263451'}}>
      <div><div style={{fontSize:11,letterSpacing:2,opacity:.7}}>TRYAMM AUDIO + SYNCHRONIZATION CORE</div><h1 style={{margin:'4px 0'}}>Quantum Beat™</h1><div style={{opacity:.7}}>Adaptive sound · spatial audio · games · haptics · LIVE/OTT sync · Lottie · Holo devices</div></div>
      <button onClick={close} aria-label="Close Quantum Beat" style={{width:48,height:48,borderRadius:14,border:'1px solid #56647f',background:'#11182a',color:'#fff',fontSize:28}}>×</button>
    </header>

    <main style={{maxWidth:1040,margin:'0 auto',padding:20,display:'grid',gap:16}}>
      <section>
        <h2 style={{margin:'0 0 10px'}}>Sound Lab</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
          {SOUND_PROFILES.map(item => <button key={item.id} onClick={()=>setSoundProfile(item.id)} style={{textAlign:'left',padding:14,borderRadius:16,border:soundProfile===item.id?'1px solid #e8b944':'1px solid #33405c',background:soundProfile===item.id?'#32270c':'#0b1020',color:'#fff'}}><strong>{item.label}</strong><div style={{fontSize:12,opacity:.65,marginTop:4}}>{item.note}</div><div style={{fontSize:11,opacity:.55,marginTop:7}}>Bass {item.bass} · Clarity {item.clarity} · Space {item.space}</div></button>)}
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {[
          ['ANC processing hook',anc,setAnc],['Transparency / awareness',transparency,setTransparency],['Adaptive spatial audio',spatial,setSpatial],['Head-tracking hook',headTracking,setHeadTracking],['Adaptive hearing mode',hearingAssist,setHearingAssist],['Safe-listening guardrail',safeListening,setSafeListening],['Cross-device handoff',deviceHandoff,setDeviceHandoff]
        ].map(([label,value,setter]:any)=><label key={label} style={{display:'flex',gap:10,alignItems:'center',padding:13,border:'1px solid #2d3c5c',borderRadius:14,background:'#0a1020'}}><input type="checkbox" checked={value} onChange={e=>setter(e.target.checked)}/>{label}</label>)}
      </section>

      <section>
        <h2 style={{margin:'0 0 10px'}}>Synchronization modes</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
          {MODES.map(item => <button key={item.id} onClick={()=>{setMode(item.id);applyConfig(item.id,bpm,compensation)}} style={{textAlign:'left',padding:14,borderRadius:16,border:mode===item.id?'1px solid #4fe3ff':'1px solid #33405c',background:mode===item.id?'#0d3043':'#0b1020',color:'#fff'}}><strong>{item.label}</strong><div style={{fontSize:12,opacity:.65,marginTop:4}}>{item.note}</div></button>)}
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
        <label style={{display:'grid',gap:6,padding:14,border:'1px solid #2d3c5c',borderRadius:14,background:'#0a1020'}}>Tempo (BPM)<input type="range" min="30" max="240" value={bpm} onChange={e=>{const v=Number(e.target.value);setBpm(v);applyConfig(mode,v,compensation)}}/><strong>{bpm} BPM</strong></label>
        <label style={{display:'grid',gap:6,padding:14,border:'1px solid #2d3c5c',borderRadius:14,background:'#0a1020'}}>Latency compensation<input type="range" min="-250" max="250" value={compensation} onChange={e=>{const v=Number(e.target.value);setCompensation(v);applyConfig(mode,bpm,v)}}/><strong>{compensation} ms</strong></label>
      </section>

      <section style={{padding:18,borderRadius:18,border:'1px solid #31526d',background:'#071522'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong>{status}</strong><span>{mode.toUpperCase()} · {soundProfile.toUpperCase()}</span></div>
        <div style={{fontSize:52,fontWeight:900,marginTop:12}}>{last ? `${last.bar}.${last.phase+1}` : '—'}</div>
        <div style={{opacity:.68}}>Bar.beat · {last ? `beat ${last.beat}` : 'not running'}</div>
        <button onClick={toggle} style={{marginTop:16,minHeight:52,padding:'0 24px',borderRadius:14,border:'1px solid #4fe3ff',background:running?'#35172a':'#0b3a46',color:'#fff',fontWeight:900}}>{running?'STOP QUANTUM BEAT':'START QUANTUM BEAT'}</button>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        <label style={{display:'flex',gap:10,alignItems:'center',padding:14,border:'1px solid #2d3c5c',borderRadius:14}}><input type="checkbox" checked={visualPulse} onChange={e=>setVisualPulse(e.target.checked)}/> Lottie / visual pulse output</label>
        <label style={{display:'flex',gap:10,alignItems:'center',padding:14,border:'1px solid #2d3c5c',borderRadius:14}}><input type="checkbox" checked={haptics} onChange={e=>setHaptics(e.target.checked)}/> Haptic bass / pulse output</label>
      </section>

      <section style={{fontSize:13,lineHeight:1.6,opacity:.78,padding:16,borderRadius:14,background:'#0a1020'}}>
        <strong>Quantum Beat™ platform:</strong> the software layer now exposes synchronized audio profiles, spatial/haptic timing and cross-device events for LIVE, OTT, GameVerse, Volcano, HoloTV/HoloCube/XR and creator tools. ANC, transparency, calibrated head tracking and true lossless wireless playback require compatible physical audio hardware and codecs before they can be called production-ready. Quantum Lag Buster supplies latency compensation so synchronized effects can be adjusted for real network conditions.
      </section>
    </main>
  </div>
}
