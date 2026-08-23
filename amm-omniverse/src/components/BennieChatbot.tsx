// BENNIE — AMM Omniverse Named AI Chatbot
// The official AMM chatbot with personality, knowledge, and faith-centered guidance
// Used on: app homepage, TikTok BIGO Live integration, web header, onboarding
// NOT Chapelle (city companion) — Bennie is the platform-wide assistant

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── BENNIE'S PERSONALITY ──────────────────────────────────────────────────────

const BENNIE_NAME = 'Bennie'
const BENNIE_TITLE = 'AMM AI Assistant'
const BENNIE_EMOJI = '🦁'  // Lion of Judah — matches the image
const BENNIE_COLOR = '#ffd700'

const BENNIE_GREETINGS = [
  `${BENNIE_EMOJI} Hey! I'm Bennie, your All American Marketplace assistant. What can I help you with today?`,
  `${BENNIE_EMOJI} Welcome to AMM Omniverse! I'm Bennie — ask me anything about the platform, games, music, or how to earn money here.`,
  `${BENNIE_EMOJI} Shalom! I'm Bennie from All American Marketplace. Ready to help you build your creator business. What do you need?`,
]

// ── BENNIE'S KNOWLEDGE BASE ───────────────────────────────────────────────────

const BENNIE_KB: Record<string, string> = {
  // Identity
  'who are you': `I'm Bennie, the official AI assistant for AMM Omniverse — All American Marketplace. I'm here to help creators, businesses, gamers, and faith community members get the most out of the platform. Named after the All American spirit — faith, family, freedom, and legacy. 🦁`,
  'bennie': `That's me! Bennie — AMM's AI assistant. Named to represent the All American spirit. I'm powered by a knowledge base about everything on the platform, and when the backend is connected I upgrade to full Claude AI responses. How can I help?`,
  'what is amm': `AMM Omniverse is a faith-centered creator economy metaverse built by All American Marketplace LLC out of Cary, IL. King James founded it to give creators, Black-owned businesses, and faith communities a platform where they keep 90% of what they earn. We have: 11 games, Drama Box short films, Holoverse services, live streaming, music distribution, card battles, and a 3D open world city.`,
  // Pricing
  'price': `Here's the full AMM pricing:\n\n🆓 Free — $0. 3 realm visits, 5 streams, 11 games.\n⭐ AMM Pro — $7.99/month or $79.90/year. All 6 realms, all 16 avatars, 50 uploads, 10 Drama unlocks.\n🎬 Creator — $14.99/month or $149.90/year. Unlimited everything + Spotify distribution + QVC studio + Drama publishing.\n⚔️ Battle Pass — $4.99/month add-on. All tournaments, card skins.\n🎭 Drama Pass — $4.99/month add-on. Unlimited Drama Box episodes.`,
  'how to make money': `6 ways to earn on AMM:\n\n1️⃣ Subscriptions — $7.99–$14.99/month per subscriber, auto-renewing\n2️⃣ Marketplace — Sell products, keep 90%\n3️⃣ Live Gifts — Stream and fans send gifts, keep 90%. Top gift is Messiah's Return at $999.99\n4️⃣ Drama Box — Publish episodes, fans unlock for 50 tokens, you keep 70%\n5️⃣ Music Royalties — $0.012–$0.018/stream, you keep 90%\n6️⃣ Tournaments — Win prize pools across 11 games\n\nOne Creator subscriber = $14.99/month in your bank account automatically every month.`,
  // Games
  'game': `AMM has 11 original games — none copy existing titles:\n\n⚔️ Tactical Realms (original shooter)\n🏰 Hero Realms RPG (5 classes, 8 spells)\n🥊 Boxing V2 (10 combo chains)\n🃏 Card Battle Arena (100 original cards)\n🏀 Basketball V2 (rhythm shooting)\n🏈 Football\n🏅 WNBA W League\n🥋 MMA + Baseball\n⚡ AR Laser Tag (real camera)\n🌍 Creature Capture (GPS)\n🌐 Platform Command Center`,
  // Holoverse
  'holoverse': `The Holoverse is AMM's full digital services ecosystem:\n\n🤖 HoloGPT — AI assistant (that's me!)\n🔍 HoloSearch — Search all of AMM\n📡 HoloDelivery — Black-owned vendor delivery\n🚗 HoloRideShare — Faith-verified community rides\n💰 AMM Wallet — Your digital wallet\n📘 AMM Passport — Digital identity\n🪪 Driver License — Platform credentials\n✨ HoloAds — Holographic advertising`,
  'hologpt': `HoloGPT is me — Bennie! I'm the AI powering HoloGPT in the Holoverse. When connected to the backend I use Claude (claude-sonnet-4-6). Without backend I use my built-in knowledge base covering everything about AMM. Ask me anything!`,
  // Drama Box
  'drama': `AMM Drama Box is our faith short drama platform (competing with DramaBox and Webtoon):\n\n🕊️ The Chosen Path — Faith drama, Chicago, 24 episodes\n😂 Sunday Best — Church comedy, 20 episodes (complete)\n👑 Queen Esther ATL — Biblical retelling, modern Atlanta\n⚡ The Fast — Supernatural thriller, 21 days of fasting\n💜 First Love — Teen faith drama, 18 episodes\n\nUnlock episodes for 50 tokens ($0.50). Create your own series — you keep 70%.`,
  // Music
  'music': `Set Apart Music Network — AMM's streaming platform:\n\n🎵 Upload your tracks (Pro: 50/month, Creator: unlimited)\n💰 Earn $0.012–$0.018/stream (3–6× Spotify rates)\n🌍 Distribute to Spotify, Apple Music, Amazon, YouTube, Tidal, Deezer — FREE\n📊 You keep 90% of all royalties\n🎙 Podcast studio (Creator tier)\n\nMonthly payout on the 1st.`,
  // Deploy
  'deploy': `Here's how to launch AMM Omniverse:\n\n1. Run: npm run build in amm-omniverse folder\n2. Upload dist/ to Vercel (free, 15 minutes)\n3. Create Stripe + Supabase accounts (free)\n4. Send Victor the handoff script + $400\n5. Victor deploys backend in 1–2 weeks\n6. Real payments activate\n\nYou can deploy the frontend TODAY for $0. tryamm.online goes live immediately.`,
  // Gen X
  'gen x': `Gen X (born 1965–1980) is a major target for AMM! Here's why they belong:\n\n✊ They grew up with American values, faith, and family\n📺 They watched Saturday morning cartoons — card games and battles resonate\n💰 They have more disposable income than Millennials or Gen Z\n🎵 They're huge music fans — gospel, R&B, hip-hop history\n🏈 They love sports — AMM has 9 sports games\n📱 They use Facebook, YouTube, and increasingly TikTok\n\nAMM speaks to ALL generations: Gen X, Millennials, Gen Z, Gen Alpha, and Baby Boomers. Faith crosses every generation.`,
  'generation': `AMM targets all generations:\n\n👴 Baby Boomers (1946–64) — Faith, church streams, Drama Box\n✊ Gen X (1965–80) — Sports, marketplace, music, card games\n🎵 Millennials (1981–96) — Creator economy, live streaming, gaming\n⚡ Gen Z (1997–2012) — AR games, card battles, short drama, TikTok sharing\n🌟 Gen Alpha (2013+) — Creature Capture, hero RPG, AR\n\nEvery feature serves multiple generations. That's the All American part.`,
  // App stores
  'play store': `AMM Play Store — the All American Marketplace developer ecosystem:\n\n📦 Submit your app/game to the AMM platform\n💰 Revenue share: 70% developer, 30% AMM\n🔐 AMM Dev Package — SDK to add AMM tokens, AMM login, marketplace checkout\n🌐 Apps appear in AMM Omniverse Blockchain Realm app store\n📱 Also on Google Play (com.tryamm.omniverse) — $25 one-time\n🍎 Also on Apple App Store — $99/year\n\nDevelopers can build on top of AMM the same way they build on Apple App Store or Google Play.`,
  'google pay': `Google Pay is integrated in AMM payments:\n\n💳 One-tap checkout for subscriptions\n📱 Available on Android during onboarding\n🔗 Works with Apple Pay on iPhone\n💰 Faster checkout than entering card details\n🔒 Tokenized — AMM never sees your real card number\n\nActivates when Victor wires the Stripe backend (Google Pay works through Stripe — zero extra code).`,
  // Lion / Image
  'lion of judah': `The Lion of Judah is AMM's spiritual foundation and brand symbol:\n\n🦁 Lion of Judah = Yeshua/Jesus as King, the conquering Lion\n🐑 The Lamb = sacrifice, redemption, peace\n🇺🇸 American flag overlay = faith + patriotism + All American\n👑 Crown = royalty, authority, the Kingdom\n⚔️ Battle scars = spiritual warfare, overcoming\n🌟 Holographic gold glow = El Saturn Chain, divine light\n\nThat image (AI Stubbs — The Lion of Judah) represents everything AMM stands for: Faith, Family, Talent, Legacy.`,
  'stubbs': `AI Stubbs is the vision character for AMM — The Lion of Judah. That imagery represents the platform's spiritual foundation. The Lion is crowned, scarred from battle, with an American flag overlay and a lamb at its feet — symbolizing strength through faith, American identity, and peace. It's the brand soul of All American Marketplace.`,
}

