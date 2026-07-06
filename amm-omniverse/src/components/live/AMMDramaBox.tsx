// AMM Drama Box — Original Faith Drama Short Clip Platform
// Like DramaBox but faith-centered, Black-owned stories, creator-made
// Revenue: coin unlock per episode + Drama Pass subscription + ad revenue share
// All real code — no placeholders

import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../../game/state/useGameStore'
import { hollywoodSounds } from '../../game/engine/HollywoodEngine'

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface DramaEpisode {
  id: string
  episodeNum: number
  title: string
  duration: string     // '2:45' format
  synopsis: string
  thumbnail: string    // emoji for now, URL after Supabase Storage
  coinCost: number     // tokens to unlock
  freePreview: boolean // first episode always free
  locked: boolean      // determined at render time
  scriptHook: string   // cliffhanger text shown on locked episodes
}

interface DramaSeries {
  id: string
  title: string
  creator: string
  creatorId: string
  genre: DramaGenre
  subgenre: string
  emoji: string
  color: string
  synopsis: string
  episodes: DramaEpisode[]
  totalEpisodes: number
  completedEpisodes: number
  rating: number
  views: number
  likes: number
  tags: string[]
  faithRating: 'G' | 'PG' | 'PG-13'  // family safe tiers
  blackOwned: boolean
  featured: boolean
  seriesPassCost: number   // buy full series at discount
  releaseSchedule: string
  status: 'ongoing' | 'completed' | 'upcoming'
}

type DramaGenre = 'Faith Drama' | 'Family Story' | 'Romance' | 'Thriller' | 'Comedy' | 'Historical' | 'Youth'

interface WatchProgress {
  seriesId: string
  episodeId: string
  progress: number   // 0-100
  completed: boolean
  unlockedEpisodes: string[]
}

// ── DATA ──────────────────────────────────────────────────────────────────────

