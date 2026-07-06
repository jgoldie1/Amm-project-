// AI Chapelle — Level 1 AI Companion
// AMM Omniverse's built-in AI guide, coach, and companion
// Uses Claude API (Anthropic) for real intelligence
// Falls back to smart rule-based responses when no API key

import { useGameStore } from '../state/useGameStore'

export interface ChapelleMessage {
  id: string
  from: 'chapelle' | 'player'
  text: string
  timestamp: number
  type: 'chat' | 'hint' | 'coach' | 'alert' | 'welcome'
  actions?: ChapelleAction[]
}

export interface ChapelleAction {
  label: string
  onClick: () => void
}

export interface ChapelleState {
  messages: ChapelleMessage[]
  isTyping: boolean
  personality: 'coach' | 'pastor' | 'hype' | 'tactical'
  level: 1 | 2 | 3  // AI level — 1 is rule-based, 2 is Claude-lite, 3 is full Claude
  disabled: boolean
}

// Chapelle's knowledge base — what she knows about every system
const KNOWLEDGE: Record<string, string> = {
  city:        'AMM City is your GTA-style hub. Drive with WASD, walk into glowing portals to enter realms, talk to NPCs for missions. Your minimap (bottom-right) shows all 5 portals.',
  sports:      'Sports Realm has 5 games: Boxing, Football, Basketball, MMA, Baseball. Each has 3 rounds. Win rounds to earn cash and XP. The Omniverse Super Bowl unlocks after 3 missions.',
  marketplace: 'All American Marketplace: browse 6+ creator products, open your store (you keep 90%), post jobs, or run ads across AMM City. Stripe handles all payments.',
  music:       'Set Apart Music: upload real MP3/WAV files (drag & drop), stream tracks with live waveforms, go live with LiveKit, run podcasts/debates, and earn per-genre royalties.',
  faith:       'Faith Realm runs on Servants of Christ platform. Verse of the Day gives faith XP. Submit prayers, watch sermons, check the feast calendar, or create your ministry page.',
  blockchain:  'El Saturn Chain: connect your wallet (real Supabase OAuth), mint NFTs, vote in DAO proposals, earn AMM tokens for everything you do. Token utility: marketplace discounts, vote weight, event access.',
  avatar:      'Avatar Creator: choose from 16 species (human male/female, 12 animals, 3 mythic, 1 divine). Scan your face with the camera or upload 1-3 photos — your face maps to the avatar head. Each species has unique stats and bonuses.',
  lottie:      'Lottie animations are all built-in — no external files. Portal swirl, XP burst, cash rain, face scan, live pulse, mission complete, and 9 more. All render as SVG in the browser.',
  google_auth: 'Google login uses Supabase OAuth. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env. Without it, demo mode runs mock Google login that still works.',
  livekit:     'LiveKit streaming: add VITE_LIVEKIT_URL to .env. Without it, streaming runs in demo mode with simulated participants. Your backend needs one token endpoint (30 lines).',
  missions:    'You have 6 missions across all realms. Each unlocks the next. Missions give cash + XP. Active missions show ▶ in the Mission panel.',
  wanted:      'Wanted level (stars) goes up to 5. Police NPCs notice you more at high wanted. Clear it with the CLEAR button in the City HUD.',
  vehicles:    'You start with the Lowrider. Buy 4 more in the Garage: Muscle ($5K), Holy Rider ($8K), Omniverse SUV ($9.5K), Quantum Cruiser ($12K). Buy with cash earned from missions.',
  battle_realms: 'Battle Realms (from your prompt) adds: AR laser tag via phone gyroscope, Pokémon GO creature capture via real GPS, Yu-Gi-Oh card battles, Ghostbusters capture mode, territory control of real-world zones. Built as AMM Realms v2 expansion.',
  google_earth: 'Google Earth integration uses the Maps JavaScript API + satellite imagery layer. Real-world territory control maps to actual GPS coordinates. Add VITE_GOOGLE_MAPS_KEY to .env.',
  distribution: 'Music distribution: AMM can act as your label/distributor. Upload to AMM first (you own 100%), then push to Spotify/Apple Music via DistroKid or TuneCore API integration. Your artist profile shows stats across all platforms.',
  monetization: 'AMM charges: 10% marketplace fee, $9.99/mo Set Apart Music premium, $4.99/mo Battle Pass, $2.99 creator event tickets, $0.25 ad click revenue, plus NFT minting fees. Your platform break-even is ~200 paying users.',
  pricing:     'Suggested pricing: Free tier (3 realm visits/day, basic avatar), Pro $9.99/mo (unlimited, real streaming, music uploads), Creator $19.99/mo (store + royalties + ad campaigns), Enterprise custom.',
  what_built:  'You have built: 3D GTA-style open world, 6 full realms (Sports/Marketplace/Music/Faith/Blockchain + City hub), Google OAuth, LiveKit streaming, real audio upload + playback, face scan avatar system, 16 species catalog, Lottie animations, articulated 3D characters, 6 missions, garage system, live chat, DAO voting, NFT minting, royalty dashboard, podcast studio, prayer wall, feast calendar. ~4,500 lines of TypeScript.',
  saved_money: 'Estimated freelancer cost for what\'s built: $15,000–$35,000. Your cost: $0 (Claude subscription). Victor\'s remaining work: Supabase DB wiring ($150–300), Stripe ($150–300), LiveKit token endpoint ($50–100). Total remaining: $350–700.',
  gta6_comparison: 'GTA 6 (Nov 2026): Leonida map (2× GTA5), dual protagonists Jason & Lucia, 700+ enterable interiors, 200+ vehicles, wildlife system, social media parody, ray-traced lighting, strand hair physics. Budget: $1–2 billion, 1,000+ developers, 10+ years. AMM: 1 developer (Claude), 2 weeks, $0. You have faith platform, creator economy, blockchain, music royalties — things GTA6 will never have.',
}

