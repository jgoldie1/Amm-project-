import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import type { StreamState } from '../game/streaming/StreamingEngine'
import type { AudioState, Track } from '../game/audio/AudioEngine'
const TacticalRealms = lazy(() => import('./games/TacticalRealms'))
const HeroRealms = lazy(() => import('./games/HeroRealms'))
const PlatformCommandCenter = lazy(() => import('./PlatformCommandCenter'))
const RevenueDashboard    = lazy(() => import('./RevenueDashboard'))
const ShareLinkSystem     = lazy(() => import('./ShareLinkSystem'))
const HoloWatermarkManager  = lazy(() => import('./HoloWatermark').then(m => ({ default: m.HoloWatermarkManager })))
const AMMDeveloperPlatform  = lazy(() => import('./AMMDeveloperPlatform'))
const BusinessDirectory     = lazy(() => import('./marketplace/BusinessDirectory'))
const LionOfJudahHolo    = lazy(() => import('./LionOfJudahHolo'))
const BennieChat         = lazy(() => import('./BennieChat'))
const RecordingStudio    = lazy(() => import('./RecordingStudio'))
const ProAudioSuite      = lazy(() => import('./ProAudioSuite'))
const AMMDramaBox = lazy(() => import('./live/AMMDramaBox'))

// ─── Shared ────────────────────────────────────────────────────────────────