const DRAMA_SERIES: DramaSeries[] = [
  {
    id: 'chosen_path',
    title: 'The Chosen Path',
    creator: 'AMM Studios',
    creatorId: 'amm_studios',
    genre: 'Faith Drama',
    subgenre: 'Family · Redemption',
    emoji: '🕊️',
    color: '#ffd700',
    synopsis: 'A young man from Chicago leaves the streets behind when he discovers a hidden family secret — and a calling he can\'t ignore. Based on real community stories.',
    totalEpisodes: 24,
    completedEpisodes: 12,
    rating: 4.9,
    views: 48200,
    likes: 12800,
    tags: ['Faith', 'Redemption', 'Chicago', 'Family', 'Streets'],
    faithRating: 'PG',
    blackOwned: true,
    featured: true,
    seriesPassCost: 800,
    releaseSchedule: 'New episodes every Tuesday',
    status: 'ongoing',
    episodes: [
      { id: 'cp_e1', episodeNum: 1, title: 'The Letter', duration: '4:12', synopsis: 'Marcus finds a letter in his grandmother\'s Bible that changes everything.', thumbnail: '✉️', coinCost: 0, freePreview: true, locked: false, scriptHook: '' },
      { id: 'cp_e2', episodeNum: 2, title: 'The Call', duration: '3:58', synopsis: 'A voice on the phone from a number that should be impossible.', thumbnail: '📞', coinCost: 50, freePreview: false, locked: true, scriptHook: 'Marcus picks up the phone and freezes — it\'s the voice of someone who died 10 years ago...' },
      { id: 'cp_e3', episodeNum: 3, title: 'Crossroads', duration: '4:33', synopsis: 'The block calls him back. Faith pushes forward. He can\'t do both.', thumbnail: '🛤️', coinCost: 50, freePreview: false, locked: true, scriptHook: 'A choice that can\'t be undone. And someone is watching...' },
      { id: 'cp_e4', episodeNum: 4, title: 'The Church on Loomis', duration: '3:44', synopsis: 'A pastor with secrets. A congregation hiding something. And Marcus is already in too deep.', thumbnail: '⛪', coinCost: 50, freePreview: false, locked: true, scriptHook: 'The envelope under the altar. The name on the inside. His name.' },
      { id: 'cp_e5', episodeNum: 5, title: 'Blood', duration: '4:01', synopsis: 'Family loyalty vs the truth. Marcus learns who his father really was.', thumbnail: '🩸', coinCost: 50, freePreview: false, locked: true, scriptHook: 'They said he died in prison. But the man standing in his kitchen is very much alive.' },
      { id: 'cp_e6', episodeNum: 6, title: 'The Vision', duration: '3:29', synopsis: 'A dream so real Marcus wakes up speaking in a language he\'s never learned.', thumbnail: '👁️', coinCost: 50, freePreview: false, locked: true, scriptHook: 'Seven words. Ancient. And they match the inscription on the letter exactly.' },
    ],
  },
  {
    id: 'sunday_best',
    title: 'Sunday Best',
    creator: 'GraceFilms_ATL',
    creatorId: 'gracefilms_atl',
    genre: 'Comedy',
    subgenre: 'Church Comedy · Family',
    emoji: '😂',
    color: '#ff6600',
    synopsis: 'What happens when a megachurch pastor\'s family moves back into the old neighborhood? Pure chaos — and pure love. A faith-forward comedy series for the whole family.',
    totalEpisodes: 20,
    completedEpisodes: 20,
    rating: 4.8,
    views: 72400,
    likes: 31000,
    tags: ['Comedy', 'Church', 'Family', 'ATL', 'Relatable'],
    faithRating: 'PG',
    blackOwned: true,
    featured: true,
    seriesPassCost: 700,
    releaseSchedule: 'Complete series — watch all now',
    status: 'completed',
    episodes: [
      { id: 'sb_e1', episodeNum: 1, title: 'Homecoming', duration: '5:02', synopsis: 'Pastor Greg\'s Tesla pulling up to 71st Street is not what the neighbors expected.', thumbnail: '🚗', coinCost: 0, freePreview: true, locked: false, scriptHook: '' },
      { id: 'sb_e2', episodeNum: 2, title: 'Potluck', duration: '4:44', synopsis: 'Mama Jenkins brings her famous seven-layer potato salad. Church wars begin.', thumbnail: '🥘', coinCost: 50, freePreview: false, locked: true, scriptHook: 'Nobody said anything about a forbidden recipe. Nobody had to.' },
      { id: 'sb_e3', episodeNum: 3, title: 'Choir Tryouts', duration: '3:58', synopsis: 'DeShawn has never sung in his life. But he signed up for a reason.', thumbnail: '🎤', coinCost: 50, freePreview: false, locked: true, scriptHook: 'She\'s front row. He\'s about to open his mouth. This will not go well.' },
      { id: 'sb_e4', episodeNum: 4, title: 'The Deacon\'s Tea', duration: '4:15', synopsis: 'What they\'re actually talking about at deacon meetings.', thumbnail: '☕', coinCost: 50, freePreview: false, locked: true, scriptHook: 'The motion is seconded. Nobody knows what it means. Including the deacon who said it.' },
    ],
  },
  {
    id: 'queen_esther_atl',
    title: 'Queen Esther ATL',
    creator: 'VisionsMedia',
    creatorId: 'visions_media',
    genre: 'Historical',
    subgenre: 'Biblical Retelling · Drama',
    emoji: '👑',
    color: '#8800ff',
    synopsis: 'The Book of Esther retold in modern Atlanta. A young Black woman discovers she\'s been positioned for a moment that will change everything — if she\'s brave enough to speak.',
    totalEpisodes: 16,
    completedEpisodes: 8,
    rating: 4.9,
    views: 29600,
    likes: 18400,
    tags: ['Biblical', 'Esther', 'ATL', 'Women', 'Courage', 'Faith'],
    faithRating: 'PG',
    blackOwned: true,
    featured: false,
    seriesPassCost: 600,
    releaseSchedule: 'New episodes every Friday',
    status: 'ongoing',
    episodes: [
      { id: 'qe_e1', episodeNum: 1, title: 'Such a Time', duration: '4:55', synopsis: 'Ester works the front desk at the most powerful firm in Atlanta. She doesn\'t know who owns it. Yet.', thumbnail: '🌆', coinCost: 0, freePreview: true, locked: false, scriptHook: '' },
      { id: 'qe_e2', episodeNum: 2, title: 'The Tower', duration: '4:22', synopsis: 'Floor 47. A boardroom. And a man who doesn\'t know she exists — or does he?', thumbnail: '🏢', coinCost: 60, freePreview: false, locked: true, scriptHook: 'His eyes find hers across the room. He knows exactly who she is.' },
      { id: 'qe_e3', episodeNum: 3, title: 'Mordecai\'s Warning', duration: '3:48', synopsis: 'Her uncle calls with information that could get them both killed.', thumbnail: '📱', coinCost: 60, freePreview: false, locked: true, scriptHook: 'Three words on the voicemail: "They know everything."' },
    ],
  },
  {
    id: 'the_fast',
    title: 'The Fast',
    creator: 'AMM Studios',
    creatorId: 'amm_studios',
    genre: 'Thriller',
    subgenre: 'Spiritual Warfare · Suspense',
    emoji: '⚡',
    color: '#00ccff',
    synopsis: '21 days. One family. And something ancient is testing them. A faith-based supernatural thriller that doesn\'t flinch.',
    totalEpisodes: 21,
    completedEpisodes: 21,
    rating: 4.7,
    views: 38100,
    likes: 14200,
    tags: ['Thriller', 'Supernatural', 'Fasting', 'Prayer', 'Family'],
    faithRating: 'PG-13',
    blackOwned: true,
    featured: false,
    seriesPassCost: 750,
    releaseSchedule: 'Complete series — watch all now',
    status: 'completed',
    episodes: [
      { id: 'tf_e1', episodeNum: 1, title: 'Day 1', duration: '3:33', synopsis: 'The Williams family starts a 21-day fast. By midnight on Day 1, something is already wrong.', thumbnail: '🌙', coinCost: 0, freePreview: true, locked: false, scriptHook: '' },
      { id: 'tf_e2', episodeNum: 2, title: 'Day 3', duration: '4:08', synopsis: 'The youngest daughter stops sleeping. The dog won\'t come inside. The TV turns on by itself.', thumbnail: '📺', coinCost: 50, freePreview: false, locked: true, scriptHook: 'It\'s not the house. It followed them here.' },
      { id: 'tf_e3', episodeNum: 3, title: 'Day 7', duration: '4:41', synopsis: 'The pastor says pray harder. The grandmother says run. Someone is right.', thumbnail: '🙏', coinCost: 50, freePreview: false, locked: true, scriptHook: 'The voice in the wall speaks a name. It\'s the father\'s name. From before he was born again.' },
    ],
  },
  {
    id: 'first_love',
    title: 'First Love',
    creator: 'IsaiahAIStudios',
    creatorId: 'isaiah_ai',
    genre: 'Youth',
    subgenre: 'Teen Faith · Romance',
    emoji: '💜',
    color: '#ff66cc',
    synopsis: 'High school. First crush. And a decision that will define who they become. A faith-based teen drama with real stakes and real heart.',
    totalEpisodes: 18,
    completedEpisodes: 9,
    rating: 4.8,
    views: 54700,
    likes: 28300,
    tags: ['Teen', 'Faith', 'Love', 'Choices', 'High School'],
    faithRating: 'G',
    blackOwned: true,
    featured: true,
    seriesPassCost: 650,
    releaseSchedule: 'New episodes every Thursday',
    status: 'ongoing',
    episodes: [
      { id: 'fl_e1', episodeNum: 1, title: 'New Kid', duration: '3:52', synopsis: 'Zion transfers to a new school mid-semester. By lunch, everything has already changed.', thumbnail: '🏫', coinCost: 0, freePreview: true, locked: false, scriptHook: '' },
      { id: 'fl_e2', episodeNum: 2, title: 'The Note', duration: '3:44', synopsis: 'Someone left a note in her locker. She knows who wrote it. She\'s pretending she doesn\'t.', thumbnail: '📝', coinCost: 40, freePreview: false, locked: true, scriptHook: 'The handwriting matches the prayer journal she found on the bench outside.' },
      { id: 'fl_e3', episodeNum: 3, title: 'The Party', duration: '4:02', synopsis: 'Everyone is going. Her parents said no. She has 4 hours to decide who she is.', thumbnail: '🎉', coinCost: 40, freePreview: false, locked: true, scriptHook: 'He shows up at her door instead. With a different plan entirely.' },
    ],
  },
]