function getBennieResponse(input: string): string {
  const q = input.toLowerCase().trim()

  // Direct KB lookup
  for (const [key, answer] of Object.entries(BENNIE_KB)) {
    if (q.includes(key)) return answer
  }

  // Fuzzy matching
  if (q.includes('earn') || q.includes('revenue') || q.includes('income') || q.includes('pay me')) return BENNIE_KB['how to make money']
  if (q.includes('cost') || q.includes('tier') || q.includes('plan') || q.includes('subscri') || q.includes('how much')) return BENNIE_KB['price']
  if (q.includes('stream') || q.includes('live') || q.includes('bigo') || q.includes('tiktok')) return `AMM has a full Bigo Live-style streaming platform:\n\n📡 Go to Faith Realm → Go Live\n🎁 18 faith gifts from free Amen up to $999.99 Messiah's Return\n⚔️ PK battles between streamers\n💰 You keep 90% of all gifts\n👥 Real LiveKit video when backend is connected\n\nFor TikTok and BIGO Live sharing, use AMM's Global Share system — 9 regions, 70+ platforms. Your stream can be shared to TikTok, Clapper, BIGO, Instagram, WhatsApp, LINE, and 60+ more.`
  if (q.includes('token') || q.includes('coin')) return `AMM Tokens: 1 token = $0.01\n\n🪙 Starter Pack: 100 tokens = $0.99\n🪙 Creator Pack: 550 tokens = $4.99\n🪙 Kingdom Pack: 1,700 tokens = $12.99 ★ Best value\n🪙 Prophet Pack: 5,750 = $39.99\n🪙 King Pack: 12,000 = $74.99\n🪙 Omniverse Pack: 32,000 = $174.99\n\nUse tokens for: Drama episodes (50 tokens), gifts, card packs, tournaments, marketplace boosts.`
  if (q.includes('card') || q.includes('duel') || q.includes('battle')) return BENNIE_KB['game']
  if (q.includes('wallet') || q.includes('passport') || q.includes('license')) return BENNIE_KB['holoverse']
  if (q.includes('africa') || q.includes('nigeria') || q.includes('ghana') || q.includes('kenya')) return `AMM is built for global reach including Africa:\n\n🌍 West Africa: WhatsApp, Facebook, Audiomack, Boomplay, TikTok\n🌍 East Africa: Mdundo, WhatsApp, YouTube, Opera News\n🇿🇦 South Africa: Moya, Ayoba, WhatsApp\n🌍 North Africa: WhatsApp, Facebook, Instagram\n\nGospel, Afrobeats, and faith content travel well across African markets. Boomplay and Audiomack are huge for music discovery. AMM's 90% royalty rate beats every African streaming platform.`
  if (q.includes('android') || q.includes('iphone') || q.includes('samsung') || q.includes('app')) return `AMM is available everywhere:\n\n📱 PWA — Add to Home Screen RIGHT NOW (works on all phones)\n🤖 Android/Samsung — npx cap add android → Google Play ($25 one-time)\n🍎 iPhone/iPad — npx cap add ios → App Store ($99/year)\n📲 Samsung Galaxy Store — same APK, free submission\n\nCapacitor is already installed. All permissions configured (camera, GPS, motion, push notifications). One command builds the native app.`
  if (q.includes('victor') || q.includes('backend') || q.includes('deploy')) return BENNIE_KB['deploy']
  if (q.includes('gen x') || q.includes('generation x') || q.includes('genx')) return BENNIE_KB['gen x']
  if (q.includes('baby boomer') || q.includes('millennial') || q.includes('gen z') || q.includes('generation')) return BENNIE_KB['generation']
  if (q.includes('watermark')) return `AMM has a 4-mode holographic watermark:\n\n◈ Corner — always-on subtle pulse on every screen\n⟋ Diagonal — screenshot protection (repeating "AMM OMNIVERSE · tryamm.online · © 2026")\n✦ Animated — scan lines + floating text for live streams and video\n🖼 Share Card — generate a 1200×630px branded PNG for social posts\n\nAccess it: Sports Realm → ◈ Holo Watermark`
  if (q.includes('share') || q.includes('tiktok') || q.includes('viral')) return `AMM Global Share System:\n\n🌍 9 regions, 70+ platforms\n📊 Track every click — which platform, which country, which day\n📱 QR codes for flyers, events, print\n🌐 Translate your share text to 12 languages\n🎯 Campaign templates with auto-generated captions + hashtags\n\nShort URL format: tryamm.online/s/abc12345\nAccess: Sports Realm → 🌍 Global Share Links`
  if (q.includes('help') || q.includes('what can you')) return `Here's what I can help you with, ${BENNIE_EMOJI}:\n\n• How to make money on AMM\n• Pricing and subscription tiers\n• All 11 games explained\n• Holoverse services\n• Drama Box series\n• Music streaming + royalties\n• How to deploy the platform\n• Mobile app (Android/iPhone/Samsung)\n• Share links and analytics\n• Gen X and all generation targeting\n• Bennie's identity and purpose\n• Lion of Judah symbolism\n\nJust ask!`

  return `${BENNIE_EMOJI} Great question! I'm still learning about "${input}". Try asking about: pricing, games, Holoverse, Drama Box, music royalties, how to make money, Gen X targeting, mobile apps, or the Lion of Judah. I'm Bennie — the AMM AI assistant, here to serve the All American Marketplace community.`
}

