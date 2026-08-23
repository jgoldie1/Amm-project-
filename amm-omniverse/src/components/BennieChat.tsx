// AMM Omniverse — BENNIE AI
// Your personal AMM chatbot. Name: Bennie.
// Bennie knows the platform inside out and guides creators to success.

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

interface BennieMessage {
  id: number
  from: 'bennie' | 'user'
  text: string
  ts: number
  quick?: string[]  // quick reply suggestions
}

// ── BENNIE'S KNOWLEDGE BASE ───────────────────────────────────────────────────
const BENNIE_RESPONSES: Record<string, { text: string; quick?: string[] }> = {
  greeting: {
    text: "Hey! I'm Bennie — your All American Marketplace AI assistant! 🦁 I know everything about AMM Omniverse — from making money and music royalties to card battles, Drama Box, the Holoverse, and how to get your app on iPhone. What do you want to know?",
    quick: ['How do I make money?', 'Tell me about Drama Box', 'How to get on iPhone?', 'What games do you have?']
  },
  money: {
    text: "Six ways to make real money on AMM Omniverse:\n\n💰 1. Subscriptions — Pro $7.99/mo, Creator $14.99/mo. Every subscriber pays monthly, automatically.\n\n🎵 2. Music royalties — Upload tracks, earn $0.012–$0.018 per stream. You keep 90%.\n\n🎁 3. Live gifts — Stream live, fans send gifts up to $999.99 each. You keep 90%.\n\n🎬 4. Drama Box — Publish your own faith drama series. Fans unlock episodes for 50 tokens ($0.50). You keep 70%.\n\n🛒 5. Marketplace — Sell products, keep 90% of every sale.\n\n🏆 6. Tournaments — Win game competitions, earn prize pools.",
    quick: ['Tell me about Drama Box', 'How much do subscribers pay?', 'Music royalties details', 'What games have prizes?']
  },
  drama: {
    text: "AMM Drama Box is your faith short drama platform — like DramaBox but Black-owned and faith-centered! 🎬\n\nYou have 5 original series:\n• The Chosen Path (faith redemption — Chicago streets)\n• Sunday Best (church comedy)\n• Queen Esther ATL (biblical retelling in Atlanta)\n• The Fast (supernatural thriller)\n• First Love (teen faith romance)\n\nHow the money works: Fans pay 50 tokens ($0.50) per episode. You keep 70%. 1,000 fans × 10 episodes = $3,500 for ONE series.\n\nDrama Pass is $4.99/month — unlimited episodes for fans.",
    quick: ['How do I create my own series?', 'What is Drama Pass?', 'How much can I earn?', 'Tell me about the games']
  },
  games: {
    text: "AMM has 11 original playable games — nothing copies existing games! 🎮\n\n⚔️ Tactical Realms — original shooter, 6 weapons, 6 maps\n🏰 Hero Realms RPG — 5 hero classes, 8 spells, 5 towns\n🃏 Card Battle Arena — 100 original cards, Hebrew feast system\n🥊 Boxing V2 — 8 moves, combo chains\n🏀 Basketball V2 — rhythm shooting\n🏈 Football, 🏅 WNBA, 🥋 MMA, ⚾ Baseball\n⚡ AR Laser Tag — uses your real camera!\n🌍 Creature Capture — GPS-based, faith creatures\n\nWin tournaments for cash. Enter for $4.99, win up to 80% of the prize pool.",
    quick: ['Card Battle details', 'How do tournaments work?', 'Tell me about AR games', 'Take me to Holoverse']
  },
  holoverse: {
    text: "The Holoverse is your complete digital service ecosystem! 🌐\n\nHoloGPT — AI that knows everything about AMM (that's me, Bennie!)\nHoloSearch — search 28+ platform features instantly\nHoloMenu — holographic navigation overlay\nHoloAds — 4 ad types, $100–$500 per placement\nHoloDelivery — Black-owned vendor delivery platform\nHoloRideShare — 5 faith-verified drivers\nAMM Wallet — your digital balance and transactions\nAMM Passport — digital identity on El Saturn Chain\nAMM Driver License — operator credentials\n\nAccess it from the 🌐 button in the city!",
    quick: ['What is AMM Wallet?', 'How does HoloDelivery work?', 'Tell me about HoloAds', 'How do I make money?']
  },
  iphone: {
    text: "Three ways to get AMM Omniverse on iPhone: 📱\n\n✅ RIGHT NOW (free, no app store):\nOpen tryamm.online in Safari → tap Share ⎙ → tap 'Add to Home Screen' → done! Works offline, opens fullscreen.\n\n🍎 App Store (coming soon):\nCapacitor is already installed. Needs Mac + Xcode + $99/year Apple Developer account. Victor can add this after the backend.\n\n📲 Also works on:\n• Android — Chrome install button\n• Samsung — Samsung Internet install\n• Any browser — works in browser too",
    quick: ['Android install?', 'What is Capacitor?', 'Tell me about Samsung', 'How to deploy the website?']
  },
  pricing: {
    text: "Complete AMM pricing:\n\n📋 SUBSCRIPTIONS\nFree: $0 — 3 realms/day, 5 streams, 11 games\nPro: $7.99/mo — all 6 realms, 16 avatars, 50 uploads, 10 Drama unlocks\nCreator: $14.99/mo — unlimited everything, Spotify distribution, QVC studio, publish Drama series\nBattle Pass: $4.99/mo — all tournaments, card skins, ranked\nDrama Pass: $4.99/mo — unlimited episodes\n\n🪙 TOKEN PACKS (1 token = $0.01)\n$0.99 = 100 tokens\n$4.99 = 550 tokens\n$12.99 = 1,700 tokens ★ Best value\n$74.99 = 12,000 tokens\n$174.99 = 32,000 tokens",
    quick: ['How does Pro save me money?', 'What are tokens for?', 'Tell me about Creator tier', 'What is a Drama Pass?']
  },
  recording: {
    text: "AMM Recording Studio is built right into the platform! 🎵\n\nWhat you have:\n• 62-track DAW layout\n• Mic recording via browser (Web Audio API)\n• Guitar Lab effects chain (Clean Gospel, Trap Guitar, Afrobeat, Worship)\n• Podcast recording with auto transcription\n• Download your takes as .webm\n• Upload to Music Realm for streaming + royalties\n• Music distribution to Spotify, Apple, Amazon, YouTube, Tidal, Deezer\n\nGo to: Music Realm → Podcast tab to access recording!\n\nAfter Victor deploys: tracks save to Supabase, real DAW plug-ins connect, audio stores to cloud.",
    quick: ['Music royalties rates', 'How to distribute music?', 'Tell me about podcast', 'How do I go live?']
  },
  podcast: {
    text: "AMM Faith Podcast Studio 🎙️\n\nYou have 3 streaming/podcast room types:\n• 🎤 Music Stage — holographic live performance\n• 🎙 Faith Podcast — teaching, sermons, Q&A, interviews\n• ⚡ Debate Room — moderated faith discussions\n\nHow to access:\nMusic Realm → PODCAST tab → choose your room type → GO LIVE\n\nEarn from podcasts:\n• Fans send gifts during live episodes (you keep 90%)\n• Sell podcast episodes as Drama Box entries\n• Subscribers get early access\n• Ads in holographic format ($100–$500 per slot)\n\nAfter LiveKit ($75 add-on): real audio streams to real listeners.",
    quick: ['How to go live?', 'Tell me about gifts', 'What is LiveKit?', 'Music royalties?']
  },
  streaming: {
    text: "AMM Live Streaming works NOW in demo mode, and fully with LiveKit! 📡\n\nGo to: Music Realm → LIVE tab → choose room → GO LIVE (Host)\n\nDemo mode: simulates participants, shows waveform, chat works\nWith LiveKit ($75 add-on to Victor's scope): real camera, real audio, real viewers\n\nHow creators earn during streams:\n• Fans send 18 faith gifts (Holy Cross free → Messiah's Return $999.99)\n• You keep 90% of every gift\n• PK battles — two streamers compete, fans vote with gifts\n• QVC live selling — sell products live\n• Go on BIGO: share your AMM stream link, redirect to AMM\n• TikTok: post stream highlights, drive to tryamm.online",
    quick: ['Gift economy details', 'PK battle rules', 'QVC selling?', 'How to share to TikTok?']
  },
  lion: {
    text: "The Lion of Judah — AI Stubbs — is AMM's brand symbol! 🦁\n\nThe holographic SVG is built and shows:\n• The lion with American flag face (stars & stripes)\n• Gold crown with cross — JUDAH text\n• The lamb resting below the lion\n• 6 platform labels: All American Marketplace, Quantum Beat Music, AI TV Holographic, Creators/Businesses/Community, Global Commerce Freedom, Powered by Faith Family & Freedom\n• AI STUBBS — THE LION OF JUDAH\n\nUse it as: TikTok background, BIGO Live overlay, app wallpaper, loading screen, share card\n\nAccess: Sports Realm → Holo Watermark → Share Card mode",
    quick: ['How to use as TikTok background?', 'What is Quantum Beat?', 'Tell me about AI Stubbs', 'Show me the games']
  },
  deploy: {
    text: "Deploy AMM Omniverse in 3 steps:\n\n1️⃣ RIGHT NOW (15 min):\nnpm run build → drag dist/ to Vercel\nFree forever, live at tryamm.online\n\n2️⃣ AFTER VICTOR ($400, 1-2 weeks):\nReal Google login, real Stripe payments, real data saves\nVictor runs the 838-line handoff script\n\n3️⃣ APP STORES ($124/year):\nGoogle Play $25 one-time\nApple App Store $99/year\nSamsung Galaxy Store free\n\nTotal to have everything live on all platforms: $524",
    quick: ['What does Victor do?', 'How much is Google Play?', 'iPhone deploy steps', 'What is in the $400?']
  },
  victor: {
    text: "Victor is the backend developer who deploys AMM for $400 flat!\n\nVictor's script (VICTOR_FINAL_HANDOFF.sh) is 838 lines of pre-written backend code. His job is run it and deploy — not write new code.\n\nVictor wires:\n✅ Real Google login (Supabase Auth)\n✅ Subscriptions $7.99/$14.99 charging real cards (Stripe)\n✅ Token packs $0.99–$174.99 charging real cards\n✅ Drama Box episode unlocks deducting real tokens\n✅ Player data saves between sessions\n✅ Music royalties counted and accumulated\n✅ Business directory stores real listings\n✅ Discord auto-posts game events\n✅ 25+ API routes — all pre-written\n\nSend Victor: Supabase URL + keys, Stripe keys, LiveKit keys, Discord webhook",
    quick: ['What keys does Victor need?', 'How long does Victor take?', 'What is the $400 scope?', 'Deploy steps?']
  },
  wallet: {
    text: "AMM Wallet is your complete digital identity! 💰\n\nAMM Wallet — stores AMM tokens, shows balance in USD ($), transaction history, send/receive tokens\n\nAMM Passport — digital identity on El Saturn Chain. Issue with your name and get AMMP-######## ID. Used for marketplace trust, showcase entry, cross-platform login.\n\nAMM Driver License — AMML-######## ID. Authorizes you for HoloRideShare, HoloDelivery, AMM Live, event production.\n\nAccess: Holoverse → AMM Wallet / Passport / License",
    quick: ['What is El Saturn Chain?', 'How to get a Passport?', 'Tell me about HoloDelivery', 'Holoverse full list']
  },
}