const RealmShell = ({ color, icon, title, children, onBack }: {
  color: string; icon: string; title: string; children: React.ReactNode; onBack: () => void
}) => (
  <div style={{ width: '100%', height: '100%', background: '#050515', fontFamily: 'monospace', overflow: 'hidden', position: 'relative' }}>
    {/* Background glow */}
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${color}22 0%, transparent 60%)`, pointerEvents: 'none' }} />
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${color}33`, position: 'relative', zIndex: 1 }}>
      <button onClick={onBack} style={{ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>
        ← CITY
      </button>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ color, fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>{title}</span>
    </div>
    <div style={{ height: 'calc(100% - 57px)', overflowY: 'auto', padding: '20px 24px', position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
)

const Card = ({ color = '#00ffcc', children, style }: { color?: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'rgba(5,5,30,0.9)', border: `1px solid ${color}44`, borderRadius: 10, padding: 16, ...style }}>
    {children}
  </div>
)

const Stat = ({ label, value, color = '#00ffcc' }: { label: string; value: string | number; color?: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color, fontSize: 20, fontWeight: 900 }}>{value}</div>
    <div style={{ color: '#666', fontSize: 11 }}>{label}</div>
  </div>
)

// ─── SPORTS REALM ──────────────────────────────────────────────────────────

export function SportsRealm() {
  const store = useGameStore()
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [round, setRound] = useState(1)

  const games = [
    { id: 'boxing', label: '🥊 Championship Boxing', desc: '12-round bout. AI opponent adapts to your strategy.', color: '#ff4400' },
    { id: 'football', label: '🏈 AI Football', desc: 'Omniverse Super Bowl qualifier. 4 downs, real scoring.', color: '#00cc44' },
    { id: 'basketball', label: '🏀 Street Basketball', desc: '3-on-3 holographic court. Creator team vs City Stars.', color: '#ff8800' },
    { id: 'mma', label: '🥋 MMA Cage', desc: 'Omniverse fighting circuit. Ground game + strikes.', color: '#8800ff' },
    { id: 'baseball', label: '⚾ Baseball', desc: 'Creator League World Series. Pitcher vs Batter sim.', color: '#00ccff' },
    { id: 'tactical', label: '⚔️ Tactical Realms', desc: '6 original weapons · 6 maps · 5 game modes · squad roles.', color: '#00ffcc' },
    { id: 'hero', label: '🏰 Hero Realms RPG', desc: '5 hero classes · 8 spells · 5 towns · full RPG.', color: '#c084fc' },
    { id: 'command', label: '🌐 Platform Command', desc: 'Search · Discord · Zapier · Creator Profiles · AI Engine', color: '#ffd700' },
    { id: 'lion_holo',  label: '🦁 Lion of Judah',   desc: 'Holographic SVG — AI Stubbs branding · TikTok · BIGO · wallpaper', color: '#ffd700' },
    { id: 'bennie',     label: '🦁 Ask Bennie',      desc: 'AMM chatbot — knows everything about the platform', color: '#ffd700' },
    { id: 'recording',  label: '🎵 Recording Studio', desc: '62-track DAW · Vocal Booth · Guitar Lab · Podcast · Remote Record', color: '#00ccff' },
    { id: 'watermark',  label: '◈ Holo Watermark', desc: 'Corner · diagonal · animated · share cards with AMM brand', color: '#00ffcc' },
    { id: 'pro_audio', label: '🎛 Pro Audio Suite', desc: 'MPC Pads · T-Pain FX · Gen Z/Alpha Bot · Smart NPCs', color: '#ff00ff' },
    { id: 'share_system', label: '🌍 Global Share Links', desc: 'Create tracked links · QR codes · Analytics · 12 regions · 70+ platforms', color: '#8800ff' },
  ]

  const playAction = () => {
    const playerScore = Math.floor(Math.random() * 3)
    const aiScore = Math.floor(Math.random() * 2)
    setScore(s => ({ player: s.player + playerScore, ai: s.ai + aiScore }))
    if (round >= 3) {
      const won = score.player + playerScore > score.ai + aiScore
      store.setNotif(won ? '🏆 YOU WIN! Collecting reward...' : '❌ Tough loss. Rematch?')
      if (won) { store.earnCash(500); store.earnXp(300) }
      setRound(1); setScore({ player: 0, ai: 0 }); setActiveGame(null)
    } else {
      setRound(r => r + 1)
      store.setNotif(playerScore > aiScore ? '✅ You scored!' : aiScore > playerScore ? '⚠️ AI scored' : 'Tied round!')
    }
  }

  return (
    <RealmShell color="#ff4400" icon="⚽" title="HOLOGRAPHIC SPORTS REALM" onBack={() => store.setScreen('city')}>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <Card color="#ff4400"><Stat label="LIVE GAMES" value="7" color="#ff4400" /></Card>
        <Card color="#ff8800"><Stat label="IN ARENA" value="1,234" color="#ff8800" /></Card>
        <Card color="#ffd700"><Stat label="PRIZE POOL" value="$50K" color="#ffd700" /></Card>
        <Card color="#00ccff"><Stat label="YOUR RANK" value={`#${Math.floor(Math.random() * 500) + 1}`} color="#00ccff" /></Card>
      </div>

      {activeGame === 'tactical' ? (
        <Suspense fallback={<div style={{color:'#00ffcc',padding:20,textAlign:'center'}}>Loading Tactical Realms...</div>}>
          <div style={{height:'calc(100vh - 120px)',width:'100%',margin:'0 -16px'}}>
            <TacticalRealms onExit={() => setActiveGame(null)} />
          </div>
        </Suspense>
      ) : activeGame === 'hero' ? (
        <Suspense fallback={<div style={{color:'#c084fc',padding:20,textAlign:'center'}}>Loading Hero Realms...</div>}>
          <div style={{height:'calc(100vh - 120px)',width:'100%',margin:'0 -16px'}}>
            <HeroRealms onExit={() => setActiveGame(null)} />
          </div>
        </Suspense>
      ) : activeGame === 'command' ? (
        <Suspense fallback={<div style={{color:'#ffd700',padding:20,textAlign:'center'}}>Loading Command Center...</div>}>
          <div style={{height:'calc(100vh - 120px)',width:'100%',margin:'0 -16px'}}>
            <PlatformCommandCenter onClose={() => setActiveGame(null)} />
          </div>
        </Suspense>
      ) : activeGame ? (
        <Card color="#ff4400">
          <div style={{ color: '#ff4400', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
            {games.find(g => g.id === activeGame)?.label}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ffcc', fontSize: 36, fontWeight: 900 }}>{score.player}</div>
              <div style={{ color: '#888', fontSize: 12 }}>YOU</div>
            </div>
            <div style={{ color: '#444', fontSize: 36, alignSelf: 'center' }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ff4400', fontSize: 36, fontWeight: 900 }}>{score.ai}</div>
              <div style={{ color: '#888', fontSize: 12 }}>AI</div>
            </div>
          </div>
          <div style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>Round {round} of 3</div>
          {/* Holographic score ring viz */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#ff440033" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#ff4400" strokeWidth="12"
                strokeDasharray={`${(score.player / Math.max(score.player + score.ai, 1)) * 314} 314`}
                strokeLinecap="round" transform="rotate(-90 60 60)" />
              <text x="60" y="66" textAnchor="middle" fill="#ff4400" fontSize="14" fontFamily="monospace" fontWeight="bold">ROUND {round}</text>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={playAction} style={{ flex: 1, background: '#ff440022', border: '1px solid #ff4400', color: '#ff4400', borderRadius: 6, padding: '10px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
              ⚡ PLAY ROUND {round}
            </button>
            <button onClick={() => { setActiveGame(null); setScore({ player: 0, ai: 0 }); setRound(1) }}
              style={{ background: '#22222244', border: '1px solid #444', color: '#888', borderRadius: 6, padding: '10px 16px', cursor: 'pointer', fontFamily: 'monospace' }}>
              QUIT
            </button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {games.map(g => (
            <Card key={g.id} color={g.color} style={{ cursor: 'pointer' }}>
              <div style={{ color: g.color, fontWeight: 900, fontSize: 15, marginBottom: 6 }}>{g.label}</div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>{g.desc}</div>
              <button onClick={() => setActiveGame(g.id)}
                style={{ background: `${g.color}22`, border: `1px solid ${g.color}`, color: g.color, borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                ▶ ENTER
              </button>
            </Card>
          ))}
          <Card color="#ffd700">
            <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 15, marginBottom: 6 }}>🏆 OMNIVERSE SUPER BOWL</div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Season finale. Creator leagues compete for the championship belt.</div>
            <div style={{ color: '#ffd700', fontSize: 12 }}>Prize: $50,000 + Creator Badge</div>
            <div style={{ color: '#ff4400', fontSize: 11, marginTop: 4 }}>🔒 Complete 3 missions to unlock</div>
          </Card>
        </div>
      )}

      {/* Live commentary feed */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: '#ff4400', fontWeight: 700, marginBottom: 8 }}>📡 LIVE COMMENTARY</div>
        {[
          { time: '2m ago', text: 'DJ_King just knocked out the AI champion in Round 9! 🥊' },
          { time: '5m ago', text: 'Creator League football — TeamGospel leads TeamOmni 21-14 at halftime 🏈' },
          { time: '8m ago', text: 'New basketball court unlocked: Holy Hoops Arena! 🏀' },
        ].map((c, i) => (
          <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,68,0,0.08)', borderLeft: '2px solid #ff440066', marginBottom: 6, borderRadius: '0 6px 6px 0' }}>
            <span style={{ color: '#ff4400', fontSize: 10 }}>{c.time} · </span>
            <span style={{ color: '#ccc', fontSize: 12 }}>{c.text}</span>
          </div>
        ))}
      </div>
    </RealmShell>
  )
}

// ─── MARKETPLACE REALM ─────────────────────────────────────────────────────

export function MarketplaceRealm() {
  const store = useGameStore()
  const [showBizDir, setShowBizDir] = useState(false)
  const [tab, setTab] = useState<'browse' | 'sell' | 'jobs' | 'ads'>('browse')
  const [cartTotal, setCartTotal] = useState(0)

  const products = [
    { id: 'p1', name: 'Gospel Beats Pack', creator: 'SetApart_DJ', price: 29, category: 'Music', sales: 412 },
    { id: 'p2', name: 'Creator Starter Kit', creator: 'AMM_Merch', price: 49, category: 'Tools', sales: 287 },
    { id: 'p3', name: 'Faith Journal Template', creator: 'SisMiriam', price: 12, category: 'Digital', sales: 903 },
    { id: 'p4', name: 'Boxing Training Plan', creator: 'CoachTitan', price: 19, category: 'Fitness', sales: 156 },
    { id: 'p5', name: 'Holographic Logo Pack', creator: 'VisualEph', price: 39, category: 'Design', sales: 234 },
    { id: 'p6', name: 'AMM Course Bundle', creator: 'KingJames', price: 99, category: 'Education', sales: 78 },
  ]

  const jobs = [
    { title: 'Godot Developer', pay: '$50-150/task', skills: 'GDScript, 3D', poster: 'AMM_Dev' },
    { title: '3D Character Artist', pay: '$150-400/project', skills: 'Mixamo, Blender', poster: 'AMM_Art' },
    { title: 'Stripe Integration', pay: '$150-300/project', skills: 'Node.js, Stripe', poster: 'AMM_Tech' },
    { title: 'Community Manager', pay: '$500/mo', skills: 'Discord, Faith focus', poster: 'AMM_HR' },
  ]

  return (
    showBizDir ? (
      <Suspense fallback={<div style={{color:'#00cc44',padding:20,textAlign:'center',fontFamily:'monospace'}}>Loading Business Directory...</div>}>
        <div style={{height:'100%',width:'100%'}}>
          <BusinessDirectory onClose={() => setShowBizDir(false)} />
        </div>
      </Suspense>
    ) :
    <RealmShell color="#00cc44" icon="🛒" title="ALL AMERICAN MARKETPLACE" onBack={() => store.setScreen('city')}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['browse', 'sell', 'jobs', 'ads'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#00cc4422' : 'transparent',
            border: `1px solid ${tab === t ? '#00cc44' : '#333'}`,
            color: tab === t ? '#00cc44' : '#666',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
          }}>{t}</button>
        ))}
        {cartTotal > 0 && <div style={{ marginLeft: 'auto', color: '#ffd700', alignSelf: 'center', fontSize: 13 }}>🛒 Cart: ${cartTotal}</div>}
      </div>

      {tab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {products.map(p => (
            <Card key={p.id} color="#00cc44">
              <div style={{ color: '#00cc44', fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div style={{ color: '#888', fontSize: 11, margin: '4px 0' }}>by {p.creator} · {p.category}</div>
              <div style={{ color: '#555', fontSize: 11 }}>🛒 {p.sales} sold</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ color: '#ffd700', fontWeight: 900 }}>${p.price}</span>
                <button onClick={() => {
                  setCartTotal(t => t + p.price)
                  store.setNotif(`🛒 Added "${p.name}" to cart!`)
                }} style={{ background: '#00cc4422', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                  ADD
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'sell' && (
        <Card color="#00cc44">
          <div style={{ color: '#00cc44', fontWeight: 900, fontSize: 16, marginBottom: 14 }}>📦 YOUR CREATOR STORE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <Stat label="TOTAL SALES" value="$0" color="#ffd700" />
            <Stat label="PRODUCTS" value="0" color="#00cc44" />
            <Stat label="ROYALTY RATE" value="90%" color="#00ccff" />
          </div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 14 }}>
            List your digital products: music, designs, courses, templates, services. AMM takes 10% — you keep 90%.
          </div>
          {['Product Name', 'Price ($)', 'Category', 'Description'].map(field => (
            <input key={field} placeholder={field}
              style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }} />
          ))}
          <button onClick={() => { store.earnXp(100); store.setNotif('✅ Product listed! First sale incoming...') }}
            style={{ background: '#00cc4422', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 6, padding: '10px', width: '100%', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
            + LIST PRODUCT
          </button>
        </Card>
      )}

      {tab === 'jobs' && (
        <div>
          <div style={{ color: '#00cc44', fontWeight: 700, marginBottom: 12 }}>💼 AMM JOB BOARD — Hire Creators & Developers</div>
          {jobs.map((j, i) => (
            <Card key={i} color="#00cc44" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#00cc44', fontWeight: 700 }}>{j.title}</span>
                <span style={{ color: '#ffd700', fontSize: 12 }}>{j.pay}</span>
              </div>
              <div style={{ color: '#888', fontSize: 11 }}>Skills: {j.skills}</div>
              <div style={{ color: '#555', fontSize: 11 }}>Posted by: {j.poster}</div>
              <button onClick={() => store.setNotif(`📩 Application sent for "${j.title}"!`)}
                style={{ marginTop: 8, background: '#00cc4411', border: '1px solid #00cc4466', color: '#00cc44', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                APPLY
              </button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'ads' && (
        <Card color="#00cc44">
          <div style={{ color: '#00cc44', fontWeight: 900, fontSize: 16, marginBottom: 12 }}>📢 AD CAMPAIGNS</div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
            Run holographic ads across AMM City. Target creators by genre, faith, or location.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { name: 'City Banner', reach: '10K views', cost: '$25', type: '3D Billboard' },
              { name: 'Portal Takeover', reach: '50K views', cost: '$150', type: 'Realm Entry Screen' },
              { name: 'Creator Boost', reach: '5K targeted', cost: '$50', type: 'Feed Placement' },
              { name: 'Faith Spotlight', reach: '8K believers', cost: '$40', type: 'Faith Realm Banner' },
            ].map(ad => (
              <Card key={ad.name} color="#00cc4466">
                <div style={{ color: '#00cc44', fontWeight: 700 }}>{ad.name}</div>
                <div style={{ color: '#888', fontSize: 11 }}>{ad.type}</div>
                <div style={{ color: '#555', fontSize: 11 }}>Reach: {ad.reach}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                  <span style={{ color: '#ffd700', fontWeight: 900 }}>{ad.cost}</span>
                  <button onClick={() => store.setNotif('📢 Ad campaign launched!')}
                    style={{ background: '#00cc4422', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                    RUN AD
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </RealmShell>
  )
}

// ─── MUSIC REALM (Full — LiveKit + Audio Engine + Real Upload) ─────────────


export function MusicRealm() {
  const store = useGameStore()
  const [tab, setTab] = useState<'stream' | 'upload' | 'live' | 'podcast' | 'payouts'>('stream')
  const [audioState, setAudioState] = useState<AudioState | null>(null)
  const [streamState, setStreamState] = useState<StreamState | null>(null)
  const [engine, setEngine] = useState<import('../game/audio/AudioEngine').AudioEngine | null>(null)
  const [streamer, setStreamer] = useState<import('../game/streaming/StreamingEngine').StreamingEngine | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploadForm, setUploadForm] = useState({ title: '', artist: '', genre: 'Gospel', scripture: '', bpm: '' })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [liveRoom, setLiveRoom] = useState<'music-stage' | 'podcast-faith' | 'debate-room'>('music-stage')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    import('../game/audio/AudioEngine').then(({ AudioEngine }) => {
      const ae = new AudioEngine(s => { setAudioState({ ...s }); setTracks([...ae.getTracks()]) })
      setEngine(ae)
      setTracks(ae.getTracks())
      return () => ae.dispose()
    })
    import('../game/streaming/StreamingEngine').then(({ StreamingEngine }) => {
      const se = new StreamingEngine(s => setStreamState({ ...s }))
      setStreamer(se)
      return () => se.leave()
    })
  }, [])

  const playTrack = (t: Track) => { engine?.play(t); engine?.setQueue(tracks) }
  const togglePlay = () => {
    if (!audioState) return
    audioState.isPlaying ? engine?.pause() : engine?.resume()
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) { store.setNotif('❌ Please select an audio file (MP3, WAV, FLAC)'); return }
    setUploadFile(file)
    if (!uploadForm.title) setUploadForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }))
    store.setNotif(`✅ "${file.name}" ready to upload`)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.title || !engine) { store.setNotif('❌ Add a file and title first'); return }
    const newTrack = await engine.uploadTrack(uploadFile, {
      title: uploadForm.title,
      artist: uploadForm.artist || store.player.name,
      genre: uploadForm.genre,
      scripture: uploadForm.scripture || undefined,
      bpm: uploadForm.bpm ? parseInt(uploadForm.bpm) : undefined,
    })
    if (newTrack) {
      setTracks(engine.getTracks())
      setUploadFile(null)
      setUploadForm({ title: '', artist: '', genre: 'Gospel', scripture: '', bpm: '' })
      store.earnXp(200)
      store.earnCash(50)
      store.setNotif(`🎵 "${newTrack.title}" uploaded! Royalties now tracking.`)
    }
  }

  const joinLive = async (asHost: boolean) => {
    if (!streamer) return
    await streamer.join(liveRoom, store.player.name, asHost)
    store.setNotif(asHost ? '🎤 You are live!' : '👁 Joined as viewer')
  }

  const leaveLive = () => { streamer?.leave(); store.setNotif('👋 Left the stream') }

  const current = audioState?.currentTrack
  const waveform = audioState?.waveformData ?? []
  const formatTimeFn = (s: number): string => { if (!isFinite(s) || s < 0) return '0:00'; const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, '0')}` }

  const genres = ['Gospel', 'Hip-Hop/Gospel', 'R&B/Soul', 'Electronic', 'Jazz/Neo-Soul', 'Worship', 'Podcast', 'Debate']
  const COLOR = '#00ccff'

  return (
    <RealmShell color={COLOR} icon="🎵" title="SET APART MUSIC REALM" onBack={() => { engine?.pause(); store.setScreen('city') }}>
      {/* Now Playing Bar */}
      {current && (
        <div style={{ background: 'rgba(0,204,255,0.08)', border: `1px solid ${COLOR}44`, borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: current.coverColor + '33', border: `1px solid ${current.coverColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎵</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.title}</div>
            <div style={{ color: '#888', fontSize: 11 }}>{current.artist} · {current.genre}</div>
            {/* Waveform */}
            <svg width="200" height="24" style={{ display: 'block', marginTop: 4 }}>
              {waveform.slice(0, 50).map((v, i) => (
                <rect key={i} x={i * 4} y={12 - v * 11} width={3} height={v * 11 + 1}
                  fill={audioState?.isPlaying ? COLOR : '#333'} rx={1} />
              ))}
            </svg>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: '#888', fontSize: 11 }}>{formatTimeFn(audioState?.currentTime ?? 0)} / {formatTimeFn(current.duration)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
              <CtrlBtn onClick={() => engine?.playPrev()}>⏮</CtrlBtn>
              <CtrlBtn onClick={togglePlay} color={COLOR}>{audioState?.isPlaying ? '⏸' : '▶'}</CtrlBtn>
              <CtrlBtn onClick={() => engine?.playNext()}>⏭</CtrlBtn>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['stream', 'upload', 'live', 'podcast', 'payouts'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? `${COLOR}22` : 'transparent',
            border: `1px solid ${tab === t ? COLOR : '#333'}`,
            color: tab === t ? COLOR : '#666',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
          }}>{t === 'live' ? '🔴 LIVE' : t === 'podcast' ? '🎙 PODCAST' : t}</button>
        ))}
      </div>

      {/* STREAM TAB */}
      {tab === 'stream' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            <Card color={COLOR}><Stat label="TOTAL STREAMS" value="55K" color={COLOR} /></Card>
            <Card color="#ffd700"><Stat label="PAYOUTS THIS MO" value="$1,033" color="#ffd700" /></Card>
            <Card color="#8800ff"><Stat label="CREATORS" value="847" color="#8800ff" /></Card>
            <Card color="#00cc44"><Stat label="ANTI-BOT" value="99%" color="#00cc44" /></Card>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tracks.map(t => {
              const isPlaying = current?.id === t.id && audioState?.isPlaying
              return (
                <div key={t.id} onClick={() => playTrack(t)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                  background: current?.id === t.id ? `${COLOR}12` : 'rgba(5,5,30,0.9)',
                  border: `1px solid ${current?.id === t.id ? COLOR : '#1a1a3e'}`,
                  borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: t.coverColor + '33', border: `2px solid ${t.coverColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.coverColor, fontSize: 18 }}>
                    {isPlaying ? '⏸' : '▶'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{t.title}</div>
                    <div style={{ color: '#888', fontSize: 11 }}>{t.artist} · {t.genre}{t.scripture ? ` · ${t.scripture}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11 }}>
                    <div style={{ color: '#555' }}>{t.plays.toLocaleString()} plays</div>
                    <div style={{ color: '#ffd700' }}>${t.royaltyRate}/stream</div>
                    <div style={{ color: '#444' }}>{formatTimeFn(t.duration)}</div>
                  </div>
                  {/* Mini waveform */}
                  <svg width="48" height="24" viewBox="0 0 48 24">
                    {Array.from({ length: 16 }, (_, i) => {
                      const h = isPlaying ? (waveform[i * 4] ?? 0) : Math.abs(Math.sin(i * 0.8 + t.id.charCodeAt(1))) * 0.7 + 0.1
                      return <rect key={i} x={i * 3} y={12 - h * 11} width={2} height={h * 11 + 1} fill={isPlaying ? COLOR : '#333'} rx={1} />
                    })}
                  </svg>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* UPLOAD TAB */}
      {tab === 'upload' && (
        <div>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? COLOR : '#333'}`, borderRadius: 10, padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: dragOver ? `${COLOR}08` : 'transparent', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎵</div>
            {uploadFile ? (
              <div style={{ color: COLOR, fontWeight: 700 }}>✅ {uploadFile.name}</div>
            ) : (
              <>
                <div style={{ color: '#888', fontSize: 13 }}>Drop your MP3, WAV, or FLAC here</div>
                <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>or click to browse</div>
              </>
            )}
            <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {(['Track Title *', 'Artist Name'] as const).map((f, i) => (
              <input key={f} placeholder={f} value={i === 0 ? uploadForm.title : uploadForm.artist}
                onChange={e => setUploadForm(p => ({ ...p, [i === 0 ? 'title' : 'artist']: e.target.value }))}
                style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <select value={uploadForm.genre} onChange={e => setUploadForm(p => ({ ...p, genre: e.target.value }))}
              style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }}>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input placeholder="BPM (opt)" value={uploadForm.bpm} onChange={e => setUploadForm(p => ({ ...p, bpm: e.target.value }))}
              style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }} />
            <input placeholder="Scripture (opt)" value={uploadForm.scripture} onChange={e => setUploadForm(p => ({ ...p, scripture: e.target.value }))}
              style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }} />
          </div>

          {audioState?.uploading && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#888' }}>
                <span>Uploading...</span><span>{audioState.uploadProgress}%</span>
              </div>
              <div style={{ background: '#111', borderRadius: 4, height: 6 }}>
                <div style={{ background: COLOR, height: '100%', width: `${audioState.uploadProgress}%`, borderRadius: 4, transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <div style={{ background: `${COLOR}11`, border: `1px solid ${COLOR}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
            ✅ Anti-bot protection · ✅ Per-genre royalty tracking · ✅ Revenue safety cap
            {!import.meta.env.VITE_SUPABASE_URL && (
              <div style={{ color: '#ffaa00', marginTop: 4 }}>⚠️ Demo mode: tracks stored locally in browser. Add Supabase to persist across sessions.</div>
            )}
          </div>

          <button onClick={handleUpload} disabled={!uploadFile || !uploadForm.title || audioState?.uploading}
            style={{ width: '100%', background: uploadFile && uploadForm.title ? `${COLOR}22` : '#111', border: `1px solid ${uploadFile && uploadForm.title ? COLOR : '#333'}`, color: uploadFile && uploadForm.title ? COLOR : '#444', borderRadius: 8, padding: 12, cursor: uploadFile && uploadForm.title ? 'pointer' : 'default', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
            {audioState?.uploading ? `Uploading... ${audioState.uploadProgress}%` : '⬆️ UPLOAD TRACK'}
          </button>
        </div>
      )}

      {/* LIVE STREAMING TAB */}
      {tab === 'live' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {([
              { id: 'music-stage', label: '🎤 Music Stage', desc: 'Live holographic performance' },
              { id: 'podcast-faith', label: '🎙 Faith Podcast', desc: 'Teaching, sermons, Q&A' },
              { id: 'debate-room', label: '⚡ Debate Room', desc: 'Moderated faith discussions' },
            ] as const).map(r => (
              <div key={r.id} onClick={() => setLiveRoom(r.id)} style={{
                padding: 14, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                background: liveRoom === r.id ? `${COLOR}15` : 'rgba(5,5,30,0.9)',
                border: `2px solid ${liveRoom === r.id ? COLOR : '#1a1a3e'}`, transition: 'all 0.15s'
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{r.label.split(' ')[0]}</div>
                <div style={{ color: liveRoom === r.id ? COLOR : '#888', fontWeight: 700, fontSize: 11 }}>{r.label.split(' ').slice(1).join(' ')}</div>
                <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          {streamState?.mockMode && (
            <div style={{ background: '#ffaa0011', border: '1px solid #ffaa0033', borderRadius: 6, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: '#ffaa00' }}>
              ⚡ Demo mode — add VITE_LIVEKIT_URL to .env for real broadcasting. Everything below is fully functional once LiveKit is connected.
            </div>
          )}

          {!streamState?.connected ? (
            <Card color={COLOR}>
              <div style={{ color: COLOR, fontWeight: 900, fontSize: 15, marginBottom: 12 }}>
                🔴 GO LIVE — {liveRoom.replace('-', ' ').toUpperCase()}
              </div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                Stream in real time to your audience. Your microphone audio broadcasts live via LiveKit WebRTC.
                Viewers see your waveform, live viewer count, and can send chat messages.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => joinLive(true)} style={{ flex: 1, background: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 8, padding: '12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
                  🔴 GO LIVE (Host)
                </button>
                <button onClick={() => joinLive(false)} style={{ flex: 1, background: `${COLOR}11`, border: `1px solid ${COLOR}66`, color: COLOR, borderRadius: 8, padding: '12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                  👁 WATCH
                </button>
              </div>
            </Card>
          ) : (
            <div>
              {/* Live session UI */}
              <Card color="#ff4444" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 6px #ff4444' }} />
                    <span style={{ color: '#ff4444', fontWeight: 900 }}>LIVE</span>
                    <span style={{ color: '#888', fontSize: 12 }}>· {streamState.roomName}</span>
                  </div>
                  <div style={{ color: '#ffd700', fontSize: 13 }}>👁 {streamState.viewerCount} watching</div>
                </div>
                {/* Live waveform */}
                <svg width="100%" height="60" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ display: 'block', marginBottom: 10 }}>
                  {Array.from({ length: 80 }, (_, i) => {
                    const h = streamState.participants[0]?.isSpeaking
                      ? (Math.random() * 40 + 5)
                      : (Math.abs(Math.sin(Date.now() / 400 + i * 0.3)) * 15 + 3)
                    return <rect key={i} x={i * 5} y={30 - h} width={4} height={h * 2} fill="#ff444488" rx={1} />
                  })}
                </svg>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {streamState.participants.map(p => (
                    <div key={p.identity} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: p.isSpeaking ? '1px solid #00cc44' : '1px solid #222' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.isSpeaking ? '#00cc4433' : '#11111', border: `2px solid ${p.isSpeaking ? '#00cc44' : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                        {p.hasVideo ? '📹' : '🎤'}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: p.isSpeaking ? '#00cc44' : '#555', fontSize: 10 }}>{p.isSpeaking ? '● speaking' : '○ silent'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <div style={{ display: 'flex', gap: 10 }}>
                {streamState.isPublishing && (
                  <button onClick={() => streamer?.stopPublishing()} style={{ flex: 1, background: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 6, padding: '9px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                    ⏹ STOP BROADCASTING
                  </button>
                )}
                <button onClick={leaveLive} style={{ flex: 1, background: '#11111', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '9px', cursor: 'pointer', fontFamily: 'monospace' }}>
                  LEAVE ROOM
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PODCAST TAB */}
      {tab === 'podcast' && (
        <div>
          <div style={{ color: COLOR, fontWeight: 700, marginBottom: 12 }}>🎙 PODCAST / DEBATE STUDIO</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { title: 'Faith & Finance', host: 'PastorEzra', ep: 12, listeners: 3421, genre: 'Podcast' },
              { title: 'Hebrew Roots Talk', host: 'ScholarMoses', ep: 28, listeners: 5102, genre: 'Podcast' },
              { title: 'Creator Economy Debate', host: 'AMM_Panel', ep: 5, listeners: 1823, genre: 'Debate' },
              { title: 'Scripture & Culture', host: 'SisDeborah', ep: 19, listeners: 2901, genre: 'Podcast' },
            ].map((p, i) => (
              <Card key={i} color={COLOR}>
                <div style={{ color: COLOR, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ color: '#888', fontSize: 11 }}>by {p.host} · Ep. {p.ep}</div>
                <div style={{ color: '#555', fontSize: 11 }}>{p.listeners.toLocaleString()} listeners</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => { store.setNotif(`🎙 Listening: "${p.title}"`); store.earnXp(30) }}
                    style={{ flex: 1, background: `${COLOR}22`, border: `1px solid ${COLOR}`, color: COLOR, borderRadius: 4, padding: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                    ▶ PLAY
                  </button>
                  <button onClick={() => { setTab('live'); setLiveRoom('podcast-faith'); joinLive(true) }}
                    style={{ background: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                    🔴
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <Card color={COLOR}>
            <div style={{ color: COLOR, fontWeight: 700, marginBottom: 10 }}>+ START YOUR PODCAST</div>
            <input placeholder="Show Name" style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' as const }} />
            <select style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' as const, marginBottom: 12 }}>
              {['Faith Teaching', 'Creator Economy', 'Hebrew Roots', 'Community Debate', 'Music Commentary'].map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => { store.earnXp(150); store.setNotif('🎙 Podcast show created! Go live anytime.') }}
              style={{ width: '100%', background: `${COLOR}22`, border: `1px solid ${COLOR}`, color: COLOR, borderRadius: 6, padding: 10, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
              CREATE SHOW
            </button>
          </Card>
        </div>
      )}

      {/* PAYOUTS TAB */}
      {tab === 'payouts' && (
        <Card color="#ffd700">
          <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 16, marginBottom: 14 }}>💸 ROYALTY DASHBOARD</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <Stat label="THIS MONTH" value="$1,033" color="#ffd700" />
            <Stat label="ALL TIME" value="$8,441" color="#00cc44" />
            <Stat label="PENDING" value="$234" color={COLOR} />
          </div>
          {[
            { genre: 'Gospel/Worship', rate: '$0.019/stream', note: 'Faith premium rate' },
            { genre: 'Hip-Hop/Gospel', rate: '$0.018/stream', note: '' },
            { genre: 'R&B/Soul', rate: '$0.017/stream', note: '' },
            { genre: 'Jazz/Neo-Soul', rate: '$0.016/stream', note: '' },
            { genre: 'Electronic', rate: '$0.015/stream', note: '' },
            { genre: 'Podcast', rate: '$0.010/stream', note: 'Per play/listen' },
            { genre: 'Debate', rate: '$0.008/stream', note: 'Per listen' },
          ].map(r => (
            <div key={r.genre} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1a1a3e', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#ccc', fontSize: 12 }}>{r.genre}</span>
                {r.note && <span style={{ color: '#555', fontSize: 10, marginLeft: 6 }}>{r.note}</span>}
              </div>
              <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>{r.rate}</span>
            </div>
          ))}
          <div style={{ color: '#555', fontSize: 10, marginTop: 10 }}>Revenue safety cap active · Anti-bot detection · 90/10 creator split</div>
        </Card>
      )}
    </RealmShell>
  )
}

function CtrlBtn({ onClick, children, color = '#888' }: { onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick() }} style={{ background: `${color}22`, border: `1px solid ${color}44`, color, borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  )
}

// ─── FAITH REALM ───────────────────────────────────────────────────────────

export function FaithRealm() {
  const store = useGameStore()
  const [prayer, setPrayer] = useState('')
  const [tab, setTab] = useState<'sanctuary' | 'drama box' | 'prayer' | 'calendar' | 'ministry'>('sanctuary')

  const sermons = [
    { title: 'Walking in the Spirit', pastor: 'Elder Solomon', views: 3421, duration: '52 min' },
    { title: 'The Feasts of YHWH', pastor: 'Sis Miriam', views: 2109, duration: '45 min' },
    { title: 'Hebrew Roots Revival', pastor: 'Brother Ezra', views: 5012, duration: '1hr 20min' },
    { title: 'Street Gospel — Our Mission', pastor: 'Pastor Knox', views: 1823, duration: '38 min' },
  ]

  const feasts = [
    { name: 'Passover (Pesach)', date: 'Apr 13', desc: 'Commemoration of the Exodus' },
    { name: 'Pentecost (Shavuot)', date: 'Jun 2', desc: 'Giving of the Torah + Holy Spirit' },
    { name: 'Feast of Trumpets', date: 'Sep 23', desc: 'New Year, shofar blowing' },
    { name: 'Day of Atonement', date: 'Oct 2', desc: 'Yom Kippur — fasting & repentance' },
    { name: 'Feast of Tabernacles', date: 'Oct 7', desc: 'Sukkot — dwelling in booths' },
  ]

  return (
    <RealmShell color="#8800ff" icon="✝️" title="SERVANTS OF CHRIST — FAITH REALM" onBack={() => store.setScreen('city')}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {(['sanctuary', 'drama box', 'prayer', 'calendar', 'ministry'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#8800ff22' : 'transparent',
            border: `1px solid ${tab === t ? '#8800ff' : '#333'}`,
            color: tab === t ? '#8800ff' : '#666',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11, whiteSpace: 'nowrap'
          }}>{t}</button>
        ))}
      </div>

      {tab === 'drama box' && (
        <Suspense fallback={<div style={{ color: '#fff', padding: 20 }}>Loading AMM Drama Box...</div>}>
          <AMMDramaBox onClose={() => setTab('sanctuary')} />
        </Suspense>
      )}

      {tab === 'sanctuary' && (
        <div>
          <Card color="#8800ff" style={{ marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕍</div>
            <div style={{ color: '#8800ff', fontWeight: 900, fontSize: 18 }}>VERSE OF THE DAY</div>
            <div style={{ color: '#ddd', fontSize: 14, margin: '10px 0', lineHeight: 1.6, fontStyle: 'italic' }}>
              "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."
            </div>
            <div style={{ color: '#8800ff88', fontSize: 12 }}>— Matthew 6:33 (KJV)</div>
            <button onClick={() => { store.setPlayer({ faith: store.player.faith + 10 }); store.setNotif('🙏 Faith +10! Keep seeking!') }}
              style={{ marginTop: 12, background: '#8800ff22', border: '1px solid #8800ff', color: '#8800ff', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace' }}>
              🙏 RECEIVE BLESSING
            </button>
          </Card>
          <div style={{ color: '#8800ff', fontWeight: 700, marginBottom: 10 }}>📺 SERMONS ON DEMAND</div>
          {sermons.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'rgba(136,0,255,0.06)', border: '1px solid #8800ff33', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 24, alignSelf: 'center' }}>🎙️</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700 }}>{s.title}</div>
                <div style={{ color: '#888', fontSize: 11 }}>{s.pastor} · {s.duration}</div>
                <div style={{ color: '#555', fontSize: 11 }}>{s.views.toLocaleString()} views</div>
              </div>
              <button onClick={() => { store.setPlayer({ faith: store.player.faith + 5 }); store.setNotif(`📺 Watching: "${s.title}"`) }}
                style={{ background: '#8800ff22', border: '1px solid #8800ff', color: '#8800ff', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, alignSelf: 'center' }}>
                WATCH
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'prayer' && (
        <div>
          <Card color="#8800ff" style={{ marginBottom: 16 }}>
            <div style={{ color: '#8800ff', fontWeight: 700, marginBottom: 8 }}>🙏 SUBMIT A PRAYER REQUEST</div>
            <textarea value={prayer} onChange={e => setPrayer(e.target.value)} placeholder="Share your prayer request with the community..."
              style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: 10, fontFamily: 'monospace', fontSize: 12, minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }} />
            <button onClick={() => { if (prayer.trim()) { setPrayer(''); store.earnXp(50); store.setNotif('🙏 Prayer submitted! The community is interceding.') } }}
              style={{ marginTop: 8, background: '#8800ff22', border: '1px solid #8800ff', color: '#8800ff', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
              SUBMIT PRAYER
            </button>
          </Card>
          {['🙏 Pray for healing for my family', '✨ Breakthrough in my business finances', '📖 Understanding of the Hebrew Scriptures', '💪 Strength to walk righteously in AMM City', '🌍 Revival in our communities'].map((p, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'rgba(136,0,255,0.06)', border: '1px solid #8800ff33', borderRadius: 8, marginBottom: 8, color: '#ccc', fontSize: 12 }}>
              {p} <button onClick={() => store.setNotif('🙏 Amen! You interceded for this prayer.')} style={{ float: 'right', background: 'none', border: '1px solid #8800ff66', color: '#8800ff', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 10 }}>AMEN</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'calendar' && (
        <div>
          <div style={{ color: '#8800ff', fontWeight: 700, marginBottom: 12 }}>📅 FEAST CALENDAR — YHWH'S APPOINTED TIMES</div>
          {feasts.map((f, i) => (
            <Card key={i} color="#8800ff" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#8800ff', fontWeight: 700 }}>{f.name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{f.desc}</div>
                </div>
                <div style={{ color: '#ffd700', fontSize: 13, fontWeight: 700 }}>{f.date}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'ministry' && (
        <Card color="#8800ff">
          <div style={{ color: '#8800ff', fontWeight: 900, fontSize: 16, marginBottom: 12 }}>⛪ CHURCH / MINISTRY PAGE</div>
          {['Ministry Name', 'Leader Name', 'City', 'Website (optional)', 'Ministry Focus'].map(f => (
            <input key={f} placeholder={f} style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }} />
          ))}
          <button onClick={() => { store.earnXp(300); store.setNotif('⛪ Ministry page created! Donations enabled.') }}
            style={{ width: '100%', background: '#8800ff22', border: '1px solid #8800ff', color: '#8800ff', borderRadius: 6, padding: 10, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
            CREATE MINISTRY PAGE
          </button>
          <div style={{ color: '#555', fontSize: 11, marginTop: 8 }}>Donations route through Stripe — 100% to your ministry minus Stripe fees.</div>
        </Card>
      )}
    </RealmShell>
  )
}

// ─── BLOCKCHAIN REALM ──────────────────────────────────────────────────────

export function BlockchainRealm() {
  const store = useGameStore()
  const [showRevenue, setShowRevenue] = useState(false)
  const [showDevPlatform, setShowDevPlatform] = useState(false)
  const [tab, setTab] = useState<'wallet' | 'nft' | 'dao' | 'tokens'>('wallet')
  const { walletConnected, walletAddress, nftCount, player } = store

  const nfts = [
    { id: 1, name: 'AMM Genesis #001', type: 'Identity NFT', value: '0.5 ETH', rarity: 'Legendary' },
    { id: 2, name: 'City Lowrider #042', type: 'Vehicle NFT', value: '0.2 ETH', rarity: 'Rare' },
    { id: 3, name: 'Holographic Set #007', type: 'Music NFT', value: '0.1 ETH', rarity: 'Epic' },
  ].slice(0, nftCount)

  return (
    <RealmShell color="#ffaa00" icon="⛓" title="EL SATURN — QUANTUM CHAIN REALM" onBack={() => store.setScreen('city')}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['wallet', 'nft', 'dao', 'tokens'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#ffaa0022' : 'transparent',
            border: `1px solid ${tab === t ? '#ffaa00' : '#333'}`,
            color: tab === t ? '#ffaa00' : '#666',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
          }}>{t === 'dao' ? 'DAO VOTE' : t}</button>
        ))}
      </div>

      {tab === 'wallet' && (
        <div>
          {!walletConnected ? (
            <Card color="#ffaa00" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
              <div style={{ color: '#ffaa00', fontWeight: 900, fontSize: 18, marginBottom: 8 }}>CONNECT YOUR WALLET</div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>El Saturn Chain — Quantum Omniverse Crossover Network</div>
              <button onClick={store.connectWallet} style={{ background: '#ffaa0022', border: '1px solid #ffaa00', color: '#ffaa00', borderRadius: 8, padding: '12px 30px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
                🔗 CONNECT WALLET
              </button>
            </Card>
          ) : (
            <div>
              <Card color="#ffaa00" style={{ marginBottom: 16 }}>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>WALLET ADDRESS</div>
                <div style={{ color: '#ffaa00', fontWeight: 700, fontSize: 13 }}>{walletAddress}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14 }}>
                  <Stat label="AMM TOKENS" value={player.tokens} color="#ffaa00" />
                  <Stat label="NFTs OWNED" value={nftCount} color="#ffd700" />
                  <Stat label="CHAIN" value="EL SATURN" color="#00ccff" />
                </div>
              </Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { action: '💸 SEND TOKENS', desc: 'Transfer AMM tokens to any address' },
                  { action: '📥 RECEIVE', desc: 'Share your wallet address to receive' },
                  { action: '🔄 SWAP', desc: 'AMM → ETH → SOL cross-chain swap' },
                  { action: '📊 HISTORY', desc: 'View all on-chain transactions' },
                ].map((a, i) => (
                  <Card key={i} color="#ffaa0066">
                    <div style={{ color: '#ffaa00', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{a.action}</div>
                    <div style={{ color: '#888', fontSize: 11 }}>{a.desc}</div>
                    <button onClick={() => store.setNotif(`⛓ ${a.action} — Coming in Phase 2`)}
                      style={{ marginTop: 8, background: '#ffaa0022', border: '1px solid #ffaa0066', color: '#ffaa00', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                      OPEN
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'nft' && (
        <div>
          <div style={{ color: '#ffaa00', fontWeight: 700, marginBottom: 12 }}>🖼 YOUR NFT COLLECTION</div>
          {!walletConnected ? (
            <Card color="#ffaa00" style={{ textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: 13 }}>Connect your wallet to view NFTs</div>
            </Card>
          ) : nfts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {nfts.map(n => (
                <Card key={n.id} color="#ffaa00">
                  <div style={{ background: 'linear-gradient(135deg, #ffaa0022, #8800ff22)', borderRadius: 6, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, fontSize: 28 }}>
                    🖼
                  </div>
                  <div style={{ color: '#ffaa00', fontWeight: 700, fontSize: 11 }}>{n.name}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>{n.type}</div>
                  <div style={{ color: '#ffd700', fontSize: 11, marginTop: 4 }}>{n.value}</div>
                  <div style={{ color: '#00ccff', fontSize: 10 }}>{n.rarity}</div>
                </Card>
              ))}
            </div>
          ) : (
            <Card color="#ffaa00" style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ color: '#888', fontSize: 13 }}>No NFTs yet. Mint your first below!</div>
            </Card>
          )}
          <Card color="#ffaa00">
            <div style={{ color: '#ffaa00', fontWeight: 700, marginBottom: 8 }}>⚡ MINT NEW NFT</div>
            {['NFT Name', 'Collection', 'Description'].map(f => (
              <input key={f} placeholder={f} style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }} />
            ))}
            <button onClick={() => { if (!walletConnected) { store.connectWallet(); return } store.earnXp(600); store.completeMission('m6'); store.setNotif('🖼 NFT minted on El Saturn Chain!') }}
              style={{ width: '100%', background: '#ffaa0022', border: '1px solid #ffaa00', color: '#ffaa00', borderRadius: 6, padding: 10, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
              ⚡ MINT NFT — El Saturn Chain
            </button>
          </Card>
        </div>
      )}

      {tab === 'dao' && (
        <div>
          <div style={{ color: '#ffaa00', fontWeight: 700, marginBottom: 12 }}>🗳 DAO GOVERNANCE — AMM Community Votes</div>
          {[
            { prop: 'Increase gospel royalty rate to $0.025/stream', votes: { yes: 847, no: 123 }, status: 'ACTIVE' },
            { prop: 'Add Ethiopian Bible category to Faith Realm', votes: { yes: 1203, no: 44 }, status: 'PASSING' },
            { prop: 'Allow NFT staking for marketplace discounts', votes: { yes: 567, no: 891 }, status: 'FAILING' },
            { prop: 'Launch AMM City mobile app (iOS/Android)', votes: { yes: 2341, no: 87 }, status: 'PASSING' },
          ].map((p, i) => {
            const total = p.votes.yes + p.votes.no
            const yesPct = Math.round(p.votes.yes / total * 100)
            return (
              <Card key={i} color="#ffaa00" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, flex: 1 }}>{p.prop}</span>
                  <span style={{ color: p.status === 'PASSING' ? '#00cc44' : p.status === 'FAILING' ? '#ff4400' : '#ffaa00', fontSize: 10, marginLeft: 8 }}>{p.status}</span>
                </div>
                <div style={{ background: '#111', borderRadius: 4, height: 6, marginBottom: 6 }}>
                  <div style={{ background: '#00cc44', height: '100%', width: `${yesPct}%`, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginBottom: 8 }}>
                  <span>✅ {p.votes.yes} YES ({yesPct}%)</span>
                  <span>❌ {p.votes.no} NO</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => store.setNotif('✅ Vote cast: YES')} style={{ flex: 1, background: '#00cc4422', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 4, padding: '5px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>VOTE YES</button>
                  <button onClick={() => store.setNotif('❌ Vote cast: NO')} style={{ flex: 1, background: '#ff440022', border: '1px solid #ff4400', color: '#ff4400', borderRadius: 4, padding: '5px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>VOTE NO</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'tokens' && (
        <Card color="#ffaa00">
          <div style={{ color: '#ffaa00', fontWeight: 900, fontSize: 16, marginBottom: 14 }}>🪙 AMM TOKEN ECONOMY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
            <Stat label="YOUR BALANCE" value={`${player.tokens} AMM`} color="#ffaa00" />
            <Stat label="TOKEN PRICE" value="$0.042" color="#ffd700" />
            <Stat label="TOTAL SUPPLY" value="100M" color="#00ccff" />
            <Stat label="MARKET CAP" value="$4.2M" color="#00cc44" />
          </div>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Token utility:</div>
          {[
            '🛒 Pay for marketplace listings (5% discount)',
            '🎵 Unlock premium music royalty tiers',
            '🗳 Vote weight in DAO proposals (1 AMM = 1 vote)',
            '🎮 Enter paid creator competitions',
            '⛓ Pay gas fees on El Saturn chain',
            '📢 Boost ad campaigns in city realm',
          ].map((u, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #1a1a3e', color: '#ccc', fontSize: 12 }}>{u}</div>
          ))}
          <button onClick={() => { store.setPlayer({ tokens: player.tokens + 50 }); store.setNotif('🪙 Earned 50 AMM tokens!') }}
            style={{ marginTop: 14, width: '100%', background: '#ffaa0022', border: '1px solid #ffaa00', color: '#ffaa00', borderRadius: 6, padding: 10, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
            ⚡ EARN AMM TOKENS — DAILY BONUS
          </button>
        </Card>
      )}
    </RealmShell>
  )
}