// ── BENNIE CHAT COMPONENT ─────────────────────────────────────────────────────

interface BennieMessage {
  id: number
  from: 'bennie' | 'user'
  text: string
  ts: number
}

interface BennieProps {
  onClose?: () => void
  embedded?: boolean    // true = inline on homepage, false = floating overlay
  showOnHomepage?: boolean
}

export function BennieChatbot({ onClose, embedded = false, showOnHomepage = false }: BennieProps) {
  const store = useGameStore()
  const [msgs, setMsgs] = useState<BennieMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [idN, setIdN] = useState(2)
  const bottomRef = useRef<HTMLDivElement>(null)
  const apiUrl = (import.meta as any).env?.VITE_API_URL ?? ''

  const QUICK = [
    'How do I make money?',
    'What does Pro cost?',
    'Tell me about the games',
    'What is the Holoverse?',
    'Gen X on AMM?',
    'How do I deploy?',
  ]

  useEffect(() => {
    const greeting = BENNIE_GREETINGS[Math.floor(Math.random() * BENNIE_GREETINGS.length)]
    setMsgs([{ id: 1, from: 'bennie', text: greeting, ts: Date.now() }])
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = useCallback(async (q?: string) => {
    const question = (q ?? input).trim()
    if (!question) return
    setInput('')

    const userMsg: BennieMessage = { id: idN, from: 'user', text: question, ts: Date.now() }
    setMsgs(m => [...m, userMsg])
    setIdN(n => n + 2)
    setTyping(true)

    // Try real API first
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/ai/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, mode: 'hybrid', bot: 'bennie' }),
        })
        const data = await res.json()
        setTyping(false)
        setMsgs(m => [...m, { id: idN + 1, from: 'bennie', text: data.answer || getBennieResponse(question), ts: Date.now() }])
        return
      } catch { /* fall through */ }
    }

    // Local knowledge
    setTimeout(() => {
      setTyping(false)
      setMsgs(m => [...m, { id: idN + 1, from: 'bennie', text: getBennieResponse(question), ts: Date.now() }])
    }, 500 + Math.random() * 400)
  }, [input, idN, apiUrl])

  const containerStyle: React.CSSProperties = embedded ? {
    width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column',
  } : {
    position: 'fixed', bottom: 80, right: 16, width: 320, height: 480, background: 'rgba(2,2,18,0.97)', border: '1px solid #ffd70066', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 9990, backdropFilter: 'blur(12px)', boxShadow: '0 0 30px rgba(255,215,0,0.2)',
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #ffd70033', background: 'linear-gradient(90deg,rgba(255,215,0,0.15),rgba(136,0,255,0.08))', display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Lion of Judah mini icon */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#020212', border: '2px solid #ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 0 8px #ffd70066' }}>
          {BENNIE_EMOJI}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: BENNIE_COLOR, fontWeight: 900, fontSize: 13 }}>{BENNIE_NAME}</div>
          <div style={{ color: '#555', fontSize: 9 }}>{BENNIE_TITLE} · AMM Omniverse</div>
        </div>
        {/* Online dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00cc44', boxShadow: '0 0 6px #00cc44' }} />
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}>✕</button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {msgs.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            {msg.from === 'bennie' && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0a0a20', border: `1px solid ${BENNIE_COLOR}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 6, marginTop: 2 }}>
                {BENNIE_EMOJI}
              </div>
            )}
            <div style={{ background: msg.from === 'user' ? 'rgba(255,215,0,0.12)' : 'rgba(17,17,42,0.95)', border: `1px solid ${msg.from === 'user' ? '#ffd70044' : '#1a1a3e'}`, borderRadius: 10, padding: '7px 10px', maxWidth: '82%', fontSize: 11, color: msg.from === 'user' ? BENNIE_COLOR : '#ccc', fontFamily: 'monospace', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0a0a20', border: `1px solid ${BENNIE_COLOR}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{BENNIE_EMOJI}</div>
            <div style={{ background: 'rgba(17,17,42,0.95)', border: '1px solid #1a1a3e', borderRadius: 10, padding: '8px 14px', color: BENNIE_COLOR, fontSize: 14, letterSpacing: 4 }}>···</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '5px 8px', borderTop: '1px solid #0a0a20', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid #ffd70022', color: BENNIE_COLOR, borderRadius: 20, padding: '3px 8px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 9 }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid #1a1a3e', display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={`Ask ${BENNIE_NAME} anything...`}
          style={{ flex: 1, background: '#09091c', border: `1px solid ${BENNIE_COLOR}33`, color: '#ccc', borderRadius: 8, padding: '8px 11px', fontFamily: 'monospace', fontSize: 11, outline: 'none' }}
        />
        <button onClick={() => send()}
          style={{ background: `rgba(255,215,0,0.15)`, border: `1px solid ${BENNIE_COLOR}`, color: BENNIE_COLOR, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>
          →
        </button>
      </div>
    </div>
  )
}

// ── BENNIE FLOATING BUTTON (shows on all pages) ───────────────────────────────

export function BennieButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && <BennieChatbot onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: 20, right: 16, width: 52, height: 52, borderRadius: '50%', background: open ? 'rgba(255,215,0,0.3)' : 'rgba(255,215,0,0.15)', border: `2px solid #ffd700`, cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9989, boxShadow: '0 0 20px rgba(255,215,0,0.3)', backdropFilter: 'blur(8px)', transition: 'all .2s' }}
        title="Chat with Bennie — AMM AI Assistant"
      >
        🦁
      </button>
    </>
  )
}

export default BennieChatbot
