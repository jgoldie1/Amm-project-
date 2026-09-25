import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Room } from 'livekit-client'
import { connectLiveRoom, getLiveStatus, type LiveRole } from '../services/live'
import LiveGenerationIntelligence from './LiveGenerationIntelligence'
import HoloGiftEngine from './HoloGiftEngine'

type Format = 'live' | 'showcase' | 'debate' | 'starverse' | 'podcast' | 'shopping' | 'gamecast'
type VisualFilter = 'clean' | 'bright' | 'warm' | 'cool' | 'mono' | 'contrast' | 'holo'

const FORMATS: Array<{ id: Format; label: string; description: string }> = [
  { id: 'live', label: 'TryAMM LIVE', description: 'General live broadcast and community room' },
  { id: 'showcase', label: 'All American Showcase', description: 'Music, creator, business and talent showcase' },
  { id: 'debate', label: 'Debate Arena', description: 'Moderated debate, town hall and panel format' },
  { id: 'starverse', label: 'StarVerse', description: 'Auditions, performances and talent discovery' },
  { id: 'podcast', label: 'Podcast', description: 'Video/audio podcast and remote guest room' },
  { id: 'shopping', label: 'LIVE Shopping', description: 'Shoppable creator and marketplace broadcast' },
  { id: 'gamecast', label: 'GameVerse Cast', description: 'Tournament, gameplay and esports-style broadcast' },
]

const FILTERS: Array<{ id: VisualFilter; label: string; css: string }> = [
  { id: 'clean', label: 'Clean', css: 'none' },
  { id: 'bright', label: 'Bright', css: 'brightness(1.12) saturate(1.06)' },
  { id: 'warm', label: 'Warm', css: 'sepia(.14) saturate(1.12) brightness(1.04)' },
  { id: 'cool', label: 'Cool', css: 'hue-rotate(10deg) saturate(1.1) brightness(1.03)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.06)' },
  { id: 'contrast', label: 'High Contrast', css: 'contrast(1.28) saturate(1.12)' },
  { id: 'holo', label: 'Holo Glow', css: 'contrast(1.08) saturate(1.32) hue-rotate(8deg) drop-shadow(0 0 10px rgba(79,227,255,.45))' },
]

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'tryamm-live'
}