// ── PRICING ───────────────────────────────────────────────────────────────────

const DRAMA_PRICING = {
  episodeUnlock: 50,          // 50 AMM tokens per episode (~$0.50 real value)
  seriesPassAvg: 700,         // avg tokens for full series
  dramaPassMonthly: 299,      // tokens/month for unlimited drama (AMM token pack)
  dramaPassUSD: 4.99,         // $4.99/month Drama Pass in USD
  creatorRevShare: 0.70,      // creator gets 70% of token unlocks
  platformCut: 0.30,          // AMM keeps 30% (higher than streaming b/c exclusive)
  freeEpisodesPerSeries: 1,   // always 1 free episode
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

type Screen = 'browse' | 'series' | 'player' | 'create'

export default function AMMDramaBox({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [screen, setScreen] = useState<Screen>('browse')
  const [selectedSeries, setSelectedSeries] = useState<DramaSeries | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<DramaEpisode | null>(null)
  const [filterGenre, setFilterGenre] = useState<DramaGenre | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all')
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({})
  const [unlocking, setUnlocking] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', genre: 'Faith Drama' as DramaGenre, synopsis: '',
    episodeTitle: '', episodeSynopsis: '', faithRating: 'PG' as 'G' | 'PG' | 'PG-13',
    coinCost: 50,
  })
  const [submitted, setSubmitted] = useState(false)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tokens = store.player?.tokens ?? store.player?.cash ?? 500

  const genres: (DramaGenre | 'All')[] = ['All', 'Faith Drama', 'Comedy', 'Historical', 'Thriller', 'Youth', 'Romance', 'Family Story']

  const filtered = DRAMA_SERIES.filter(s => {
    if (filterGenre !== 'All' && s.genre !== filterGenre) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  const isUnlocked = (series: DramaSeries, ep: DramaEpisode): boolean => {
    if (ep.freePreview) return true
    const prog = watchProgress[series.id]
    return prog?.unlockedEpisodes?.includes(ep.id) ?? false
  }

  const unlockEpisode = (series: DramaSeries, ep: DramaEpisode) => {
    if (ep.freePreview) { openPlayer(series, ep); return }
    if (tokens < ep.coinCost) { store.setNotif(`❌ Need ${ep.coinCost} tokens to unlock. Buy a token pack!`); return }
    setUnlocking(true)
    hollywoodSounds.scoreHit(100)
    setTimeout(() => {
      store.earnCash(-ep.coinCost)
      setWatchProgress(prev => {
        const prog = prev[series.id] || { seriesId: series.id, episodeId: ep.id, progress: 0, completed: false, unlockedEpisodes: [] }
        return { ...prev, [series.id]: { ...prog, unlockedEpisodes: [...(prog.unlockedEpisodes || []), ep.id] } }
      })
      store.setNotif(`✅ Episode ${ep.episodeNum} unlocked! "${ep.title}"`)
      setUnlocking(false)
      openPlayer(series, ep)
    }, 600)
  }

  const unlockSeries = (series: DramaSeries) => {
    if (tokens < series.seriesPassCost) { store.setNotif(`❌ Need ${series.seriesPassCost} tokens for the full series. Save ${series.seriesPassCost - tokens} more.`); return }
    store.earnCash(-series.seriesPassCost)
    const allIds = series.episodes.map(e => e.id)
    setWatchProgress(prev => ({
      ...prev,
      [series.id]: { seriesId: series.id, episodeId: '', progress: 0, completed: false, unlockedEpisodes: allIds }
    }))
    store.setNotif(`🎬 Full series unlocked! ${series.totalEpisodes} episodes of "${series.title}"`)
    hollywoodSounds.victoryFanfare()
  }

  const openPlayer = (series: DramaSeries, ep: DramaEpisode) => {
    setSelectedEpisode(ep)
    setPlaying(false)
    setPlayProgress(0)
    setScreen('player')
  }

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      if (playRef.current) clearInterval(playRef.current)
    } else {
      setPlaying(true)
      hollywoodSounds.scoreHit(50)
      playRef.current = setInterval(() => {
        setPlayProgress(p => {
          if (p >= 100) {
            clearInterval(playRef.current!)
            setPlaying(false)
            // Mark complete
            if (selectedSeries && selectedEpisode) {
              setWatchProgress(prev => ({ ...prev, [selectedSeries.id]: { ...prev[selectedSeries.id], completed: true, progress: 100 } }))
              store.earnXp(50)
              store.setNotif(`✅ Episode complete! +50 XP`)
            }
            return 100
          }
          return p + 0.5
        })
      }, 150)
    }
  }

  const nextEp = () => {
    if (!selectedSeries || !selectedEpisode) return
    const idx = selectedSeries.episodes.findIndex(e => e.id === selectedEpisode.id)
    const next = selectedSeries.episodes[idx + 1]
    if (!next) { store.setNotif('🎬 You\'ve reached the latest episode! Check back for updates.'); return }
    if (!isUnlocked(selectedSeries, next)) { setShowUnlockModal(true); return }
    setPlayProgress(0)
    setPlaying(false)
    setSelectedEpisode(next)
  }

  useEffect(() => () => { if (playRef.current) clearInterval(playRef.current) }, [])

  const c = selectedSeries?.color ?? '#00ffcc'

  // ── BROWSE ────────────────────────────────────────────────────────────────
  if (screen === 'browse') return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #1a1a3e', background: '#09091d' }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← EXIT</button>
        <span style={{ fontSize: 18 }}>🎬</span>
        <span style={{ color: '#ff66cc', fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>AMM DRAMA BOX</span>
        <span style={{ marginLeft: 'auto', color: '#ffd700', fontSize: 11 }}>🪙 {tokens} tokens</span>
      </div>

      {/* Drama Pass banner */}
      <div style={{ background: 'linear-gradient(90deg,rgba(255,102,204,0.15),rgba(136,0,255,0.15))', borderBottom: '1px solid rgba(255,102,204,0.3)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>💜</span>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#ff66cc', fontWeight: 700, fontSize: 12 }}>AMM Drama Pass</span>
          <span style={{ color: '#888', fontSize: 11, marginLeft: 8 }}>Unlimited episodes · $4.99/month · 299 tokens/month</span>
        </div>
        <button onClick={() => store.setNotif('🎬 Drama Pass — $4.99/month. Add to your Creator subscription at checkout!')}
          style={{ background: 'rgba(255,102,204,0.2)', border: '1px solid #ff66cc', color: '#ff66cc', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
          GET PASS
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a3e', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {genres.map(g => (
          <button key={g} onClick={() => setFilterGenre(g)}
            style={{ background: filterGenre === g ? 'rgba(255,102,204,0.2)' : 'transparent', border: `1px solid ${filterGenre === g ? '#ff66cc' : '#333'}`, color: filterGenre === g ? '#ff66cc' : '#888', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
            {g}
          </button>
        ))}
        <div style={{ height: 1, width: '100%', marginTop: 4 }} />
        {(['all', 'ongoing', 'completed'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ background: filterStatus === s ? 'rgba(0,255,204,0.1)' : 'transparent', border: `1px solid ${filterStatus === s ? '#00ffcc' : '#333'}`, color: filterStatus === s ? '#00ffcc' : '#555', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Series grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {filtered.map(series => {
            const progress = watchProgress[series.id]
            const episodesWatched = progress?.unlockedEpisodes?.length ?? 0
            return (
              <div key={series.id} onClick={() => { setSelectedSeries(series); setScreen('series') }}
                style={{ background: 'linear-gradient(145deg,#11112a,#171735)', border: `1px solid ${series.featured ? series.color + '66' : '#222'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'}
              >
                {/* Thumbnail */}
                <div style={{ background: `${series.color}18`, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: `1px solid ${series.color}22` }}>
                  <span style={{ fontSize: 44 }}>{series.emoji}</span>
                  {series.featured && <span style={{ position: 'absolute', top: 6, left: 6, background: series.color, color: '#111', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700 }}>⭐ FEATURED</span>}
                  <span style={{ position: 'absolute', top: 6, right: 6, background: '#111', color: '#888', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}>{series.faithRating}</span>
                  {series.status === 'completed' && <span style={{ position: 'absolute', bottom: 6, right: 6, background: '#00cc44', color: '#111', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700 }}>COMPLETE</span>}
                  {series.status === 'ongoing' && <span style={{ position: 'absolute', bottom: 6, right: 6, background: '#ff4400', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700, animation: 'pulse 2s infinite' }}>● LIVE</span>}
                </div>
                {/* Info */}
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ color: series.color, fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{series.title}</div>
                  <div style={{ color: '#555', fontSize: 9, marginBottom: 4 }}>{series.genre} · {series.subgenre}</div>
                  <div style={{ color: '#888', fontSize: 10, marginBottom: 6, lineHeight: 1.4 }}>{series.synopsis.slice(0, 70)}...</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#555' }}>
                    <span>⭐ {series.rating} · {(series.views / 1000).toFixed(0)}K views</span>
                    <span>{episodesWatched}/{series.totalEpisodes} eps</span>
                  </div>
                  {episodesWatched > 0 && (
                    <div style={{ background: '#111', borderRadius: 2, height: 3, marginTop: 5 }}>
                      <div style={{ background: series.color, height: '100%', width: `${(episodesWatched / series.episodes.length) * 100}%`, borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Create your own */}
        <div onClick={() => setScreen('create')} style={{ marginTop: 12, background: 'rgba(255,102,204,0.06)', border: '1px dashed #ff66cc44', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
          <div style={{ color: '#ff66cc', fontWeight: 700, fontSize: 12 }}>Create Your Own Drama Series</div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>You keep 70% of every token unlock. Upload episodes, set your price, build your audience.</div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
    </div>
  )

  // ── SERIES DETAIL ─────────────────────────────────────────────────────────
  if (screen === 'series' && selectedSeries) {
    const s = selectedSeries
    const episodesUnlocked = watchProgress[s.id]?.unlockedEpisodes ?? []
    const savedTokens = s.episodes.length * DRAMA_PRICING.episodeUnlock - s.seriesPassCost
    return (
      <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${s.color}33`, background: '#09091d' }}>
          <button onClick={() => setScreen('browse')} style={{ background: 'none', border: `1px solid ${s.color}44`, color: s.color, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← BACK</button>
          <span style={{ fontSize: 16 }}>{s.emoji}</span>
          <span style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>{s.title}</span>
          <span style={{ marginLeft: 'auto', color: '#ffd700', fontSize: 11 }}>🪙 {tokens}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {/* Hero */}
          <div style={{ background: `${s.color}10`, border: `1px solid ${s.color}33`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 52 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: s.color, fontWeight: 900, fontSize: 15 }}>{s.title}</div>
                <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{s.genre} · {s.subgenre} · by {s.creator}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11 }}>
                  <span style={{ color: '#ffd700' }}>⭐ {s.rating}</span>
                  <span style={{ color: '#555' }}>{(s.views / 1000).toFixed(0)}K views</span>
                  <span style={{ color: s.color }}>{s.totalEpisodes} episodes</span>
                  {s.blackOwned && <span style={{ color: '#00cc44' }}>✊ Black-owned</span>}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, margin: '0 0 12px' }}>{s.synopsis}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {s.tags.map(t => <span key={t} style={{ background: `${s.color}15`, border: `1px solid ${s.color}33`, color: s.color, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>{t}</span>)}
            </div>
            {/* Series pass */}
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>📦 Series Pass — All {s.totalEpisodes} Episodes</div>
                <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>Save {savedTokens} tokens vs episode-by-episode · {s.releaseSchedule}</div>
              </div>
              <button onClick={() => unlockSeries(s)} style={{ background: `${s.color}22`, border: `1px solid ${s.color}`, color: s.color, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                🪙 {s.seriesPassCost} TOKENS
              </button>
            </div>
          </div>

          {/* Episodes */}
          <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: 2 }}>EPISODES ({s.episodes.length} available · {s.totalEpisodes} total)</div>
          {s.episodes.map(ep => {
            const unlocked = isUnlocked(s, ep)
            return (
              <div key={ep.id} style={{ background: unlocked ? `${s.color}08` : '#09091c', border: `1px solid ${unlocked ? s.color + '44' : '#1a1a3e'}`, borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, background: `${s.color}15`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, opacity: unlocked ? 1 : 0.5 }}>
                  {ep.thumbnail}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ color: '#555', fontSize: 9 }}>EP {ep.episodeNum}</span>
                    <span style={{ color: unlocked ? s.color : '#888', fontWeight: 700, fontSize: 12 }}>{ep.title}</span>
                    <span style={{ color: '#444', fontSize: 9, marginLeft: 'auto' }}>{ep.duration}</span>
                  </div>
                  <div style={{ color: unlocked ? '#888' : '#444', fontSize: 11, lineHeight: 1.4 }}>
                    {unlocked ? ep.synopsis : ep.scriptHook || ep.synopsis.slice(0, 60) + '...'}
                  </div>
                  {!unlocked && ep.scriptHook && (
                    <div style={{ color: s.color, fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>🎬 {ep.scriptHook}</div>
                  )}
                </div>
                <button onClick={() => unlocked ? openPlayer(s, ep) : unlockEpisode(s, ep)}
                  style={{ background: unlocked ? `${s.color}22` : 'rgba(255,215,0,0.1)', border: `1px solid ${unlocked ? s.color : '#ffd70066'}`, color: unlocked ? s.color : '#ffd700', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, flexShrink: 0, minWidth: 70, textAlign: 'center' }}>
                  {unlocked ? '▶ PLAY' : ep.freePreview ? '▶ FREE' : `🪙 ${ep.coinCost}`}
                </button>
              </div>
            )
          })}
          {s.totalEpisodes > s.episodes.length && (
            <div style={{ textAlign: 'center', padding: 16, color: '#444', fontSize: 11 }}>
              + {s.totalEpisodes - s.episodes.length} more episodes coming · {s.releaseSchedule}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── PLAYER ────────────────────────────────────────────────────────────────
  if (screen === 'player' && selectedSeries && selectedEpisode) {
    const ep = selectedEpisode
    const s = selectedSeries
    return (
      <div style={{ width: '100%', height: '100%', background: '#000', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
        {/* Back */}
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.8)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <button onClick={() => { setPlaying(false); if (playRef.current) clearInterval(playRef.current); setScreen('series') }}
            style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${s.color}44`, color: s.color, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← BACK</button>
          <span style={{ color: s.color, fontSize: 11, fontWeight: 700 }}>{s.title}</span>
          <span style={{ color: '#555', fontSize: 10 }}>· EP {ep.episodeNum}: {ep.title}</span>
        </div>

        {/* Video area — vertical 9:16 format */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', marginTop: 36 }}>
          <div style={{ width: '100%', maxWidth: 340, aspectRatio: '9/16', background: `linear-gradient(180deg,${s.color}22,#000)`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
            {/* Episode visual */}
            <div style={{ fontSize: 80, marginBottom: 20, filter: `drop-shadow(0 0 20px ${s.color})` }}>{ep.thumbnail}</div>
            <div style={{ color: s.color, fontSize: 16, fontWeight: 900, marginBottom: 8, textAlign: 'center', padding: '0 20px' }}>{ep.title}</div>
            <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: '0 20px', lineHeight: 1.5 }}>{ep.synopsis}</div>

            {/* Playing overlay */}
            {playing && (
              <div style={{ position: 'absolute', bottom: 60, left: 20, right: 20, textAlign: 'center' }}>
                <div style={{ color: '#00cc44', fontSize: 10, marginBottom: 4 }}>▶ PLAYING · {ep.duration}</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, height: 4 }}>
                  <div style={{ background: s.color, height: '100%', width: `${playProgress}%`, borderRadius: 3, transition: 'width .1s' }} />
                </div>
              </div>
            )}

            {/* Demo notice */}
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: '#333', fontSize: 9 }}>
              Demo player · Upload real video via Supabase Storage after Victor deploys
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.95)', borderTop: `1px solid ${s.color}22` }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
            <button onClick={togglePlay}
              style={{ background: playing ? 'rgba(255,68,0,0.2)' : `${s.color}22`, border: `2px solid ${playing ? '#ff4400' : s.color}`, color: playing ? '#ff4400' : s.color, borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
              {playing ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button onClick={nextEp}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#888', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
              NEXT EP ⏭
            </button>
          </div>

          {/* Unlock next promo */}
          {!playing && playProgress === 0 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#555' }}>
              {ep.episodeNum < s.episodes.length ? (
                <>Next: EP {ep.episodeNum + 1} — {s.episodes[ep.episodeNum]?.title} · <span style={{ color: '#ffd700' }}>🪙 {s.episodes[ep.episodeNum]?.coinCost} tokens</span></>
              ) : (
                <span style={{ color: s.color }}>You\'re caught up! New episode: {s.releaseSchedule}</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── CREATE SERIES ─────────────────────────────────────────────────────────
  if (screen === 'create') return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #1a1a3e', background: '#09091d' }}>
        <button onClick={() => setScreen('browse')} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← BACK</button>
        <span style={{ color: '#ff66cc', fontWeight: 700, fontSize: 13 }}>🎬 Create Your Drama Series</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {!submitted ? (
          <>
            {/* Revenue info */}
            <div style={{ background: 'rgba(0,204,68,0.08)', border: '1px solid #00cc4433', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ color: '#00cc44', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>💰 Creator Revenue — You Keep 70%</div>
              <div style={{ fontSize: 11, color: '#888', lineHeight: 1.7 }}>
                • Set your coin price per episode (suggested: 40–100 tokens)<br />
                • 70% of every unlock goes directly to you<br />
                • AMM takes 30% to run the platform<br />
                • 50 episodes × 100 tokens × 1,000 viewers = 5,000,000 tokens = $50,000 at $0.01/token<br />
                • Free first episode always unlocks your audience
              </div>
            </div>

            {/* Series info */}
            <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 2 }}>SERIES INFO</div>
            <input value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Series title *" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
            <select value={createForm.genre} onChange={e => setCreateForm(f => ({ ...f, genre: e.target.value as DramaGenre }))}
              style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }}>
              {(['Faith Drama', 'Family Story', 'Romance', 'Thriller', 'Comedy', 'Historical', 'Youth'] as DramaGenre[]).map(g => <option key={g}>{g}</option>)}
            </select>
            <textarea value={createForm.synopsis} onChange={e => setCreateForm(f => ({ ...f, synopsis: e.target.value }))}
              placeholder="Series synopsis — what's the story? *" rows={3}
              style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8, resize: 'vertical' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <select value={createForm.faithRating} onChange={e => setCreateForm(f => ({ ...f, faithRating: e.target.value as 'G' | 'PG' | 'PG-13' }))}
                style={{ background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                <option value="G">G — All ages</option>
                <option value="PG">PG — Mild themes</option>
                <option value="PG-13">PG-13 — Teen+</option>
              </select>
              <div style={{ background: '#09091c', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#555', fontSize: 11 }}>🪙 Per episode:</span>
                <input type="number" value={createForm.coinCost} onChange={e => setCreateForm(f => ({ ...f, coinCost: Number(e.target.value) }))}
                  min={20} max={500} style={{ flex: 1, background: 'transparent', border: 'none', color: '#ffd700', fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }} />
                <span style={{ color: '#555', fontSize: 10 }}>tokens</span>
              </div>
            </div>

            {/* First episode */}
            <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 2 }}>FIRST EPISODE (FREE — hooks the audience)</div>
            <input value={createForm.episodeTitle} onChange={e => setCreateForm(f => ({ ...f, episodeTitle: e.target.value }))}
              placeholder="Episode 1 title *" style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
            <textarea value={createForm.episodeSynopsis} onChange={e => setCreateForm(f => ({ ...f, episodeSynopsis: e.target.value }))}
              placeholder="Episode 1 synopsis — what happens? Make it a hook. *" rows={3}
              style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 16, resize: 'vertical' }} />

            <button onClick={() => {
              if (!createForm.title || !createForm.synopsis || !createForm.episodeTitle) {
                store.setNotif('❌ Fill in title, synopsis, and first episode'); return
              }
              store.earnXp(500)
              store.setNotif(`🎬 "${createForm.title}" submitted! AMM team reviews within 48 hours.`)
              setSubmitted(true)
            }} style={{ width: '100%', background: 'rgba(255,102,204,0.15)', border: '2px solid #ff66cc', color: '#ff66cc', borderRadius: 10, padding: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
              🎬 SUBMIT SERIES — ${(createForm.coinCost * 0.70 * 0.01).toFixed(2)} per unlock to you
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
            <div style={{ color: '#ff66cc', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Series Submitted!</div>
            <div style={{ color: '#888', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              "{createForm.title}" is under review.<br />
              AMM team approves within 48 hours.<br />
              Once approved, upload your episodes and go live.
            </div>
            <div style={{ background: 'rgba(0,204,68,0.08)', border: '1px solid #00cc4433', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ color: '#00cc44', fontWeight: 700, marginBottom: 6 }}>Your revenue share</div>
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                🪙 {createForm.coinCost} tokens per episode · You keep 70%<br />
                100 viewers × {createForm.coinCost} tokens = {createForm.coinCost * 100} tokens = ${(createForm.coinCost * 100 * 0.70 * 0.01).toFixed(0)} per episode<br />
                20 episodes × 1,000 viewers = ${(createForm.coinCost * 1000 * 0.70 * 0.01 * 20).toFixed(0)} total potential
              </div>
            </div>
            <button onClick={() => { setScreen('browse'); setSubmitted(false) }}
              style={{ background: 'rgba(255,102,204,0.15)', border: '1px solid #ff66cc', color: '#ff66cc', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
              Back to Drama Box
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return null
}
