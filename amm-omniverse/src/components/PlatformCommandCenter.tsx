// AMM Omniverse — Platform Command Center
// Quantum Discord · Zapier Dashboard · Unified Search · Creator Profiles · AI Answer Engine

import { useState } from 'react'
import { QUANTUM_DISCORD, ZAPIER_AUTOMATIONS } from '../game/engine/HollywoodEngine'

type CommandTab = 'search'|'discord'|'zapier'|'creator'|'ai'

interface SearchResult {
  type: 'game'|'card'|'gift'|'product'|'track'|'business'|'feature'
  title: string; subtitle: string; emoji: string; action: string
}

const FULL_SEARCH_INDEX: SearchResult[] = [
  // Games
  { type:'game', title:'Boxing Arena V2',       subtitle:'8 moves · 10 combos · 5 rounds · SVG fighters',         emoji:'🥊', action:'Open Sports Realm' },
  { type:'game', title:'Basketball V2',         subtitle:'3-phase rhythm shooting · 6 MyPlayer archetypes',        emoji:'🏀', action:'Open Sports Realm' },
  { type:'game', title:'Card Battle Arena',     subtitle:'100 original cards · 10 realms · 6 battle phases',       emoji:'🃏', action:'Open Sports Realm' },
  { type:'game', title:'Tactical Realms',       subtitle:'6 original weapons · 6 maps · 5 game modes',             emoji:'⚔️', action:'Open Sports Realm' },
  { type:'game', title:'Hero Realms RPG',       subtitle:'5 hero classes · 8 spells · 5 towns · morality system',  emoji:'🏰', action:'Open Sports Realm' },
  { type:'game', title:'AR Laser Tag',          subtitle:'Camera overlay · gyroscope aiming · real world battles',  emoji:'⚡', action:'Open Sports Realm' },
  { type:'game', title:'Creature Capture',      subtitle:'10 faith creatures · GPS radar · throw meter',            emoji:'🌍', action:'Open Sports Realm' },
  { type:'game', title:'Football',              subtitle:'7 plays vs 5 defenses · real downs system',               emoji:'🏈', action:'Open Sports Realm' },
  { type:'game', title:'WNBA W League',         subtitle:'MyWPlayer · team chemistry · W-specific shots',           emoji:'🏅', action:'Open Sports Realm' },
  // Cards
  { type:'card', title:'Lion of Judah',         subtitle:'2800 ATK · Judah realm · Epic tier boss card',            emoji:'🦁', action:'Open Card Battle' },
  { type:'card', title:'Shofar Blast',          subtitle:'Feast of Trumpets · stuns ALL enemies 2 turns',           emoji:'📯', action:'Open Card Battle' },
  { type:'card', title:'Exodus Shield',         subtitle:'Passover feast card · field-wide immunity 3 turns',       emoji:'🛡️', action:'Open Card Battle' },
  { type:'card', title:'Void Empress',          subtitle:'Final boss · 4000 ATK · Shadow Realm · Legendary',        emoji:'👑', action:'Open Card Battle' },
  { type:'card', title:'El Saturn Cosmic',      subtitle:'2600 ATK · blockchain realm · cosmic chain reaction',     emoji:'🪐', action:'Open Card Battle' },
  { type:'card', title:'Gospel Thunder Bird',   subtitle:'2400 ATK · music realm · deals sound damage to all',      emoji:'⚡', action:'Open Card Battle' },
  // Gifts
  { type:'gift', title:'Holy Cross',            subtitle:'Free gift · basic faith expression during live streams',  emoji:'✝️', action:'Open Faith Realm' },
  { type:'gift', title:'Holy Dove',             subtitle:'50 tokens · peace animation · 5 seconds',                emoji:'🕊️', action:'Open Faith Realm' },
  { type:'gift', title:'Ark of the Covenant',   subtitle:'2,500 tokens · legendary 30-second animation',           emoji:'📦', action:'Open Faith Realm' },
  { type:'gift', title:'Seraphim',              subtitle:'6,666 tokens · angel animation · 25 seconds full screen', emoji:'👼', action:'Open Faith Realm' },
  { type:'gift', title:'Omniverse Blast',       subtitle:'9,999 tokens · most powerful gift in AMM',               emoji:'🌐', action:'Open Faith Realm' },
  // Products
  { type:'product', title:'Creator Starter Bundle',subtitle:'$49.99 · instant dropship · beats, presets, guide',  emoji:'📦', action:'Open Marketplace' },
  { type:'product', title:'Gospel Beat Pack V1', subtitle:'$29 · 50 original beats · royalty-free for creators',   emoji:'🎵', action:'Open Marketplace' },
  { type:'product', title:'Faith Creator Course', subtitle:'$97 · 12 modules · build your creator business',       emoji:'📚', action:'Open Marketplace' },
  // Platform features
  { type:'feature', title:'Go Live — Streaming',  subtitle:'Stream to AMM · earn gifts · run PK battles · 90% cut', emoji:'🔴', action:'Open Live Hub' },
  { type:'feature', title:'Upload Music',          subtitle:'Upload tracks · earn $0.015–0.019/stream · distribute', emoji:'🎵', action:'Open Music Realm' },
  { type:'feature', title:'List Your Business',    subtitle:'Black-owned business directory · free listing',        emoji:'✊', action:'Open Marketplace' },
  { type:'feature', title:'HoloMenu',             subtitle:'Full-screen realm navigation overlay',                   emoji:'🌐', action:'Open HoloMenu' },
  { type:'feature', title:'Mythos Blender',        subtitle:'8 genre layers · 6 signature blends · AI coaching',    emoji:'🎛️', action:'Open Isaiah AI' },
  { type:'feature', title:'Hebrew Feast Calendar', subtitle:'10 feast cards · seasonal bonuses · Lottie animations', emoji:'🕯️', action:'Open Faith Realm' },
  { type:'feature', title:'Subscribe Pro',         subtitle:'$9.99/mo · all 6 realms · 16 avatar species · streaming',emoji:'⭐',action:'Open Subscription' },
]

