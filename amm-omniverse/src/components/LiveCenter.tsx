import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Room } from 'livekit-client'
import { connectLiveRoom, getLiveStatus, type LiveRole } from '../services/live'

type Format = 'live' | 'showcase' | 'debate' | 'starverse' | 'podcast' | 'shopping' | 'gamecast'

const FORMATS: Array<{ id: Format; label: string; description: string }> = [
  { id: 'live', label: 'TryAMM LIVE', description: 'General live broadcast and community room' },
  { id: 'showcase', label: 'All American Showcase', description: 'Music, creator, business and talent showcase' },
  { id: 'debate', label: 'Debate Arena', description: 'Moderated debate, town hall and panel format' },
  { id: 'starverse', label: 'StarVerse', description: 'Auditions, performances and talent discovery' },
  { id: 'podcast', label: 'Podcast', description: 'Video/audio podcast and remote guest room' },
  { id: 'shopping', label: 'LIVE Shopping', description: 'Shoppable creator and marketplace broadcast' },
  { id: 'gamecast', label: 'GameVerse Cast', description: 'Tournament, gameplay and esports-style broadcast' },
]

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'tryamm-live'
}

export default function LiveCenter({ onClose }: { onClose: () => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [format, setFormat] = useState<Format>('live')
  const [title, setTitle] = useState('TryAMM LIVE')
  const [role, setRole] = useState<LiveRole>('host')
  const [displayName, setDisplayName] = useState('Creator')
  const [roomName, setRoomName] = useState('tryamm-live')
  const [connected, setConnected] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getLiveStatus().then(status => setConfigured(Boolean(status.configured))).catch(() => setConfigured(false))
    return () => {
      roomRef.current?.disconnect()
      roomRef.current = null
    }
  }, [])

  function chooseFormat(next: Format) {
    setFormat(next)
    const selected = FORMATS.find(x => x.id === next)
    if (selected) {
      setTitle(selected.label)
      setRoomName(slug(selected.label))
    }
  }

  async function connect() {
    setBusy(true)
    setError('')
    try {
      stageRef.current?.replaceChildren()
      const { room } = await connectLiveRoom({
        roomName,
        role,
        displayName,
        onParticipants: setParticipants,
        onTrack: (element, participantIdentity) => {
          element.setAttribute('data-participant', participantIdentity)
          element.style.width = '100%'
          element.style.maxHeight = '360px'
          element.style.objectFit = 'cover'
          element.style.borderRadius = '14px'
          if (element instanceof HTMLAudioElement) element.style.display = 'none'
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
            element.style.width = '100%'
            element.style.maxHeight = '360px'
            element.style.objectFit = 'cover'
            element.style.borderRadius = '14px'
            if (element instanceof HTMLVideoElement) element.muted = true
            if (element instanceof HTMLAudioElement) element.style.display = 'none'
            stageRef.current?.prepend(element)
          }
        }
      }
      setConnected(true)
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
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="TryAMM LIVE Center" style={styles.shell}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>TRYAMM MEDIA CORE</div>
          <h1 style={styles.title}>LIVE Center</h1>
          <p style={styles.subtitle}>One streaming engine for LIVE, All American Showcase, Debate Arena, StarVerse, podcasts, shopping and GameVerse broadcasts.</p>
        </div>
        <button aria-label="Close LIVE Center" onClick={onClose} style={styles.close}>×</button>
      </header>

      <main style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Broadcast format</h2>
          <div style={styles.formatGrid}>
            {FORMATS.map(item => (
              <button key={item.id} onClick={() => chooseFormat(item.id)} style={{ ...styles.format, ...(format === item.id ? styles.formatActive : {}) }}>
                <strong>{item.label}</strong>
                <span style={styles.small}>{item.description}</span>
              </button>
            ))}
          </div>

          <label style={styles.label}>Show title<input value={title} onChange={e => { setTitle(e.target.value); setRoomName(slug(e.target.value)) }} style={styles.input} /></label>
          <label style={styles.label}>Room ID<input value={roomName} onChange={e => setRoomName(slug(e.target.value))} style={styles.input} /></label>
          <label style={styles.label}>Display name<input value={displayName} onChange={e => setDisplayName(e.target.value.slice(0,80))} style={styles.input} /></label>

          <div style={styles.row}>
            <button onClick={() => setRole('host')} style={{ ...styles.role, ...(role === 'host' ? styles.roleActive : {}) }}>Host / Creator</button>
            <button onClick={() => setRole('viewer')} style={{ ...styles.role, ...(role === 'viewer' ? styles.roleActive : {}) }}>Viewer</button>
          </div>

          {!connected ? (
            <button disabled={busy || configured === false} onClick={() => void connect()} style={styles.primary}>{busy ? 'Connecting…' : role === 'host' ? 'Go LIVE' : 'Join LIVE'}</button>
          ) : (
            <div style={styles.row}>
              {role === 'host' && <button onClick={() => void toggleMic()} style={styles.secondary}>Mic</button>}
              {role === 'host' && <button onClick={() => void toggleCamera()} style={styles.secondary}>Camera</button>}
              <button onClick={leave} style={styles.danger}>Leave</button>
            </div>
          )}

          <p style={styles.status}>{configured === null ? 'Checking LiveKit…' : configured ? '● LIVE infrastructure configured' : '○ LiveKit server configuration is still required on the backend'}</p>
          {error && <div role="alert" style={styles.error}>{error}</div>}
        </section>

        <section style={{ ...styles.card, ...styles.stageCard }}>
          <div style={styles.stageHeader}>
            <div><strong>{title || 'TryAMM LIVE'}</strong><div style={styles.small}>{format.toUpperCase()} · {role.toUpperCase()}</div></div>
            <div style={styles.viewerBadge}>👥 {participants}</div>
          </div>
          <div ref={stageRef} style={styles.stage} aria-live="polite">
            {!connected && <div style={styles.placeholder}>Camera/video stage appears here after joining.</div>}
          </div>
          <div style={styles.features}>
            <span>Captions-ready</span><span>Translation-ready</span><span>Sign-language companion</span><span>Gifts/commerce hook</span><span>OTT replay hook</span>
          </div>
        </section>
      </main>
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
  primary: { width: '100%', marginTop: 14, padding: 13, border: 0, borderRadius: 13, fontWeight: 900, cursor: 'pointer', background: '#fff', color: '#071022' },
  secondary: { padding: '10px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer' },
  danger: { padding: '10px 14px', borderRadius: 11, border: '1px solid rgba(255,80,80,.35)', background: 'rgba(255,80,80,.14)', color: '#fff', cursor: 'pointer' },
  status: { marginTop: 12, fontSize: 12, opacity: .7 }, error: { marginTop: 10, padding: 10, borderRadius: 10, background: 'rgba(255,80,80,.13)', border: '1px solid rgba(255,80,80,.3)' },
  stageCard: { minHeight: 520 }, stageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  viewerBadge: { borderRadius: 999, padding: '7px 10px', background: 'rgba(255,255,255,.08)', fontSize: 12 },
  stage: { minHeight: 400, display: 'grid', gap: 10, alignContent: 'start', borderRadius: 16, padding: 10, background: '#02040b', overflow: 'hidden' },
  placeholder: { minHeight: 360, display: 'grid', placeItems: 'center', opacity: .45, textAlign: 'center' },
  features: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12, fontSize: 11, opacity: .65 },
}