function getBennieResponse(input: string): { text: string; quick?: string[] } {
  const q = input.toLowerCase().trim()
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('start')) return BENNIE_RESPONSES.greeting
  if (q.includes('money') || q.includes('earn') || q.includes('revenue') || q.includes('income') || q.includes('how much')) return BENNIE_RESPONSES.money
  if (q.includes('drama') || q.includes('episode') || q.includes('series') || q.includes('short film')) return BENNIE_RESPONSES.drama
  if (q.includes('game') || q.includes('card') || q.includes('tactical') || q.includes('hero') || q.includes('boxing') || q.includes('tournament')) return BENNIE_RESPONSES.games
  if (q.includes('holoverse') || q.includes('holo') || q.includes('delivery') || q.includes('rideshare') || q.includes('search')) return BENNIE_RESPONSES.holoverse
  if (q.includes('iphone') || q.includes('ios') || q.includes('apple') || q.includes('app store')) return BENNIE_RESPONSES.iphone
  if (q.includes('price') || q.includes('cost') || q.includes('token') || q.includes('subscri') || q.includes('cheap') || q.includes('afford')) return BENNIE_RESPONSES.pricing
  if (q.includes('record') || q.includes('studio') || q.includes('daw') || q.includes('plugin') || q.includes('ableton') || q.includes('protools') || q.includes('guitar')) return BENNIE_RESPONSES.recording
  if (q.includes('podcast') || q.includes('sermon') || q.includes('teaching') || q.includes('interview')) return BENNIE_RESPONSES.podcast
  if (q.includes('stream') || q.includes('live') || q.includes('bigo') || q.includes('broadcast')) return BENNIE_RESPONSES.streaming
  if (q.includes('lion') || q.includes('judah') || q.includes('stubbs') || q.includes('lamb') || q.includes('image') || q.includes('logo') || q.includes('wallpaper')) return BENNIE_RESPONSES.lion
  if (q.includes('deploy') || q.includes('vercel') || q.includes('launch') || q.includes('go live')) return BENNIE_RESPONSES.deploy
  if (q.includes('victor') || q.includes('backend') || q.includes('stripe') || q.includes('supabase') || q.includes('400')) return BENNIE_RESPONSES.victor
  if (q.includes('wallet') || q.includes('passport') || q.includes('license') || q.includes('identity')) return BENNIE_RESPONSES.wallet
  if (q.includes('android') || q.includes('samsung') || q.includes('phone') || q.includes('mobile') || q.includes('pwa')) return BENNIE_RESPONSES.iphone

  return {
    text: `Great question about "${input}"! Let me tell you what I know best about AMM Omniverse. The platform has 11 games, Drama Box faith dramas, live streaming with 18 gifts, music royalties at 90% creator cut, the Holoverse with HoloGPT/Delivery/RideShare/Wallet, and the Lion of Judah — AI Stubbs — as our brand. What specifically do you want to explore?`,
    quick: ['How do I make money?', 'Tell me about games', 'Drama Box details', 'Pricing breakdown']
  }
}

