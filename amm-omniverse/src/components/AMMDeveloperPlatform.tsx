// AMM Developer Platform & Play Store
// The All American Marketplace App Store — submit apps, earn revenue, build on AMM
// Google Pay integration + AMM Pay + developer SDK package

import { useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'

type DevTab = 'store' | 'submit' | 'sdk' | 'payments' | 'earnings'

interface AppListing {
  id: string; name: string; developer: string; category: string
  emoji: string; description: string; price: number | 'free'; downloads: number
  rating: number; revenue_share: string; verified: boolean; color: string
}

const FEATURED_APPS: AppListing[] = [
  { id:'a1', name:'AMM Beat Maker Pro', developer:'QuantumBeat Studios', category:'Music', emoji:'🎛️', description:'Professional beat-making suite integrated with AMM music distribution. Upload directly to Spotify, Apple Music from inside the app.', price:'free', downloads:12400, rating:4.8, revenue_share:'70/30', verified:true, color:'#00ccff' },
  { id:'a2', name:'Faith Prayer Journal', developer:'Kingdom Apps LLC', category:'Faith', emoji:'📖', description:'Daily faith journal with scripture integration, prayer tracking, and AMM community sharing. Links to Faith Realm.', price:2.99, downloads:8900, rating:4.9, revenue_share:'70/30', verified:true, color:'#ffd700' },
  { id:'a3', name:'AMM Card Trader', developer:'Community Dev', category:'Games', emoji:'🃏', description:'Trade Omniverse Duel Realms cards with other players. Wallet-to-wallet card NFT transfers on El Saturn Chain.', price:'free', downloads:5600, rating:4.6, revenue_share:'70/30', verified:false, color:'#8800ff' },
  { id:'a4', name:'Black Business Finder', developer:'Melanin Tech', category:'Marketplace', emoji:'✊', description:'Discover and support Black-owned businesses near you. Integrated with AMM marketplace. GPS-powered.', price:'free', downloads:22000, rating:4.9, revenue_share:'70/30', verified:true, color:'#00cc44' },
  { id:'a5', name:'Gospel TV Live', developer:'SetApart Media', category:'Faith', emoji:'📺', description:'24/7 gospel and faith TV streaming. Syncs with AMM Drama Box. Earn tokens watching faith content.', price:'free', downloads:31000, rating:4.7, revenue_share:'70/30', verified:true, color:'#ff66cc' },
  { id:'a6', name:'AMM Event Tickets', developer:'Kingdom Events', category:'Events', emoji:'🎪', description:'Buy and sell tickets to AMM community events, showcases, and tournaments. QR code entry. Royalties to venue owners.', price:'free', downloads:4200, rating:4.5, revenue_share:'70/30', verified:false, color:'#ffaa00' },
]

const AMM_SDK_FEATURES = [
  { icon:'🔐', name:'AMM Single Sign-On', desc:'Let users log in with their AMM account. Google OAuth backed by Supabase. One line of code.' },
  { icon:'🪙', name:'AMM Token Payments', desc:'Accept AMM tokens as payment in your app. Users pay from their AMM wallet. 5% transaction fee.' },
  { icon:'💳', name:'AMM Stripe Checkout', desc:'Inherit the full Stripe payment stack from AMM. Cards, Google Pay, Apple Pay, crypto — all included.' },
  { icon:'🌐', name:'AMM Share SDK', desc:'Add global sharing with tracked links, QR codes, and analytics to your app. 9 regions, 70+ platforms.' },
  { icon:'🤖', name:'Bennie AI Bot SDK', desc:'Embed Bennie (our AI chatbot) into your app. Customize knowledge base. Claude API powered.' },
  { icon:'🎁', name:'AMM Gift Economy', desc:'Add gift buttons to your live streams. Faith gifts from free Amen to $999.99. Creator keeps 90%.' },
  { icon:'📊', name:'AMM Analytics', desc:'See how your app performs inside the AMM ecosystem. Users, revenue, engagement, retention.' },
  { icon:'🌍', name:'AMM Regional Targeting', desc:'Reach users by generation (Gen X, Millennials, Gen Z), region (Africa, Asia, US), and faith preference.' },
]

const PAYMENT_METHODS = [
  { id:'google_pay', name:'Google Pay', emoji:'🟢', desc:'One-tap payment on Android. Works through Stripe — zero extra code after Victor deploys.', status:'active', color:'#00cc44' },
  { id:'apple_pay', name:'Apple Pay', emoji:'🍎', desc:'One-tap payment on iPhone. Works through Stripe automatically.', status:'active', color:'#888' },
  { id:'stripe_card', name:'Credit / Debit Card', emoji:'💳', desc:'Visa, Mastercard, Amex, Discover. Stripe handles everything. 2.9% + $0.30 per transaction.', status:'active', color:'#00ccff' },
  { id:'amm_tokens', name:'AMM Tokens', emoji:'🪙', desc:'Pay with your AMM token balance. 1 token = $0.01. Instant, no fees for users.', status:'active', color:'#ffd700' },
  { id:'usdc', name:'USDC Crypto', emoji:'💵', desc:'Stablecoin payment. Address on file. Confirmation in 1–3 minutes.', status:'active', color:'#00cc44' },
  { id:'eth', name:'Ethereum', emoji:'🔷', desc:'ETH payments accepted. Converted at current rate. AMM wallet address provided.', status:'active', color:'#8800ff' },
  { id:'btc', name:'Bitcoin', emoji:'🟠', desc:'BTC accepted. Lightning Network coming Q2 2027.', status:'active', color:'#ff8800' },
  { id:'sol', name:'Solana', emoji:'🟣', desc:'SOL payments accepted. Fast confirmations (< 1 second).', status:'active', color:'#9945ff' },
]

export default function AMMDeveloperPlatform({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [tab, setTab] = useState<DevTab>('store')
  const [submitForm, setSubmitForm] = useState({ name:'', category:'Music', description:'', url:'', price:'free', developer:'' })
  const [submitted, setSubmitted] = useState(false)
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Music', 'Faith', 'Games', 'Marketplace', 'Events', 'Fitness', 'Education']
  const filtered = filter === 'All' ? FEATURED_APPS : FEATURED_APPS.filter(a => a.category === filter)

  const TABS: { id: DevTab; label: string; color: string }[] = [
    { id:'store',    label:'🏪 App Store',    color:'#00ffcc' },
    { id:'submit',   label:'📤 Submit App',   color:'#ffd700' },
    { id:'sdk',      label:'🔧 Dev SDK',      color:'#8800ff' },
    { id:'payments', label:'💳 Payments',     color:'#00cc44' },
    { id:'earnings', label:'💰 Earn More',    color:'#ff6600' },
  ]

  return (
    <div style={{ width:'100%', height:'100%', background:'#020212', fontFamily:'monospace', color:'#ccc', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'10px 14px', borderBottom:'1px solid #00ffcc22', background:'#09091d', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onClose} style={{ background:'none', border:'1px solid #333', color:'#555', borderRadius:4, padding:'4px 10px', cursor:'pointer', fontFamily:'monospace', fontSize:10 }}>← BACK</button>
        <div style={{ width:28, height:28, background:'rgba(0,255,204,.12)', border:'1px solid #00ffcc44', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🏪</div>
        <div>
          <div style={{ color:'#00ffcc', fontWeight:900, fontSize:13 }}>ALL AMERICAN MARKETPLACE · DEVELOPER PLATFORM</div>
          <div style={{ color:'#555', fontSize:9 }}>Submit apps · AMM SDK · Google Pay · Apple Pay · Token Economy</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid #1a1a3e', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex:'0 0 auto', padding:'8px 12px', background:tab===t.id?`${t.color}10`:'transparent', border:'none', borderBottom:tab===t.id?`2px solid ${t.color}`:'2px solid transparent', color:tab===t.id?t.color:'#555', cursor:'pointer', fontFamily:'monospace', fontSize:10, fontWeight:tab===t.id?700:400, whiteSpace:'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:14 }}>

        {/* ── APP STORE ── */}
        {tab==='store' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,rgba(0,255,204,.08),rgba(136,0,255,.06))', border:'1px solid #00ffcc22', borderRadius:12, padding:14, marginBottom:16 }}>
              <div style={{ color:'#00ffcc', fontWeight:900, fontSize:14, marginBottom:4 }}>🏪 ALL AMERICAN MARKETPLACE PLAY STORE</div>
              <p style={{ fontSize:11, color:'#888', margin:0, lineHeight:1.6 }}>The AMM App Store lives inside the Blockchain Realm. Developers submit apps that plug into the AMM ecosystem. Users discover, download, and pay with AMM tokens or any payment method. Developer keeps 70% of all revenue.</p>
            </div>

            {/* Category filter */}
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:12 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ background:filter===c?'rgba(0,255,204,.12)':'transparent', border:`1px solid ${filter===c?'#00ffcc':'#333'}`, color:filter===c?'#00ffcc':'#555', borderRadius:20, padding:'3px 10px', cursor:'pointer', fontFamily:'monospace', fontSize:10 }}>
                  {c}
                </button>
              ))}
            </div>

            {/* App grid */}
            {filtered.map(app => (
              <div key={app.id} style={{ background:'#09091c', border:`1px solid ${app.color}22`, borderRadius:10, padding:12, marginBottom:10 }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ width:44, height:44, background:`${app.color}15`, border:`1px solid ${app.color}33`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{app.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                      <span style={{ color:'#fff', fontWeight:700, fontSize:12 }}>{app.name}</span>
                      {app.verified && <span style={{ background:'rgba(0,204,68,.15)', color:'#00cc44', borderRadius:20, padding:'1px 7px', fontSize:8, fontWeight:700 }}>✓ VERIFIED</span>}
                    </div>
                    <div style={{ color:'#555', fontSize:10, marginBottom:3 }}>by {app.developer} · {app.category}</div>
                    <div style={{ display:'flex', gap:8, fontSize:10 }}>
                      <span style={{ color:'#ffd700' }}>⭐ {app.rating}</span>
                      <span style={{ color:'#555' }}>{app.downloads.toLocaleString()} downloads</span>
                      <span style={{ color:app.color }}>Rev share: {app.revenue_share}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ color:app.price==='free'?'#00cc44':app.color, fontWeight:700, fontSize:13, marginBottom:6 }}>
                      {app.price === 'free' ? 'FREE' : `$${app.price}`}
                    </div>
                    <button onClick={() => store.setNotif(`📲 ${app.name} — installing...`)}
                      style={{ background:`${app.color}20`, border:`1px solid ${app.color}`, color:app.color, borderRadius:6, padding:'5px 12px', cursor:'pointer', fontFamily:'monospace', fontSize:10, fontWeight:700 }}>
                      GET
                    </button>
                  </div>
                </div>
                <div style={{ color:'#666', fontSize:10, lineHeight:1.5 }}>{app.description}</div>
              </div>
            ))}

            <div style={{ textAlign:'center', padding:'16px 0', color:'#333', fontSize:11 }}>
              More apps coming as developers build on the AMM SDK.
              <br/>You can be the first — submit your app below.
            </div>
          </div>
        )}

        {/* ── SUBMIT APP ── */}
        {tab==='submit' && (
          <div>
            {!submitted ? (
              <>
                <div style={{ background:'rgba(255,215,0,.06)', border:'1px solid #ffd70022', borderRadius:10, padding:12, marginBottom:16, fontSize:11, color:'#888', lineHeight:1.7 }}>
                  <strong style={{ color:'#ffd700' }}>Developer Revenue:</strong> You keep 70% of all app revenue. AMM takes 30% to run the platform, process payments, and handle distribution. Free apps earn through IAP (in-app purchases) using AMM tokens.
                </div>
                {[
                  { key:'name',        label:'App Name *',                 placeholder:'Your app name' },
                  { key:'developer',   label:'Developer / Company Name *',  placeholder:'Your name or company' },
                  { key:'description', label:'App Description *',           placeholder:'What does your app do?' },
                  { key:'url',         label:'App URL or GitHub *',         placeholder:'https://github.com/you/app' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, color:'#555', marginBottom:4 }}>{f.label}</div>
                    {f.key === 'description' ? (
                      <textarea value={(submitForm as any)[f.key]} onChange={e => setSubmitForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} rows={3}
                        style={{ width:'100%', background:'#09091c', border:'1px solid #ffd70033', color:'#ccc', borderRadius:8, padding:'9px 12px', fontFamily:'monospace', fontSize:12, resize:'vertical', boxSizing:'border-box' as const }}/>
                    ) : (
                      <input value={(submitForm as any)[f.key]} onChange={e => setSubmitForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                        style={{ width:'100%', background:'#09091c', border:'1px solid #ffd70033', color:'#ccc', borderRadius:8, padding:'9px 12px', fontFamily:'monospace', fontSize:12, boxSizing:'border-box' as const }}/>
                    )}
                  </div>
                ))}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:10, color:'#555', marginBottom:4 }}>Category</div>
                    <select value={submitForm.category} onChange={e => setSubmitForm(p => ({...p, category: e.target.value}))}
                      style={{ width:'100%', background:'#09091c', border:'1px solid #333', color:'#ccc', borderRadius:8, padding:'9px 12px', fontFamily:'monospace', fontSize:12 }}>
                      {['Music','Faith','Games','Marketplace','Events','Fitness','Education','Productivity','Social'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#555', marginBottom:4 }}>Price</div>
                    <select value={submitForm.price} onChange={e => setSubmitForm(p => ({...p, price: e.target.value}))}
                      style={{ width:'100%', background:'#09091c', border:'1px solid #333', color:'#ccc', borderRadius:8, padding:'9px 12px', fontFamily:'monospace', fontSize:12 }}>
                      <option value="free">Free</option>
                      <option value="0.99">$0.99</option>
                      <option value="1.99">$1.99</option>
                      <option value="2.99">$2.99</option>
                      <option value="4.99">$4.99</option>
                      <option value="9.99">$9.99</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => {
                  if (!submitForm.name || !submitForm.developer) { store.setNotif('❌ Fill in app name and developer name'); return }
                  setSubmitted(true)
                  store.earnXp(500)
                  store.setNotif(`🏪 "${submitForm.name}" submitted! AMM Dev team reviews within 48 hours.`)
                }}
                  style={{ width:'100%', background:'rgba(255,215,0,.15)', border:'2px solid #ffd700', color:'#ffd700', borderRadius:10, padding:14, cursor:'pointer', fontFamily:'monospace', fontWeight:900, fontSize:14 }}>
                  📤 SUBMIT TO AMM PLAY STORE
                </button>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'30px 20px' }}>
                <div style={{ fontSize:52, marginBottom:12 }}>🏪</div>
                <div style={{ color:'#00cc44', fontSize:16, fontWeight:900, marginBottom:8 }}>App Submitted!</div>
                <div style={{ color:'#888', fontSize:12, lineHeight:1.7, marginBottom:20 }}>"{submitForm.name}" is under review.<br/>AMM Dev team reviews within 48 hours.<br/>Once approved, your app goes live in the AMM Play Store.</div>
                <div style={{ background:'rgba(0,204,68,.06)', border:'1px solid #00cc4422', borderRadius:10, padding:14, marginBottom:16 }}>
                  <div style={{ color:'#00cc44', fontWeight:700, marginBottom:6 }}>Your revenue share</div>
                  <div style={{ fontSize:12, color:'#888', lineHeight:1.6 }}>
                    You keep 70% of all revenue<br/>
                    AMM takes 30% (payments, distribution, support)<br/>
                    {submitForm.price !== 'free' ? `$${submitForm.price} × 1,000 downloads = $${(parseFloat(submitForm.price) * 1000 * 0.7).toFixed(0)} to you` : 'Free app + in-app purchases = token economy revenue'}
                  </div>
                </div>
                <button onClick={() => { setSubmitted(false); setSubmitForm({ name:'', category:'Music', description:'', url:'', price:'free', developer:'' }) }}
                  style={{ background:'rgba(255,215,0,.1)', border:'1px solid #ffd700', color:'#ffd700', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontFamily:'monospace', fontSize:12 }}>
                  Submit Another App
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SDK ── */}
        {tab==='sdk' && (
          <div>
            <div style={{ background:'rgba(136,0,255,.06)', border:'1px solid #8800ff22', borderRadius:10, padding:12, marginBottom:16, fontSize:11, color:'#888', lineHeight:1.6 }}>
              The <strong style={{ color:'#8800ff' }}>AMM Developer Package</strong> is an SDK that lets any developer add AMM features to their app — login, token payments, sharing, gifting, Bennie AI, and analytics. Like Firebase for the faith creator economy.
            </div>
            <div style={{ fontSize:10, color:'#555', marginBottom:10, letterSpacing:2 }}>NPM INSTALL (after launch)</div>
            <div style={{ background:'#09091c', border:'1px solid #8800ff44', borderRadius:8, padding:12, marginBottom:16, fontFamily:'monospace', fontSize:12, color:'#8800ff' }}>
              npm install @amm/sdk<br/>
              <span style={{ color:'#555' }}># or</span><br/>
              yarn add @amm/sdk
            </div>
            <div style={{ fontSize:10, color:'#555', marginBottom:10, letterSpacing:2 }}>SDK FEATURES — ALL INCLUDED</div>
            {AMM_SDK_FEATURES.map((f, i) => (
              <div key={i} style={{ background:'#09091c', border:'1px solid #1a1a3e', borderRadius:8, padding:12, marginBottom:8, display:'flex', gap:12 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{f.icon}</span>
                <div>
                  <div style={{ color:'#8800ff', fontWeight:700, fontSize:12, marginBottom:3 }}>{f.name}</div>
                  <div style={{ color:'#666', fontSize:11, lineHeight:1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop:14, padding:12, background:'rgba(136,0,255,.06)', border:'1px solid #8800ff22', borderRadius:10, fontSize:11, color:'#888', lineHeight:1.6 }}>
              <strong style={{ color:'#8800ff' }}>Pricing:</strong> Free for AMM Creator subscribers. $49/month for external developers. Revenue share: 70/30 on all in-app purchases. Token transactions: 5% fee.
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab==='payments' && (
          <div>
            <div style={{ background:'rgba(0,204,68,.06)', border:'1px solid #00cc4422', borderRadius:10, padding:12, marginBottom:16, fontSize:11, color:'#888', lineHeight:1.6 }}>
              AMM supports 8 payment methods. All active after Victor deploys the Stripe backend. Google Pay and Apple Pay work automatically through Stripe — zero extra code.
            </div>
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} style={{ background:'#09091c', border:`1px solid ${pm.color}22`, borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontSize:22 }}>{pm.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:pm.color, fontWeight:700, fontSize:12 }}>{pm.name}</div>
                    <div style={{ color:'#555', fontSize:10 }}>{pm.desc}</div>
                  </div>
                  <span style={{ background:'rgba(0,204,68,.15)', color:'#00cc44', borderRadius:20, padding:'2px 8px', fontSize:9, fontWeight:700 }}>✓ ACTIVE</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop:14, padding:12, background:'rgba(0,204,68,.06)', border:'1px solid #00cc4422', borderRadius:10 }}>
              <div style={{ color:'#00cc44', fontWeight:700, fontSize:12, marginBottom:6 }}>How Google Pay works on AMM</div>
              <div style={{ fontSize:11, color:'#888', lineHeight:1.7 }}>
                1. User taps Subscribe Pro ($7.99/month)<br/>
                2. Google Pay sheet appears (one tap confirm)<br/>
                3. Stripe processes the tokenized payment<br/>
                4. Backend webhook upgrades user to Pro tier<br/>
                5. User's card is never stored on AMM servers<br/>
                <br/>
                <strong style={{ color:'#555' }}>No extra code needed.</strong> Stripe handles Google Pay and Apple Pay automatically.
              </div>
            </div>
          </div>
        )}

        {/* ── EARN MORE ── */}
        {tab==='earnings' && (
          <div>
            <div style={{ background:'rgba(255,102,0,.06)', border:'1px solid #ff660022', borderRadius:10, padding:12, marginBottom:16 }}>
              <div style={{ color:'#ff6600', fontWeight:700, fontSize:13, marginBottom:4 }}>💰 NEW REVENUE STREAMS FROM DEVELOPER PLATFORM</div>
              <p style={{ fontSize:11, color:'#888', margin:0 }}>Beyond subscriptions, gifts, and marketplace — here's how the AMM Dev Platform adds more money.</p>
            </div>
            {[
              { emoji:'🏪', title:'App Store Commission', desc:'30% of every purchase in the AMM Play Store. 6 apps featured → 100 downloads each at $2.99 = $538 AMM revenue.', color:'#00ffcc', monthly:'$538–$5,000' },
              { emoji:'🔧', title:'SDK Subscriptions', desc:'$49/month per external developer using the AMM SDK. 10 developers = $490/month passive income.', color:'#8800ff', monthly:'$490–$4,900' },
              { emoji:'💳', title:'Token Transaction Fees', desc:'5% on every AMM token purchase inside developer apps. Developers drive token purchases, AMM earns automatically.', color:'#ffd700', monthly:'$200–$2,000' },
              { emoji:'✨', title:'Featured App Placement', desc:'$299/month for featured position in AMM Play Store. 5 featured slots = $1,495/month.', color:'#ff6600', monthly:'$1,495' },
              { emoji:'🌍', title:'Regional App Distribution', desc:'Developers pay $99 to distribute their app in a specific region (Africa, India, Japan). Revenue per region.', color:'#00cc44', monthly:'$500–$3,000' },
              { emoji:'🤖', title:'Bennie AI API Calls', desc:'External apps calling Bennie AI (the AMM chatbot SDK). $0.01 per AI response beyond free tier.', color:'#00ccff', monthly:'$100–$1,000' },
            ].map((s, i) => (
              <div key={i} style={{ background:'#09091c', border:`1px solid ${s.color}22`, borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:20 }}>{s.emoji}</span>
                    <span style={{ color:s.color, fontWeight:700, fontSize:12 }}>{s.title}</span>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ color:s.color, fontWeight:900, fontSize:12 }}>{s.monthly}</div>
                    <div style={{ color:'#444', fontSize:9 }}>per month</div>
                  </div>
                </div>
                <div style={{ color:'#666', fontSize:11, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
            <div style={{ background:'rgba(0,204,68,.08)', border:'1px solid #00cc4433', borderRadius:10, padding:14, marginTop:6 }}>
              <div style={{ color:'#00cc44', fontWeight:700, fontSize:13, marginBottom:6 }}>Developer Platform Revenue Projection</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                <div style={{ background:'#09091c', borderRadius:6, padding:8, textAlign:'center' }}>
                  <div style={{ color:'#00ffcc', fontWeight:900, fontSize:16 }}>+$3,323</div>
                  <div style={{ color:'#555', fontSize:9 }}>Monthly at 10 devs</div>
                </div>
                <div style={{ background:'#09091c', borderRadius:6, padding:8, textAlign:'center' }}>
                  <div style={{ color:'#ffd700', fontWeight:900, fontSize:16 }}>+$16,895</div>
                  <div style={{ color:'#555', fontSize:9 }}>Monthly at 50 devs</div>
                </div>
              </div>
              <div style={{ fontSize:10, color:'#555', marginTop:8 }}>On top of all existing revenue streams (subscriptions, gifts, marketplace, music, drama, tokens).</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
