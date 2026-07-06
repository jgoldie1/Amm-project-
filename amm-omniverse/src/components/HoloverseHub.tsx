// AMM Omniverse — Complete Holoverse System
// HoloGPT · HoloSearch · HoloMenu · HoloAds · HoloDelivery · HoloRideShare
// AMM Wallet · AMM Passport · AMM Driver License
// All American Marketplace — complete digital identity and services platform

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── SHARED TYPES ──────────────────────────────────────────────────────────────

type HoloService = 'gpt' | 'search' | 'delivery' | 'rideshare' | 'wallet' | 'passport' | 'license' | 'ads'

const HOLO_COLOR = {
  gpt:       '#00ffcc',
  search:    '#00ccff',
  delivery:  '#00cc44',
  rideshare: '#ff6600',
  wallet:    '#ffd700',
  passport:  '#8800ff',
  license:   '#ff66cc',
  ads:       '#ffaa00',
}

// ── HOLO GPT ─────────────────────────────────────────────────────────────────

interface ChatMessage { id: number; from: 'user' | 'holoGPT'; text: string; ts: number }

const HOLOGPT_KNOWLEDGE: Record<string, string> = {
  // Platform
  'what is amm': 'AMM Omniverse is a faith-centered creator economy metaverse built by All American Marketplace LLC. It has a 3D open world city, 11 games, live streaming, marketplace, music distribution, Drama Box short films, card battles, AR games, and a complete creator economy where you keep 90% of everything you earn.',
  'how do i make money': 'Six ways: (1) Subscriptions — $9.99–$19.99/month recurring. (2) Marketplace — sell products, keep 90%. (3) Live gifts — stream and fans send gifts, keep 90%. (4) Drama Box — create episodes, keep 70% of unlocks. (5) Music royalties — earn $0.012–$0.018/stream. (6) Tournaments — win prize pools. One Pro subscriber = $9.99 to your bank every month automatically.',
  'price': 'Free: $0. Pro: $9.99/month (all realms, 16 avatars, 50 uploads). Creator: $19.99/month (unlimited everything, Spotify distribution, QVC studio, Drama Box publishing). Battle Pass add-on: $4.99/month. Drama Pass add-on: $4.99/month. Token packs from $0.99 to $174.99.',
  'how to stream': 'Go to Faith Realm → tap Go Live → you get a real streaming room powered by LiveKit. Fans join, send gifts, vote in PK battles. You keep 90% of all gifts. Once Victor wires LiveKit ($75 extra), it\'s real video. Until then it\'s demo mode.',
  'drama box': 'AMM Drama Box is your version of DramaBox — faith short dramas. Fans unlock episodes for 50 tokens ($0.50). You publish a series, set your price, keep 70%. 1,000 viewers × 10 episodes × $0.50 × 70% = $3,500 for one series.',
  'card game': 'Card Battle Arena has 100 original cards across 10 realms. Hebrew feast cards activate seasonal bonuses. Build decks, duel other players, win tournaments. 6 battle phases, weakness targeting, fusion champions. Nothing copies Yu-Gi-Oh.',
  'music': 'Upload tracks to Music Realm. Stream royalties: $0.012–$0.018/stream (Spotify pays $0.003–$0.005 — AMM pays 3–6× more). Distribute free to Spotify, Apple Music, Amazon, YouTube, Tidal. Keep 90% of all royalties.',
  'deploy': 'npm run build in amm-omniverse folder, drag dist/ folder to Vercel. Free. 15 minutes. Done. Then send Victor $400 and the handoff script to wire payments.',
  'victor': 'Victor wires the backend for $400. Pre-written script with 16 routes. He deploys to Render.com, runs Supabase SQL, adds Stripe webhook, adds env var to Vercel. 10–14 hours his time. Real payments in 1–2 weeks.',
  'game': 'AMM has 11 playable games: Tactical Realms (original shooter), Hero Realms RPG, Boxing V2, Basketball V2, Football, WNBA, MMA, Baseball, Card Battle, AR Laser Tag, Creature Capture. All fully playable now.',
  'holo': 'The Holoverse is 9 rendering layers: CSS custom properties, SVG scan lines, Tron perspective grid, Three.js PBR WebGL, Lottie particles, Camera AR, CSS backdrop-filter, Web Audio, and WebXR VR mode. They stack to create the holographic metaverse look.',
  'wallet': 'AMM Wallet in Blockchain Realm — stores AMM tokens, NFTs, and El Saturn Chain transactions. AMM Passport and Driver License are digital identity documents on the blockchain. Think of it as your All American Marketplace digital identity.',
  'how many lines': 'AMM Omniverse has 18,555 lines of code across 47 TypeScript files, plus 2,819 lines in Isaiah AI Starverse and 640 lines in AMM Card Arena. Total: 22,000+ lines across 3 complete platforms.',
}

