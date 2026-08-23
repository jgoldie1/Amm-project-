// AMM Omniverse — Holographic AI System
// HoloGPT: AI assistant with holographic avatar
// HoloSearch: search the platform with holographic results
// HoloMenu: holographic navigation overlay
// HoloAd: programmable holographic advertisement engine

import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── HOLOGRAPHIC COLOR THEMES ────────────────────────────────────────
const HOLO_THEMES = {
  city:        { primary: '#00ffcc', accent: '#8800ff', bg: 'rgba(0,255,204,0.06)' },
  faith:       { primary: '#ffd700', accent: '#ffffff', bg: 'rgba(255,215,0,0.06)'  },
  sports:      { primary: '#ff4400', accent: '#ffd700', bg: 'rgba(255,68,0,0.06)'   },
  music:       { primary: '#00ccff', accent: '#ff66cc', bg: 'rgba(0,204,255,0.06)'  },
  marketplace: { primary: '#00cc44', accent: '#00ffcc', bg: 'rgba(0,204,68,0.06)'   },
  blockchain:  { primary: '#ffaa00', accent: '#00ffcc', bg: 'rgba(255,170,0,0.06)'  },
  battle:      { primary: '#ff0066', accent: '#ffd700', bg: 'rgba(255,0,102,0.06)'  },
}

type HoloTheme = keyof typeof HOLO_THEMES

// ── HOLO MENU ────────────────────────────────────────────────────────
// Full-screen holographic navigation overlay
// Triggered by: floating button, swipe up from bottom, or keyboard shortcut

