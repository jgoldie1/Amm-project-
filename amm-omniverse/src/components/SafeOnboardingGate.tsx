import { useEffect, useState } from 'react'
import { getSessionUser, isSupabaseConfigured, signInWithGoogle, type AuthUser } from '../game/auth/googleAuth'
import { useGameStore } from '../game/state/useGameStore'

type Avatar = 'king'|'queen'|'prophet'|'warrior'
type PaymentStatus = { ok?: boolean; stripeConfigured?: boolean; verification?: string; payoutMode?: string; livePayoutsEnabled?: boolean }

export default function SafeOnboardingGate() {
  const screen = useGameStore(s => s.screen)
  const store = useGameStore()
  const [stage, setStage] = useState<'account'|'plan'|'avatar'>('account')
  const [name, setName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [authUser, setAuthUser] = useState<AuthUser|null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [avatar, setAvatar] = useState<Avatar>('king')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus|null>(null)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (screen !== 'login') return
    getSessionUser().then(user => {
      if (user) { setAuthUser(user); setName(user.name); setStage('plan') }
    })
    fetch('/api/payments/status', { headers: { Accept: 'application/json' } })
      .then(async response => response.ok ? response.json() : null)
      .then(status => setPaymentStatus(status))
      .catch(() => setPaymentStatus(null))
  }, [screen])

  if (screen !== 'login') return null

  const continueGuest = () => { const finalName = guestName.trim() || 'Creator'; setName(finalName); setStage('plan') }
  const continueGoogle = async () => {
    setGoogleLoading(true)
    const { user, error } = await signInWithGoogle()
    if (error) { store.setNotif(`❌ ${error}`); setGoogleLoading(false); return }
    if (user) { setAuthUser(user); setName(user.name); setStage('plan') }
    setGoogleLoading(false)
  }
  const enterWorld = () => {
    store.setPlayer({ name: name || authUser?.name || 'Creator', avatar })
    store.setNotif('🌐 Welcome to TRYAMM. Free access is active. Paid access requires provider-verified checkout.')
    store.setScreen('city')
  }
  const providerReady = paymentStatus?.stripeConfigured === true && paymentStatus?.verification === 'server_retrieve'

  return (
    <div data-testid="safe-onboarding-gate" style={{position:'fixed',inset:0,zIndex:20000,background:'#020212',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',padding:16,overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:480,background:'#070719',border:'1px solid #00ffcc55',borderRadius:18,padding:24,boxShadow:'0 20px 70px #000b'}}>
        <div style={{textAlign:'center',marginBottom:20}}><div style={{fontSize:30}}>🌐</div><div style={{color:'#00ffcc',fontWeight:900,letterSpacing:3,marginTop:8}}>TRYAMM PASSPORT</div><div style={{color:'#667085',fontSize:10,marginTop:5}}>Safe onboarding · provider-verified payments only</div></div>
        {stage === 'account' && <>
          <button onClick={continueGoogle} disabled={googleLoading} style={{width:'100%',padding:12,borderRadius:9,border:'1px solid #ddd',background:'#fff',color:'#111',fontFamily:'monospace',fontWeight:800,cursor:'pointer',marginBottom:10}}>{googleLoading ? 'CONNECTING…' : configured ? 'CONTINUE WITH GOOGLE' : 'DEMO GOOGLE LOGIN'}</button>
          <input value={guestName} onChange={e=>setGuestName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&continueGuest()} placeholder="Creator name" style={{width:'100%',boxSizing:'border-box',padding:12,borderRadius:9,border:'1px solid #26324a',background:'#0a0d1e',color:'#fff',fontFamily:'monospace',marginBottom:10}} />
          <button onClick={continueGuest} style={{width:'100%',padding:12,borderRadius:9,border:'1px solid #00ffcc88',background:'#00ffcc18',color:'#00ffcc',fontFamily:'monospace',fontWeight:900,cursor:'pointer'}}>CONTINUE AS GUEST →</button>
        </>}
        {stage === 'plan' && <>
          <div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:8}}>Welcome, {name || 'Creator'}</div>
          <div style={{background:'#071923',border:'1px solid #00ffcc55',borderRadius:12,padding:14,marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}><b style={{color:'#00ffcc'}}>FREE</b><b style={{color:'#fff'}}>$0</b></div><div style={{color:'#91a0b8',fontSize:11,marginTop:6}}>Enter StreetVerse and use available free/beta experiences.</div></div>
          <div style={{background:'#17120a',border:'1px solid #e8b94455',borderRadius:12,padding:14,marginBottom:12}}><div style={{color:'#e8b944',fontWeight:900}}>PRO / CREATOR</div><div style={{color:'#c2aa73',fontSize:11,lineHeight:1.55,marginTop:6}}>{providerReady ? 'Stripe verification is reachable, but paid onboarding remains gated until hosted subscription checkout and post-payment entitlement are certified end-to-end.' : 'Paid plans temporarily unavailable — continue free. TRYAMM does not collect card numbers/CVV here and does not request manual crypto sends.'}</div><div style={{fontSize:9,color:'#74664a',marginTop:8}}>Verification: {paymentStatus?.verification ?? 'unavailable'} · Payout mode: {paymentStatus?.payoutMode ?? 'unknown'} · Live payouts: {paymentStatus?.livePayoutsEnabled === true ? 'enabled' : 'disabled'}</div></div>
          <button onClick={()=>setStage('avatar')} style={{width:'100%',padding:13,borderRadius:9,border:'1px solid #00ffcc',background:'#00ffcc18',color:'#00ffcc',fontFamily:'monospace',fontWeight:900,cursor:'pointer'}}>CONTINUE FREE →</button>
        </>}
        {stage === 'avatar' && <>
          <div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:12}}>Choose your avatar profile</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:14}}>{(['king','queen','prophet','warrior'] as Avatar[]).map(value => <button key={value} onClick={()=>setAvatar(value)} style={{padding:13,borderRadius:10,border:`1px solid ${avatar===value?'#00ffcc':'#283047'}`,background:avatar===value?'#00ffcc18':'#0a0d1e',color:avatar===value?'#00ffcc':'#9aa6bd',fontFamily:'monospace',fontWeight:800,cursor:'pointer',textTransform:'uppercase'}}>{value}</button>)}</div>
          <button onClick={enterWorld} style={{width:'100%',padding:13,borderRadius:9,border:'1px solid #00ffcc',background:'#00ffcc22',color:'#00ffcc',fontFamily:'monospace',fontWeight:900,cursor:'pointer'}}>ENTER TRYAMM →</button>
        </>}
      </div>
    </div>
  )
}
