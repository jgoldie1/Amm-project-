import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../game/state/useGameStore'
import { DEMO_VIDEOS, DISTRIBUTION_COMPARISON, submitToDistribution } from '../../game/distribution/MusicDistribution'
import { GIFT_CATALOG } from '../../game/gifts/GiftSystem'
import { LIVE_SOCIAL_FEED, generateWorldEvents } from '../../game/social/GTAFeatures'
import type { Gift, ActiveGift } from '../../game/gifts/GiftSystem'
import type { MusicVideo } from '../../game/distribution/MusicDistribution'
import type { SocialPost, WorldEvent } from '../../game/social/GTAFeatures'

// ── Shared helpers ────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  free: '#888', bronze: '#cd7f32', silver: '#c0c0c0',
  gold: '#ffd700', diamond: '#00ccff', legendary: '#ff00ff'
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span style={{ background: TIER_COLORS[tier] + '22', border: `1px solid ${TIER_COLORS[tier]}`, color: TIER_COLORS[tier], borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
      {tier}
    </span>
  )
}

// ── LIVE ROOM (Bigo Live clone — better) ──────────────────────────────────────

export function LiveRoom({ onBack }: { onBack: () => void }) {
  const store = useGameStore()
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 800) + 200)
  const [gifts, setGifts] = useState<ActiveGift[]>([])
  const [fullscreenGift, setFullscreenGift] = useState<ActiveGift | null>(null)
  const [showGiftPanel, setShowGiftPanel] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{user: string; text: string; color: string}>>([
    { user: 'DJ_SetApart', text: 'Streaming live from AMM City! 🔥', color: '#ff6600' },
    { user: 'PastorEzra', text: 'Blessings on this stream 🙏', color: '#8800ff' },
    { user: 'FAN_2341', text: 'first time here, this is fire!!', color: '#00ccff' },
    { user: 'MayaMarkets', text: 'sent an Amen!', color: '#00cc44' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isPKMode, setIsPKMode] = useState(false)
  const [pkScore, setPKScore] = useState({ a: 0, b: 0 })
  const [pkTimeLeft, setPKTimeLeft] = useState(300)
  const [isHost, setIsHost] = useState(false)
  const [giftFilter, setGiftFilter] = useState<'all' | 'faith' | 'hype' | 'love' | 'battle' | 'kingdom' | 'cosmic'>('all')
  const chatRef = useRef<HTMLDivElement>(null)
  const C = '#00ffcc'

  // Simulate live viewers
  useEffect(() => {
    const iv = setInterval(() => setViewers(v => Math.max(10, v + Math.floor((Math.random() - 0.3) * 15))), 3000)
    return () => clearInterval(iv)
  }, [])

  // Simulate incoming chat
  useEffect(() => {
    const msgs = [
      { user: 'KING_2026', text: 'bro drop that NFT!! 🔥🔥', color: '#ffd700' },
      { user: 'SisterFaith', text: 'Holy Is The Lord playing rn 🙏', color: '#8800ff' },
      { user: 'CreatorX', text: 'just sent 500 tokens! keep going!!', color: '#ff4400' },
      { user: 'GospelFan', text: 'this stream is different fr different energy', color: '#00cc44' },
      { user: 'AMM_Official', text: '📢 Black Business Saturday TOMORROW! All stores 3× visibility', color: '#00ccff' },
    ]
    const iv = setInterval(() => {
      const msg = msgs[Math.floor(Math.random() * msgs.length)]
      setChatMessages(prev => [...prev.slice(-49), { ...msg, user: msg.user + '_' + Math.floor(Math.random()*999) }])
    }, 2500)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => { chatRef.current?.scrollTo(0, 99999) }, [chatMessages])

  // PK timer
  useEffect(() => {
    if (!isPKMode) return
    const iv = setInterval(() => {
      setPKTimeLeft(t => {
        if (t <= 0) { setIsPKMode(false); return 300 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [isPKMode])

  const sendGift = (gift: Gift) => {
    if (store.player.tokens < gift.ammTokens && gift.ammTokens > 0) {
      store.setNotif(`❌ Need ${gift.ammTokens} AMM tokens. You have ${store.player.tokens}.`)
      return
    }
    if (gift.ammTokens > 0) store.setPlayer({ tokens: store.player.tokens - gift.ammTokens })

    const active: ActiveGift = {
      id: Math.random().toString(36).slice(2),
      gift, sender: store.player.name || 'You',
      senderAvatar: '👑', target: 'Stream Host',
      timestamp: Date.now(),
    }
    setGifts(prev => [...prev.slice(-9), active])
    if (isPKMode) setPKScore(s => ({ ...s, a: s.a + gift.ammTokens }))

    if (gift.animationType === 'fullscreen') {
      setFullscreenGift(active)
      setTimeout(() => setFullscreenGift(null), gift.animationDuration * 1000)
    }
    setChatMessages(prev => [...prev, {
      user: store.player.name || 'You',
      text: `sent ${gift.name} ${gift.emoji}! (${gift.ammTokens} tokens)`,
      color: gift.color,
    }])
    store.earnXp(Math.ceil(gift.ammTokens / 10))
    store.setNotif(`${gift.emoji} Sent ${gift.name}!`)
    setShowGiftPanel(false)
  }

  const filteredGifts = giftFilter === 'all' ? GIFT_CATALOG : GIFT_CATALOG.filter(g => g.category === giftFilter)

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Fullscreen gift animation */}
      {fullscreenGift && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', animation: 'pulseIn 0.3s ease-out' }}>
          <div style={{ fontSize: 120, filter: `drop-shadow(0 0 40px ${fullscreenGift.gift.color})`, marginBottom: 20 }}>{fullscreenGift.gift.emoji}</div>
          <div style={{ color: fullscreenGift.gift.color, fontSize: 32, fontWeight: 900, letterSpacing: 4, textShadow: `0 0 30px ${fullscreenGift.gift.color}`, marginBottom: 10 }}>{fullscreenGift.gift.name.toUpperCase()}</div>
          <div style={{ color: '#fff', fontSize: 16 }}>{fullscreenGift.sender} sent this!</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>{fullscreenGift.gift.description}</div>
          {/* Animated glow rings */}
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${fullscreenGift.gift.color}22 0%, transparent 60%)`, pointerEvents: 'none' }} />
        </div>
      )}

      {/* Stream header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #00ffcc22', background: 'rgba(0,0,20,0.95)' }}>
        <button onClick={onBack} style={{ background: '#00ffcc11', border: '1px solid #00ffcc44', color: C, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>←</button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff440033', border: '2px solid #ff4400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎤</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>AMM City Live — Set Apart Stage</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <span style={{ color: '#ff4400', fontSize: 11 }}>● LIVE</span>
            <span style={{ color: '#888', fontSize: 11 }}>👁 {viewers.toLocaleString()} watching</span>
            <span style={{ color: '#ffd700', fontSize: 11 }}>💎 {store.player.tokens} tokens</span>
          </div>
        </div>
        <button onClick={() => setIsPKMode(!isPKMode)} style={{ background: isPKMode ? '#ff440022' : '#00ffcc11', border: `1px solid ${isPKMode ? '#ff4400' : '#00ffcc44'}`, color: isPKMode ? '#ff4400' : C, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
          {isPKMode ? '⚔️ PK ON' : '⚔️ PK BATTLE'}
        </button>
      </div>

      {/* PK Battle bar */}
      {isPKMode && (
        <div style={{ background: 'rgba(255,68,0,0.1)', borderBottom: '1px solid #ff440033', padding: '8px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ color: '#00ccff', fontWeight: 700, fontSize: 13 }}>SET APART STAGE</span>
            <span style={{ color: '#ff4400', fontSize: 11 }}>⏱ {Math.floor(pkTimeLeft / 60)}:{(pkTimeLeft % 60).toString().padStart(2, '0')}</span>
            <span style={{ color: '#8800ff', fontWeight: 700, fontSize: 13 }}>GOSPEL FM</span>
          </div>
          <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', height: 12 }}>
            <div style={{ background: '#00ccff', flex: pkScore.a || 1, transition: 'flex 0.5s' }} />
            <div style={{ background: '#8800ff', flex: pkScore.b || 1, transition: 'flex 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
            <span style={{ color: '#00ccff' }}>💎 {pkScore.a.toLocaleString()}</span>
            <span style={{ color: '#8800ff' }}>💎 {pkScore.b.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Stream area */}
        <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(180deg, #020212 0%, #0a0030 100%)' }}>
          {/* Holographic stage visualization */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>🎤</div>
              <div style={{ color: C, fontSize: 14, fontWeight: 700 }}>{store.player.name || 'Host'} is LIVE</div>
              <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>AMM Holographic Stage</div>
            </div>
          </div>

          {/* Floating gift effects */}
          <div style={{ position: 'absolute', top: 60, left: 10, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 200 }}>
            {gifts.slice(-5).map((g, i) => (
              <div key={g.id} style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${g.gift.color}`, borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8, opacity: 1 - i * 0.15 }}>
                <span style={{ fontSize: 18 }}>{g.gift.emoji}</span>
                <div>
                  <div style={{ color: g.gift.color, fontSize: 11, fontWeight: 700 }}>{g.gift.name}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>from {g.sender}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Host actions (if hosting) */}
          {isHost && (
            <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
              {['🎵 Play Track', '📢 Announce', '🎭 Effect', '🔥 Hype'].map(a => (
                <button key={a} onClick={() => store.setNotif(`${a} triggered!`)} style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #00ffcc44', color: C, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>{a}</button>
              ))}
            </div>
          )}

          {/* Toggle host mode */}
          <button onClick={() => setIsHost(h => !h)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', border: '1px solid #ff440044', color: '#ff4400', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
            {isHost ? '📺 Viewer Mode' : '🔴 Host Mode'}
          </button>
        </div>

        {/* Chat sidebar */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #00ffcc11', background: 'rgba(0,0,10,0.95)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', fontSize: 11 }} ref={chatRef}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <span style={{ color: msg.color, fontWeight: 700 }}>{msg.user}: </span>
                <span style={{ color: '#ccc' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid #00ffcc11' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { setChatMessages(prev => [...prev, { user: store.player.name || 'You', text: chatInput, color: C }]); setChatInput('') } }}
              placeholder="Say something..." style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 4, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', boxSizing: 'border-box' as const }} />
          </div>
        </div>
      </div>

      {/* Bottom gift button */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid #00ffcc11', display: 'flex', gap: 8, background: 'rgba(0,0,20,0.95)' }}>
        {/* Quick gifts */}
        {GIFT_CATALOG.slice(0, 4).map((g: import('../../game/gifts/GiftSystem').Gift) => (
          <button key={g.id} onClick={() => sendGift(g)}
            style={{ background: `${g.color}11`, border: `1px solid ${g.color}44`, borderRadius: 6, padding: '5px 8px', cursor: 'pointer', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 18 }}>{g.emoji}</div>
            <div style={{ color: g.color, fontSize: 9 }}>{g.ammTokens || 'FREE'}</div>
          </button>
        ))}
        <button onClick={() => setShowGiftPanel(v => !v)}
          style={{ background: '#ffd70022', border: '1px solid #ffd700', color: '#ffd700', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
          🎁 ALL
        </button>
      </div>

      {/* Full gift panel */}
      {showGiftPanel && (
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, background: 'rgba(2,2,20,0.98)', border: '1px solid #00ffcc33', borderRadius: '12px 12px 0 0', maxHeight: '50vh', overflowY: 'auto', zIndex: 50 }}>
          <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #1a1a3e' }}>
            <div style={{ color: C, fontWeight: 700, marginBottom: 8 }}>🎁 AMM GIFTS — Creator keeps 90%</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'faith', 'hype', 'love', 'battle', 'kingdom', 'cosmic'] as const).map(cat => (
                <button key={cat} onClick={() => setGiftFilter(cat)} style={{
                  background: giftFilter === cat ? '#00ffcc22' : 'transparent',
                  border: `1px solid ${giftFilter === cat ? C : '#333'}`,
                  color: giftFilter === cat ? C : '#666',
                  borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase'
                }}>{cat}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12 }}>
            {filteredGifts.map((g: Gift) => (
              <div key={g.id} onClick={() => sendGift(g)} style={{ background: `${g.color}11`, border: `1px solid ${g.color}33`, borderRadius: 8, padding: 10, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{g.emoji}</div>
                <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{g.name}</div>
                <TierBadge tier={g.tier} />
                <div style={{ color: g.tier === 'free' ? '#00cc44' : '#ffd700', fontSize: 11, marginTop: 4, fontWeight: 700 }}>
                  {g.ammTokens === 0 ? 'FREE' : `${g.ammTokens} 🪙`}
                </div>
                <div style={{ color: '#555', fontSize: 9, marginTop: 2 }}>{g.animationDuration}s anim</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── MUSIC VIDEO + DISTRIBUTION UI ─────────────────────────────────────────────

export function MusicVideoHub({ onBack }: { onBack: () => void }) {
  const store = useGameStore()
  const [tab, setTab] = useState<'videos' | 'upload' | 'distribute' | 'stats'>('videos')
  const [selectedVideo, setSelectedVideo] = useState<MusicVideo | null>(null)
  const [distributing, setDistributing] = useState(false)
  const [distResult, setDistResult] = useState<string | null>(null)
  const [distForm, setDistForm] = useState({ distributor: 'distrokid', explicit: false, releaseDate: '' })
  const C = '#ff8800'

  const handleDistribute = async (video: MusicVideo) => {
    setDistributing(true)
    const result = await submitToDistribution({
      trackId: video.audioTrackId ?? video.id,
      videoId: video.id,
      distributor: distForm.distributor as any,
      targetPlatforms: ['spotify', 'apple_music', 'amazon', 'youtube', 'tidal'],
      releaseDate: distForm.releaseDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      artistName: video.artist,
      genre: video.genre,
      explicit: distForm.explicit,
      scriptureTag: video.scripture,
      upcRequested: true,
      isrcRequested: true,
    })
    setDistributing(false)
    setDistResult(result.message + `\n\nEstimated live date: ${result.estimatedLiveDate}`)
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #ff880033' }}>
        <button onClick={onBack} style={{ background: '#ff880011', border: '1px solid #ff880044', color: C, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>← BACK</button>
        <span style={{ color: C, fontWeight: 900, fontSize: 16, letterSpacing: 3 }}>🎬 MUSIC VIDEO + DISTRIBUTION</span>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', borderBottom: '1px solid #1a1a3e' }}>
        {(['videos', 'upload', 'distribute', 'stats'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? `${C}22` : 'transparent', border: `1px solid ${tab === t ? C : '#333'}`,
            color: tab === t ? C : '#666', borderRadius: '6px 6px 0 0', padding: '8px 16px',
            cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
          }}>{t === 'distribute' ? '🌍 DISTRIBUTE' : t === 'upload' ? '⬆ UPLOAD' : t === 'stats' ? '📊 STATS' : '🎬 VIDEOS'}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* VIDEO GALLERY */}
        {tab === 'videos' && (
          <div>
            {selectedVideo ? (
              // Holographic video player
              <div>
                <button onClick={() => setSelectedVideo(null)} style={{ background: '#11111180', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', marginBottom: 14 }}>← BACK TO GALLERY</button>
                <div style={{ background: 'rgba(5,5,30,0.95)', border: `1px solid ${C}44`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                  {/* Holographic video canvas */}
                  <div style={{ position: 'relative', paddingBottom: selectedVideo.isVertical ? '177%' : '56.25%', background: 'linear-gradient(135deg, #0a0030, #1a0050)', borderRadius: '12px 12px 0 0', minHeight: selectedVideo.isVertical ? 0 : 200 }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <div style={{ fontSize: 48, filter: `drop-shadow(0 0 20px ${C})`, marginBottom: 12 }}>🎬</div>
                      <div style={{ color: C, fontSize: 14, fontWeight: 700 }}>{selectedVideo.title}</div>
                      <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>{selectedVideo.artist} · {selectedVideo.genre}</div>
                      {selectedVideo.holographicMode && (
                        <div style={{ marginTop: 12, padding: '6px 14px', background: `${C}22`, border: `1px solid ${C}44`, borderRadius: 6, color: C, fontSize: 11 }}>
                          ✨ HOLOGRAPHIC MODE ACTIVE
                        </div>
                      )}
                      {selectedVideo.videoUrl ? (
                        <video src={selectedVideo.videoUrl} controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ color: '#555', fontSize: 11, marginTop: 8 }}>Demo — upload your video file to play</div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{selectedVideo.title}</div>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{selectedVideo.artist} · {selectedVideo.genre}{selectedVideo.scripture ? ` · ${selectedVideo.scripture}` : ''}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#555', marginBottom: 12 }}>
                      <span>👁 {selectedVideo.views.toLocaleString()} views</span>
                      <span>❤️ {selectedVideo.likes.toLocaleString()} likes</span>
                      <span>⏱ {Math.floor(selectedVideo.duration / 60)}:{(selectedVideo.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                    {/* Distribution status */}
                    <div style={{ background: 'rgba(0,0,30,0.8)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      <div style={{ color: C, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>📡 DISTRIBUTION STATUS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                        {Object.entries(selectedVideo.distributionStatus.platforms).map(([p, status]: [string, string]) => (
                          <div key={p} style={{ textAlign: 'center', padding: '6px 4px', background: 'rgba(0,0,20,0.8)', borderRadius: 6, border: `1px solid ${status === 'live' ? '#00cc44' : status === 'pending' ? '#ffaa00' : '#333'}` }}>
                            <div style={{ fontSize: 16 }}>{p === 'spotify' ? '🎵' : p === 'appleMusic' ? '🍎' : p === 'amazon' ? '📦' : p === 'youtube' ? '▶️' : '🌊'}</div>
                            <div style={{ color: status === 'live' ? '#00cc44' : status === 'pending' ? '#ffaa00' : '#555', fontSize: 9, marginTop: 2, textTransform: 'uppercase' }}>{status.replace('_', ' ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setSelectedVideo(null); setTab('distribute') }} style={{ flex: 1, background: `${C}22`, border: `1px solid ${C}`, color: C, borderRadius: 6, padding: '8px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                        🌍 DISTRIBUTE TO PLATFORMS
                      </button>
                      <button onClick={() => store.setNotif('🔗 Share link copied!')} style={{ background: '#00ccff22', border: '1px solid #00ccff', color: '#00ccff', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
                        SHARE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>Your music videos, holographic performances, and short reels. Upload 9:16 for reels, 16:9 for full music videos.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {DEMO_VIDEOS.map((v: import('../../game/distribution/MusicDistribution').MusicVideo) => (
                    <div key={v.id} onClick={() => setSelectedVideo(v)} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ background: `linear-gradient(135deg, #0a0030, ${C}22)`, height: v.isVertical ? 140 : 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <span style={{ fontSize: 32 }}>🎬</span>
                        {v.isVertical && <div style={{ position: 'absolute', top: 6, right: 6, background: '#00ffcc22', border: '1px solid #00ffcc44', color: '#00ffcc', borderRadius: 4, fontSize: 9, padding: '2px 4px' }}>REEL</div>}
                        {v.holographicMode && <div style={{ position: 'absolute', top: 6, left: 6, background: `${C}22`, border: `1px solid ${C}44`, color: C, borderRadius: 4, fontSize: 9, padding: '2px 4px' }}>✨ HOLO</div>}
                      </div>
                      <div style={{ padding: 10 }}>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{v.title}</div>
                        <div style={{ color: '#888', fontSize: 10 }}>{v.artist}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#555' }}>
                          <span>👁 {v.views.toLocaleString()}</span>
                          <span style={{ color: v.distributionStatus.submitted ? '#00cc44' : '#555' }}>{v.distributionStatus.submitted ? '✅ Live' : '⬆ Not Distributed'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Add new */}
                  <div onClick={() => setTab('upload')} style={{ background: 'rgba(255,136,0,0.05)', border: '1px dashed #ff880044', borderRadius: 10, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                    <div style={{ color: C, fontSize: 12 }}>Upload Video</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD */}
        {tab === 'upload' && (
          <div>
            <div style={{ background: 'rgba(5,5,30,0.9)', border: `1px solid ${C}44`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ color: C, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>⬆️ UPLOAD MUSIC VIDEO</div>
              <div style={{ border: `2px dashed ${C}44`, borderRadius: 10, padding: 30, textAlign: 'center', cursor: 'pointer', marginBottom: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
                <div style={{ color: '#888', fontSize: 13 }}>Drop MP4, MOV, or WebM here</div>
                <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>9:16 for Reels · 16:9 for Music Videos · Max 500MB</div>
              </div>
              {[['Video Title *', 'title'], ['Artist Name', 'artist'], ['Scripture Reference (opt)', 'scripture']].map(([label, key]) => (
                <input key={key} placeholder={label} style={{ width: '100%', background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' as const, marginBottom: 8 }} />
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <select style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                  {['Gospel', 'Worship', 'Hip-Hop/Gospel', 'R&B/Soul', 'Electronic', 'Jazz/Neo-Soul'].map(g => <option key={g}>{g}</option>)}
                </select>
                <select style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                  <option>16:9 Music Video</option>
                  <option>9:16 Reel/Short</option>
                  <option>1:1 Square</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#888', fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" /> Enable Holographic Mode (AR overlay effects)
              </label>
              <button onClick={() => { store.earnXp(200); store.setNotif('🎬 Video uploaded! Processing...') }}
                style={{ width: '100%', background: `${C}22`, border: `1px solid ${C}`, color: C, borderRadius: 8, padding: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
                ⬆️ UPLOAD VIDEO
              </button>
            </div>
          </div>
        )}

        {/* DISTRIBUTE */}
        {tab === 'distribute' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {DISTRIBUTION_COMPARISON.map((d: typeof DISTRIBUTION_COMPARISON[0]) => (
                <div key={d.service} onClick={() => setDistForm(f => ({ ...f, distributor: d.service.toLowerCase().replace(' ', '') }))}
                  style={{ background: `${C}08`, border: `1px solid ${C}33`, borderRadius: 10, padding: 14, cursor: 'pointer' }}>
                  <div style={{ color: C, fontWeight: 700, marginBottom: 6 }}>{d.service}</div>
                  <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>💰 {d.annualFee}</div>
                  <div style={{ color: '#00cc44', fontSize: 11, marginBottom: 4 }}>📡 {d.platforms} platforms</div>
                  <div style={{ color: '#ffd700', fontSize: 11, marginBottom: 4 }}>⏱ {d.processingTime}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>Best for: {d.best}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(5,5,30,0.9)', border: `1px solid ${C}44`, borderRadius: 10, padding: 16 }}>
              <div style={{ color: C, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🌍 DISTRIBUTE YOUR MUSIC</div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                Your music goes from AMM → DistroKid/TuneCore → Spotify, Apple Music, Amazon, YouTube, Tidal and 30+ more platforms. You keep 100% of external royalties. AMM earns from subscriptions, not your music.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <input type="date" value={distForm.releaseDate} onChange={e => setDistForm(f => ({ ...f, releaseDate: e.target.value }))}
                  style={{ background: '#0a0a20', border: '1px solid #333', color: '#fff', borderRadius: 6, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={distForm.explicit} onChange={e => setDistForm(f => ({ ...f, explicit: e.target.checked }))} /> Explicit content
                </label>
              </div>
              {distResult && (
                <div style={{ background: '#00cc4411', border: '1px solid #00cc44', borderRadius: 6, padding: 12, marginBottom: 12, color: '#00cc44', fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{distResult}</div>
              )}
              <button onClick={() => handleDistribute(DEMO_VIDEOS[0])} disabled={distributing}
                style={{ width: '100%', background: distributing ? '#111' : `${C}22`, border: `1px solid ${distributing ? '#333' : C}`, color: distributing ? '#444' : C, borderRadius: 8, padding: 12, cursor: distributing ? 'default' : 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
                {distributing ? 'Submitting...' : '🌍 SUBMIT TO ALL PLATFORMS'}
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
              {[{ l: 'TOTAL STREAMS', v: '204,842', c: C }, { l: 'TOTAL REVENUE', v: '$1,733', c: '#00cc44' }, { l: 'PLATFORMS', v: '4 live', c: '#00ccff' }, { l: 'YOUR CUT', v: '90%', c: '#ffd700' }].map(s => (
                <div key={s.l} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ color: s.c, fontSize: 22, fontWeight: 700 }}>{s.v}</div>
                  <div style={{ color: '#555', fontSize: 10, marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {DEMO_VIDEOS.map((v: import('../../game/distribution/MusicDistribution').MusicVideo) => (
              <div key={v.id} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
                  {v.platforms.map((p: import('../../game/distribution/MusicDistribution').PlatformStats) => (
                    <div key={p.platform} style={{ textAlign: 'center', padding: 8, background: 'rgba(0,0,20,0.8)', borderRadius: 6 }}>
                      <div style={{ fontSize: 16 }}>{p.platform === 'spotify' ? '🎵' : p.platform === 'apple_music' ? '🍎' : p.platform === 'amm' ? '🌐' : p.platform === 'youtube' ? '▶️' : '📦'}</div>
                      <div style={{ color: '#ccc', fontSize: 10 }}>{p.streams.toLocaleString()}</div>
                      <div style={{ color: '#ffd700', fontSize: 10 }}>${p.revenue.toFixed(2)}</div>
                      <div style={{ color: p.monthlyChange > 0 ? '#00cc44' : '#ff4400', fontSize: 9 }}>{p.monthlyChange > 0 ? '+' : ''}{p.monthlyChange}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── SOCIAL FEED (GTA 6-inspired in-world feed) ─────────────────────────────────

export function CityFeed({ onBack }: { onBack: () => void }) {
  const store = useGameStore()
  const [posts, setPosts] = useState<SocialPost[]>(LIVE_SOCIAL_FEED)
  const [events] = useState<WorldEvent[]>(generateWorldEvents())
  const [feedTab, setFeedTab] = useState<'feed' | 'events' | 'trending'>('feed')
  const C = '#00ccff'

  const likePost = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    store.earnXp(5)
  }

  const realmColor: Record<string, string> = {
    city: '#00ffcc', sports: '#ff4400', marketplace: '#00cc44',
    music: '#00ccff', faith: '#8800ff', blockchain: '#ffaa00'
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #00ccff22' }}>
        <button onClick={onBack} style={{ background: '#00ccff11', border: '1px solid #00ccff44', color: C, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>← BACK</button>
        <span style={{ color: C, fontWeight: 900, fontSize: 16, letterSpacing: 3 }}>📱 AMM CITY FEED</span>
        <span style={{ color: '#555', fontSize: 11, marginLeft: 'auto' }}>GTA 6-style in-world social</span>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '10px 20px 0', borderBottom: '1px solid #1a1a3e' }}>
        {(['feed', 'events', 'trending'] as const).map((t: 'feed'|'events'|'trending') => (  
          <button key={t} onClick={() => setFeedTab(t)} style={{
            background: feedTab === t ? `${C}22` : 'transparent', border: `1px solid ${feedTab === t ? C : '#333'}`,
            color: feedTab === t ? C : '#666', borderRadius: '6px 6px 0 0', padding: '6px 14px',
            cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {feedTab === 'feed' && posts.map(p => (
          <div key={p.id} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: realmColor[p.realmOrigin] + '22', border: `2px solid ${realmColor[p.realmOrigin]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {p.authorRole === 'pastor' ? '✝️' : p.authorRole === 'athlete' ? '⚽' : p.authorRole === 'merchant' ? '🛒' : '🎤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{p.author}</span>
                  {p.isLive && <span style={{ background: '#ff000022', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 4, fontSize: 9, padding: '1px 5px' }}>● LIVE</span>}
                  {p.trending && <span style={{ background: '#ff880022', border: '1px solid #ff8800', color: '#ff8800', borderRadius: 4, fontSize: 9, padding: '1px 5px' }}>🔥 TRENDING</span>}
                </div>
                <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{p.location} · {Math.floor((Date.now() - p.timestamp) / 60000)}m ago</div>
              </div>
            </div>
            <div style={{ color: '#ddd', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{p.content}</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {p.tags.map(t => <span key={t} style={{ background: `${realmColor[p.realmOrigin]}11`, border: `1px solid ${realmColor[p.realmOrigin]}33`, color: realmColor[p.realmOrigin], borderRadius: 4, fontSize: 10, padding: '2px 6px' }}>#{t}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#555' }}>
              <button onClick={() => likePost(p.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace' }}>❤️ {p.likes.toLocaleString()}</button>
              <span>💬 {p.comments.toLocaleString()}</span>
              <span>🔄 {p.shares.toLocaleString()}</span>
              <button onClick={() => store.setNotif('🔄 Post shared!')} style={{ background: 'none', border: 'none', color: realmColor[p.realmOrigin], cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', marginLeft: 'auto' }}>SHARE →</button>
            </div>
          </div>
        ))}
        {feedTab === 'events' && events.map(e => (
          <div key={e.id} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{e.title}</div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{e.description}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#555', marginBottom: 10 }}>
              <span>📍 {e.location}</span>
              <span>👥 {e.participants.toLocaleString()} going</span>
              <span>⏱ {e.duration} min</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11 }}>
              {e.rewards.cash > 0 && <span style={{ background: '#ffd70011', border: '1px solid #ffd70033', color: '#ffd700', borderRadius: 4, padding: '3px 8px' }}>💰 ${e.rewards.cash}</span>}
              {e.rewards.xp > 0 && <span style={{ background: '#00ccff11', border: '1px solid #00ccff33', color: '#00ccff', borderRadius: 4, padding: '3px 8px' }}>⭐ {e.rewards.xp} XP</span>}
              {e.rewards.tokens > 0 && <span style={{ background: '#ffaa0011', border: '1px solid #ffaa0033', color: '#ffaa00', borderRadius: 4, padding: '3px 8px' }}>🪙 {e.rewards.tokens} tokens</span>}
            </div>
            <button onClick={() => { store.earnXp(50); store.setNotif(`📅 RSVP'd to "${e.title}"!`) }}
              style={{ background: '#00ffcc22', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>
              RSVP + REMIND ME
            </button>
          </div>
        ))}
        {feedTab === 'trending' && (
          <div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>What's trending across all 6 realms right now</div>
            {['#OmniverseBowl', '#SetApartMusic', '#BlackBizSaturday', '#ElSaturnNFT', '#GodsHand', '#AMMLive', '#RevivalNight', '#FeastOfTrumpets'].map((tag, i) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a3e' }}>
                <span style={{ color: '#555', fontSize: 14, width: 24 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C, fontSize: 13, fontWeight: 700 }}>{tag}</div>
                  <div style={{ color: '#555', fontSize: 11 }}>{Math.floor(Math.random() * 9000 + 1000).toLocaleString()} posts</div>
                </div>
                <span style={{ fontSize: 11, color: '#ff8800' }}>🔥</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