// ── BENNIE CHAT COMPONENT ─────────────────────────────────────────────────────
export default function BennieChat({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [messages, setMessages] = useState<BennieMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [msgId, setMsgId] = useState(2)
  const bottomRef = useRef<HTMLDivElement>(null)
  const apiUrl = (import.meta as any).env?.VITE_API_URL ?? ''

  useEffect(() => {
    const welcome = BENNIE_RESPONSES.greeting
    setMessages([{
      id: 1,
      from: 'bennie',
      text: welcome.text,
      ts: Date.now(),
      quick: welcome.quick,
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: BennieMessage = { id: msgId, from: 'user', text: text.trim(), ts: Date.now() }
    setMessages(m => [...m, userMsg])
    setMsgId(id => id + 2)
    setInput('')
    setTyping(true)

    // Try real API first
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/ai/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text, mode: 'hybrid' }),
        })
        const data = await res.json()
        if (data.answer) {
          setTyping(false)
          setMessages(m => [...m, { id: msgId + 1, from: 'bennie', text: data.answer, ts: Date.now() }])
          return
        }
      } catch { /* fall through to local */ }
    }

    // Local knowledge base
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400))
    const response = getBennieResponse(text)
    setTyping(false)
    setMessages(m => [...m, {
      id: msgId + 1,
      from: 'bennie',
      text: response.text,
      ts: Date.now(),
      quick: response.quick,
    }])
  }, [msgId, apiUrl])

  const QUICK_STARTERS = [
    'How do I make money?', 'Tell me about Drama Box', 'Games available?',
    'Pricing breakdown', 'Podcast & streaming', 'Get on iPhone',
    'Lion of Judah branding', 'What is Holoverse?'
  ]

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #ffd70033', background: 'linear-gradient(135deg,#0a0600,#1a0800)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>←</button>
        {/* Bennie avatar — stylized lion */}
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#ffd700,#b8860b)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 12px rgba(255,215,0,0.5)' }}>🦁</div>
        <div>
          <div style={{ color: '#ffd700', fontWeight: 900, fontSize: 14 }}>BENNIE</div>
          <div style={{ color: '#555', fontSize: 9 }}>AMM AI Assistant · Powered by All American Marketplace</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00cc44', boxShadow: '0 0 6px #00cc44' }}/>
          <span style={{ color: '#00cc44', fontSize: 10 }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {messages.map(msg => (
          <div key={msg.id}>
            <div style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              {msg.from === 'bennie' && (
                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#ffd700,#b8860b)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2, boxShadow: '0 0 8px rgba(255,215,0,0.4)' }}>🦁</div>
              )}
              <div style={{ background: msg.from === 'user' ? 'rgba(0,255,204,0.12)' : 'rgba(255,215,0,0.06)', border: `1px solid ${msg.from === 'user' ? '#00ffcc44' : '#ffd70033'}`, borderRadius: 12, padding: '8px 12px', maxWidth: '82%', fontSize: 12, color: msg.from === 'user' ? '#00ffcc' : '#ccc', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            </div>
            {/* Quick replies */}
            {msg.from === 'bennie' && msg.quick && (
              <div style={{ marginBottom: 10, marginLeft: 36, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {msg.quick.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid #ffd70033', color: '#ffd700', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10 }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#ffd700,#b8860b)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🦁</div>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid #ffd70033', borderRadius: 12, padding: '10px 14px', color: '#ffd700', fontSize: 16, letterSpacing: 4 }}>···</div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick start buttons (only when few messages) */}
      {messages.length <= 2 && (
        <div style={{ padding: '6px 12px', borderTop: '1px solid #1a1a0a', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {QUICK_STARTERS.slice(0, 4).map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid #ffd70022', color: '#888', borderRadius: 20, padding: '3px 9px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 9 }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1a0a', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask Bennie anything about AMM Omniverse..."
          style={{ flex: 1, background: '#09091c', border: '1px solid #ffd70033', color: '#ccc', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, outline: 'none' }}
        />
        <button onClick={() => sendMessage(input)}
          style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #ffd700', color: '#ffd700', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>
          →
        </button>
      </div>
    </div>
  )
}
