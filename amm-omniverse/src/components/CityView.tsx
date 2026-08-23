import { useEffect, useRef, useState, useCallback } from 'react'
import { AMMCityEngine } from '../game/engine/CityEngine'
import { useGameStore } from '../game/state/useGameStore'
import { ChapelleAISimple as ChapelleAI } from '../game/ai/ChapelleAI'
import { HoloWatermarkCorner, HoloWatermarkDiagonal } from './HoloWatermark'

interface SocialPost { id: number; text: string; ts: number }

export default function CityView() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const engineRef   = useRef<AMMCityEngine | null>(null)
  const chapelleRef = useRef<ChapelleAI | null>(null)

  const [dialogue,     setDialogue]     = useState<string | null>(null)
  const [socialFeed,   setSocialFeed]   = useState<SocialPost[]>([])
  const [chapelleOpen, setChapelleOpen] = useState(false)
  const [chapelleInput,setChapelleInput]= useState('')
  const [chapelleMsgs, setChapelleMsgs] = useState<{from:'chapelle'|'player';text:string}[]>([])
  const [chapelleTyping,setChapelleTyping]= useState(false)
  const [hudState, setHudState] = useState({
    cash: 2500, tokens: 100, xp: 0, level: 1,
    wantedLevel: 0, health: 100, stamina: 100,
  })
  const [weather, setWeather]   = useState('clear')
  const [tod,     setTod]       = useState(0.35)
  const [portal,  setPortal]    = useState<string|null>(null)
  const [event,   setEvent]     = useState<string|null>(null)
  const [socialOpen, setSocialOpen] = useState(false)

  const store = useGameStore()
  const feedId = useRef(0)

  const addSocialPost = useCallback((text: string) => {
    setSocialFeed(prev => [...prev.slice(-8), { id: feedId.current++, text, ts: Date.now() }])
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new AMMCityEngine(canvasRef.current)
    engineRef.current = engine

    engine.init(
      // onHUD
      (playerState, wx, tod) => {
        setHudState({
          cash: playerState.cash, tokens: playerState.tokens,
          xp: playerState.xp, level: playerState.level,
          wantedLevel: Math.floor(playerState.wantedLevel),
          health: playerState.health ?? 100, stamina: playerState.stamina ?? 100,
        })
        setWeather(wx); setTod(tod)
        store.earnCash(0) // sync
      },
      // onPortalEnter
      (realm: string) => {
        setPortal(realm)
        addSocialPost(`🌀 Entering ${realm} realm...`)
        setTimeout(() => { store.setScreen(realm as any); setPortal(null) }, 1200)
      },
      // onNotif
      (msg: string) => {
        store.setNotif(msg)
        addSocialPost(msg)
        if (msg.includes('Event')) setEvent(msg)
      },
    ).catch(console.error)

    // Chapelle AI
    chapelleRef.current = new ChapelleAI()
    const welcome = chapelleRef.current.getWelcome()
    setChapelleMsgs([{ from: 'chapelle', text: welcome }])

    // Social feed ticker
    const socialTick = setInterval(() => {
      if (engineRef.current) {
        const feed = engineRef.current.getSocialFeed()
        if (feed.length) addSocialPost(feed[feed.length - 1])
      }
    }, 8000)

    const handleResize = () => engineRef.current?.handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      clearInterval(socialTick)
      window.removeEventListener('resize', handleResize)
      engineRef.current?.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const askChapelle = async () => {
    if (!chapelleInput.trim() || !chapelleRef.current) return
    const q = chapelleInput.trim()
    setChapelleInput('')
    setChapelleMsgs(m => [...m, { from: 'player', text: q }])
    setChapelleTyping(true)
    const answer = await chapelleRef.current.ask(q)
    setChapelleTyping(false)
    setChapelleMsgs(m => [...m, { from: 'chapelle', text: answer }])
  }

  const timeLabel = tod < 0.22 || tod > 0.78 ? '🌙 Night'
    : tod > 0.62 ? '🌆 Dusk' : tod < 0.38 ? '🌅 Dawn' : '☀️ Day'

  const weatherEmoji: Record<string,string> = {
    clear:'☀️', rain:'🌧️', fog:'🌫️', golden_hour:'🌇', storm:'⛈️'
  }

  const wantedStars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < hudState.wantedLevel ? '#ff4400' : '#333', fontSize: 10 }}>★</span>
  ))

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#020212', overflow: 'hidden' }}>

      {/* THREE.JS CANVAS */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* SCAN-LINE OVERLAY (Holoverse Layer 2) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,204,0.025) 3px,rgba(0,255,204,0.025) 4px)',
      }} />

      {/* PORTAL TRANSITION */}
      {portal && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle,rgba(0,255,204,0.35),rgba(0,0,0,0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, backdropFilter: 'blur(4px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 12, animation: 'spin 0.8s linear infinite' }}>🌀</div>
            <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 18, fontFamily: 'monospace', letterSpacing: 3 }}>ENTERING {portal.toUpperCase()}</div>
          </div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg,rgba(0,0,0,0.85),transparent)', pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, display: 'flex', gap: 16, color: '#fff' }}>
          <span style={{ color: '#00ffcc' }}>💰 ${hudState.cash.toLocaleString()}</span>
          <span style={{ color: '#8800ff' }}>🪙 {hudState.tokens}</span>
          <span style={{ color: '#ffd700' }}>⭐ Lv{hudState.level}</span>
          <span style={{ color: '#00ccff' }}>XP {hudState.xp}</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 10, display: 'flex', gap: 10, color: '#888', alignItems: 'center' }}>
          <span>{timeLabel}</span>
          <span>{weatherEmoji[weather] || '☀️'} {weather}</span>
          <div>{wantedStars}</div>
        </div>
      </div>

      {/* HP / STAMINA BARS */}
      <div style={{ position: 'absolute', bottom: 90, left: 14, pointerEvents: 'none' }}>
        <div style={{ marginBottom: 5 }}>
          <div style={{ fontSize: 9, color: '#00cc44', fontFamily: 'monospace', marginBottom: 2 }}>HP {hudState.health}</div>
          <div style={{ background: 'rgba(0,0,0,0.6)', width: 90, height: 6, borderRadius: 3 }}>
            <div style={{ background: '#00cc44', height: '100%', width: `${hudState.health}%`, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#00ccff', fontFamily: 'monospace', marginBottom: 2 }}>STAMINA</div>
          <div style={{ background: 'rgba(0,0,0,0.6)', width: 90, height: 6, borderRadius: 3 }}>
            <div style={{ background: '#00ccff', height: '100%', width: `${hudState.stamina}%`, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* WORLD EVENT BANNER */}
      {event && (
        <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,170,0,0.15)', border: '1px solid #ffaa00', borderRadius: 8, padding: '6px 18px', fontFamily: 'monospace', fontSize: 12, color: '#ffaa00', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          {event}
        </div>
      )}

      {/* NPC DIALOGUE */}
      {dialogue && (
        <div style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', maxWidth: 340, background: 'rgba(0,0,0,0.88)', border: '1px solid #00ffcc44', borderRadius: 12, padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#ccc', backdropFilter: 'blur(6px)' }}>
          {dialogue}
        </div>
      )}

      {/* CONTROLS HINT */}
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: 'monospace', fontSize: 9, color: '#333', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        WASD / ARROWS — drive · PORTALS — enter realms
      </div>

      {/* REALM NAV BUTTONS */}
      <div style={{ position: 'absolute', bottom: 80, right: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { screen: 'sports',      emoji: '⚽', color: '#ff4400' },
          { screen: 'marketplace', emoji: '🛒', color: '#00cc44' },
          { screen: 'music',       emoji: '🎵', color: '#00ccff' },
          { screen: 'faith',       emoji: '✝️', color: '#ffd700' },
          { screen: 'blockchain',  emoji: '⛓️', color: '#ffaa00' },
        ].map(b => (
          <button key={b.screen} onClick={() => store.setScreen(b.screen as any)} style={{ width: 38, height: 38, background: `${b.color}18`, border: `1px solid ${b.color}66`, borderRadius: 10, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            {b.emoji}
          </button>
        ))}
      </div>

      {/* SOCIAL FEED TOGGLE */}
      <button onClick={() => setSocialOpen(o => !o)} style={{ position: 'absolute', top: 40, right: 14, background: socialOpen ? 'rgba(0,255,204,0.15)' : 'rgba(0,0,0,0.6)', border: '1px solid #00ffcc44', borderRadius: 8, color: '#00ffcc', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, padding: '5px 10px', backdropFilter: 'blur(4px)' }}>
        📡 FEED
      </button>

      {/* SOCIAL FEED PANEL */}
      {socialOpen && (
        <div style={{ position: 'absolute', top: 70, right: 14, width: 240, background: 'rgba(2,2,18,0.92)', border: '1px solid #00ffcc22', borderRadius: 10, padding: 10, backdropFilter: 'blur(8px)', maxHeight: 200, overflowY: 'auto' }}>
          <div style={{ color: '#00ffcc', fontSize: 10, fontFamily: 'monospace', marginBottom: 8, fontWeight: 700 }}>📡 AMM CITY SOCIAL FEED</div>
          {socialFeed.length === 0 ? (
            <div style={{ color: '#333', fontSize: 10, fontFamily: 'monospace' }}>Driving activates the feed...</div>
          ) : (
            [...socialFeed].reverse().map(p => (
              <div key={p.id} style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', marginBottom: 6, borderBottom: '1px solid #0a0a20', paddingBottom: 4 }}>{p.text}</div>
            ))
          )}
        </div>
      )}

      {/* HOLOVERSE BUTTON */}
      <button onClick={() => { if ((window as any).__showHoloverse) (window as any).__showHoloverse() }}
        style={{ position: 'absolute', bottom: 130, left: 14, width: 42, height: 42, background: 'rgba(0,255,204,0.12)', border: '1px solid #00ffcc', borderRadius: 12, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
        🌐
      </button>

      {/* PRICING BUTTON */}
      <button onClick={() => { if ((window as any).__showPricing) (window as any).__showPricing() }}
        style={{ position: 'absolute', bottom: 178, left: 14, width: 42, height: 42, background: 'rgba(255,215,0,0.12)', border: '1px solid #ffd700', borderRadius: 12, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
        💳
      </button>

      {/* CHAPELLE AI BUTTON */}
      <button onClick={() => setChapelleOpen(o => !o)} style={{ position: 'absolute', bottom: 80, left: 14, width: 42, height: 42, background: chapelleOpen ? 'rgba(136,0,255,0.3)' : 'rgba(136,0,255,0.12)', border: '1px solid #8800ff', borderRadius: 12, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
        🤖
      </button>

      {/* CHAPELLE AI PANEL */}
      {chapelleOpen && (
        <div style={{ position: 'absolute', bottom: 90, left: 60, width: 280, background: 'rgba(2,2,18,0.95)', border: '1px solid #8800ff66', borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'rgba(136,0,255,0.15)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #8800ff33' }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <div>
              <div style={{ color: '#8800ff', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>CHAPELLE AI</div>
              <div style={{ color: '#555', fontSize: 9, fontFamily: 'monospace' }}>AMM Omniverse Companion</div>
            </div>
            <button onClick={() => setChapelleOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10, maxHeight: 200 }}>
            {chapelleMsgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: m.from === 'player' ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: m.from === 'chapelle' ? 'rgba(136,0,255,0.15)' : 'rgba(0,255,204,0.1)', border: `1px solid ${m.from === 'chapelle' ? '#8800ff44' : '#00ffcc33'}`, borderRadius: 8, padding: '6px 10px', maxWidth: '85%', fontSize: 11, color: m.from === 'chapelle' ? '#ccc' : '#00ffcc', fontFamily: 'monospace', lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {chapelleTyping && (
              <div style={{ color: '#8800ff', fontSize: 11, fontFamily: 'monospace' }}>Chapelle is thinking...</div>
            )}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid #1a1a3e', display: 'flex', gap: 6 }}>
            <input value={chapelleInput} onChange={e => setChapelleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && askChapelle()} placeholder="Ask Chapelle anything..." style={{ flex: 1, background: '#09091c', border: '1px solid #8800ff44', color: '#ccc', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', fontSize: 11, outline: 'none' }} />
            <button onClick={askChapelle} style={{ background: 'rgba(136,0,255,0.2)', border: '1px solid #8800ff', color: '#8800ff', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>→</button>
          </div>
        </div>
      )}

            {/* HOLOGRAPHIC CORNER WATERMARK — always on */}
      <HoloWatermarkCorner animated={true} />

      {/* DIAGONAL WATERMARK — screenshot protection */}
      <HoloWatermarkDiagonal opacity={0.04} text="AMM OMNIVERSE · ALL AMERICAN MARKETPLACE LLC · tryamm.online · © 2026" />

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