export function HoloMenu({ 
  isOpen, 
  onClose, 
  theme = 'city' 
}: { 
  isOpen: boolean
  onClose: () => void
  theme?: HoloTheme
}) {
  const store = useGameStore()
  const t = HOLO_THEMES[theme]

  const MENU_ITEMS = [
    { label: 'AMM City',      emoji: '🏙️', screen: 'city',        desc: 'Drive the 3D open world' },
    { label: 'Sports Realm',  emoji: '🏆', screen: 'sports',      desc: '9 real games' },
    { label: 'Marketplace',   emoji: '🛒', screen: 'marketplace', desc: 'Shop + live selling' },
    { label: 'Music Realm',   emoji: '🎵', screen: 'music',       desc: 'Stream + earn royalties' },
    { label: 'Faith Realm',   emoji: '✝️', screen: 'faith',       desc: 'Prayer + feast calendar' },
    { label: 'Blockchain',    emoji: '⛓️', screen: 'blockchain',  desc: 'NFT + DAO + tokens' },
  ]

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,5,0.94)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}
      onClick={onClose}
    >
      {/* Scan lines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${t.primary}08 3px, ${t.primary}08 4px)`, pointerEvents: 'none' }} />

      {/* Grid floor */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '40%', opacity: 0.12, pointerEvents: 'none' }} viewBox="0 0 400 200" preserveAspectRatio="none">
        {Array.from({ length: 10 }, (_, i) => {
          const x = i * 40
          return <line key={i} x1={x} y1="0" x2={200 + (x - 200) * 3} y2="200" stroke={t.primary} strokeWidth="0.5" />
        })}
        {Array.from({ length: 6 }, (_, i) => {
          const y = i * 40
          const spread = (y / 200) * 180
          return <line key={i} x1={200 - spread} y1={y} x2={200 + spread} y2={y} stroke={t.primary} strokeWidth="0.5" opacity="0.5" />
        })}
      </svg>

      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 600, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: t.primary, fontSize: 11, letterSpacing: 4, fontFamily: 'monospace', marginBottom: 8 }}>AMM OMNIVERSE — NAVIGATION</div>
          <div style={{ color: t.primary, fontSize: 28, fontWeight: 900, fontFamily: 'monospace', textShadow: `0 0 20px ${t.primary}` }}>HOLO MENU</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MENU_ITEMS.map(item => (
            <button key={item.screen}
              onClick={() => { store.setScreen(item.screen as any); onClose() }}
              style={{
                background: `${t.primary}10`,
                border: `1px solid ${t.primary}44`,
                borderRadius: 16, padding: '18px 16px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all .15s', color: 'white',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${t.primary}20`; (e.currentTarget as HTMLButtonElement).style.borderColor = t.primary }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${t.primary}10`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${t.primary}44` }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ color: t.primary, fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{item.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3 }}>{item.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'monospace' }}>
          TAP OUTSIDE OR PRESS ESC TO CLOSE
        </div>
      </div>
    </div>
  )
}

// ── HOLO SEARCH ──────────────────────────────────────────────────────
// Search across the entire AMM platform with holographic results

type SearchResult = {
  type: 'game' | 'product' | 'creator' | 'track' | 'card' | 'business' | 'gift'
  title: string
  subtitle: string
  emoji: string
  action: string
  screen?: string
}

const SEARCH_INDEX: SearchResult[] = [
  { type: 'game',     title: 'Boxing Arena',        subtitle: '8 moves · combos · SVG fighters',     emoji: '🥊', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'Basketball V2',       subtitle: 'Rhythm shooting · MyPlayer builder',  emoji: '🏀', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'Card Battle Arena',   subtitle: '100 original cards · 10 realms',      emoji: '🃏', action: 'Duel now',  screen: 'sports'      },
  { type: 'game',     title: 'Football',            subtitle: '7 plays vs 5 defenses',               emoji: '🏈', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'WNBA W League',       subtitle: 'MyWPlayer · team chemistry',          emoji: '🏀', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'MMA',                 subtitle: 'Position-based · submissions',        emoji: '🥋', action: 'Fight now', screen: 'sports'      },
  { type: 'game',     title: 'Baseball',            subtitle: '5 pitch types · reaction timing',     emoji: '⚾', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'AR Laser Tag',        subtitle: 'Camera overlay · gyroscope aiming',   emoji: '⚡', action: 'Play now',  screen: 'sports'      },
  { type: 'game',     title: 'Creature Capture',    subtitle: '10 faith creatures · radar map',      emoji: '🌍', action: 'Catch now', screen: 'sports'      },
  { type: 'card',     title: 'Lion of Judah',       subtitle: '2800 ATK · Judah realm · Epic',       emoji: '🦁', action: 'View card', screen: 'sports'      },
  { type: 'card',     title: 'Shofar Blast',        subtitle: 'Feast of Trumpets · stuns all enemies',emoji: '📯', action: 'View card', screen: 'sports'      },
  { type: 'card',     title: 'Exodus Shield',       subtitle: 'Passover feast · field immunity',     emoji: '🛡️', action: 'View card', screen: 'sports'      },
  { type: 'card',     title: 'Void Empress',        subtitle: 'Final boss · 4000 ATK',               emoji: '🌑', action: 'View card', screen: 'sports'      },
  { type: 'gift',     title: 'Amen Gift',           subtitle: 'Free · live streaming basic',         emoji: '🙏', action: 'Send gift', screen: 'faith'       },
  { type: 'gift',     title: 'Omniverse Blast',     subtitle: '$99.99 · legendary holo animation',   emoji: '🌐', action: 'Send gift', screen: 'faith'       },
  { type: 'gift',     title: 'Seraphim',            subtitle: '$66.66 · angel animation 25 sec',     emoji: '👼', action: 'Send gift', screen: 'faith'       },
  { type: 'product',  title: 'Creator Starter Kit', subtitle: '$49.99 · instant dropship',           emoji: '📦', action: 'Buy now',   screen: 'marketplace' },
  { type: 'creator',  title: 'Music Upload',        subtitle: 'Upload track · earn royalties',       emoji: '🎵', action: 'Upload',    screen: 'music'       },
  { type: 'creator',  title: 'Go Live',             subtitle: 'Stream · gifts · PK battles',         emoji: '🔴', action: 'Go live',   screen: 'faith'       },
  { type: 'business', title: 'Register Business',   subtitle: 'Black-owned directory · free listing', emoji: '✊', action: 'Register',  screen: 'marketplace' },
]

export function HoloSearch({ 
  isOpen, 
  onClose,
  theme = 'city'
}: { 
  isOpen: boolean
  onClose: () => void
  theme?: HoloTheme
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const store = useGameStore()
  const t = HOLO_THEMES[theme]
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else setQuery('')
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const q = query.toLowerCase()
    setResults(
      SEARCH_INDEX.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.type.includes(q)
      ).slice(0, 8)
    )
  }, [query])

  if (!isOpen) return null

  const typeColor: Record<string, string> = {
    game: t.primary, product: '#00cc44', creator: t.accent,
    track: '#00ccff', card: '#ffd700', business: '#00cc44', gift: t.accent
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(0,0,5,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 600, padding: '0 20px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 20, pointerEvents: 'none' }}>🔍</div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && onClose()}
            placeholder="Search AMM Omniverse..."
            style={{
              width: '100%', padding: '18px 18px 18px 52px',
              background: `rgba(0,0,0,0.8)`,
              border: `1px solid ${t.primary}`,
              borderRadius: 16, color: 'white', fontSize: 16,
              fontFamily: 'monospace',
              boxShadow: `0 0 30px ${t.primary}33`,
              outline: 'none',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>✕</button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: 'rgba(0,0,8,0.96)', border: `1px solid ${t.primary}44`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 20px 60px rgba(0,0,0,0.8)` }}>
            {results.map((r, i) => (
              <button key={i}
                onClick={() => { if (r.screen) store.setScreen(r.screen as any); onClose() }}
                style={{ width: '100%', display: 'flex', gap: 14, padding: '12px 18px', background: 'none', border: 'none', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', textAlign: 'left', alignItems: 'center', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${t.primary}10`}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
              >
                <div style={{ fontSize: 28, width: 40, textAlign: 'center', flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{r.subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: typeColor[r.type], fontSize: 10, fontFamily: 'monospace', background: `${typeColor[r.type]}15`, border: `1px solid ${typeColor[r.type]}44`, borderRadius: 20, padding: '2px 8px' }}>{r.type.toUpperCase()}</span>
                  <span style={{ color: t.primary, fontSize: 12, fontFamily: 'monospace' }}>{r.action} →</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 30, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 13 }}>
            No results for "{query}" — try: games, cards, gifts, music, marketplace
          </div>
        )}

        {query.length < 2 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            {['boxing', 'card battle', 'live stream', 'music upload', 'creature', 'business'].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                style={{ background: `${t.primary}10`, border: `1px solid ${t.primary}33`, borderRadius: 20, padding: '6px 14px', color: t.primary, cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── HOLOGRAPHIC AD ENGINE ────────────────────────────────────────────
// Programmable ads that fire at specific game events

export type HoloAdTrigger =
  | 'game_win' | 'round_start' | 'level_up' | 'card_summon'
  | 'feast_card' | 'marketplace_open' | 'stream_start' | 'manual'
  | 'creature_caught' | 'mission_complete'

export interface HoloAdConfig {
  id: string
  brand: string
  headline: string
  subline: string
  cta: string
  ctaUrl: string
  emoji: string
  color: string
  duration: number      // seconds
  trigger: HoloAdTrigger
  type: 'full_screen' | 'corner_popup' | 'banner' | 'interactive'
  faithFriendly: boolean
  blackOwned: boolean
}

export const AMM_HOLO_ADS: HoloAdConfig[] = [
  {
    id: 'amm_pro',
    brand: 'AMM Omniverse',
    headline: 'GO PRO TODAY',
    subline: 'Unlock all 6 realms · All 16 avatar species · Live streaming · Music distribution',
    cta: 'SUBSCRIBE — $9.99/MONTH',
    ctaUrl: 'https://tryamm.online',
    emoji: '🌐',
    color: '#00ffcc',
    duration: 8,
    trigger: 'game_win',
    type: 'full_screen',
    faithFriendly: true,
    blackOwned: true,
  },
  {
    id: 'gospel_beats',
    brand: 'Set Apart Music Network',
    headline: 'SET APART BEATS VOL. 1',
    subline: '50 original gospel rap + worship beats · Royalty-free · Instant download',
    cta: 'GET 50 TRACKS — $29',
    ctaUrl: 'https://tryamm.online/marketplace',
    emoji: '🎵',
    color: '#ffd700',
    duration: 10,
    trigger: 'stream_start',
    type: 'corner_popup',
    faithFriendly: true,
    blackOwned: true,
  },
  {
    id: 'messiah_ai',
    brand: 'Isaiah AI Starverse',
    headline: 'GET YOUR STAR PLAN',
    subline: 'Messiah AI MD builds your personal 30-day development plan — free',
    cta: 'START FREE COACHING',
    ctaUrl: 'https://isaiah-starverse.vercel.app/profile',
    emoji: '🤖',
    color: '#8800ff',
    duration: 12,
    trigger: 'level_up',
    type: 'interactive',
    faithFriendly: true,
    blackOwned: true,
  },
  {
    id: 'black_biz',
    brand: 'AMM Black Business Directory',
    headline: 'LIST YOUR BUSINESS FREE',
    subline: 'Join the All American Marketplace Black-owned business directory — 0 cost',
    cta: 'LIST NOW — FREE',
    ctaUrl: 'https://tryamm.online/marketplace',
    emoji: '✊',
    color: '#00cc44',
    duration: 8,
    trigger: 'marketplace_open',
    type: 'banner',
    faithFriendly: true,
    blackOwned: true,
  },
  {
    id: 'token_pack',
    brand: 'AMM Token Store',
    headline: '🎉 100 FREE TOKENS TODAY',
    subline: 'Buy the Starter Pack ($0.99) and get 200 tokens instead of 100. Today only.',
    cta: 'CLAIM BONUS TOKENS',
    ctaUrl: 'https://tryamm.online',
    emoji: '🪙',
    color: '#ffaa00',
    duration: 10,
    trigger: 'manual',
    type: 'full_screen',
    faithFriendly: true,
    blackOwned: true,
  },
]

export function HoloAdOverlay({ ad, onClose }: { ad: HoloAdConfig; onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(ad.duration)

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { onClose(); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [onClose])

  if (ad.type === 'corner_popup') return (
    <div style={{ position: 'fixed', bottom: 100, right: 16, zIndex: 8500, width: 280, background: `rgba(0,0,0,0.95)`, border: `1px solid ${ad.color}`, borderRadius: 16, padding: 16, boxShadow: `0 0 30px ${ad.color}33` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>{ad.emoji}</span>
        <div>
          <div style={{ color: ad.color, fontWeight: 900, fontSize: 13 }}>{ad.headline}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>{ad.brand}</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{ad.subline}</p>
      <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: ad.color, color: '#111', borderRadius: 8, padding: '8px', textAlign: 'center', fontWeight: 900, fontSize: 12, textDecoration: 'none' }}>
        {ad.cta}
      </a>
      <div style={{ color: '#333', fontSize: 10, textAlign: 'center', marginTop: 6 }}>Closes in {timeLeft}s</div>
    </div>
  )

  if (ad.type === 'banner') return (
    <div style={{ position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 8500, background: `linear-gradient(90deg, ${ad.color}22, rgba(0,0,0,0.95), ${ad.color}22)`, border: `1px solid ${ad.color}44`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 24 }}>{ad.emoji}</span>
      <div style={{ flex: 1 }}>
        <span style={{ color: ad.color, fontWeight: 700, fontSize: 13 }}>{ad.headline}</span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginLeft: 8 }}>{ad.subline}</span>
      </div>
      <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ background: ad.color, color: '#111', borderRadius: 8, padding: '6px 14px', fontWeight: 900, fontSize: 12, textDecoration: 'none', flexShrink: 0 }}>
        {ad.cta}
      </a>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
    </div>
  )

  // Full screen + interactive
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 8500, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: `rgba(0,0,0,0.98)`, border: `2px solid ${ad.color}`, borderRadius: 24, padding: 40, textAlign: 'center', maxWidth: 440, width: '90%', boxShadow: `0 0 80px ${ad.color}33` }}>
        <div style={{ fontSize: 72, marginBottom: 16, filter: `drop-shadow(0 0 20px ${ad.color})` }}>{ad.emoji}</div>
        <div style={{ color: ad.color, fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{ad.headline}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 6 }}>{ad.brand}</div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{ad.subline}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ background: ad.color, color: '#111', borderRadius: 12, padding: '12px 24px', fontWeight: 900, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            {ad.cta}
          </a>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#666', borderRadius: 12, padding: '12px 20px', cursor: 'pointer', fontSize: 13 }}>
            Skip ({timeLeft}s)
          </button>
        </div>
        {(ad.faithFriendly || ad.blackOwned) && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {ad.faithFriendly && <span style={{ color: '#ffd700', fontSize: 11 }}>✝️ Faith-friendly</span>}
            {ad.blackOwned && <span style={{ color: '#00cc44', fontSize: 11 }}>✊ Black-owned</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── HOLOGRAPHIC AD MANAGER ────────────────────────────────────────────
// Hook to use in any component — fires ads based on game events

export function useHoloAds() {
  const [activeAd, setActiveAd] = useState<HoloAdConfig | null>(null)
  const shownAds = useRef<Set<string>>(new Set())

  const fireAd = (trigger: HoloAdTrigger) => {
    const matching = AMM_HOLO_ADS.filter(ad =>
      ad.trigger === trigger && !shownAds.current.has(ad.id)
    )
    if (matching.length === 0) return
    const ad = matching[Math.floor(Math.random() * matching.length)]
    shownAds.current.add(ad.id)
    setActiveAd(ad)
  }

  const dismissAd = () => setActiveAd(null)
  const fireManual = (adId: string) => {
    const ad = AMM_HOLO_ADS.find(a => a.id === adId)
    if (ad) setActiveAd(ad)
  }

  return { activeAd, fireAd, dismissAd, fireManual }
}
