import { useEffect, useMemo, useState } from 'react'

type Room = {
  id: string
  name: string
  proof: string
  xp: number
}

type Saved = {
  room: number
  completed: string[]
  xp: number
  oneHanded: boolean
  reducedMotion: boolean
  highContrast: boolean
}

const ROOMS: Room[] = [
  { id: 'welcome', name: 'Holographic Welcome Hall', proof: 'Identity, accessibility profile, mission state and checkpoint.', xp: 25 },
  { id: 'light', name: 'Infinite Light Chamber', proof: 'Movement, controller, touch and reactive-environment proof.', xp: 25 },
  { id: 'mirror', name: 'Quantum Mirror Room', proof: 'Avatar, mission, unlock and privacy-safe state rendering.', xp: 25 },
  { id: 'music', name: 'Holo Music Lab', proof: 'Shared composition state, spatial audio and late-join proof.', xp: 50 },
  { id: 'puzzle', name: 'Collective Puzzle Room', proof: 'Authoritative multiplayer, presence and anti-cheat proof.', xp: 75 },
  { id: 'chicago', name: 'Living Chicago Illusion Room', proof: 'Effects budget, recording, reduced motion and mobile proof.', xp: 50 },
  { id: 'portal', name: 'Judah Portal', proof: 'Completion, progression reward, save/rejoin and return checkpoint.', xp: 100 },
]

const STORAGE_KEY = 'tryamm.streetverse.district01.realitylab.v1'
const initial: Saved = { room: 0, completed: [], xp: 0, oneHanded: false, reducedMotion: false, highContrast: false }

