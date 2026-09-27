import { useEffect, useState } from 'react'
import { continueAsGuest, getSessionUser, isSupabaseConfigured, sendEmailMagicLink, sendPhoneOtp, signInWithApple, signInWithEmail, signInWithGoogle, signUpWithEmail, verifyPhoneOtp, type AuthUser } from '../game/auth/googleAuth'
import { useGameStore } from '../game/state/useGameStore'
type Avatar='king'|'queen'|'prophet'|'warrior'
type PaymentStatus={stripeConfigured?:boolean;verification?:string;payoutMode?:string;livePayoutsEnabled?:boolean}
const btn:React.CSSProperties={width:'100%',padding:12,borderRadius:10,border:'1px solid #31405c',background:'#0a0d1e',color:'#fff',fontFamily:'monospace',fontWeight:900,cursor:'pointer',marginBottom:9}
const field:React.CSSProperties={...btn,fontWeight:500,boxSizing:'border-box'}
export default function SafeOnboardingGate(){
 const screen=useGameStore(s=>s.screen),store=useGameStore()
 const [stage,setStage]=useState<'account'|'plan'|'avatar'>('account'),[mode,setMode]=useState<'email'|'phone'|null>(null)
 const [name,setName]=useState(''),[guestName,setGuestName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[phone,setPhone]=useState(''),[otp,setOtp]=useState(''),[otpSent,setOtpSent]=useState(false),[busy,setBusy]=useState(false)
 const [authUser,setAuthUser]=useState<AuthUser|null>(null),[avatar,setAvatar]=useState<Avatar>('king'),[paymentStatus,setPaymentStatus]=useState<PaymentStatus|null>(null)
 const configured=isSupabaseConfigured()
 useEffect(()=>{if(screen!=='login')return;getSessionUser().then(u=>{if(u){setAuthUser(u);setName(u.name);setStage('plan')}});fetch('/api/payments/status',{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():null).then(setPaymentStatus).catch(()=>setPaymentStatus(null))},[screen])
 if(screen!=='login')return null
 const done=(u:AuthUser|null)=>{if(u){setAuthUser(u);setName(u.name);setStage('plan')}}
 const run=async(fn:()=>Promise<{user?:AuthUser|null;error:string|null}>)=>{setBusy(true);const r=await fn();if(r.error)store.setNotif('❌ '+r.error);else done(r.user??null);setBusy(false);return r}
 const oauth=async(provider:'google'|'apple')=>{setBusy(true);const r=await(provider==='google'?signInWithGoogle():signInWithApple());if(r.error)store.setNotif('❌ '+r.error);setBusy(false)}
 const emailLogin=()=>run(()=>signInWithEmail(email,password))
 const emailCreate=()=>run(()=>signUpWithEmail(email,password,name))
 const magic=async()=>{setBusy(true);const r=await sendEmailMagicLink(email);store.setNotif(r.error?'❌ '+r.error:'✉️ Check your email for the TRYAMM sign-in link.');setBusy(false)}
 const sms=async()=>{setBusy(true);const r=await sendPhoneOtp(phone);if(r.error)store.setNotif('❌ '+r.error);else{setOtpSent(true);store.setNotif('📲 Verification code sent by SMS.')}setBusy(false)}
 const verify=()=>run(()=>verifyPhoneOtp(phone,otp))
 const guest=()=>{const u=continueAsGuest(guestName);done(u)}
 const enter=()=>{store.setPlayer({name:name||authUser?.name||'Creator',avatar});store.setNotif('🌐 Welcome to TRYAMM.');store.setScreen('city')}
 const providerReady=paymentStatus?.stripeConfigured===true&&paymentStatus?.verification==='server_retrieve'
 return <div data-testid="safe-onboarding-gate" style={{position:'fixed',inset:0,zIndex:20000,background:'#020212',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',padding:16,overflowY:'auto'}}><div style={{width:'100%',maxWidth:480,background:'#070719',border:'1px solid #00ffcc55',borderRadius:18,padding:24,boxShadow:'0 20px 70px #000b'}}>
  <div style={{textAlign:'center',marginBottom:18}}><div style={{fontSize:30}}>🌐</div><div style={{color:'#00ffcc',fontWeight:900,letterSpacing:3,marginTop:8}}>TRYAMM PASSPORT</div><div style={{color:'#8290a8',fontSize:10,marginTop:5}}>Google · Apple · Phone SMS · Email</div></div>
  {stage==='account'&&<>{!mode&&<>
   <button onClick={()=>oauth('google')} disabled={busy||!configured} style={{...btn,background:'#fff',color:'#111'}}>G CONTINUE WITH GOOGLE</button>
   <button onClick={()=>oauth('apple')} disabled={busy||!configured} style={{...btn,background:'#000',border:'1px solid #777'}}>● CONTINUE WITH APPLE</button>
   <button onClick={()=>setMode('phone')} disabled={!configured} style={btn}>📱 CONTINUE WITH PHONE / SMS</button>
   <button onClick={()=>setMode('email')} disabled={!configured} style={btn}>✉️ CONTINUE WITH EMAIL</button>
   {!configured&&<div style={{color:'#ffcf72',fontSize:10,margin:'2px 0 10px'}}>Secure providers require the production Supabase environment configuration.</div>}
   <div style={{height:1,background:'#253047',margin:'10px 0'}}/><input value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Creator name" style={field}/><button onClick={guest} style={{...btn,border:'1px solid #00ffcc88',color:'#00ffcc'}}>CONTINUE AS GUEST →</button>
  </>}
  {mode==='phone'&&<><button onClick={()=>{setMode(null);setOtpSent(false)}} style={{...btn,width:'auto'}}>← BACK</button><input inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 312 555 1212" style={field}/>{otpSent&&<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="SMS verification code" style={field}/>}<button onClick={otpSent?verify:sms} disabled={busy||!phone||(otpSent&&!otp)} style={{...btn,border:'1px solid #00ffcc88',color:'#00ffcc'}}>{busy?'WORKING…':otpSent?'VERIFY CODE':'TEXT ME A CODE'}</button></>}
  {mode==='email'&&<><button onClick={()=>setMode(null)} style={{...btn,width:'auto'}}>← BACK</button><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={field}/><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (6+ characters)" style={field}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (for new account)" style={field}/><button onClick={emailLogin} disabled={busy||!email||!password} style={{...btn,border:'1px solid #00ffcc88',color:'#00ffcc'}}>SIGN IN WITH EMAIL</button><button onClick={emailCreate} disabled={busy||!email||password.length<6} style={btn}>CREATE EMAIL ACCOUNT</button><button onClick={magic} disabled={busy||!email} style={btn}>EMAIL ME A SIGN-IN LINK</button></>}
  </>}
  {stage==='plan'&&<><div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:8}}>Welcome, {name||'Creator'}</div><div style={{background:'#071923',border:'1px solid #00ffcc55',borderRadius:12,padding:14,marginBottom:10}}><b style={{color:'#00ffcc'}}>FREE · $0</b><div style={{color:'#91a0b8',fontSize:11,marginTop:6}}>One TRYAMM Passport for StreetVerse and connected experiences.</div></div><div style={{color:'#c2aa73',fontSize:10,marginBottom:12}}>Payments: {providerReady?'server verification reachable':'paid plans remain gated'} · {paymentStatus?.payoutMode??'unknown'}</div><button onClick={()=>setStage('avatar')} style={{...btn,border:'1px solid #00ffcc',color:'#00ffcc'}}>CONTINUE FREE →</button></>}
  {stage==='avatar'&&<><div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:12}}>Choose your avatar profile</div><div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:14}}>{(['king','queen','prophet','warrior'] as Avatar[]).map(v=><button key={v} onClick={()=>setAvatar(v)} style={{...btn,margin:0,border:`1px solid ${avatar===v?'#00ffcc':'#283047'}`,color:avatar===v?'#00ffcc':'#9aa6bd',textTransform:'uppercase'}}>{v}</button>)}</div><button onClick={enter} style={{...btn,border:'1px solid #00ffcc',color:'#00ffcc'}}>ENTER TRYAMM →</button></>}
 </div></div>
}