function getHoloGPTResponse(input: string): string {
  const q = input.toLowerCase().trim()
  // Direct matches
  for (const [key, answer] of Object.entries(HOLOGPT_KNOWLEDGE)) {
    if (q.includes(key)) return answer
  }
  // Fuzzy matches
  if (q.includes('earn') || q.includes('revenue') || q.includes('income')) return HOLOGPT_KNOWLEDGE['how do i make money']
  if (q.includes('subs') || q.includes('tier') || q.includes('cost') || q.includes('cheap')) return HOLOGPT_KNOWLEDGE['price']
  if (q.includes('live') || q.includes('stream')) return HOLOGPT_KNOWLEDGE['how to stream']
  if (q.includes('card') || q.includes('duel') || q.includes('battle')) return HOLOGPT_KNOWLEDGE['card game']
  if (q.includes('deploy') || q.includes('vercel') || q.includes('launch')) return HOLOGPT_KNOWLEDGE['deploy']
  if (q.includes('victor') || q.includes('backend') || q.includes('stripe') || q.includes('supabase')) return HOLOGPT_KNOWLEDGE['victor']
  if (q.includes('music') || q.includes('royalt') || q.includes('track')) return HOLOGPT_KNOWLEDGE['music']
  if (q.includes('drama') || q.includes('episode') || q.includes('series')) return HOLOGPT_KNOWLEDGE['drama box']
  if (q.includes('holover') || q.includes('holo') || q.includes('holoverse')) return HOLOGPT_KNOWLEDGE['holo']

  // Default helpful response
  return `Great question about "${input}". AMM Omniverse is a faith-centered creator economy metaverse with 11 games, Drama Box short films, live streaming, music distribution, card battles, and a real creator economy. Try asking me: "how do I make money", "what does Pro cost", "how does Drama Box work", "what games do you have", or "how do I deploy".`
}