export default function RealityLabDistrict01({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<Saved>(initial)
  const [panic, setPanic] = useState(false)
  const [message, setMessage] = useState('District 01 checkpoint ready.')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...initial, ...JSON.parse(raw) })
    } catch {
      setMessage('Local checkpoint recovery failed; safe fresh state loaded.')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanic(true)
        setMessage('PANIC SAFE STATE ACTIVE.')
        return
      }
      if (panic) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        setState(s => ({ ...s, room: Math.min(ROOMS.length - 1, s.room + 1) }))
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        setState(s => ({ ...s, room: Math.max(0, s.room - 1) }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panic])

  const current = ROOMS[state.room]
  const progress = Math.round((state.completed.length / ROOMS.length) * 100)
  const allComplete = state.completed.length === ROOMS.length
  const completedSet = useMemo(() => new Set(state.completed), [state.completed])

  const completeRoom = () => {
    if (panic || completedSet.has(current.id)) return
    setState(s => ({ ...s, completed: [...s.completed, current.id], xp: s.xp + current.xp }))
    setMessage(`${current.name} interaction recorded. Non-cash progression only.`)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="StreetVerse District 01 Reality Lab" style={{ position:'fixed', inset:0, zIndex:10040, overflowY:'auto', background: state.highContrast ? '#000' : 'radial-gradient(circle at top,#10283b,#050814 58%,#020212)', color: state.highContrast ? '#fff200' : '#fff', padding:18 }}>
      <div style={{ maxWidth:1180, margin:'0 auto' }}>
        <div style={{ display:'flex', gap:12, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' }}>
          <div>
            <div style={{ color:'#4fe3ff', fontSize:11, fontWeight:900, letterSpacing:3 }}>STREETVERSE • DISTRICT 01 • FINISH-AND-PROVE</div>
            <h1 style={{ margin:'8px 0', fontSize:'clamp(2.2rem,7vw,5rem)' }}>TRYAMM Reality Lab</h1>
            <div style={{ color:'#a9b8c8' }}>Original interactive-attraction proof venue. Inspired by immersive museums as a category, not copied from any third-party exhibit.</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setPanic(true); setMessage('PANIC SAFE STATE ACTIVE.') }} style={{ minHeight:48, padding:'0 16px', fontWeight:900, border:'1px solid #ff6b7d', background:'#3b1018', color:'#fff', borderRadius:12 }}>PANIC / SAFE STATE</button>
            <button onClick={onClose} aria-label="Close Reality Lab" style={{ width:48, height:48, borderRadius:'50%', border:'1px solid #4fe3ff77', background:'#0c1620', color:'#fff' }}>×</button>
          </div>
        </div>

        <div aria-live="polite" style={{ marginTop:16, padding:12, border:'1px solid #4fe3ff55', borderRadius:12, background:'#06111dcc' }}><strong>{message}</strong></div>
        <div style={{ marginTop:10, display:'flex', gap:18, flexWrap:'wrap', fontFamily:'monospace', fontSize:12 }}><span>PROGRESS {progress}%</span><span>XP {state.xp}</span><span>ROOM {state.room + 1}/{ROOMS.length}</span></div>
        <progress value={progress} max={100} style={{ width:'100%', height:18, marginTop:10 }} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:10, marginTop:18 }}>
          {ROOMS.map((room, index) => <button key={room.id} onClick={() => !panic && setState(s => ({ ...s, room:index }))} aria-current={index === state.room ? 'step' : undefined} style={{ minHeight:74, textAlign:'left', padding:12, borderRadius:14, border:index===state.room?'2px solid #4fe3ff':'1px solid #23364a', background:'#08121dcc', color:'#fff' }}><strong>{index + 1}. {room.name}</strong><div style={{ marginTop:7, color:completedSet.has(room.id)?'#78ffb4':'#93a4b5', fontSize:11 }}>{completedSet.has(room.id)?'Interaction recorded':'Not yet completed'}</div></button>)}
        </div>

        <section style={{ marginTop:20, border:'1px solid #29435a', borderRadius:20, padding:18, background:'#07101bcc' }}>
          <div style={{ color:'#e8b944', fontSize:10, letterSpacing:2, fontWeight:900 }}>CURRENT PROOF ROOM</div>
          <h2 style={{ fontSize:'clamp(1.8rem,5vw,3rem)', margin:'8px 0' }}>{current.name}</h2>
          <p style={{ color:'#c3d0dc', maxWidth:840 }}>{current.proof}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button disabled={panic || state.room === 0} onClick={() => setState(s => ({ ...s, room:Math.max(0,s.room-1) }))}>Previous</button>
            <button disabled={panic || completedSet.has(current.id)} onClick={completeRoom}>{completedSet.has(current.id)?'Interaction recorded':`Complete +${current.xp} XP`}</button>
            <button disabled={panic || state.room === ROOMS.length - 1} onClick={() => setState(s => ({ ...s, room:Math.min(ROOMS.length-1,s.room+1) }))}>Next</button>
          </div>
        </section>

        <fieldset style={{ marginTop:18, border:'1px solid #29435a', borderRadius:18, padding:16 }}>
          <legend>Accessibility controls</legend>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.oneHanded} onChange={e=>setState(s=>({...s,oneHanded:e.target.checked}))}/> One-handed mode</label>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.reducedMotion} onChange={e=>setState(s=>({...s,reducedMotion:e.target.checked}))}/> Reduced motion</label>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.highContrast} onChange={e=>setState(s=>({...s,highContrast:e.target.checked}))}/> High contrast</label>
        </fieldset>

        {panic && <div role="alert" style={{ marginTop:18, border:'3px solid #ff6b7d', borderRadius:18, padding:18 }}><strong>SAFE STATE ACTIVE.</strong> Room progression is locked.<div><button onClick={()=>{setPanic(false);setMessage('Safe state cleared. Resume when ready.')}} style={{ marginTop:10 }}>Resume</button></div></div>}

        {allComplete && <div style={{ marginTop:18, border:'2px solid #e8b944', borderRadius:18, padding:18 }}><strong>Local interaction loop complete.</strong> This does not turn the active slice GREEN by itself. Two-device multiplayer, authenticated cloud save/rejoin, physical controller/touch, mobile/XR benchmarks, commerce isolation and deployed smoke evidence still require real proof.</div>}
      </div>
    </div>
  )
}