export default function LiveCenter({ onClose, initialMode='live', initialRole='host', youthViewerOnly=false }: { onClose: () => void; initialMode?: 'live'|'pk'; initialRole?: LiveRole; youthViewerOnly?: boolean }) {
  const pkMode=initialMode==='pk'
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [format, setFormat] = useState<Format>('live')
  const [title, setTitle] = useState(pkMode?'Holographic PK Battle':'TryAMM LIVE')
  const [role, setRole] = useState<LiveRole>(youthViewerOnly?'viewer':initialRole)
  const [displayName, setDisplayName] = useState(youthViewerOnly?'Youth Viewer':'Creator')
  const [roomName, setRoomName] = useState(pkMode?'tryamm-pk':'tryamm-live')
  const [connected, setConnected] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [visualFilter, setVisualFilter] = useState<VisualFilter>('clean')
  const [mirrorLocal, setMirrorLocal] = useState(true)
  const [effectsOpen, setEffectsOpen] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getLiveStatus().then(status => setConfigured(Boolean(status.configured))).catch(() => setConfigured(false))
    return () => {
      roomRef.current?.disconnect()
      roomRef.current = null
    }
  }, [])

  useEffect(() => {
    applyStageFilter()
  }, [visualFilter, mirrorLocal])

  function chooseFormat(next: Format) {
    setFormat(next)
    const selected = FORMATS.find(x => x.id === next)
    if (selected) {
      setTitle(selected.label)
      setRoomName(slug(selected.label))
    }
  }

  function applyStageFilter() {
    const css = FILTERS.find(x => x.id === visualFilter)?.css || 'none'
    const stage = stageRef.current
    if (!stage) return
    stage.querySelectorAll('video').forEach(node => {
      const video = node as HTMLVideoElement
      video.style.filter = css
      const local = video.dataset.local === 'true'
      video.style.transform = local && mirrorLocal ? 'scaleX(-1)' : 'none'
    })
  }

  function prepareMediaElement(element: HTMLMediaElement, participantIdentity: string, local = false) {
    element.setAttribute('data-participant', participantIdentity)
    element.setAttribute('data-local', local ? 'true' : 'false')
    element.style.width = '100%'
    element.style.maxHeight = '360px'
    element.style.objectFit = 'cover'
    element.style.borderRadius = '14px'
    if (element instanceof HTMLVideoElement) {
      const css = FILTERS.find(x => x.id === visualFilter)?.css || 'none'
      element.style.filter = css
      element.style.transform = local && mirrorLocal ? 'scaleX(-1)' : 'none'
      if (local) element.muted = true
    }
    if (element instanceof HTMLAudioElement) element.style.display = 'none'
  }

  async function preflightHostMedia(){
    if(role!=='host')return
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera and microphone are not available on this device/browser.')
    const preview=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
    preview.getTracks().forEach(track=>track.stop())
  }

  async function connect() {
    setBusy(true)
    setError('')
    try {
      if(youthViewerOnly&&role!=='viewer')throw new Error('Youth Viewer Mode keeps camera, microphone and hosting disabled in this release.')
      await preflightHostMedia()
      stageRef.current?.replaceChildren()
      const { room, session } = await connectLiveRoom({
        roomName,
        role,
        displayName,
        onParticipants: setParticipants,
        onTrack: (element, participantIdentity) => {
          prepareMediaElement(element, participantIdentity, false)
          stageRef.current?.appendChild(element)
        },
      })
      roomRef.current = room
      if (role === 'host') {
        const pubs = Array.from(room.localParticipant.trackPublications.values())
        for (const pub of pubs) {
          const track = pub.track
          if (track) {
            const element = track.attach()
            prepareMediaElement(element, room.localParticipant.identity || 'local', true)
            stageRef.current?.prepend(element)
          }
        }
      }
      setConnected(true)
      window.dispatchEvent(new CustomEvent('tryamm:live-session',{detail:{type:pkMode?'pk':'live',roomName:session.room,role:session.role,participant:session.participant,connected:true}}))
      if(pkMode)window.dispatchEvent(new CustomEvent('tryamm:pk-start',{detail:{mode:'livekit',roomName:session.room,participant:session.participant,role:session.role}}))
    } catch (e: any) {
      setError(e.message || 'Could not join LIVE room')
    } finally {
      setBusy(false)
    }
  }

  function leave() {
    roomRef.current?.disconnect()
    roomRef.current = null
    stageRef.current?.replaceChildren()
    setConnected(false)
    setParticipants(0)
    window.dispatchEvent(new CustomEvent('tryamm:live-session-end',{detail:{roomName,role}}))
    if(pkMode)window.dispatchEvent(new CustomEvent('tryamm:pk-end',{detail:{roomName,role,reason:'leave'}}))
  }

  async function toggleMic() {
    if (!roomRef.current || role !== 'host') return
    const enabled = roomRef.current.localParticipant.isMicrophoneEnabled
    await roomRef.current.localParticipant.setMicrophoneEnabled(!enabled)
  }

  async function toggleCamera() {
    if (!roomRef.current || role !== 'host') return
    const enabled = roomRef.current.localParticipant.isCameraEnabled
    await roomRef.current.localParticipant.setCameraEnabled(!enabled)
    setTimeout(applyStageFilter, 150)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="TryAMM LIVE Center" style={styles.shell}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>TRYAMM MEDIA CORE</div>
          <h1 style={styles.title}>{pkMode?'Holographic PK Arena':'LIVE Center'}</h1>
          <p style={styles.subtitle}>{pkMode?'Realtime camera/microphone PK battle stage with LiveKit, holographic effects and verified gift hooks.':'One streaming engine for LIVE, All American Showcase, Debate Arena, StarVerse, podcasts, shopping and GameVerse broadcasts.'}</p>
        </div>
        <button aria-label="Close LIVE Center" onClick={onClose} style={styles.close}>×</button>
      </header>

      <main style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>{pkMode?'PK room setup':'Broadcast format'}</h2>
          {youthViewerOnly&&<div style={styles.youthNotice}><b>12-YEAR-OLD YOUTH VIEWER MODE</b><br/>Viewing is enabled. Camera, microphone, hosting, freeform personal-information exchange and paid gifts/tips remain disabled until adult-managed controls are verified.</div>}
          {!pkMode&&<div style={styles.formatGrid}>
            {FORMATS.map(item => (
              <button key={item.id} onClick={() => chooseFormat(item.id)} style={{ ...styles.format, ...(format === item.id ? styles.formatActive : {}) }}>
                <strong>{item.label}</strong>
                <span style={styles.small}>{item.description}</span>
              </button>
            ))}
          </div>}

          <label style={styles.label}>Show title<input value={title} onChange={e => { setTitle(e.target.value); setRoomName(slug(e.target.value)) }} style={styles.input} /></label>
          <label style={styles.label}>Room ID<input value={roomName} onChange={e => setRoomName(slug(e.target.value))} style={styles.input} /></label>
          <label style={styles.label}>Display name<input value={displayName} onChange={e => setDisplayName(e.target.value.slice(0,80))} style={styles.input} /></label>

          <div style={styles.row}>
            {!youthViewerOnly&&<button onClick={() => setRole('host')} style={{ ...styles.role, ...(role === 'host' ? styles.roleActive : {}) }}>Host / Creator</button>}
            <button onClick={() => setRole('viewer')} style={{ ...styles.role, ...(role === 'viewer' ? styles.roleActive : {}) }}>Viewer</button>
          </div>

          <button type="button" onClick={() => setEffectsOpen(v => !v)} style={styles.effectsButton}>✨ HoloFilter {effectsOpen ? '▲' : '▼'}</button>
          {effectsOpen && <div style={styles.effectsPanel}>
            <div style={styles.filterGrid}>
              {FILTERS.map(filter => <button key={filter.id} type="button" onClick={() => setVisualFilter(filter.id)} style={{...styles.filterChip,...(visualFilter===filter.id?styles.filterActive:{})}}>{filter.label}</button>)}
            </div>
            <label style={styles.check}><input type="checkbox" checked={mirrorLocal} onChange={e=>setMirrorLocal(e.target.checked)}/> Mirror my camera</label>
            <div style={styles.filterRoadmap}>
              <span>✓ visual presets</span><span>◌ beauty/lighting</span><span>◌ background blur/replace</span><span>◌ AR/hologram masks</span><span>◌ noise cleanup</span><span>◌ moderation/safety</span>
            </div>
            <p style={styles.small}>Visual presets work now with browser video filters. Background segmentation, face effects and audio denoise require dedicated media processors and are kept as explicit provider/device hooks instead of being falsely marked complete.</p>
          </div>}

          {!connected ? (
            <button disabled={busy || configured === false} onClick={() => void connect()} style={styles.primary}>{busy ? 'Connecting…' : role === 'host' ? (pkMode?'START PK CAMERA':'Go LIVE') : (pkMode?'WATCH PK':'Join LIVE')}</button>
          ) : (
            <div style={styles.row}>
              {role === 'host' && <button onClick={() => void toggleMic()} style={styles.secondary}>Mic</button>}
              {role === 'host' && <button onClick={() => void toggleCamera()} style={styles.secondary}>Camera</button>}
              <button onClick={leave} style={styles.danger}>Leave</button>
            </div>
          )}

          <p style={styles.status}>{configured === null ? 'Checking LiveKit…' : configured ? `● ${pkMode?'PK / ':''}LIVE infrastructure configured • host camera/mic preflight on connect` : '○ LiveKit server configuration is still required on the backend'}</p>
          {error && <div role="alert" style={styles.error}>{error}</div>}
        </section>

        <section style={{ ...styles.card, ...styles.stageCard }}>
          <div style={styles.stageHeader}>
            <div><strong>{title || 'TryAMM LIVE'}</strong><div style={styles.small}>{pkMode?'PK':format.toUpperCase()} · {role.toUpperCase()} · FILTER {visualFilter.toUpperCase()}</div></div>
            <div style={styles.viewerBadge}>👥 {participants}</div>
          </div>
          <div ref={stageRef} style={styles.stage} aria-live="polite">
            {!connected && <div style={styles.placeholder}>Camera/video stage appears here after joining.</div>}
          </div>
          <div style={styles.features}>
            <span>HoloFilter</span><span>LiveKit camera/mic</span><span>Captions-ready</span><span>Translation-ready</span><span>Sign-language companion</span><span>Report/block safety</span><span>OTT replay hook</span>
          </div>
          {connected&&!youthViewerOnly&&<details style={{marginTop:12}}><summary style={{cursor:'pointer',fontWeight:900,color:'#4fe3ff'}}>HOLO GIFTS / PK FX</summary><div style={{marginTop:10}}><HoloGiftEngine recipientId={pkMode?'pk-host':'live-host'}/></div></details>}
        </section>
      </main>

      <LiveGenerationIntelligence format={format} />
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100%', overflowY: 'auto', padding: 22, background: 'linear-gradient(180deg,#030611,#101531)', color: '#fff', fontFamily: 'system-ui,sans-serif' },
  header: { maxWidth: 1200, margin: '0 auto 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: 900, opacity: .68 },
  title: { fontSize: 34, margin: '5px 0' }, subtitle: { maxWidth: 760, opacity: .75, lineHeight: 1.5 },
  close: { width: 46, height: 46, borderRadius: 15, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 30, cursor: 'pointer' },
  grid: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(300px,430px) 1fr', gap: 16 },
  card: { border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, background: 'rgba(255,255,255,.06)', padding: 18 },
  cardTitle: { marginTop: 0, fontSize: 19 }, formatGrid: { display: 'grid', gap: 8 },
  format: { textAlign: 'left', display: 'grid', gap: 4, padding: 11, borderRadius: 13, color: '#fff', background: '#090f26', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer' },
  formatActive: { border: '1px solid #66e7ff', boxShadow: '0 0 18px rgba(102,231,255,.15)' },
  small: { fontSize: 12, opacity: .65, fontWeight: 500 }, label: { display: 'grid', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 800 },
  input: { width: '100%', padding: 11, borderRadius: 11, border: '1px solid rgba(255,255,255,.16)', background: '#070d20', color: '#fff', fontSize: 15 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  role: { flex: 1, padding: 10, borderRadius: 11, border: '1px solid rgba(255,255,255,.16)', background: '#0a1025', color: '#fff', cursor: 'pointer' },
  roleActive: { background: '#fff', color: '#081022' },
  effectsButton: { width:'100%', marginTop:12, padding:11, borderRadius:12, border:'1px solid rgba(79,227,255,.4)', background:'#0a1c2d', color:'#fff', fontWeight:900, cursor:'pointer' },
  effectsPanel: { marginTop:8, padding:12, borderRadius:14, border:'1px solid rgba(79,227,255,.2)', background:'rgba(5,18,32,.85)' },
  filterGrid: { display:'flex', flexWrap:'wrap', gap:7 },
  filterChip: { padding:'8px 10px', borderRadius:999, border:'1px solid rgba(255,255,255,.16)', background:'#10172b', color:'#fff', cursor:'pointer', fontSize:12 },
  filterActive: { border:'1px solid #4fe3ff', boxShadow:'0 0 12px rgba(79,227,255,.22)', background:'#123145' },
  check: { display:'flex', gap:8, alignItems:'center', marginTop:10, fontSize:12 },
  filterRoadmap: { display:'flex', flexWrap:'wrap', gap:7, marginTop:10, fontSize:11, opacity:.75 },
  primary: { width: '100%', marginTop: 14, padding: 13, border: 0, borderRadius: 13, fontWeight: 900, cursor: 'pointer', background: '#fff', color: '#071022' },
  secondary: { padding: '10px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer' },
  danger: { padding: '10px 14px', borderRadius: 11, border: '1px solid rgba(255,80,80,.35)', background: 'rgba(255,80,80,.14)', color: '#fff', cursor: 'pointer' },
  status: { marginTop: 12, fontSize: 12, opacity: .7 }, error: { marginTop: 10, padding: 10, borderRadius: 10, background: 'rgba(255,80,80,.13)', border: '1px solid rgba(255,80,80,.3)' },
  youthNotice: { marginBottom: 12, padding: 11, borderRadius: 12, border:'1px solid rgba(255,214,90,.45)', background:'rgba(74,57,8,.7)', color:'#fff3c4', fontSize:12, lineHeight:1.45 },
  stageCard: { minHeight: 520 }, stageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  viewerBadge: { borderRadius: 999, padding: '7px 10px', background: 'rgba(255,255,255,.08)', fontSize: 12 },
  stage: { minHeight: 400, display: 'grid', gap: 10, alignContent: 'start', borderRadius: 16, padding: 10, background: '#02040b', overflow: 'hidden' },
  placeholder: { minHeight: 360, display: 'grid', placeItems: 'center', opacity: .45, textAlign: 'center' },
  features: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12, fontSize: 11, opacity: .65 },
}