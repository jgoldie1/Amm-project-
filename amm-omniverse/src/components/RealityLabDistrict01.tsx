import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAuthenticatedUserId, getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient'

type Room = { id: string; name: string; proof: string; xp: number }
type Exhibit = { id: string; name: string; experience: string; linkedProof: string }
type Saved = {
  room: number
  completed: string[]
  xp: number
  oneHanded: boolean
  reducedMotion: boolean
  highContrast: boolean
}
type CloudRow = {
  current_room: string
  completed_rooms: string[] | null
  xp: number | null
  accessibility: Record<string, unknown> | null
  checkpoint_revision: number | null
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

const EXHIBITS: Exhibit[] = [
  { id: 'reactive-holo', name: 'Reactive Holographic Hall', experience: 'Presence-reactive holographic surfaces, light trails and avatar silhouettes respond to movement.', linkedProof: 'Welcome + Light' },
  { id: 'infinity', name: 'Infinity / Reflection Gallery', experience: 'Recursive reflections, depth illusions and accessibility-safe visual modes create the infinite-room effect.', linkedProof: 'Light + Mirror' },
  { id: 'projection', name: 'Floor & Wall Projection Chamber', experience: 'Projected environments follow footsteps and transform walls, floors and portals without changing gameplay state.', linkedProof: 'Light + Chicago' },
  { id: 'spatial-audio', name: 'Spatial Audio Theater', experience: 'Position-aware sound zones, narration and music cues support headphone, speaker and reduced-sensory modes.', linkedProof: 'Music' },
  { id: 'light-tunnel', name: 'Interactive Light Tunnel', experience: 'Touch, keyboard, controller and motion inputs drive synchronized light patterns and safe-state transitions.', linkedProof: 'Light' },
  { id: 'ai-illusion', name: 'Stubbs AI Illusion Chamber', experience: 'AI-guided perspective puzzles and adaptive prompts react to the player without pretending generated content is physical reality.', linkedProof: 'Mirror + Puzzle' },
  { id: 'creator-gallery', name: 'Creator Gallery', experience: 'Original art, music, short-form media and creator exhibits can be curated as rotating digital installations.', linkedProof: 'Welcome + Music' },
  { id: 'music-reactive', name: 'Music-Reactive Room', experience: 'Beat, frequency and player interaction drive visual layers while keeping volume and motion accessibility controls available.', linkedProof: 'Music + Chicago' },
  { id: 'ar-secrets', name: 'AR Secrets & Hidden Portals', experience: 'Optional clues, collectibles and portal markers reveal discoverable layers without blocking the core route.', linkedProof: 'Mirror + Portal' },
  { id: 'black-history', name: 'Black History & Chicago Legacy Wing', experience: 'Expandable educational exhibit lane for sourced Chicago, Black history, arts, science and cultural storytelling.', linkedProof: 'Curated expansion' },
  { id: 'science-kids', name: 'Science & Children’s Discovery Wing', experience: 'Hands-on digital science, building, pattern and discovery activities designed for family and classroom modes.', linkedProof: 'Curated expansion' },
  { id: 'sports-starverse', name: 'Sports + StarVerse Experience', experience: 'Interactive sports moments, creator auditions and performance challenges connect to Sports Realm and StarVerse without changing proof progression.', linkedProof: 'Curated expansion' },
  { id: 'zoo-aquarium', name: 'Virtual Zoo & Aquarium', experience: 'Educational animal and marine-life simulations with species information, ambient ecosystems and accessibility-safe presentation.', linkedProof: 'Curated expansion' },
  { id: 'seasonal', name: 'Seasonal Immersive Gallery', experience: 'Rotating holiday, haunted, festival and special-event scenes stay modular so the permanent proof route remains stable.', linkedProof: 'Curated expansion' },
]

const STORAGE_KEY = 'tryamm.streetverse.district01.realitylab.v1'
const initial: Saved = { room: 0, completed: [], xp: 0, oneHanded: false, reducedMotion: false, highContrast: false }

export default function RealityLabDistrict01({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<Saved>(initial)
  const [hydrated, setHydrated] = useState(false)
  const [panic, setPanic] = useState(false)
  const [message, setMessage] = useState('District 01 checkpoint ready.')
  const [cloudStatus, setCloudStatus] = useState<'local'|'loading'|'synced'|'unavailable'>('local')
  const [selectedExhibit, setSelectedExhibit] = useState(EXHIBITS[0])
  const [gamepadName, setGamepadName] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const loadedCloudRef = useRef(false)
  const gamepadNameRef = useRef<string | null>(null)
  const previousButtonsRef = useRef<boolean[]>([])
  const previousAxisRef = useRef({ left: false, right: false })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState({ ...initial, ...JSON.parse(raw) })
    } catch {
      setMessage('Local checkpoint recovery failed; safe fresh state loaded.')
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [hydrated, state])

  useEffect(() => {
    if (!hydrated || loadedCloudRef.current) return
    loadedCloudRef.current = true
    let cancelled = false
    async function loadCloudCheckpoint() {
      if (!isSupabaseConfigured()) return
      const client = getSupabaseClient()
      if (!client) return
      setCloudStatus('loading')
      try {
        const userId = await getAuthenticatedUserId()
        if (!userId) {
          if (!cancelled) setCloudStatus('local')
          return
        }
        userIdRef.current = userId
        const { data, error } = await client
          .from('reality_lab_progress')
          .select('current_room,completed_rooms,xp,accessibility,checkpoint_revision')
          .eq('user_id', userId)
          .maybeSingle<CloudRow>()
        if (error) throw error
        if (data && !cancelled) {
          const index = Math.max(0, ROOMS.findIndex(room => room.id === data.current_room))
          const a11y = data.accessibility ?? {}
          setState(prev => ({
            ...prev,
            room: index,
            completed: Array.isArray(data.completed_rooms) ? data.completed_rooms.filter(id => ROOMS.some(room => room.id === id)) : [],
            xp: typeof data.xp === 'number' ? Math.max(0, data.xp) : 0,
            oneHanded: a11y.oneHanded === true,
            reducedMotion: a11y.reducedMotion === true,
            highContrast: a11y.highContrast === true,
          }))
          setMessage(`Cloud checkpoint restored • revision ${data.checkpoint_revision ?? 1}.`)
        }
        if (!cancelled) setCloudStatus('synced')
      } catch (error) {
        console.warn('[RealityLab] cloud checkpoint load skipped:', error)
        if (!cancelled) setCloudStatus('unavailable')
      }
    }
    void loadCloudCheckpoint()
    return () => { cancelled = true }
  }, [hydrated])

  useEffect(() => {
    if (!hydrated || !userIdRef.current) return
    const client = getSupabaseClient()
    if (!client) return
    const timer = window.setTimeout(async () => {
      setCloudStatus('loading')
      const current = ROOMS[state.room] ?? ROOMS[0]
      const { data: existing } = await client
        .from('reality_lab_progress')
        .select('checkpoint_revision')
        .eq('user_id', userIdRef.current)
        .maybeSingle<{ checkpoint_revision: number | null }>()
      const revision = (existing?.checkpoint_revision ?? 0) + 1
      const { error } = await client.from('reality_lab_progress').upsert({
        user_id: userIdRef.current,
        current_room: current.id,
        completed_rooms: state.completed,
        xp: state.xp,
        accessibility: { oneHanded: state.oneHanded, reducedMotion: state.reducedMotion, highContrast: state.highContrast },
        checkpoint_revision: revision,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (error) {
        console.warn('[RealityLab] cloud checkpoint save skipped:', error)
        setCloudStatus('unavailable')
      } else setCloudStatus('synced')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [hydrated, state])

  const current = ROOMS[state.room] ?? ROOMS[0]
  const progress = Math.round((state.completed.length / ROOMS.length) * 100)
  const allComplete = state.completed.length === ROOMS.length
  const completedSet = useMemo(() => new Set(state.completed), [state.completed])

  const previousRoom = useCallback(() => {
    if (panic) return
    setState(s => ({ ...s, room: Math.max(0, s.room - 1) }))
  }, [panic])

  const nextRoom = useCallback(() => {
    if (panic) return
    setState(s => ({ ...s, room: Math.min(ROOMS.length - 1, s.room + 1) }))
  }, [panic])

  const completeCurrent = useCallback(() => {
    if (panic) return
    setState(s => {
      const room = ROOMS[s.room] ?? ROOMS[0]
      if (s.completed.includes(room.id)) return s
      setMessage(`${room.name} interaction recorded. Lab XP only; no cash or payable balance changed.`)
      return { ...s, completed: [...s.completed, room.id], xp: s.xp + room.xp }
    })
  }, [panic])

  const activatePanic = useCallback(() => {
    setPanic(true)
    setMessage('PANIC SAFE STATE ACTIVE.')
  }, [])

  const resume = useCallback(() => {
    setPanic(false)
    setMessage('Safe state cleared. Resume when ready.')
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return activatePanic()
      if (event.key === 'Home' && panic) return resume()
      if (panic) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextRoom()
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') previousRoom()
      if (event.key === 'Enter') completeCurrent()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activatePanic, completeCurrent, nextRoom, panic, previousRoom, resume])

  useEffect(() => {
    if (!('getGamepads' in navigator)) return
    let frame = 0
    const edge = (index: number, pressed: boolean, action: () => void) => {
      const previous = previousButtonsRef.current[index] ?? false
      if (pressed && !previous) action()
      previousButtonsRef.current[index] = pressed
    }
    const poll = () => {
      const pad = Array.from(navigator.getGamepads?.() ?? []).find((candidate): candidate is Gamepad => Boolean(candidate))
      const nextName = pad?.id ?? null
      if (nextName !== gamepadNameRef.current) {
        gamepadNameRef.current = nextName
        setGamepadName(nextName)
      }
      if (pad) {
        edge(14, Boolean(pad.buttons[14]?.pressed), previousRoom)
        edge(15, Boolean(pad.buttons[15]?.pressed), nextRoom)
        edge(0, Boolean(pad.buttons[0]?.pressed), completeCurrent)
        edge(1, Boolean(pad.buttons[1]?.pressed), activatePanic)
        edge(9, Boolean(pad.buttons[9]?.pressed), resume)
        const axis = pad.axes[0] ?? 0
        const left = axis < -0.65
        const right = axis > 0.65
        if (left && !previousAxisRef.current.left) previousRoom()
        if (right && !previousAxisRef.current.right) nextRoom()
        previousAxisRef.current = { left, right }
      } else {
        previousButtonsRef.current = []
        previousAxisRef.current = { left: false, right: false }
      }
      frame = window.requestAnimationFrame(poll)
    }
    frame = window.requestAnimationFrame(poll)
    return () => window.cancelAnimationFrame(frame)
  }, [activatePanic, completeCurrent, nextRoom, previousRoom, resume])

  return (
    <div role="dialog" aria-modal="true" aria-label="StreetVerse District 01 Reality Lab" style={{ position:'fixed', inset:0, zIndex:10040, overflowY:'auto', background: state.highContrast ? '#000' : 'radial-gradient(circle at top,#10283b,#050814 58%,#020212)', color: state.highContrast ? '#fff200' : '#fff', padding:18 }}>
      <div style={{ maxWidth:1180, margin:'0 auto' }}>
        <div style={{ display:'flex', gap:12, justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' }}>
          <div>
            <div style={{ color:'#4fe3ff', fontSize:11, fontWeight:900, letterSpacing:3 }}>STREETVERSE • DISTRICT 01 • FINISH-AND-PROVE</div>
            <h1 style={{ margin:'8px 0', fontSize:'clamp(2.2rem,7vw,5rem)' }}>TRYAMM Reality Lab</h1>
            <div style={{ color:'#a9b8c8' }}>Original Chicago immersive-attraction system. Inspired by the interactive-museum category, not copied from any third-party exhibit.</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={activatePanic} style={{ minHeight:48, padding:'0 16px', fontWeight:900, border:'1px solid #ff6b7d', background:'#3b1018', color:'#fff', borderRadius:12 }}>PANIC / SAFE STATE</button>
            <button onClick={onClose} aria-label="Close Reality Lab" style={{ width:48, height:48, borderRadius:'50%', border:'1px solid #4fe3ff77', background:'#0c1620', color:'#fff' }}>×</button>
          </div>
        </div>

        <div aria-live="polite" style={{ marginTop:16, padding:12, border:'1px solid #4fe3ff55', borderRadius:12, background:'#06111dcc' }}><strong>{message}</strong></div>
        <div style={{ marginTop:10, display:'flex', gap:18, flexWrap:'wrap', fontFamily:'monospace', fontSize:12 }}>
          <span>PROGRESS {progress}%</span><span>LAB XP {state.xp}</span><span>ROOM {state.room + 1}/{ROOMS.length}</span><span>CLOUD {cloudStatus.toUpperCase()}</span><span>GAMEPAD {gamepadName ? 'CONNECTED' : 'WAITING'}</span>
        </div>
        {gamepadName && <div aria-label="Connected gamepad" style={{ marginTop:6, color:'#78ffb4', fontFamily:'monospace', fontSize:10 }}>Controller: {gamepadName} • D-pad/left stick navigate • A complete • B panic • Start resume</div>}
        <progress value={progress} max={100} style={{ width:'100%', height:18, marginTop:10 }} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:10, marginTop:18 }}>
          {ROOMS.map((room, index) => <button key={room.id} onClick={() => !panic && setState(s => ({ ...s, room:index }))} aria-current={index === state.room ? 'step' : undefined} style={{ minHeight:74, textAlign:'left', padding:12, borderRadius:14, border:index===state.room?'2px solid #4fe3ff':'1px solid #23364a', background:'#08121dcc', color:'#fff' }}><strong>{index + 1}. {room.name}</strong><div style={{ marginTop:7, color:completedSet.has(room.id)?'#78ffb4':'#93a4b5', fontSize:11 }}>{completedSet.has(room.id)?'Interaction recorded':'Not yet completed'}</div></button>)}
        </div>

        <section style={{ marginTop:20, border:'1px solid #29435a', borderRadius:20, padding:18, background:'#07101bcc' }}>
          <div style={{ color:'#e8b944', fontSize:10, letterSpacing:2, fontWeight:900 }}>CURRENT PROOF ROOM</div>
          <h2 style={{ fontSize:'clamp(1.8rem,5vw,3rem)', margin:'8px 0' }}>{current.name}</h2>
          <p style={{ color:'#c3d0dc', maxWidth:840 }}>{current.proof}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button disabled={panic || state.room === 0} onClick={previousRoom}>Previous</button>
            <button disabled={panic || completedSet.has(current.id)} onClick={completeCurrent}>{completedSet.has(current.id)?'Interaction recorded':`Complete +${current.xp} Lab XP`}</button>
            <button disabled={panic || state.room === ROOMS.length - 1} onClick={nextRoom}>Next</button>
          </div>
        </section>

        <section aria-label="Chicago World Museum Immersive Wing" style={{ marginTop:20, border:'1px solid #704fe3aa', borderRadius:20, padding:18, background:'linear-gradient(145deg,#0c1022,#10081c)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div><div style={{ color:'#d49cff', fontSize:10, letterSpacing:2, fontWeight:900 }}>RECOVERED ORIGINAL DESIGN • IMMERSIVE WING</div><h2 style={{ margin:'7px 0' }}>Chicago World Museum Experiences</h2></div>
            <div style={{ color:'#78ffb4', fontFamily:'monospace', fontSize:10 }}>14 EXPERIENCES • DOES NOT INFLATE PROOF PROGRESS</div>
          </div>
          <p style={{ color:'#aeb7ca', maxWidth:900 }}>These are the additional immersive experiences already designed for District 01. They wrap around the seven proof rooms as exhibit layers; the seven-room completion spine remains unchanged.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:8 }}>
            {EXHIBITS.map(exhibit => <button key={exhibit.id} aria-pressed={selectedExhibit.id===exhibit.id} onClick={()=>setSelectedExhibit(exhibit)} style={{ textAlign:'left', minHeight:70, padding:10, borderRadius:12, border:selectedExhibit.id===exhibit.id?'2px solid #d49cff':'1px solid #2b2e48', background:'#0a0d18', color:'#fff' }}><strong>{exhibit.name}</strong><div style={{ marginTop:5, fontSize:9, color:'#8e9aae' }}>{exhibit.linkedProof}</div></button>)}
          </div>
          <article aria-live="polite" style={{ marginTop:12, padding:16, borderRadius:14, background:'#070912', border:'1px solid #3b315b' }}><div style={{ color:'#d49cff', fontWeight:900 }}>{selectedExhibit.name}</div><p style={{ color:'#c7cfda', marginBottom:5 }}>{selectedExhibit.experience}</p><small style={{ color:'#7f8ba0' }}>Proof relationship: {selectedExhibit.linkedProof}</small></article>
        </section>

        <fieldset style={{ marginTop:18, border:'1px solid #29435a', borderRadius:18, padding:16 }}>
          <legend>Accessibility controls</legend>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.oneHanded} onChange={e=>setState(s=>({...s,oneHanded:e.target.checked}))}/> One-handed mode</label>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.reducedMotion} onChange={e=>setState(s=>({...s,reducedMotion:e.target.checked}))}/> Reduced motion</label>
          <label style={{ display:'block', minHeight:44 }}><input type="checkbox" checked={state.highContrast} onChange={e=>setState(s=>({...s,highContrast:e.target.checked}))}/> High contrast</label>
        </fieldset>

        {panic && <div role="alert" style={{ marginTop:18, border:'3px solid #ff6b7d', borderRadius:18, padding:18 }}><strong>SAFE STATE ACTIVE.</strong> Room progression is locked.<div><button onClick={resume} style={{ marginTop:10 }}>Resume</button></div></div>}
        {allComplete && <div style={{ marginTop:18, border:'2px solid #e8b944', borderRadius:18, padding:18 }}><strong>Interaction loop complete.</strong> This does not turn the active slice GREEN by itself. Two-device multiplayer, authenticated cloud save/rejoin, physical controller evidence, mobile/XR benchmarks, commerce isolation and deployed smoke evidence still require real proof.</div>}
      </div>
    </div>
  )
}