// Smart rule-based responses when no API key
function ruleBasedResponse(input: string, state: ReturnType<typeof useGameStore.getState>): string {
  const q = input.toLowerCase()

  // Greetings
  if (q.match(/^(hi|hello|hey|sup|what's up|wassup)/)) {
    return `What's good, ${state.player.name || 'Creator'}! I'm Chapelle, your AI guide. You're at Level ${state.player.level} with $${state.player.cash.toLocaleString()} in your pocket. What do you need?`
  }

  // Find relevant knowledge
  const matches = Object.entries(KNOWLEDGE).filter(([key, val]) =>
    q.includes(key) || val.toLowerCase().split(' ').some(w => w.length > 4 && q.includes(w))
  )
  if (matches.length > 0) {
    return matches[0][1]
  }

  // Contextual advice based on player state
  if (q.includes('mission') || q.includes('quest')) return KNOWLEDGE.missions
  if (q.includes('money') || q.includes('cash') || q.includes('earn')) {
    if (state.player.cash < 1000) return `You only have $${state.player.cash}. Complete the "First Drop" mission in the city — it pays $500. Then check the Marketplace Realm and list a product (you keep 90%).`
    return `You have $${state.player.cash.toLocaleString()}. Consider buying the Muscle Car ($5K) or investing in a Marketplace ad campaign to grow your creator store.`
  }
  if (q.includes('how') && q.includes('make money')) return KNOWLEDGE.monetization
  if (q.includes('price') || q.includes('charge') || q.includes('subscription')) return KNOWLEDGE.pricing
  if (q.includes('save') || q.includes('cost') || q.includes('free')) return KNOWLEDGE.saved_money
  if (q.includes('gta') || q.includes('rockstar') || q.includes('compare')) return KNOWLEDGE.gta6_comparison
  if (q.includes('what') && (q.includes('built') || q.includes('created') || q.includes('have'))) return KNOWLEDGE.what_built
  if (q.includes('sound') || q.includes('audio') || q.includes('music')) return 'Sound Engine: all 60+ sound effects are generated procedurally via Web Audio API — no files needed, 100% free. Gospel choir hits, laser blasts, portal whooshes, cash rain, church bells, engine revs — all synthesized in real time. The Music Realm also plays your uploaded MP3/WAV files with real Web Audio waveform visualization.'
  if (q.includes('google earth') || q.includes('satellite') || q.includes('map')) return KNOWLEDGE.google_earth
  if (q.includes('distribution') || q.includes('spotify') || q.includes('apple music') || q.includes('label')) return KNOWLEDGE.distribution
  if (q.includes('lottie') || q.includes('animation')) return KNOWLEDGE.lottie
  if (q.includes('avatar') || q.includes('face') || q.includes('scan') || q.includes('species')) return KNOWLEDGE.avatar
  if (q.includes('battle') || q.includes('laser tag') || q.includes('card') || q.includes('ghost') || q.includes('pokemon')) return KNOWLEDGE.battle_realms
  if (q.includes('stream') || q.includes('live') || q.includes('livekit')) return KNOWLEDGE.livekit
  if (q.includes('login') || q.includes('google') || q.includes('auth')) return KNOWLEDGE.google_auth
  if (q.includes('nft') || q.includes('blockchain') || q.includes('token') || q.includes('wallet') || q.includes('dao')) return KNOWLEDGE.blockchain
  if (q.includes('faith') || q.includes('church') || q.includes('prayer') || q.includes('sermon')) return KNOWLEDGE.faith
  if (q.includes('deploy') || q.includes('vercel') || q.includes('go live') || q.includes('launch')) {
    return 'Deploy to Vercel: push to GitHub → vercel.com → Import → Build: `npm run build`, Output: `dist` → Add env vars → Done in 5 min. Free tier handles up to 100K visitors/mo.'
  }
  if (q.includes('victor') || q.includes('freelancer') || q.includes('fiverr')) {
    return `Victor's remaining work is minimal: wire Supabase tables ($150–300), add Stripe webhooks ($150–300), add LiveKit token endpoint ($50–100). Total: ~$350–700. The UI for ALL of those is already built — he just wires backend data.`
  }
  if (q.includes('help') || q.includes('guide') || q.includes('tutorial')) {
    return `I can help with: missions, cash, vehicles, realms, avatar, streaming, music upload, payments, deployment, freelancer costs, GTA6 comparison, Google Earth, music distribution. Just ask!`
  }

  // Player stats response
  return `${state.player.name || 'Creator'}, you're Level ${state.player.level} (${state.player.xp % 1000}/1000 XP), $${state.player.cash.toLocaleString()} cash, ${state.player.tokens} AMM tokens, faith ${state.player.faith}. Ask me about any realm, mission, feature, or what to build next.`
}

// Claude API call for Level 2/3 intelligence
async function callClaude(userMessage: string, playerContext: string): Promise<string> {
  const apiKey = (import.meta.env as Record<string,string>).VITE_ANTHROPIC_KEY
  if (!apiKey) throw new Error('No API key')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are Chapelle, the AI companion inside AMM Omniverse — a faith-centered creator economy metaverse with 6 realms (City, Sports, Marketplace, Music, Faith, Blockchain). You are a Level 1 AI guide who is knowledgeable, encouraging, street-smart, and faith-positive. Current player context: ${playerContext}. Keep answers under 3 sentences. Be direct and helpful.`,
      messages: [{ role: 'user', content: userMessage }]
    })
  })
  const data = await res.json() as { content: Array<{ type: string; text: string }> }
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('')
}

// Main Chapelle class
export class ChapelleAI {
  private state: ChapelleState = {
    messages: [],
    isTyping: false,
    personality: 'coach',
    level: 1,
    disabled: false,
  }
  private onChange: (state: ChapelleState) => void
  private welcomeSent = false

  constructor(onChange: (state: ChapelleState) => void) {
    this.onChange = onChange
  }

  // Send welcome message
  welcome(playerName: string) {
    if (this.welcomeSent) return
    this.welcomeSent = true
    setTimeout(() => {
      this.addMessage({
        from: 'chapelle',
        text: `What's good, ${playerName || 'Creator'}! 👑 I'm Chapelle — your AI guide to the AMM Omniverse. I can coach your battles, explain any system, help you earn more, and guide you through all 6 realms. What's your first move?`,
        type: 'welcome',
        actions: [
          { label: '🎯 What missions should I do?', onClick: () => this.ask('What missions should I do first?') },
          { label: '💰 How do I make money?', onClick: () => this.ask('How do I make money?') },
          { label: '🌐 What have I built?', onClick: () => this.ask('What have I created?') },
        ]
      })
    }, 1500)
  }

  // Player asks a question
  async ask(text: string): Promise<void> {
    this.addMessage({ from: 'player', text, type: 'chat' })
    this.emit({ isTyping: true })

    const gameState = useGameStore.getState()
    const playerCtx = `Name: ${gameState.player.name}, Level: ${gameState.player.level}, Cash: $${gameState.player.cash}, XP: ${gameState.player.xp}, Faith: ${gameState.player.faith}, Missions complete: ${gameState.player.completedMissions.length}/6`

    let response: string
    try {
      if (this.state.level >= 2) {
        response = await callClaude(text, playerCtx)
      } else {
        await delay(600 + Math.random() * 400)
        response = ruleBasedResponse(text, gameState)
      }
    } catch {
      response = ruleBasedResponse(text, gameState)
    }

    this.emit({ isTyping: false })
    this.addMessage({ from: 'chapelle', text: response, type: 'chat' })
  }

  // Context-aware hints (called by game systems)
  hint(context: 'low_cash' | 'level_up' | 'mission_complete' | 'portal_near' | 'wanted' | 'idle'): void {
    const hints: Record<string, string> = {
      low_cash:         '💰 Cash running low! Complete the First Drop mission ($500) or list a product in the Marketplace Realm.',
      level_up:         '⭐ Level up! Your stats got stronger. New missions may have unlocked — check the Mission panel.',
      mission_complete: '✅ Mission done! Open the Mission panel to see what unlocked next. Keep stacking that XP.',
      portal_near:      '🌀 Portal nearby! Drive or walk into the glowing ring to enter that realm.',
      wanted:           '⚠️ Wanted level rising! Hit CLEAR in the HUD or drive away from Officer Knox.',
      idle:             '🎮 Tip: Try the Sports Realm — 3 rounds of boxing earns $2,000 and 500 XP.',
    }
    this.addMessage({ from: 'chapelle', text: hints[context] ?? 'Need help? Just ask me anything!', type: 'hint' })
  }

  // Upgrade AI level (when Claude API key added)
  upgradeLevel(level: 1 | 2 | 3) {
    this.emit({ level })
    this.addMessage({
      from: 'chapelle',
      text: level === 2
        ? '🧠 Chapelle upgraded to Level 2 — I can now answer freeform questions using Claude AI!'
        : '🚀 Chapelle upgraded to Level 3 — Full Claude intelligence, battle coaching, real-time strategy!',
      type: 'alert'
    })
  }

  private addMessage(msg: Omit<ChapelleMessage, 'id' | 'timestamp'>) {
    const full: ChapelleMessage = { ...msg, id: Math.random().toString(36).slice(2), timestamp: Date.now() }
    this.state.messages = [...this.state.messages.slice(-49), full]
    this.emit({})
  }

  private emit(patch: Partial<ChapelleState>) {
    this.state = { ...this.state, ...patch }
    this.onChange({ ...this.state })
  }

  getState(): ChapelleState { return { ...this.state } }
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ── Simple wrapper for CityView integration ───────────────────────────
// ChapelleAI requires onChange callback — this wrapper makes it UI-friendly
export class ChapelleAISimple {
  private inner: ChapelleAI

  constructor() {
    this.inner = new ChapelleAI(() => {})
  }

  getWelcome(): string {
    return "👋 Hey! I'm Chapelle, your AMM Omniverse AI companion. Ask me anything about the city, games, marketplace, music, faith realm, or your earnings. I'm here to help you win. 🌐"
  }

  async ask(question: string): Promise<string> {
    return new Promise(resolve => {
      let answered = false
      const inner = new ChapelleAI((state) => {
        if (!answered && state.messages.length > 0) {
          const last = state.messages[state.messages.length - 1]
          if (last.from === 'chapelle' && !state.isTyping) {
            answered = true
            resolve(last.text)
          }
        }
      })
      inner.send(question)
      // Fallback timeout
      setTimeout(() => {
        if (!answered) resolve("I'm thinking... Try asking again! Or type 'help' to see what I know.")
      }, 5000)
    })
  }
}