export default function PlatformCommandCenter({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<CommandTab>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [discordMsg, setDiscordMsg] = useState('')
  const [discordSent, setDiscordSent] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiMode, setAiMode] = useState<'hybrid'|'local'|'ai'|'open_web'>('hybrid')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [creatorId, setCreatorId] = useState('')
  const [creatorProfile, setCreatorProfile] = useState<any>(null)
  const [creatorLoading, setCreatorLoading] = useState(false)

  // ── SEARCH ──────────────────────────────────────────────────────────
  const runSearch = (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    const lower = q.toLowerCase()
    setSearchResults(
      FULL_SEARCH_INDEX.filter(r =>
        r.title.toLowerCase().includes(lower) ||
        r.subtitle.toLowerCase().includes(lower) ||
        r.type.includes(lower)
      ).slice(0, 10)
    )
  }

  const typeColors: Record<string, string> = {
    game:'#00ffcc', card:'#ffd700', gift:'#ff66cc', product:'#00cc44', track:'#00ccff', business:'#ffaa00', feature:'#8800ff'
  }

  // ── DISCORD NOTIFY ──────────────────────────────────────────────────
  const sendDiscordMsg = async () => {
    if (!discordMsg.trim()) return
    setDiscordSent(true)
    // Real call goes to backend /api/discord/notify
    const apiUrl = (import.meta as any).env?.VITE_API_URL || ''
    if (apiUrl) {
      await fetch(`${apiUrl}/api/discord/notify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'AMM Platform Update', description: discordMsg })
      }).catch(() => {})
    }
    setTimeout(() => { setDiscordSent(false); setDiscordMsg('') }, 2000)
  }

  // ── AI ANSWER ───────────────────────────────────────────────────────
  const askAI = async () => {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    const apiUrl = (import.meta as any).env?.VITE_API_URL || ''
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/ai/answer`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: aiQuestion, mode: aiMode })
        })
        const data = await res.json()
        setAiAnswer(data.answer || 'No answer returned.')
      } catch { setAiAnswer('Backend not connected. Deploy with Victor\'s script to enable AI answers.') }
    } else {
      const answers: Record<string, string> = {
        hybrid: `Hybrid Mode — AMM Platform Answer:\n\nSearching local AMM knowledge base for: "${aiQuestion}"\n\nRecommended sources: tryamm.online · Isaiah AI Starverse · AMM Marketplace\n\nConnect VITE_API_URL to enable real database search + Claude AI answers.`,
        local: `Local AMM Memory — "${aiQuestion}"\n\nAMM Platform Knowledge:\n• AMM Omniverse: 9 games, 100 cards, 6 realms, 31 animations\n• Isaiah AI Starverse: talent discovery, Higfield Dance 2.0, Mythos Blender\n• Victor backend: Stripe, Supabase, LiveKit, Discord, Zapier\n• Revenue model: subscriptions, marketplace 10%, gifts 10%, royalties`,
        ai: `AI Mode — Claude API Answer for: "${aiQuestion}"\n\nThis mode uses the Claude API (claude-sonnet-4-6).\nSet ANTHROPIC_API_KEY in your backend .env to enable.\n\nVICTOR: add ANTHROPIC_API_KEY to Render environment variables.`,
        open_web: `Open Web Mode — Sources for: "${aiQuestion}"\n\n✅ tryamm.online — AMM Omniverse official\n✅ isaiah-starverse.vercel.app — Isaiah AI Starverse\n✅ docs.anthropic.com — Claude API docs\n✅ supabase.com/docs — Database docs\n✅ stripe.com/docs — Payments docs`,
      }
      setAiAnswer(answers[aiMode] || answers.hybrid)
    }
    setAiLoading(false)
  }

  // ── CREATOR PROFILE ─────────────────────────────────────────────────
  const loadCreator = async () => {
    if (!creatorId.trim()) return
    setCreatorLoading(true)
    const apiUrl = (import.meta as any).env?.VITE_API_URL || ''
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/api/creators/${creatorId}/profile`)
        const data = await res.json()
        setCreatorProfile(data)
      } catch { setCreatorProfile({ error: 'Creator not found or backend not connected.' }) }
    } else {
      setCreatorProfile({
        creator: { id: creatorId, email: 'demo@tryamm.online', subscription_tier: 'creator' },
        tracks: [{ title: 'Kingdom Anthem', genre: 'Gospel', stream_count: 1240, royalties_earned: 23.56 }],
        products: [{ name: 'Beat Pack Vol.1', price: 29.99, sold_count: 34 }]
      })
    }
    setCreatorLoading(false)
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderBottom:'1px solid #1a1a3e',background:'rgba(0,0,0,0.95)' }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← BACK</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:12,letterSpacing:2 }}>🌐 PLATFORM COMMAND CENTER</span>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid #1a1a3e',background:'rgba(0,0,0,0.8)' }}>
        {([
          { id:'search',  label:'🔍 Search',  color:'#00ffcc' },
          { id:'discord', label:'💬 Discord', color:'#8800ff' },
          { id:'zapier',  label:'⚡ Zapier',  color:'#ffaa00' },
          { id:'creator', label:'👤 Creator', color:'#00cc44' },
          { id:'ai',      label:'🤖 AI Mode', color:'#00ccff' },
        ] as {id:CommandTab;label:string;color:string}[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1,padding:'8px 4px',background:tab===t.id?`${t.color}10`:'transparent',border:'none',borderBottom:tab===t.id?`2px solid ${t.color}`:'2px solid transparent',color:tab===t.id?t.color:'#555',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:tab===t.id?700:400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1,overflowY:'auto',padding:14 }}>

        {/* UNIFIED SEARCH */}
        {tab === 'search' && (
          <div>
            <div style={{ position:'relative',marginBottom:14 }}>
              <input value={searchQuery} onChange={e => runSearch(e.target.value)} placeholder="Search AMM Omniverse — games, cards, gifts, features, products..." style={{ width:'100%',background:'#09091c',border:'1px solid #00ffcc44',color:'#ccc',borderRadius:10,padding:'12px 14px',fontFamily:'monospace',fontSize:13,outline:'none' }} />
              {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]) }} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:16 }}>✕</button>}
            </div>

            {/* Quick filters */}
            <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:14 }}>
              {['boxing','card battle','go live','music upload','creature','business','pro subscription','tactical'].map(q => (
                <button key={q} onClick={() => runSearch(q)} style={{ background:'rgba(0,255,204,0.06)',border:'1px solid #00ffcc22',color:'#00ffcc',borderRadius:20,padding:'4px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>{q}</button>
              ))}
            </div>

            {/* Results */}
            {searchResults.length > 0 ? (
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {searchResults.map((r, i) => (
                  <div key={i} style={{ background:'#09091c',border:`1px solid ${typeColors[r.type]}22`,borderRadius:10,padding:'10px 14px',display:'flex',gap:12,alignItems:'center' }}>
                    <span style={{ fontSize:24,width:32,textAlign:'center',flexShrink:0 }}>{r.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:13,color:'#fff' }}>{r.title}</div>
                      <div style={{ color:'#555',fontSize:11,marginTop:2 }}>{r.subtitle}</div>
                    </div>
                    <div style={{ display:'flex',gap:6,alignItems:'center',flexShrink:0 }}>
                      <span style={{ color:typeColors[r.type],fontSize:9,background:`${typeColors[r.type]}15`,border:`1px solid ${typeColors[r.type]}33`,borderRadius:20,padding:'2px 8px' }}>{r.type.toUpperCase()}</span>
                      <span style={{ color:'#00ffcc',fontSize:11 }}>{r.action} →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div style={{ textAlign:'center',padding:30,color:'#333',fontSize:13 }}>No results for "{searchQuery}"</div>
            ) : (
              <div style={{ color:'#333',fontSize:12,textAlign:'center',padding:20 }}>Type 2+ characters to search all of AMM Omniverse</div>
            )}
          </div>
        )}

        {/* QUANTUM DISCORD */}
        {tab === 'discord' && (
          <div>
            <div style={{ background:'rgba(136,0,255,0.08)',border:'1px solid #8800ff33',borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ color:'#8800ff',fontWeight:700,fontSize:13,marginBottom:6 }}>💬 Quantum Discord Integration</div>
              <p style={{ fontSize:12,color:'#666',margin:0 }}>Send game events, platform updates, and announcements directly to your AMM Discord server. Every subscription, sale, tournament win, and feast card activation posts automatically after Victor wires the backend.</p>
            </div>

            {/* Send custom message */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>SEND TO DISCORD</div>
              <textarea value={discordMsg} onChange={e => setDiscordMsg(e.target.value)} placeholder="Type a platform announcement..." style={{ width:'100%',background:'#09091c',border:'1px solid #8800ff44',color:'#ccc',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,minHeight:80,resize:'vertical' }} />
              <button onClick={sendDiscordMsg} disabled={!discordMsg.trim()} style={{ width:'100%',marginTop:8,background:discordSent?'rgba(0,204,68,0.15)':'rgba(136,0,255,0.15)',border:`1px solid ${discordSent?'#00cc44':'#8800ff'}`,color:discordSent?'#00cc44':'#8800ff',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                {discordSent ? '✅ SENT TO DISCORD!' : '📤 SEND TO DISCORD'}
              </button>
            </div>

            {/* Auto events */}
            <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>AUTOMATIC DISCORD EVENTS (fires after Victor deploys)</div>
            <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
              {[
                { emoji:'💳',event:'New Subscription',     desc:'User subscribes → posted to #new-members with tier and timestamp',      color:'#00cc44' },
                { emoji:'🛒',event:'Marketplace Sale',     desc:'Product sold → posted to #sales with amount, creator, and 90/10 split', color:'#ffd700' },
                { emoji:'🏆',event:'Tournament Winner',    desc:'Game ends → winner posted to #tournaments with score and prize',         color:'#ff6600' },
                { emoji:'🎵',event:'Music Milestone',      desc:'1000 streams → posted to #music-wins with royalty total',               color:'#00ccff' },
                { emoji:'📯',event:'Feast Card Activated', desc:'Hebrew feast card used → community announcement with animation',         color:'#ffaa00' },
                { emoji:'✊',event:'Business Listed',      desc:'Black-owned business registers → posted to #directory',                  color:'#00cc44' },
              ].map((ev, i) => (
                <div key={i} style={{ background:'#09091c',border:`1px solid ${ev.color}22`,borderRadius:8,padding:10,display:'flex',gap:10,alignItems:'flex-start' }}>
                  <span style={{ fontSize:18 }}>{ev.emoji}</span>
                  <div>
                    <div style={{ color:ev.color,fontWeight:700,fontSize:11 }}>{ev.event}</div>
                    <div style={{ color:'#555',fontSize:10,marginTop:2 }}>{ev.desc}</div>
                  </div>
                  <span style={{ marginLeft:'auto',color:'#00cc44',fontSize:10,flexShrink:0 }}>AUTO ✓</span>
                </div>
              ))}
            </div>

            {/* Bot commands */}
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:10,letterSpacing:2 }}>DISCORD BOT COMMANDS</div>
              {QUANTUM_DISCORD.botCommands.map((cmd: {cmd:string;desc:string}, i: number) => (
                <div key={i} style={{ display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid #1a1a3e',fontSize:11 }}>
                  <span style={{ color:'#8800ff',fontWeight:700,width:140,flexShrink:0 }}>{cmd.cmd}</span>
                  <span style={{ color:'#555' }}>{cmd.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZAPIER DASHBOARD */}
        {tab === 'zapier' && (
          <div>
            <div style={{ background:'rgba(255,170,0,0.08)',border:'1px solid #ffaa0033',borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ color:'#ffaa00',fontWeight:700,fontSize:13,marginBottom:6 }}>⚡ Zapier Automation Dashboard</div>
              <p style={{ fontSize:12,color:'#666',margin:0 }}>6 pre-built Zapier workflows connect AMM Omniverse to Gmail, Google Sheets, Slack, Mailchimp, Twilio, Airtable, and Twitter automatically. Set up in Zapier.com pointing to your Render backend URL.</p>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {ZAPIER_AUTOMATIONS.map((auto: {trigger:string;actions:string[]}, i: number) => (
                <div key={i} style={{ background:'#09091c',border:'1px solid #ffaa0022',borderRadius:10,padding:14 }}>
                  <div style={{ color:'#ffaa00',fontWeight:700,fontSize:12,marginBottom:10 }}>
                    ⚡ TRIGGER: {auto.trigger}
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                    {auto.actions.map((action: string, j: number) => (
                      <div key={j} style={{ display:'flex',gap:8,alignItems:'center',fontSize:11 }}>
                        <span style={{ color:'#00cc44',flexShrink:0 }}>→</span>
                        <span style={{ color:'#888' }}>{action}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10,padding:'6px 10px',background:'rgba(255,170,0,0.06)',borderRadius:6,fontSize:10,color:'#555' }}>
                    Setup: Zapier.com → Create Zap → Trigger: Webhook → URL: https://your-backend.onrender.com/api/zapier/trigger
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATOR PROFILE */}
        {tab === 'creator' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>LOAD CREATOR PROFILE</div>
              <div style={{ display:'flex',gap:8 }}>
                <input value={creatorId} onChange={e => setCreatorId(e.target.value)} placeholder="Paste creator ID or email..." style={{ flex:1,background:'#09091c',border:'1px solid #00cc4444',color:'#ccc',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,outline:'none' }} />
                <button onClick={loadCreator} disabled={creatorLoading} style={{ background:'rgba(0,204,68,0.15)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'10px 16px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12,flexShrink:0 }}>
                  {creatorLoading ? '...' : 'LOAD'}
                </button>
              </div>
            </div>

            {creatorProfile && !creatorProfile.error && (
              <div>
                <div style={{ background:'rgba(0,204,68,0.06)',border:'1px solid #00cc4422',borderRadius:10,padding:14,marginBottom:12 }}>
                  <div style={{ color:'#00cc44',fontWeight:700,fontSize:13,marginBottom:8 }}>👤 Creator Profile</div>
                  <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
                    <div style={{ textAlign:'center',background:'#09091c',borderRadius:6,padding:8 }}>
                      <div style={{ color:'#00cc44',fontSize:18,fontWeight:700 }}>{creatorProfile.tracks?.length || 0}</div>
                      <div style={{ fontSize:9,color:'#555' }}>TRACKS</div>
                    </div>
                    <div style={{ textAlign:'center',background:'#09091c',borderRadius:6,padding:8 }}>
                      <div style={{ color:'#00ccff',fontSize:18,fontWeight:700 }}>{creatorProfile.products?.length || 0}</div>
                      <div style={{ fontSize:9,color:'#555' }}>PRODUCTS</div>
                    </div>
                    <div style={{ textAlign:'center',background:'#09091c',borderRadius:6,padding:8 }}>
                      <div style={{ color:'#ffd700',fontSize:14,fontWeight:700 }}>{creatorProfile.creator?.subscription_tier?.toUpperCase()}</div>
                      <div style={{ fontSize:9,color:'#555' }}>TIER</div>
                    </div>
                  </div>
                </div>
                {creatorProfile.tracks?.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>TRACKS</div>
                    {creatorProfile.tracks.map((t: any, i: number) => (
                      <div key={i} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:6,display:'flex',gap:10,alignItems:'center' }}>
                        <span style={{ fontSize:18 }}>🎵</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700,fontSize:12 }}>{t.title}</div>
                          <div style={{ color:'#555',fontSize:10 }}>{t.genre} · {t.stream_count?.toLocaleString()} streams</div>
                        </div>
                        <div style={{ color:'#00cc44',fontSize:11 }}>${parseFloat(t.royalties_earned || 0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {creatorProfile.products?.length > 0 && (
                  <div>
                    <div style={{ fontSize:11,color:'#555',marginBottom:8 }}>PRODUCTS</div>
                    {creatorProfile.products.map((p: any, i: number) => (
                      <div key={i} style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:8,padding:10,marginBottom:6,display:'flex',gap:10,alignItems:'center' }}>
                        <span style={{ fontSize:18 }}>📦</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700,fontSize:12 }}>{p.name}</div>
                          <div style={{ color:'#555',fontSize:10 }}>${p.price} · {p.sold_count} sold</div>
                        </div>
                        <div style={{ color:'#ffd700',fontSize:11 }}>${(p.price * p.sold_count * 0.9).toFixed(0)} earned</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {creatorProfile?.error && (
              <div style={{ color:'#ff4400',fontSize:12,padding:10 }}>{creatorProfile.error}</div>
            )}
          </div>
        )}

        {/* AI ANSWER ENGINE */}
        {tab === 'ai' && (
          <div>
            <div style={{ background:'rgba(0,204,255,0.06)',border:'1px solid #00ccff22',borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ color:'#00ccff',fontWeight:700,fontSize:13,marginBottom:4 }}>🤖 AI Answer Engine</div>
              <p style={{ fontSize:11,color:'#555',margin:0 }}>Not locked into one AI. Choose your information source: local AMM database, approved web sources, Claude AI, or all three combined in hybrid mode.</p>
            </div>

            {/* Mode selector */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:14 }}>
              {([
                { id:'hybrid',   label:'Hybrid',     desc:'AI + local + web', color:'#00ffcc' },
                { id:'local',    label:'Local Only',  desc:'AMM database',     color:'#00cc44' },
                { id:'ai',       label:'Claude AI',   desc:'Claude claude-sonnet-4-6',   color:'#00ccff' },
                { id:'open_web', label:'Web Sources', desc:'Approved sites',   color:'#ffaa00' },
              ] as {id:typeof aiMode;label:string;desc:string;color:string}[]).map(m => (
                <div key={m.id} onClick={() => setAiMode(m.id)} style={{ background:aiMode===m.id?`${m.color}15`:'#09091c',border:`1px solid ${aiMode===m.id?m.color:'#222'}`,borderRadius:8,padding:'8px 6px',cursor:'pointer',textAlign:'center' }}>
                  <div style={{ color:aiMode===m.id?m.color:'#555',fontWeight:700,fontSize:11 }}>{m.label}</div>
                  <div style={{ color:'#444',fontSize:9,marginTop:2 }}>{m.desc}</div>
                </div>
              ))}
            </div>

            <textarea value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} placeholder="Ask anything about AMM Omniverse, Isaiah AI Starverse, the platform, features, business model..." style={{ width:'100%',background:'#09091c',border:'1px solid #00ccff44',color:'#ccc',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,minHeight:70,resize:'vertical',marginBottom:8 }} />
            <button onClick={askAI} disabled={aiLoading || !aiQuestion.trim()} style={{ width:'100%',background:aiLoading?'#09091c':'rgba(0,204,255,0.12)',border:`1px solid ${aiLoading?'#333':'#00ccff'}`,color:aiLoading?'#333':'#00ccff',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:13,marginBottom:14 }}>
              {aiLoading ? '🤖 Thinking...' : `🤖 ASK IN ${aiMode.toUpperCase()} MODE`}
            </button>

            {aiAnswer && (
              <div style={{ background:'#09091c',border:'1px solid #00ccff33',borderRadius:10,padding:14 }}>
                <div style={{ fontSize:10,color:'#00ccff',marginBottom:8 }}>ANSWER — {aiMode.toUpperCase()} MODE</div>
                <pre style={{ whiteSpace:'pre-wrap',fontFamily:'monospace',fontSize:11,color:'#aaa',lineHeight:1.7,margin:0 }}>{aiAnswer}</pre>
              </div>
            )}

            {/* Web sources */}
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>APPROVED KNOWLEDGE SOURCES</div>
              {[
                { title:'AMM Omniverse Official', url:'https://tryamm.online', category:'Official' },
                { title:'Isaiah AI Starverse', url:'https://isaiah-starverse.vercel.app', category:'Platform' },
                { title:'Anthropic Claude Docs', url:'https://docs.anthropic.com', category:'AI' },
                { title:'Supabase Documentation', url:'https://supabase.com/docs', category:'Database' },
                { title:'Stripe Documentation', url:'https://stripe.com/docs', category:'Payments' },
                { title:'LiveKit Documentation', url:'https://docs.livekit.io', category:'Streaming' },
              ].map((s, i) => (
                <div key={i} style={{ display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid #1a1a3e',fontSize:11,alignItems:'center' }}>
                  <span style={{ color:'#00cc44',width:14 }}>✓</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:'#ccc' }}>{s.title}</div>
                    <div style={{ color:'#555',fontSize:9 }}>{s.url}</div>
                  </div>
                  <span style={{ background:'rgba(0,204,68,0.1)',border:'1px solid #00cc4433',color:'#00cc44',borderRadius:20,padding:'2px 8px',fontSize:9 }}>{s.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
