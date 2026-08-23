import { useState, useEffect } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { signInWithGoogle, getSessionUser, signOut, isSupabaseConfigured, type AuthUser } from '../game/auth/googleAuth'
import { AMM_PRICING } from '../game/pricing/PricingConfig'

// ── INTRO ─────────────────────────────────────────────────────────────────────
export function IntroScreen() {
  const store = useGameStore()
  const [showDownload, setShowDownload] = useState(false)
  if (showDownload) return <DownloadPage onBack={() => setShowDownload(false)} onEnter={() => store.setScreen('login')} />
  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',position:'relative',overflow:'hidden' }}>
      <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:.1 }}>
        {Array.from({length:22},(_,i)=><line key={`v${i}`} x1={`${i*5}%`} y1="0" x2={`${i*5+8}%`} y2="100%" stroke="#00ffcc" strokeWidth=".5"/>)}
        {Array.from({length:16},(_,i)=><line key={`h${i}`} x1="0" y1={`${i*7}%`} x2="100%" y2={`${i*7+4}%`} stroke="#0044ff" strokeWidth=".5"/>)}
      </svg>
      <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 40%,#0a005588,transparent 65%)' }}/>
      <div style={{ position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,204,.015) 3px,rgba(0,255,204,.015) 4px)',pointerEvents:'none' }}/>
      <div style={{ textAlign:'center',position:'relative',zIndex:1,padding:'0 20px',width:'100%',maxWidth:420 }}>
        <div style={{ fontSize:68,marginBottom:10,filter:'drop-shadow(0 0 24px #00ffcc)' }}>🌐</div>
        <div style={{ fontSize:42,fontWeight:900,letterSpacing:10,color:'#00ffcc',textShadow:'0 0 32px #00ffcc88',marginBottom:4 }}>AMM</div>
        <div style={{ fontSize:18,fontWeight:700,letterSpacing:7,color:'#4488ff',textShadow:'0 0 16px #4488ff',marginBottom:4 }}>OMNIVERSE</div>
        <div style={{ fontSize:10,color:'#334',letterSpacing:4,marginBottom:28 }}>ALL AMERICAN MARKETPLACE · FAITH · FAMILY · LEGACY</div>
        <div style={{ display:'flex',gap:12,justifyContent:'center',marginBottom:30,flexWrap:'wrap' }}>
          {[{icon:'🏙️',label:'CITY',color:'#00ffcc'},{icon:'⚽',label:'SPORTS',color:'#ff4400'},{icon:'🛒',label:'MARKET',color:'#00cc44'},{icon:'🎵',label:'MUSIC',color:'#00ccff'},{icon:'✝️',label:'FAITH',color:'#ffd700'},{icon:'⛓',label:'CHAIN',color:'#ffaa00'}].map(r=>(
            <div key={r.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:26,filter:`drop-shadow(0 0 8px ${r.color})` }}>{r.icon}</div>
              <div style={{ color:r.color,fontSize:8,letterSpacing:2,marginTop:4 }}>{r.label}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>store.setScreen('login')} style={{ display:'block',width:'100%',background:'linear-gradient(135deg,#00ffcc22,#0044ff22)',border:'1px solid #00ffcc',color:'#00ffcc',borderRadius:10,padding:'14px',fontSize:15,cursor:'pointer',fontFamily:'monospace',fontWeight:900,letterSpacing:4,textShadow:'0 0 10px #00ffcc',boxShadow:'0 0 24px #00ffcc33',marginBottom:10 }}>
          ENTER THE OMNIVERSE
        </button>
        <button onClick={()=>setShowDownload(true)} style={{ display:'block',width:'100%',background:'transparent',border:'1px solid #333',color:'#888',borderRadius:10,padding:'11px',fontSize:12,cursor:'pointer',fontFamily:'monospace',fontWeight:700,letterSpacing:2 }}>
          📲 DOWNLOAD THE APP
        </button>
        <div style={{ color:'#2a2a3a',fontSize:9,marginTop:14,letterSpacing:3 }}>POWERED BY AMM · SET APART · EL SATURN CHAIN</div>
      </div>
    </div>
  )
}

