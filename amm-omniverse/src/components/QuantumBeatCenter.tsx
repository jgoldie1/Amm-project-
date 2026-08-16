import { useEffect, useMemo, useState } from 'react'
import { onQuantumBeat, quantumBeatClock, type QuantumBeatEvent, type QuantumBeatMode } from '../services/quantumBeat'

type Props = { onClose: () => void }

const MODES: Array<{ id: QuantumBeatMode; label: string; note: string }> = [
  { id: 'music', label: 'Music', note: 'Tracks, Aniyah Studio, concerts and creator performance' },
  { id: 'live', label: 'LIVE', note: 'LiveKit rooms, Showcase, Debate, StarVerse and podcasts' },
  { id: 'game', label: 'Game', note: 'GameVerse, Volcano and controller/haptic timing' },
  { id: 'cinema', label: 'Cinema', note: 'OTT, Isaiah AI TV, trailers and synchronized effects' },
  { id: 'holo', label: 'Holo', note: 'HoloTV, HoloCube, XR, Lottie and spatial effects' },
]

export default function QuantumBeatCenter({ onClose }: Props) {
  const [running, setRunning] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [mode, setMode] = useState<QuantumBeatMode>('music')
  const [compensation, setCompensation] = useState(0)
  const [last, setLast] = useState<QuantumBeatEvent | null>(null)
  const [haptics, setHaptics] = useState(false)
  const [visualPulse, setVisualPulse] = useState(true)

  useEffect(() => onQuantumBeat(event => {
    setLast(event)
    if (haptics && navigator.vibrate && event.phase === 0) navigator.vibrate([18, 18, 28])
    window.dispatchEvent(new CustomEvent('tryamm:quantum-beat-output', {
      detail: { ...event, haptics, visualPulse }
    }))
  }), [haptics, visualPulse])

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
      <div><div style={{fontSize:11,letterSpacing:2,opacity:.7}}>TRYAMM SYNCHRONIZATION CORE</div><h1 style={{margin:'4px 0'}}>Quantum Beat™</h1><div style={{opacity:.7}}>Shared beat/timecode for audio · video · games · haptics · Lottie · Holo devices</div></div>
      <button onClick={close} aria-label="Close Quantum Beat" style={{width:48,height:48,borderRadius:14,border:'1px solid #56647f',background:'#11182a',color:'#fff',fontSize:28}}>×</button>
    </header>

    <main style={{maxWidth:960,margin:'0 auto',padding:20,display:'grid',gap:16}}>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
        {MODES.map(item => <button key={item.id} onClick={()=>{setMode(item.id);applyConfig(item.id,bpm,compensation)}} style={{textAlign:'left',padding:14,borderRadius:16,border:mode===item.id?'1px solid #4fe3ff':'1px solid #33405c',background:mode===item.id?'#0d3043':'#0b1020',color:'#fff'}}><strong>{item.label}</strong><div style={{fontSize:12,opacity:.65,marginTop:4}}>{item.note}</div></button>)}
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
        <label style={{display:'grid',gap:6,padding:14,border:'1px solid #2d3c5c',borderRadius:14,background:'#0a1020'}}>Tempo (BPM)<input type="range" min="30" max="240" value={bpm} onChange={e=>{const v=Number(e.target.value);setBpm(v);applyConfig(mode,v,compensation)}}/><strong>{bpm} BPM</strong></label>
        <label style={{display:'grid',gap:6,padding:14,border:'1px solid #2d3c5c',borderRadius:14,background:'#0a1020'}}>Latency compensation<input type="range" min="-250" max="250" value={compensation} onChange={e=>{const v=Number(e.target.value);setCompensation(v);applyConfig(mode,bpm,v)}}/><strong>{compensation} ms</strong></label>
      </section>

      <section style={{padding:18,borderRadius:18,border:'1px solid #31526d',background:'#071522'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong>{status}</strong><span>{mode.toUpperCase()}</span></div>
        <div style={{fontSize:52,fontWeight:900,marginTop:12}}>{last ? `${last.bar}.${last.phase+1}` : '—'}</div>
        <div style={{opacity:.68}}>Bar.beat · {last ? `beat ${last.beat}` : 'not running'}</div>
        <button onClick={toggle} style={{marginTop:16,minHeight:52,padding:'0 24px',borderRadius:14,border:'1px solid #4fe3ff',background:running?'#35172a':'#0b3a46',color:'#fff',fontWeight:900}}>{running?'STOP QUANTUM BEAT':'START QUANTUM BEAT'}</button>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        <label style={{display:'flex',gap:10,alignItems:'center',padding:14,border:'1px solid #2d3c5c',borderRadius:14}}><input type="checkbox" checked={visualPulse} onChange={e=>setVisualPulse(e.target.checked)}/> Lottie / visual pulse output</label>
        <label style={{display:'flex',gap:10,alignItems:'center',padding:14,border:'1px solid #2d3c5c',borderRadius:14}}><input type="checkbox" checked={haptics} onChange={e=>setHaptics(e.target.checked)}/> Haptic pulse on bar</label>
      </section>

      <section style={{fontSize:13,lineHeight:1.6,opacity:.78,padding:16,borderRadius:14,background:'#0a1020'}}>
        <strong>How it works:</strong> Quantum Beat™ emits one synchronized timing event that LIVE, OTT, GameVerse, Volcano, HoloTV/HoloCube/XR, spatial audio, lights, haptics and Lottie/Holo effects can subscribe to. Quantum Lag Buster can feed latency compensation into this clock so effects arrive closer to the intended moment across different connections and devices. This is deterministic timing software; it does not claim quantum-computing hardware.
      </section>
    </main>
  </div>
}