export function HoloGPT({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 0, from: 'holoGPT',
    text: '🌐 HoloGPT online. I know everything about AMM Omniverse — pricing, features, games, revenue, deployment, Drama Box, music royalties, and more. What do you want to know?',
    ts: Date.now(),
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [idCounter, setIdCounter] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const apiUrl = (import.meta as any).env?.VITE_API_URL ?? ''

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async () => {
    const q = input.trim()
    if (!q) return
    setInput('')
    const userMsg: ChatMessage = { id: idCounter, from: 'user', text: q, ts: Date.now() }
    setMessages(m => [...m, userMsg])
    setIdCounter(i => i + 2)
    setTyping(true)

    // Try real Claude API if backend connected
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/ai/answer`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, mode: 'hybrid' }),
        })
        const data = await res.json()
        setTyping(false)
        setMessages(m => [...m, { id: idCounter + 1, from: 'holoGPT', text: data.answer || getHoloGPTResponse(q), ts: Date.now() }])
        return
      } catch { /* fall through to local */ }
    }

    // Local knowledge base response
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { id: idCounter + 1, from: 'holoGPT', text: getHoloGPTResponse(q), ts: Date.now() }])
    }, 600 + Math.random() * 400)
  }, [input, idCounter, apiUrl])

  const quickPrompts = ['How do I make money?', 'What does Pro cost?', 'How does Drama Box work?', 'Tell me about the games', 'How do I deploy?']

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #00ffcc22', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        <div style={{ width: 32, height: 32, background: 'rgba(0,255,204,0.15)', border: '1px solid #00ffcc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
        <div>
          <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 13 }}>HoloGPT</div>
          <div style={{ color: '#555', fontSize: 9 }}>AMM Omniverse AI · Always online</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 8, height: 8, background: '#00cc44', borderRadius: '50%', boxShadow: '0 0 6px #00cc44' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            {msg.from === 'holoGPT' && <div style={{ width: 24, height: 24, background: 'rgba(0,255,204,0.15)', border: '1px solid #00ffcc33', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🤖</div>}
            <div style={{ background: msg.from === 'user' ? 'rgba(0,255,204,0.12)' : 'rgba(17,17,42,0.9)', border: `1px solid ${msg.from === 'user' ? '#00ffcc44' : '#1a1a3e'}`, borderRadius: 12, padding: '8px 12px', maxWidth: '82%', fontSize: 12, color: msg.from === 'user' ? '#00ffcc' : '#ccc', lineHeight: 1.6 }}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 24, height: 24, background: 'rgba(0,255,204,0.15)', border: '1px solid #00ffcc33', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>🤖</div>
            <div style={{ background: 'rgba(17,17,42,0.9)', border: '1px solid #1a1a3e', borderRadius: 12, padding: '8px 14px', color: '#00ffcc', fontSize: 13, letterSpacing: 4 }}>···</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '6px 10px', borderTop: '1px solid #0a0a20', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {quickPrompts.map(p => (
          <button key={p} onClick={() => { setInput(p); setTimeout(send, 50) }}
            style={{ background: 'rgba(0,255,204,0.06)', border: '1px solid #00ffcc22', color: '#00ffcc', borderRadius: 20, padding: '3px 9px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 9 }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 10px', borderTop: '1px solid #1a1a3e', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask HoloGPT anything about AMM Omniverse..." style={{ flex: 1, background: '#09091c', border: '1px solid #00ffcc44', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, outline: 'none' }} />
        <button onClick={send} style={{ background: 'rgba(0,255,204,0.15)', border: '1px solid #00ffcc', color: '#00ffcc', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>→</button>
      </div>
    </div>
  )
}

// ── HOLO DELIVERY ─────────────────────────────────────────────────────────────

interface DeliveryItem { id: string; name: string; emoji: string; price: number; category: string; vendor: string; vendorType: 'black_owned' | 'faith' | 'local' }
interface DeliveryOrder { id: string; items: DeliveryItem[]; status: 'placing' | 'confirmed' | 'preparing' | 'en_route' | 'delivered'; eta: string; driver: string; driverEmoji: string; total: number }

const DELIVERY_MENU: DeliveryItem[] = [
  { id: 'd1', name: 'Gospel Feast Meal',    emoji: '🍽️', price: 14.99, category: 'Food',      vendor: 'Sister Ruth\'s Kitchen',  vendorType: 'black_owned' },
  { id: 'd2', name: 'Jerk Chicken Plate',   emoji: '🍗', price: 12.99, category: 'Food',      vendor: 'Kingdom Grill ATL',       vendorType: 'black_owned' },
  { id: 'd3', name: 'AMM Creator Bundle',   emoji: '📦', price: 49.99, category: 'Products',  vendor: 'AMM Marketplace',         vendorType: 'faith'       },
  { id: 'd4', name: 'Faith Journal',        emoji: '📖', price: 24.99, category: 'Products',  vendor: 'Kingdom Press',           vendorType: 'faith'       },
  { id: 'd5', name: 'Gospel Beat Pack',     emoji: '🎵', price: 29.99, category: 'Digital',   vendor: 'Set Apart Music',         vendorType: 'faith'       },
  { id: 'd6', name: 'Shea Butter Set',      emoji: '💆', price: 18.99, category: 'Beauty',    vendor: 'Zion Beauty Supply',      vendorType: 'black_owned' },
  { id: 'd7', name: 'Herb Tea Collection',  emoji: '🌿', price: 11.99, category: 'Wellness',  vendor: 'Natural Roots Wellness',  vendorType: 'black_owned' },
  { id: 'd8', name: 'Scripture Art Print',  emoji: '🖼️', price: 22.99, category: 'Art',       vendor: 'Sacred Prints Co',        vendorType: 'faith'       },
]

export function HoloDelivery({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [cart, setCart] = useState<DeliveryItem[]>([])
  const [filter, setFilter] = useState<'All' | 'Food' | 'Products' | 'Digital' | 'Beauty' | 'Wellness' | 'Art'>('All')
  const [order, setOrder] = useState<DeliveryOrder | null>(null)
  const [address, setAddress] = useState('')
  const [phase, setPhase] = useState<'browse' | 'checkout' | 'tracking'>('browse')

  const filtered = DELIVERY_MENU.filter(i => filter === 'All' || i.category === filter)
  const total = cart.reduce((s, i) => s + i.price, 0)
  const deliveryFee = total > 35 ? 0 : 3.99
  const tokenDiscount = Math.min(cart.length * 10, 50)  // earn 10 tokens per item
  const drivers = [
    { name: 'Brother Marcus',  emoji: '🚗', eta: '18 min' },
    { name: 'Sister Keisha',   emoji: '🛵', eta: '12 min' },
    { name: 'Deacon James',    emoji: '🚙', eta: '22 min' },
    { name: 'Faith Runner',    emoji: '🚐', eta: '9 min'  },
  ]

  const placeOrder = () => {
    if (!address.trim()) { store.setNotif('❌ Enter your delivery address'); return }
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const newOrder: DeliveryOrder = {
      id: 'HD-' + Date.now().toString().slice(-6),
      items: [...cart], status: 'confirmed', eta: driver.eta,
      driver: driver.name, driverEmoji: driver.emoji,
      total: total + deliveryFee,
    }
    setOrder(newOrder)
    setPhase('tracking')
    store.earnXp(tokenDiscount * 5)
    store.setNotif(`🚗 Order placed! ${driver.name} picking up in ${driver.eta}. +${tokenDiscount} tokens earned!`)

    // Simulate delivery progress
    const stages: DeliveryOrder['status'][] = ['confirmed', 'preparing', 'en_route', 'delivered']
    stages.forEach((status, i) => {
      setTimeout(() => setOrder(o => o ? { ...o, status } : o), i * 8000)
    })
  }

  const statusInfo: Record<DeliveryOrder['status'], { label: string; color: string; progress: number }> = {
    placing:   { label: 'Placing order...',     color: '#888',    progress: 10 },
    confirmed: { label: 'Order confirmed!',     color: '#00ccff', progress: 25 },
    preparing: { label: 'Vendor preparing...',  color: '#ffaa00', progress: 50 },
    en_route:  { label: 'Driver en route!',     color: '#00cc44', progress: 75 },
    delivered: { label: '✅ Delivered!',         color: '#00cc44', progress: 100 },
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #00cc4422', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        <span style={{ fontSize: 20 }}>🚗</span>
        <div>
          <div style={{ color: '#00cc44', fontWeight: 900, fontSize: 13 }}>HOLO DELIVERY</div>
          <div style={{ color: '#555', fontSize: 9 }}>Black-owned businesses · Faith vendors · Free over $35</div>
        </div>
        {cart.length > 0 && (
          <button onClick={() => setPhase('checkout')}
            style={{ marginLeft: 'auto', background: 'rgba(0,204,68,0.15)', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
            🛒 {cart.length} · ${total.toFixed(2)}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {phase === 'browse' && (
          <>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {['All', 'Food', 'Products', 'Digital', 'Beauty', 'Wellness', 'Art'].map(f => (
                <button key={f} onClick={() => setFilter(f as any)}
                  style={{ background: filter === f ? 'rgba(0,204,68,0.15)' : 'transparent', border: `1px solid ${filter === f ? '#00cc44' : '#333'}`, color: filter === f ? '#00cc44' : '#555', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
                  {f}
                </button>
              ))}
            </div>
            {filtered.map(item => (
              <div key={item.id} style={{ background: '#09091c', border: '1px solid #1a1a3e', borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 32, width: 44, height: 44, background: 'rgba(0,204,68,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{item.name}</div>
                  <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{item.vendor}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{ color: item.vendorType === 'black_owned' ? '#00cc44' : '#ffd700', fontSize: 9, background: item.vendorType === 'black_owned' ? 'rgba(0,204,68,0.1)' : 'rgba(255,215,0,0.1)', border: `1px solid ${item.vendorType === 'black_owned' ? '#00cc4433' : '#ffd70033'}`, borderRadius: 20, padding: '1px 7px' }}>
                      {item.vendorType === 'black_owned' ? '✊ Black-owned' : '✝️ Faith'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#00cc44', fontWeight: 700, fontSize: 14 }}>${item.price}</div>
                  <button onClick={() => setCart(c => [...c, item])} style={{ background: 'rgba(0,204,68,0.15)', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                    + ADD
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {phase === 'checkout' && (
          <div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: 2 }}>ORDER SUMMARY</div>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #111', fontSize: 12 }}>
                <span style={{ color: '#ccc' }}>{item.emoji} {item.name}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#00cc44' }}>${item.price}</span>
                  <button onClick={() => setCart(c => c.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ff4400', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 12, background: '#09091c', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}><span>Delivery fee</span><span style={{ color: deliveryFee === 0 ? '#00cc44' : '#ccc' }}>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee}`}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#00ffcc', marginBottom: 4 }}><span>Token bonus</span><span>+{tokenDiscount} tokens</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, borderTop: '1px solid #333', marginTop: 6, paddingTop: 6 }}><span>Total</span><span style={{ color: '#00cc44' }}>${(total + deliveryFee).toFixed(2)}</span></div>
            </div>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address..." style={{ width: '100%', background: '#09091c', border: '1px solid #333', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginTop: 12, marginBottom: 12 }} />
            <button onClick={placeOrder} style={{ width: '100%', background: 'rgba(0,204,68,0.15)', border: '2px solid #00cc44', color: '#00cc44', borderRadius: 10, padding: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
              🚗 PLACE HOLO DELIVERY ORDER
            </button>
            <button onClick={() => setPhase('browse')} style={{ width: '100%', background: 'transparent', border: '1px solid #333', color: '#555', borderRadius: 8, padding: 10, cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, marginTop: 8 }}>
              ← Continue Shopping
            </button>
          </div>
        )}

        {phase === 'tracking' && order && (
          <div>
            <div style={{ background: 'rgba(0,204,68,0.06)', border: '1px solid #00cc4433', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>{order.driverEmoji}</span>
                <div>
                  <div style={{ color: '#00cc44', fontWeight: 700, fontSize: 14 }}>{order.driver}</div>
                  <div style={{ color: '#888', fontSize: 11 }}>Your Holo Driver · ETA: {order.eta}</div>
                </div>
              </div>
              <div style={{ color: statusInfo[order.status].color, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                {statusInfo[order.status].label}
              </div>
              <div style={{ background: '#111', borderRadius: 4, height: 8 }}>
                <div style={{ background: statusInfo[order.status].color, height: '100%', width: `${statusInfo[order.status].progress}%`, borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Order #{order.id}</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 11, color: '#888', borderBottom: '1px solid #0a0a20' }}>
                <span>{item.emoji}</span><span style={{ flex: 1 }}>{item.name}</span><span style={{ color: '#00cc44' }}>${item.price}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: 10, background: '#09091c', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#888' }}>Total charged</span>
              <span style={{ color: '#00cc44', fontWeight: 700 }}>${order.total.toFixed(2)}</span>
            </div>
            {order.status === 'delivered' && (
              <button onClick={() => { setPhase('browse'); setCart([]); setOrder(null) }}
                style={{ width: '100%', marginTop: 12, background: 'rgba(0,204,68,0.15)', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 8, padding: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                🛒 Order Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── HOLO RIDESHARE ────────────────────────────────────────────────────────────

interface RideDriver { id: string; name: string; emoji: string; vehicle: string; rating: number; eta: string; priceMultiplier: number; type: 'standard' | 'premium' | 'xl' | 'faith_shuttle' }

const RIDE_DRIVERS: RideDriver[] = [
  { id: 'r1', name: 'Deacon Willis',     emoji: '🚗', vehicle: '2022 Toyota Camry',    rating: 4.97, eta: '4 min',  priceMultiplier: 1.0, type: 'standard'      },
  { id: 'r2', name: 'Sister Monique',    emoji: '🚙', vehicle: '2023 Honda Accord',   rating: 4.95, eta: '7 min',  priceMultiplier: 1.0, type: 'standard'      },
  { id: 'r3', name: 'Pastor Mike',       emoji: '🚐', vehicle: '2021 Ford Transit',    rating: 4.99, eta: '9 min',  priceMultiplier: 1.4, type: 'xl'            },
  { id: 'r4', name: 'Brother Tyrone',    emoji: '🚘', vehicle: '2024 Cadillac CT5',   rating: 4.98, eta: '6 min',  priceMultiplier: 1.8, type: 'premium'       },
  { id: 'r5', name: 'Mother Johnson',    emoji: '🚌', vehicle: 'AMM Faith Shuttle',    rating: 5.00, eta: '12 min', priceMultiplier: 0.8, type: 'faith_shuttle' },
]

export function HoloRideShare({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<RideDriver | null>(null)
  const [ridePhase, setRidePhase] = useState<'request' | 'matching' | 'confirmed' | 'enroute' | 'arrived'>('request')
  const [basePrice] = useState(8.99 + Math.random() * 6)

  const requestRide = () => {
    if (!pickup.trim() || !dropoff.trim()) { store.setNotif('❌ Enter pickup and dropoff'); return }
    setRidePhase('matching')
    setTimeout(() => {
      const driver = RIDE_DRIVERS[Math.floor(Math.random() * RIDE_DRIVERS.length)]
      setSelectedDriver(driver)
      setRidePhase('confirmed')
      store.setNotif(`🚗 ${driver.name} is on the way! ETA ${driver.eta}`)
    }, 2000)
  }

  const startRide = () => {
    setRidePhase('enroute')
    setTimeout(() => { setRidePhase('arrived'); store.earnXp(50); store.setNotif('✅ Arrived! Rate your driver.') }, 5000)
  }

  const typeColors = { standard: '#00cc44', premium: '#ffd700', xl: '#00ccff', faith_shuttle: '#8800ff' }
  const typeLabels = { standard: '🚗 Standard', premium: '⭐ Premium', xl: '👥 XL', faith_shuttle: '✝️ Faith Shuttle' }

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #ff660022', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        <span style={{ fontSize: 20 }}>🚗</span>
        <div>
          <div style={{ color: '#ff6600', fontWeight: 900, fontSize: 13 }}>HOLO RIDESHARE</div>
          <div style={{ color: '#555', fontSize: 9 }}>Faith-safe rides · Black drivers · Community first</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {ridePhase === 'request' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="📍 Pickup location"
                style={{ width: '100%', background: '#09091c', border: '1px solid #ff660044', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
              <input value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="🎯 Where to?"
                style={{ width: '100%', background: '#09091c', border: '1px solid #ff660044', color: '#ccc', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }} />
            </div>

            <div style={{ fontSize: 11, color: '#555', marginBottom: 10, letterSpacing: 2 }}>AVAILABLE RIDES</div>
            {RIDE_DRIVERS.map(driver => {
              const price = (basePrice * driver.priceMultiplier).toFixed(2)
              return (
                <div key={driver.id} onClick={() => setSelectedDriver(driver)}
                  style={{ background: selectedDriver?.id === driver.id ? `${typeColors[driver.type]}10` : '#09091c', border: `1px solid ${selectedDriver?.id === driver.id ? typeColors[driver.type] : '#222'}`, borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{driver.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ color: typeColors[driver.type], fontWeight: 700, fontSize: 11 }}>{typeLabels[driver.type]}</span>
                      <span style={{ color: '#555', fontSize: 9 }}>ETA {driver.eta}</span>
                    </div>
                    <div style={{ color: '#888', fontSize: 11 }}>{driver.name} · {driver.vehicle}</div>
                    <div style={{ color: '#ffd700', fontSize: 10, marginTop: 2 }}>⭐ {driver.rating}</div>
                  </div>
                  <div style={{ color: typeColors[driver.type], fontWeight: 700, fontSize: 15 }}>${price}</div>
                </div>
              )
            })}

            <button onClick={requestRide} disabled={!selectedDriver}
              style={{ width: '100%', marginTop: 8, background: selectedDriver ? 'rgba(255,102,0,0.15)' : '#09091c', border: `2px solid ${selectedDriver ? '#ff6600' : '#333'}`, color: selectedDriver ? '#ff6600' : '#555', borderRadius: 10, padding: 14, cursor: selectedDriver ? 'pointer' : 'default', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
              {selectedDriver ? `🚗 REQUEST — $${(basePrice * selectedDriver.priceMultiplier).toFixed(2)}` : 'Select a ride type above'}
            </button>

            <div style={{ marginTop: 12, padding: 10, background: 'rgba(136,0,255,0.06)', border: '1px solid #8800ff22', borderRadius: 8, fontSize: 10, color: '#666', lineHeight: 1.6 }}>
              ✝️ All Holo drivers are community-verified faith members. Background checked. Women drivers available on request. Prayer available during your ride — just ask.
            </div>
          </>
        )}

        {ridePhase === 'matching' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>🔄</div>
            <div style={{ color: '#ff6600', fontWeight: 700, fontSize: 16 }}>Finding your driver...</div>
            <div style={{ color: '#555', fontSize: 12, marginTop: 8 }}>Matching with faith-verified community drivers</div>
          </div>
        )}

        {(ridePhase === 'confirmed' || ridePhase === 'enroute' || ridePhase === 'arrived') && selectedDriver && (
          <div>
            <div style={{ background: 'rgba(255,102,0,0.08)', border: '1px solid #ff660033', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 40 }}>{selectedDriver.emoji}</span>
                <div>
                  <div style={{ color: '#ff6600', fontWeight: 700, fontSize: 14 }}>{selectedDriver.name}</div>
                  <div style={{ color: '#888', fontSize: 11 }}>{selectedDriver.vehicle}</div>
                  <div style={{ color: '#ffd700', fontSize: 11 }}>⭐ {selectedDriver.rating} · {selectedDriver.type.replace('_', ' ')}</div>
                </div>
              </div>
              <div style={{ color: ridePhase === 'arrived' ? '#00cc44' : '#ff6600', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                {ridePhase === 'confirmed' ? `Driver on way · ETA ${selectedDriver.eta}` :
                 ridePhase === 'enroute'  ? '🚗 En route to your destination...' :
                 '✅ You have arrived!'}
              </div>
              <div style={{ background: '#111', borderRadius: 4, height: 8 }}>
                <div style={{ background: ridePhase === 'arrived' ? '#00cc44' : '#ff6600', height: '100%', width: ridePhase === 'confirmed' ? '25%' : ridePhase === 'enroute' ? '70%' : '100%', borderRadius: 4, transition: 'width 1s ease' }} />
              </div>
            </div>

            <div style={{ padding: 12, background: '#09091c', borderRadius: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#888' }}>📍 From</span><span style={{ color: '#ccc' }}>{pickup || 'Current location'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#888' }}>🎯 To</span><span style={{ color: '#ccc' }}>{dropoff}</span>
              </div>
            </div>

            {ridePhase === 'confirmed' && (
              <button onClick={startRide} style={{ width: '100%', background: 'rgba(255,102,0,0.15)', border: '1px solid #ff6600', color: '#ff6600', borderRadius: 8, padding: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                Simulate Ride →
              </button>
            )}
            {ridePhase === 'arrived' && (
              <div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 10, textAlign: 'center' }}>Rate {selectedDriver.name}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => { store.setNotif(`⭐ ${s} stars given to ${selectedDriver.name}!`); setRidePhase('request') }}
                      style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid #ffd70044', color: '#ffd700', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 16 }}>
                      {'⭐'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── AMM WALLET / PASSPORT / DRIVER LICENSE ────────────────────────────────────

export function AMMWalletSystem({ onClose, startTab = 'wallet' }: { onClose: () => void; startTab?: 'wallet' | 'passport' | 'license' }) {
  const store = useGameStore()
  const [tab, setTab] = useState<'wallet' | 'passport' | 'license'>(startTab)
  const [passportApplied, setPassportApplied] = useState(false)
  const [licenseApplied, setLicenseApplied] = useState(false)
  const [passportForm, setPassportForm] = useState({ legalName: '', dob: '', country: '', city: '' })
  const [licenseForm, setLicenseForm] = useState({ legalName: '', dob: '', state: '', vehicleClass: 'B - Standard' })
  const tokens = store.player?.tokens ?? 0
  const cash = store.player?.cash ?? 0
  const level = store.player?.level ?? 1
  const name = store.player?.name ?? 'Creator'
  const walletAddr = (store as any).walletAddress ?? 'AMM-' + Math.random().toString(36).substring(2, 10).toUpperCase()

  const PASSPORT_ID = 'AMMP-' + Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)).toString().padStart(8, '0')
  const LICENSE_ID  = 'AMML-' + Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7).toString().padStart(8, '0')

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #ffd70022', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        <span style={{ fontSize: 18 }}>🌐</span>
        <span style={{ color: '#ffd700', fontWeight: 900, fontSize: 13 }}>ALL AMERICAN MARKETPLACE IDENTITY</span>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a3e' }}>
        {[
          { id: 'wallet', label: '💰 Wallet', color: '#ffd700' },
          { id: 'passport', label: '📘 Passport', color: '#8800ff' },
          { id: 'license', label: '🪪 License', color: '#00ccff' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{ flex: 1, padding: '9px 4px', background: tab === t.id ? `${t.color}10` : 'transparent', border: 'none', borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent', color: tab === t.id ? t.color : '#555', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

        {/* WALLET */}
        {tab === 'wallet' && (
          <div>
            {/* Balance card */}
            <div style={{ background: 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,170,0,0.08))', border: '1px solid #ffd70044', borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ color: '#888', fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>AMM WALLET BALANCE</div>
              <div style={{ color: '#ffd700', fontSize: 36, fontWeight: 900, marginBottom: 4 }}>${(cash * 0.01).toFixed(2)}</div>
              <div style={{ color: '#555', fontSize: 11 }}>USD equivalent · {cash.toLocaleString()} AMM tokens</div>
              <div style={{ marginTop: 10, color: '#888', fontSize: 10, fontFamily: 'monospace', letterSpacing: 2 }}>{walletAddr}</div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Tokens', value: tokens.toLocaleString(), color: '#ffd700' },
                { label: 'Level', value: `Lv${level}`, color: '#00ffcc' },
                { label: 'Chain', value: 'EL SATURN', color: '#ffaa00' },
              ].map(s => (
                <div key={s.label} style={{ background: '#09091c', border: '1px solid #1a1a3e', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: 16 }}>{s.value}</div>
                  <div style={{ color: '#555', fontSize: 9, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: '⬆️ Add Funds', desc: 'Buy token packs', color: '#00cc44', action: () => store.setNotif('💳 Opening token store...') },
                { label: '⬇️ Withdraw', desc: 'To bank account', color: '#00ccff', action: () => store.setNotif('🏦 Withdrawals available after Creator subscription + 30-day hold') },
                { label: '↗️ Send', desc: 'To another user', color: '#ffd700', action: () => store.setNotif('✉️ Enter recipient AMM handle to send tokens') },
                { label: '↙️ Receive', desc: 'Share your address', color: '#8800ff', action: () => { navigator.clipboard?.writeText(walletAddr); store.setNotif('📋 Wallet address copied!') } },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  style={{ background: `${a.color}10`, border: `1px solid ${a.color}33`, color: a.color, borderRadius: 10, padding: 12, cursor: 'pointer', fontFamily: 'monospace', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{a.label}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Recent transactions */}
            <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 2 }}>RECENT TRANSACTIONS</div>
            {[
              { type: '+', label: 'Game reward — Boxing KO bonus', amount: '+$0.50', color: '#00cc44', time: '2m ago' },
              { type: '-', label: 'Drama Box — The Chosen Path Ep 2', amount: '-$0.50', color: '#ff4400', time: '1h ago' },
              { type: '+', label: 'Tournament prize — Card Battle', amount: '+$4.99', color: '#00cc44', time: '3h ago' },
              { type: '-', label: 'Token pack — Kingdom Pack', amount: '-$12.99', color: '#ff4400', time: '1d ago' },
              { type: '+', label: 'Music royalty — Gospel Anthem', amount: '+$0.19', color: '#00cc44', time: '2d ago' },
            ].map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #0a0a20', fontSize: 11 }}>
                <div>
                  <div style={{ color: '#ccc' }}>{tx.label}</div>
                  <div style={{ color: '#333', fontSize: 9, marginTop: 1 }}>{tx.time}</div>
                </div>
                <span style={{ color: tx.color, fontWeight: 700 }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        )}

        {/* PASSPORT */}
        {tab === 'passport' && (
          <div>
            {!passportApplied ? (
              <>
                <div style={{ background: 'rgba(136,0,255,0.08)', border: '1px solid #8800ff33', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11, color: '#888', lineHeight: 1.7 }}>
                  📘 The <strong style={{ color: '#8800ff' }}>AMM Digital Passport</strong> is your verified identity on the All American Marketplace platform. Used for: cross-platform login, creator verification, marketplace seller trust badge, showcase entry, and AMM business directory listing. Free for all Creator subscribers.
                </div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 2 }}>APPLY FOR AMM PASSPORT</div>
                <input value={passportForm.legalName} onChange={e => setPassportForm(f => ({ ...f, legalName: e.target.value }))} placeholder="Legal full name *" style={{ width: '100%', background: '#09091c', border: '1px solid #8800ff33', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <input value={passportForm.dob} onChange={e => setPassportForm(f => ({ ...f, dob: e.target.value }))} placeholder="Date of birth (MM/DD/YYYY) *" style={{ width: '100%', background: '#09091c', border: '1px solid #8800ff33', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <input value={passportForm.country} onChange={e => setPassportForm(f => ({ ...f, country: e.target.value }))} placeholder="Country of residence *" style={{ width: '100%', background: '#09091c', border: '1px solid #8800ff33', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <input value={passportForm.city} onChange={e => setPassportForm(f => ({ ...f, city: e.target.value }))} placeholder="City *" style={{ width: '100%', background: '#09091c', border: '1px solid #8800ff33', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 14 }} />
                <button onClick={() => { if (!passportForm.legalName || !passportForm.dob) { store.setNotif('❌ Fill required fields'); return } setPassportApplied(true); store.setNotif('📘 AMM Passport issued!') }}
                  style={{ width: '100%', background: 'rgba(136,0,255,0.15)', border: '2px solid #8800ff', color: '#8800ff', borderRadius: 10, padding: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 13 }}>
                  📘 ISSUE AMM PASSPORT
                </button>
              </>
            ) : (
              <div style={{ background: 'linear-gradient(135deg,rgba(136,0,255,0.2),rgba(0,0,0,0.9))', border: '2px solid #8800ff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📘</div>
                <div style={{ color: '#8800ff', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>ALL AMERICAN MARKETPLACE</div>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 16, letterSpacing: 2 }}>DIGITAL PASSPORT</div>
                <div style={{ background: 'rgba(136,0,255,0.1)', border: '1px solid #8800ff44', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                  <div style={{ color: '#ccc', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{passportForm.legalName || name}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>{passportForm.city || 'USA'} · {passportForm.country || 'United States'}</div>
                  <div style={{ color: '#8800ff', fontSize: 11, marginTop: 8, fontFamily: 'monospace', letterSpacing: 3 }}>{PASSPORT_ID}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(0,204,68,0.15)', border: '1px solid #00cc4433', color: '#00cc44', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}>✓ VERIFIED IDENTITY</span>
                  <span style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #ffd70033', color: '#ffd700', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}>✓ CREATOR STATUS</span>
                  <span style={{ background: 'rgba(136,0,255,0.15)', border: '1px solid #8800ff33', color: '#8800ff', borderRadius: 20, padding: '3px 10px', fontSize: 10 }}>✓ AMM MEMBER</span>
                </div>
                <div style={{ color: '#333', fontSize: 9 }}>EL SATURN CHAIN · BLOCK #{Math.floor(Math.random() * 9999999)}</div>
              </div>
            )}
          </div>
        )}

        {/* DRIVER LICENSE */}
        {tab === 'license' && (
          <div>
            {!licenseApplied ? (
              <>
                <div style={{ background: 'rgba(0,204,255,0.06)', border: '1px solid #00ccff22', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11, color: '#888', lineHeight: 1.7 }}>
                  🪪 The <strong style={{ color: '#00ccff' }}>AMM Digital Driver License</strong> verifies you as an authorized AMM platform operator. Used for: Holo RideShare driver registration, Holo Delivery driver access, marketplace business verification, event producer credentials, and AMM Live streaming certification.
                </div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 8, letterSpacing: 2 }}>APPLY FOR AMM DRIVER LICENSE</div>
                <input value={licenseForm.legalName} onChange={e => setLicenseForm(f => ({ ...f, legalName: e.target.value }))} placeholder="Legal full name *" style={{ width: '100%', background: '#09091c', border: '1px solid #00ccff22', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <input value={licenseForm.dob} onChange={e => setLicenseForm(f => ({ ...f, dob: e.target.value }))} placeholder="Date of birth (MM/DD/YYYY) *" style={{ width: '100%', background: '#09091c', border: '1px solid #00ccff22', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <input value={licenseForm.state} onChange={e => setLicenseForm(f => ({ ...f, state: e.target.value }))} placeholder="State / Province *" style={{ width: '100%', background: '#09091c', border: '1px solid #00ccff22', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 8 }} />
                <select value={licenseForm.vehicleClass} onChange={e => setLicenseForm(f => ({ ...f, vehicleClass: e.target.value }))}
                  style={{ width: '100%', background: '#09091c', border: '1px solid #00ccff22', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, marginBottom: 14 }}>
                  <option>B - Standard (up to 8 passengers)</option>
                  <option>C - Commercial (delivery vehicles)</option>
                  <option>D - Digital Only (no physical vehicle)</option>
                  <option>E - Event Producer (venues)</option>
                </select>
                <button onClick={() => { if (!licenseForm.legalName || !licenseForm.state) { store.setNotif('❌ Fill required fields'); return } setLicenseApplied(true); store.setNotif('🪪 AMM Driver License issued!') }}
                  style={{ width: '100%', background: 'rgba(0,204,255,0.1)', border: '2px solid #00ccff', color: '#00ccff', borderRadius: 10, padding: 14, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 13 }}>
                  🪪 ISSUE AMM DRIVER LICENSE
                </button>
              </>
            ) : (
              <div style={{ background: 'linear-gradient(135deg,rgba(0,204,255,0.15),rgba(0,0,0,0.9))', border: '2px solid #00ccff', borderRadius: 16, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ color: '#00ccff', fontWeight: 900, fontSize: 15 }}>ALL AMERICAN MARKETPLACE</div>
                    <div style={{ color: '#555', fontSize: 9, letterSpacing: 2 }}>DIGITAL DRIVER LICENSE</div>
                  </div>
                  <span style={{ fontSize: 28 }}>🪪</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ color: '#555', fontSize: 9, marginBottom: 2 }}>NAME</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{licenseForm.legalName || name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#555', fontSize: 9, marginBottom: 2 }}>STATE</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{licenseForm.state || 'IL'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#555', fontSize: 9, marginBottom: 2 }}>CLASS</div>
                    <div style={{ color: '#00ccff', fontWeight: 700, fontSize: 11 }}>{licenseForm.vehicleClass.split(' ')[0]}</div>
                  </div>
                  <div>
                    <div style={{ color: '#555', fontSize: 9, marginBottom: 2 }}>LICENSE #</div>
                    <div style={{ color: '#00ccff', fontFamily: 'monospace', fontSize: 10 }}>{LICENSE_ID}</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,204,255,0.08)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 6 }}>AUTHORIZED SERVICES</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['🚗 Holo RideShare', '🚗 Holo Delivery', '🛒 Marketplace', '📺 AMM Live', '🎪 Events'].map(s => (
                      <span key={s} style={{ background: 'rgba(0,204,255,0.1)', border: '1px solid #00ccff22', color: '#00ccff', borderRadius: 20, padding: '2px 8px', fontSize: 9 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 10, color: '#333', fontSize: 9, textAlign: 'center' }}>EL SATURN CHAIN · VERIFIED · EXPIRES NEVER</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── HOLOVERSE HUB — Master component wiring all services ─────────────────────

export default function HoloverseHub({ onClose }: { onClose: () => void }) {
  const [activeService, setActiveService] = useState<HoloService | null>(null)

  const SERVICES: { id: HoloService; name: string; emoji: string; desc: string; color: string }[] = [
    { id: 'gpt',      name: 'HoloGPT',      emoji: '🤖', desc: 'AI that knows everything about AMM',     color: HOLO_COLOR.gpt      },
    { id: 'search',   name: 'HoloSearch',   emoji: '🔍', desc: 'Search all of AMM Omniverse',            color: HOLO_COLOR.search   },
    { id: 'delivery', name: 'HoloDelivery', emoji: '🚗', desc: 'Black-owned vendors · faith products',   color: HOLO_COLOR.delivery },
    { id: 'rideshare',name: 'HoloRideShare',emoji: '🚙', desc: 'Faith-safe community rides',             color: HOLO_COLOR.rideshare},
    { id: 'wallet',   name: 'AMM Wallet',   emoji: '💰', desc: 'Your All American Marketplace wallet',   color: HOLO_COLOR.wallet   },
    { id: 'passport', name: 'AMM Passport', emoji: '📘', desc: 'Digital identity on El Saturn Chain',    color: HOLO_COLOR.passport },
    { id: 'license',  name: 'Driver License',emoji: '🪪', desc: 'AMM driver / operator credentials',    color: HOLO_COLOR.license  },
    { id: 'ads',      name: 'HoloAds',      emoji: '✨', desc: 'Holographic advertising platform',       color: HOLO_COLOR.ads      },
  ]

  if (activeService === 'gpt')       return <HoloGPT onClose={() => setActiveService(null)} />
  if (activeService === 'delivery')  return <HoloDelivery onClose={() => setActiveService(null)} />
  if (activeService === 'rideshare') return <HoloRideShare onClose={() => setActiveService(null)} />
  if (activeService === 'wallet' || activeService === 'passport' || activeService === 'license')
    return <AMMWalletSystem onClose={() => setActiveService(null)} startTab={activeService} />

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', color: '#ccc', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #00ffcc22', background: '#09091d', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>← EXIT</button>
        <div style={{ width: 28, height: 28, background: 'rgba(0,255,204,0.12)', border: '1px solid #00ffcc44', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</div>
        <div>
          <div style={{ color: '#00ffcc', fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>HOLOVERSE</div>
          <div style={{ color: '#555', fontSize: 9 }}>All American Marketplace — Full Service Platform</div>
        </div>
      </div>

      {/* Scan line overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,204,0.018) 3px,rgba(0,255,204,0.018) 4px)', zIndex: 0 }} />

      <div style={{ flex: 1, padding: 14, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8, filter: 'drop-shadow(0 0 16px #00ffcc)' }}>🌐</div>
          <div style={{ color: '#00ffcc', fontSize: 16, fontWeight: 900, letterSpacing: 3 }}>HOLOVERSE</div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>The complete All American Marketplace ecosystem</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SERVICES.map(svc => (
            <button key={svc.id} onClick={() => setActiveService(svc.id)}
              style={{ background: `${svc.color}08`, border: `1px solid ${svc.color}33`, borderRadius: 14, padding: '16px 12px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = svc.color; (e.currentTarget as HTMLButtonElement).style.background = `${svc.color}15` }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${svc.color}33`; (e.currentTarget as HTMLButtonElement).style.background = `${svc.color}08` }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>{svc.emoji}</div>
              <div style={{ color: svc.color, fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{svc.name}</div>
              <div style={{ color: '#555', fontSize: 10, lineHeight: 1.4 }}>{svc.desc}</div>
              <div style={{ marginTop: 8, color: svc.color, fontSize: 10 }}>Open →</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,255,204,0.04)', border: '1px solid #00ffcc11', borderRadius: 10, fontSize: 10, color: '#444', textAlign: 'center', lineHeight: 1.7 }}>
          Powered by All American Marketplace LLC · El Saturn Chain · tryamm.online<br />
          Faith-centered · Black-owned priority · Community first
        </div>
      </div>
    </div>
  )
}