// ── DOWNLOAD PAGE ──────────────────────────────────────────────────────────────
function DownloadPage({ onBack, onEnter }: { onBack:()=>void; onEnter:()=>void }) {
  const [installed, setInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isAndroid = /android/i.test(navigator.userAgent)

  useEffect(()=>{
    const handler = (e:any)=>{ e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    if(window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    return ()=>window.removeEventListener('beforeinstallprompt', handler)
  },[])

  const installPWA = async () => {
    if(!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if(outcome==='accepted') setInstalled(true)
  }

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',fontFamily:'monospace',color:'#ccc',overflowY:'auto' }}>
      <div style={{ padding:'12px 16px',borderBottom:'1px solid #1a1a3e',display:'flex',alignItems:'center',gap:10,background:'#09091d' }}>
        <button onClick={onBack} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>← BACK</button>
        <span style={{ color:'#00ffcc',fontWeight:900,fontSize:14 }}>📲 GET AMM OMNIVERSE</span>
      </div>
      <div style={{ padding:20,maxWidth:480,margin:'0 auto' }}>
        {/* App hero */}
        <div style={{ background:'linear-gradient(135deg,rgba(0,255,204,.1),rgba(0,68,255,.08))',border:'1px solid #00ffcc44',borderRadius:16,padding:20,marginBottom:20,textAlign:'center' }}>
          <div style={{ fontSize:52,marginBottom:10,filter:'drop-shadow(0 0 16px #00ffcc)' }}>🌐</div>
          <div style={{ color:'#00ffcc',fontWeight:900,fontSize:18,letterSpacing:4 }}>AMM OMNIVERSE</div>
          <div style={{ color:'#555',fontSize:11,marginTop:4 }}>All American Marketplace LLC · tryamm.online</div>
          <div style={{ display:'flex',gap:10,justifyContent:'center',marginTop:10,fontSize:11,color:'#888',flexWrap:'wrap' }}>
            <span>⭐ 4.9</span><span>•</span><span>Free download</span><span>•</span><span>Faith centered</span><span>•</span><span>11 games</span>
          </div>
        </div>

        {installed && (
          <div style={{ background:'rgba(0,204,68,.1)',border:'1px solid #00cc44',borderRadius:12,padding:14,marginBottom:16,textAlign:'center' }}>
            <div style={{ color:'#00cc44',fontWeight:700,fontSize:14,marginBottom:4 }}>✅ Already installed!</div>
            <button onClick={onEnter} style={{ marginTop:8,background:'rgba(0,204,68,.2)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'8px 20px',cursor:'pointer',fontFamily:'monospace',fontWeight:700 }}>Open App →</button>
          </div>
        )}

        {/* Android / Chrome install */}
        {(isAndroid || deferredPrompt) && !installed && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>ANDROID · CHROME · DESKTOP</div>
            <button onClick={installPWA} style={{ width:'100%',background:'linear-gradient(135deg,rgba(0,204,68,.2),rgba(0,204,68,.08))',border:'2px solid #00cc44',color:'#00cc44',borderRadius:12,padding:16,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
              <span style={{ fontSize:22 }}>📲</span>
              <div style={{ textAlign:'left' }}>
                <div>INSTALL AMM OMNIVERSE</div>
                <div style={{ fontSize:10,color:'#00cc4488',fontWeight:400,marginTop:2 }}>Adds to home screen · works offline · no app store needed</div>
              </div>
            </button>
          </div>
        )}

        {/* iOS Safari steps */}
        {isIOS && !installed && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>iPHONE · iPAD — OPEN IN SAFARI</div>
            <div style={{ background:'#09091c',border:'1px solid #1a1a3e',borderRadius:12,padding:16 }}>
              {[
                {n:'1',icon:'🌐',text:'Open tryamm.online in Safari (not Chrome)'},
                {n:'2',icon:'⎙', text:'Tap the Share button at the bottom of screen'},
                {n:'3',icon:'➕',text:'Scroll down · tap "Add to Home Screen"'},
                {n:'4',icon:'✅',text:'Tap "Add" — AMM icon appears on home screen'},
              ].map(s=>(
                <div key={s.n} style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:12 }}>
                  <div style={{ width:24,height:24,background:'rgba(0,255,204,.12)',border:'1px solid #00ffcc44',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#00ffcc',fontWeight:900,fontSize:11,flexShrink:0 }}>{s.n}</div>
                  <div style={{ fontSize:12,color:'#aaa',paddingTop:2,flex:1 }}><span style={{ marginRight:5 }}>{s.icon}</span>{s.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* App store placeholders */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20 }}>
          {[{icon:'🤖',name:'Google Play',status:'Coming soon'},{icon:'🍎',name:'App Store',status:'Coming soon'}].map(s=>(
            <div key={s.name} style={{ background:'#09091c',border:'1px solid #222',borderRadius:12,padding:14,textAlign:'center',opacity:.6 }}>
              <div style={{ fontSize:26,marginBottom:6 }}>{s.icon}</div>
              <div style={{ color:'#888',fontWeight:700,fontSize:12 }}>{s.name}</div>
              <div style={{ color:'#555',fontSize:10,marginTop:3 }}>{s.status}</div>
              <div style={{ color:'#333',fontSize:9,marginTop:5 }}>Use install above</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>FREE FEATURES INCLUDED</div>
        {['🏙️ 3D open world city with PBR graphics and holographic portals','🎮 11 playable games — Tactical Realms, Hero RPG, Card Battle, AR + more','🎬 AMM Drama Box — 5 faith drama series with episode unlocks','🌐 Holoverse — HoloGPT, HoloDelivery, HoloRideShare, HoloSearch','💳 AMM Wallet, Passport, and Driver License on El Saturn Chain','🎵 Music streaming — $0.012–$0.018/stream, creator keeps 90%','📱 Works offline after install · No app store subscription needed'].map((f,i)=>(
          <div key={i} style={{ display:'flex',gap:8,padding:'5px 0',fontSize:11,color:'#888',borderBottom:'1px solid #0a0a20' }}>
            <span style={{ color:'#00cc44',flexShrink:0 }}>✓</span>{f}
          </div>
        ))}
        <button onClick={onEnter} style={{ width:'100%',marginTop:20,background:'rgba(0,255,204,.1)',border:'1px solid #00ffcc',color:'#00ffcc',borderRadius:10,padding:14,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13,letterSpacing:3 }}>
          ENTER IN BROWSER →
        </button>
      </div>
    </div>
  )
}

// ── ONBOARDING — 3 steps ──────────────────────────────────────────────────────
export function LoginScreen() {
  const store = useGameStore()
  const [authUser, setAuthUser] = useState<AuthUser|null>(null)
  const [loading, setLoading] = useState(true)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [step, setStep] = useState<'account'|'payment'|'avatar'>('account')
  const [name, setName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [mode, setMode] = useState<'google'|'guest'|null>(null)
  const [avatar, setAvatar] = useState<'king'|'queen'|'prophet'|'warrior'>('king')
  const [selectedTier, setSelectedTier] = useState<'free'|'pro'|'creator'>('free')
  const [payMethod, setPayMethod] = useState<'card'|'crypto'|'skip'>('skip')
  // Card fields
  const [cardName, setCardName] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVV, setCardCVV] = useState('')
  // Crypto
  const [cryptoType, setCryptoType] = useState<'BTC'|'ETH'|'USDC'|'SOL'>('USDC')

  const configured = isSupabaseConfigured()
  const apiUrl = (import.meta as any).env?.VITE_API_URL ?? ''

  useEffect(()=>{
    getSessionUser().then(u=>{
      if(u){ setAuthUser(u); setName(u.name); setStep('payment') }
      setLoading(false)
    })
  },[])

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { user, error } = await signInWithGoogle()
    if(error){ store.setNotif(`❌ ${error}`); setGoogleLoading(false); return }
    if(user){ setAuthUser(user); setName(user.name); setMode('google'); setStep('payment') }
    setGoogleLoading(false)
  }
  const handleGuest = () => {
    const finalName = guestName.trim() || 'Creator'
    setName(finalName); setMode('guest'); setStep('payment')
  }
  const handlePayment = async () => {
    if(selectedTier==='free'||payMethod==='skip'){ setStep('avatar'); return }
    if(payMethod==='card'&&(!cardNum||!cardExpiry||!cardCVV||!cardName)){ store.setNotif('❌ Fill in all card fields'); return }
    if(apiUrl){
      try{
        const res = await fetch(`${apiUrl}/api/stripe/checkout`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:selectedTier==='pro'?'pro_monthly':'creator_monthly',userId:authUser?.id??'guest',email:authUser?.email??'',type:'subscription'})})
        const { url } = await res.json()
        if(url) window.open(url,'_blank')
      }catch{ store.setNotif('⚠️ Demo mode — connect Stripe backend for real payments') }
    } else if(payMethod==='crypto'){
      store.setNotif(`🔐 Send ${selectedTier==='pro'?'≈8':'≈15'} ${cryptoType} to AMM wallet. Confirmation in 1–3 min.`)
    }
    setStep('avatar')
  }
  const enter = () => {
    store.setPlayer({ name, avatar })
    store.setNotif(`🌐 Welcome, ${name}! ${selectedTier!=='free'?`${selectedTier.toUpperCase()} activated.`:'Enjoy the free tier!'}`)
    store.setScreen('city')
  }

  const fmtCard = (v:string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const fmtExp  = (v:string) => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?`${d.slice(0,2)}/${d.slice(2)}`:d }

  const TIERS = [
    { id:'free'    as const, name:'Free',       price:'$0',      color:'#555',    features:['3 realm visits/day','5 music streams','11 games (no save)','1 Drama episode/series'] },
    { id:'pro'     as const, name:'AMM Pro',    price:'$7.99',   color:'#00ffcc', popular:true, features:['All 6 realms','All 16 avatars','50 uploads/mo','10 Drama unlocks','Progress saves'] },
    { id:'creator' as const, name:'Creator',    price:'$14.99',  color:'#8800ff', features:['Everything in Pro','Unlimited uploads','Spotify distribution','QVC studio','Publish Drama series'] },
  ]
  const CRYPTO_WALLETS:Record<string,string> = {
    BTC:'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ETH:'0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    USDC:'0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    SOL:'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmkzBnEss',
  }

  if(loading) return <div style={{ width:'100%',height:'100%',background:'#020212',display:'flex',alignItems:'center',justifyContent:'center',color:'#00ffcc',fontFamily:'monospace' }}>Loading...</div>

  return (
    <div style={{ width:'100%',height:'100%',background:'#020212',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',overflowY:'auto',padding:'20px 16px',boxSizing:'border-box' }}>
      <div style={{ width:'100%',maxWidth:460,background:'rgba(5,5,30,.98)',border:'1px solid #00ffcc44',borderRadius:16,padding:28,boxShadow:'0 0 40px #00ffcc11' }}>

        {/* Progress bar */}
        <div style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:24 }}>
          {['account','payment','avatar'].map((s,i)=>(
            <div key={s} style={{ height:6,borderRadius:3,background:step===s?'#00ffcc':['account','payment','avatar'].indexOf(step)>i?'#00cc4466':'#1a1a3e',width:step===s?32:16,transition:'all .3s' }}/>
          ))}
        </div>

        {/* STEP 1 — ACCOUNT */}
        {step==='account'&&(
          <>
            <div style={{ textAlign:'center',marginBottom:22 }}>
              <div style={{ fontSize:30,marginBottom:8 }}>🌐</div>
              <div style={{ color:'#00ffcc',fontSize:17,fontWeight:900,letterSpacing:3 }}>CREATE ACCOUNT</div>
              <div style={{ color:'#555',fontSize:11,marginTop:4 }}>Step 1 of 3 · Your AMM identity</div>
            </div>
            <button onClick={handleGoogle} disabled={googleLoading} style={{ width:'100%',background:googleLoading?'#111':'#fff',border:'none',borderRadius:8,padding:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:14 }}>
              {!googleLoading&&<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              <span style={{ fontFamily:'monospace',fontWeight:700,color:'#111',fontSize:14 }}>{googleLoading?'Connecting...':configured?'Continue with Google':'Demo Google Login'}</span>
            </button>
            {!configured&&<div style={{ background:'#ffaa0011',border:'1px solid #ffaa0033',borderRadius:6,padding:'7px 10px',marginBottom:12,fontSize:10,color:'#ffaa00' }}>⚠️ Demo mode — add VITE_SUPABASE_URL for real Google login</div>}
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:12 }}>
              <div style={{ flex:1,height:1,background:'#1a1a3e' }}/><span style={{ color:'#444',fontSize:11 }}>or guest</span><div style={{ flex:1,height:1,background:'#1a1a3e' }}/>
            </div>
            <input value={guestName} onChange={e=>setGuestName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGuest()} placeholder="Enter your creator name..."
              style={{ width:'100%',background:'#0a0a25',border:'1px solid #00ffcc33',color:'#fff',borderRadius:8,padding:'11px 14px',fontSize:13,fontFamily:'monospace',marginBottom:10,boxSizing:'border-box' }}/>
            <button onClick={handleGuest} style={{ width:'100%',background:'rgba(0,255,204,.15)',border:'1px solid #00ffcc88',color:'#00ffcc',borderRadius:8,padding:'12px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:13 }}>
              CONTINUE AS GUEST →
            </button>
            <div style={{ color:'#2a2a3a',fontSize:10,textAlign:'center',marginTop:12 }}>Google saves your progress · Guest accounts are temporary</div>
          </>
        )}

        {/* STEP 2 — PAYMENT */}
        {step==='payment'&&(
          <>
            <div style={{ textAlign:'center',marginBottom:18 }}>
              <div style={{ fontSize:26,marginBottom:6 }}>💳</div>
              <div style={{ color:'#ffd700',fontSize:16,fontWeight:900 }}>CHOOSE YOUR PLAN</div>
              <div style={{ color:'#555',fontSize:11,marginTop:3 }}>Step 2 of 3 · Welcome, {name}!</div>
            </div>

            {/* Tier cards */}
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
              {TIERS.map(t=>(
                <div key={t.id} onClick={()=>setSelectedTier(t.id)} style={{ background:selectedTier===t.id?`${t.color}12`:'#09091c',border:`${selectedTier===t.id?2:1}px solid ${selectedTier===t.id?t.color:'#222'}`,borderRadius:10,padding:'11px 13px',cursor:'pointer',position:'relative' }}>
                  {(t as any).popular&&<div style={{ position:'absolute',top:-8,right:10,background:t.color,color:'#111',borderRadius:20,padding:'1px 10px',fontSize:9,fontWeight:900 }}>POPULAR</div>}
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <div style={{ width:14,height:14,borderRadius:'50%',border:`2px solid ${t.color}`,background:selectedTier===t.id?t.color:'transparent',flexShrink:0 }}/>
                      <span style={{ color:selectedTier===t.id?t.color:'#888',fontWeight:700,fontSize:13 }}>{t.name}</span>
                    </div>
                    <span style={{ color:t.color,fontWeight:900,fontSize:14 }}>{t.price}<span style={{ color:'#555',fontSize:10,fontWeight:400 }}>{t.id!=='free'?'/mo':''}</span></span>
                  </div>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                    {t.features.slice(0,2).map((f,i)=><span key={i} style={{ color:'#555',fontSize:9 }}>✓ {f}</span>)}
                    {t.features.length>2&&<span style={{ color:'#333',fontSize:9 }}>+{t.features.length-2} more</span>}
                  </div>
                </div>
              ))}
            </div>

            {selectedTier!=='free'&&(
              <>
                <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>PAYMENT METHOD</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:14 }}>
                  {[{id:'card' as const,label:'💳 Card',desc:'Visa/MC/Amex'},{id:'crypto' as const,label:'🔐 Crypto',desc:'BTC/ETH/USDC/SOL'},{id:'skip' as const,label:'⏭ Later',desc:'Start free first'}].map(pm=>(
                    <button key={pm.id} onClick={()=>setPayMethod(pm.id)} style={{ background:payMethod===pm.id?'rgba(0,255,204,.12)':'#09091c',border:`1px solid ${payMethod===pm.id?'#00ffcc':'#222'}`,color:payMethod===pm.id?'#00ffcc':'#666',borderRadius:8,padding:'9px 5px',cursor:'pointer',fontFamily:'monospace',textAlign:'center' }}>
                      <div style={{ fontSize:12,fontWeight:700 }}>{pm.label}</div>
                      <div style={{ fontSize:9,color:'#555',marginTop:2 }}>{pm.desc}</div>
                    </button>
                  ))}
                </div>

                {payMethod==='card'&&(
                  <div style={{ marginBottom:14 }}>
                    <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Name on card" style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' }}/>
                    <input value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} style={{ width:'100%',background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:13,marginBottom:8,letterSpacing:2,boxSizing:'border-box' }}/>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                      <input value={cardExpiry} onChange={e=>setCardExpiry(fmtExp(e.target.value))} placeholder="MM/YY" style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:13 }}/>
                      <input value={cardCVV} onChange={e=>setCardCVV(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="CVV" style={{ background:'#09091c',border:'1px solid #333',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:13 }}/>
                    </div>
                    <div style={{ fontSize:10,color:'#333',textAlign:'center' }}>🔒 Secured by Stripe · AMM never stores card data</div>
                  </div>
                )}

                {payMethod==='crypto'&&(
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:10 }}>
                      {(['BTC','ETH','USDC','SOL'] as const).map(c=>(
                        <button key={c} onClick={()=>setCryptoType(c)} style={{ background:cryptoType===c?'rgba(255,215,0,.15)':'#09091c',border:`1px solid ${cryptoType===c?'#ffd700':'#222'}`,color:cryptoType===c?'#ffd700':'#555',borderRadius:6,padding:'7px 4px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700 }}>{c}</button>
                      ))}
                    </div>
                    <div style={{ background:'#09091c',border:'1px solid #ffd70033',borderRadius:8,padding:12 }}>
                      <div style={{ color:'#ffd700',fontSize:11,fontWeight:700,marginBottom:5 }}>Send {selectedTier==='pro'?'≈8':'≈15'} {cryptoType} to:</div>
                      <div style={{ color:'#888',fontSize:9,fontFamily:'monospace',wordBreak:'break-all',lineHeight:1.6,marginBottom:8 }}>{CRYPTO_WALLETS[cryptoType]}</div>
                      <button onClick={()=>{navigator.clipboard?.writeText(CRYPTO_WALLETS[cryptoType]);store.setNotif('📋 Wallet address copied!')}} style={{ background:'rgba(255,215,0,.1)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📋 Copy</button>
                    </div>
                    <div style={{ fontSize:10,color:'#555',marginTop:6,textAlign:'center' }}>Confirmation arrives in 1–3 minutes</div>
                  </div>
                )}
              </>
            )}

            <button onClick={handlePayment} style={{ width:'100%',background:selectedTier==='free'?'rgba(0,255,204,.1)':'rgba(255,215,0,.15)',border:`2px solid ${selectedTier==='free'?'#00ffcc':'#ffd700'}`,color:selectedTier==='free'?'#00ffcc':'#ffd700',borderRadius:10,padding:13,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>
              {selectedTier==='free'?'CONTINUE FREE →':payMethod==='skip'?`START ${selectedTier.toUpperCase()} (PAY LATER) →`:payMethod==='crypto'?`I SENT ${cryptoType} →`:`SUBSCRIBE — ${TIERS.find(t=>t.id===selectedTier)?.price}/mo →`}
            </button>
            <button onClick={()=>setStep('account')} style={{ width:'100%',background:'none',border:'none',color:'#444',fontSize:11,marginTop:10,cursor:'pointer',fontFamily:'monospace' }}>← Back</button>
          </>
        )}

        {/* STEP 3 — AVATAR */}
        {step==='avatar'&&(
          <>
            <div style={{ textAlign:'center',marginBottom:18 }}>
              {authUser?.avatar_url&&<img src={authUser.avatar_url} alt="" style={{ width:50,height:50,borderRadius:'50%',border:'2px solid #00ffcc',marginBottom:8 }}/>}
              <div style={{ color:'#00ffcc',fontSize:16,fontWeight:900 }}>CHOOSE YOUR CLASS</div>
              <div style={{ color:'#555',fontSize:11,marginTop:3 }}>Step 3 of 3 · Almost there!</div>
              {selectedTier!=='free'&&<div style={{ marginTop:8,background:'rgba(0,204,68,.1)',border:'1px solid #00cc4433',borderRadius:20,padding:'2px 12px',display:'inline-block',color:'#00cc44',fontSize:10 }}>✅ {selectedTier.toUpperCase()} selected</div>}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18 }}>
              {[{id:'king' as const,icon:'👑',label:'KING',bonus:'+20% Cash Earnings'},{id:'queen' as const,icon:'👸',label:'QUEEN',bonus:'+20% Marketplace'},{id:'prophet' as const,icon:'📖',label:'PROPHET',bonus:'+30% Faith Points'},{id:'warrior' as const,icon:'⚔️',label:'WARRIOR',bonus:'+25% Combat XP'}].map(a=>(
                <div key={a.id} onClick={()=>setAvatar(a.id)} style={{ padding:13,textAlign:'center',cursor:'pointer',borderRadius:10,background:avatar===a.id?'rgba(0,255,204,.1)':'#09091c',border:`2px solid ${avatar===a.id?'#00ffcc':'#1a1a3e'}`,transition:'all .15s' }}>
                  <div style={{ fontSize:30,marginBottom:6 }}>{a.icon}</div>
                  <div style={{ color:avatar===a.id?'#00ffcc':'#888',fontWeight:700,fontSize:12 }}>{a.label}</div>
                  <div style={{ color:'#555',fontSize:10,marginTop:3 }}>{a.bonus}</div>
                </div>
              ))}
            </div>
            <button onClick={enter} style={{ width:'100%',background:'linear-gradient(135deg,#00ffcc22,#0044ff22)',border:'2px solid #00ffcc',color:'#00ffcc',borderRadius:10,padding:'14px',cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14,textShadow:'0 0 10px #00ffcc',boxShadow:'0 0 20px #00ffcc22',letterSpacing:2 }}>
              🌐 ENTER OMNIVERSE
            </button>
            <button onClick={()=>setStep('payment')} style={{ width:'100%',background:'none',border:'none',color:'#444',fontSize:11,marginTop:10,cursor:'pointer',fontFamily:'monospace' }}>← Back</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── NOTIFICATION TOAST ────────────────────────────────────────────────────────
export function NotifToast() {
  const notif = useGameStore(s=>s.notif)
  if(!notif) return null
  return (
    <div style={{ position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:'rgba(2,2,20,.97)',border:'1px solid #00ffcc88',borderRadius:10,padding:'11px 22px',color:'#fff',fontSize:13,fontFamily:'monospace',zIndex:10000,pointerEvents:'none',boxShadow:'0 0 24px #00ffcc22',maxWidth:'90vw',textAlign:'center' }}>
      {notif}
    </div>
  )
}
