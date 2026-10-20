import {Component, useEffect, useState, type ReactNode} from 'react'
import {createRoot} from 'react-dom/client'
import {getSupabaseClient} from './services/supabaseClient'
import './business-entry.css'
import TemplateStore from './business/TemplateStore'
import BusinessAccessibility from './business/BusinessAccessibility'
import BusinessOnboarding from './business/BusinessOnboarding'
import ServiceWorkbench from './business/ServiceWorkbench'
import SupportOperatorConsole from './business/SupportOperatorConsole'
import TemplateGallery from './business/TemplateGallery'
import BusinessFundingHub from './business/BusinessFundingHub'
import PilotProgram from './business/PilotProgram'
import TemplatePublisher from './business/TemplatePublisher'
import {TemplateCatalogProvider} from './business/TemplateCatalogProvider'

type Order={id:string;currency:string;subtotalCents:number;status:string;createdAt:string}
class BusinessBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false}
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<main><h1>TRYAMM Business</h1><p>This page could not open. Your orders have not been changed.</p><a href="/business-app.html">Try again</a></main>:this.props.children}
}
function BetaTools(){
 const [status,setStatus]=useState({media:'Checking…',payments:'Checking…',video:'Checking…'})
 const [steps,setSteps]=useState(''),[actual,setActual]=useState(''),[expected,setExpected]=useState(''),[notice,setNotice]=useState('')
 useEffect(()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000)
  let active=true
  const check=async(key:'media'|'payments'|'video',path:string)=>{
   try{
    const response=await fetch(path,{signal:controller.signal,cache:'no-store'})
    const data=await response.json()
    const text=key==='media'?(response.ok&&data.signedUploads&&data.verifiedPlayback?'Service available — publishing still needs a test.':'Cloud publishing unavailable. Keep your original file.'):
     key==='payments'?(response.ok&&data.stripeConfigured?'Payment setup detected — purchases are not beta-verified.':'Payments unavailable. Do not buy credits during this beta.'):
     (response.ok&&data.configured?'Video provider configured — completed rendering not verified.':'AI video generation unavailable. Script and scene planning can still be tested.')
    if(active)setStatus(old=>({...old,[key]:text}))
   }catch{if(active)setStatus(old=>({...old,[key]:'Status unavailable. This feature is not verified ready.'}))}
  }
  void Promise.all([check('media','/api/media/health'),check('payments','/api/payments/status'),check('video','/api/media/happy-horse')]).finally(()=>clearTimeout(timer))
  return()=>{active=false;clearTimeout(timer);controller.abort()}
 },[])
 function saveReport(event:React.FormEvent){
  event.preventDefault()
  const body=['TRYAMM beta problem report',new Date().toISOString(),'Page: /business-app','What I tapped:',steps,'What happened:',actual,'What I expected:',expected].join('\n')
  const url=URL.createObjectURL(new Blob([body],{type:'text/plain;charset=utf-8'})),a=document.createElement('a')
  a.href=url;a.download='TRYAMM-beta-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('Report prepared for download. It has not been sent. Attach the saved file when reporting the problem.')
 }
 return <section data-beta-diagnostics aria-labelledby="beta-title"><h2 id="beta-title">Small beta · test before you sell</h2>
 <p>Try a short clip and keep the original on your phone. This beta does not certify purchases, payouts or finished movie generation.</p>
 <ul aria-live="polite"><li><strong>Reel publishing: </strong>{status.media}</li><li><strong>Payments: </strong>{status.payments}</li><li><strong>AI video: </strong>{status.video}</li></ul>
 <details><summary>Report a problem — no screenshot needed</summary><p>Describe the problem below. Do not include passwords, payment details or private customer information. The report stays here until you download and share it.</p>
 <form onSubmit={saveReport}><label>What did you tap?<textarea required maxLength={2000} value={steps} onChange={e=>setSteps(e.target.value)}/></label><label>What happened?<textarea required maxLength={2000} value={actual} onChange={e=>setActual(e.target.value)}/></label><label>What did you expect?<textarea required maxLength={2000} value={expected} onChange={e=>setExpected(e.target.value)}/></label><button>Download problem report</button></form><p role="status">{notice}</p></details></section>
}
function BusinessApp(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState('')
 const [account,setAccount]=useState<string|null>(null),[message,setMessage]=useState('Checking your account…'),[busy,setBusy]=useState(false)
 const [orders,setOrders]=useState<Order[]|null>(null),[orderMessage,setOrderMessage]=useState('Sign in to see your orders.')
 const sb=getSupabaseClient()
 useEffect(()=>{
  if(!sb){setMessage('Sign-in setup is unavailable. Please try again later.');return}
  let active=true
  const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{
   if(!active)return
   setAccount(session?.user.email||null);setOrders(null)
   setMessage(session?'Signed in with your TRYAMM account.':'Use the same account as StreetVerse.')
  })
  return()=>{active=false;subscription.unsubscribe()}
 },[sb])
 useEffect(()=>{
  const controller=new AbortController()
  let active=true
  if(!account){setOrders(null);setOrderMessage('Sign in to see your orders.');return()=>controller.abort()}
  setOrderMessage('Loading your orders…')
  const timer=setTimeout(()=>controller.abort(),12000)
  void (async()=>{
   try{
    const session=await sb!.auth.getSession(),token=session.data.session?.access_token
    if(!token)throw new Error('Please sign in again.')
    const response=await fetch('/api/commerce/orders',{headers:{Authorization:`Bearer ${token}`},signal:controller.signal,cache:'no-store'})
    if(!response.ok)throw new Error(response.status===401?'Please sign in again.':'Order history is temporarily unavailable. No order has been changed.')
    const data=await response.json()
    if(!data.ok||!Array.isArray(data.orders))throw new Error('Order history could not be verified.')
    if(active){setOrders(data.orders);setOrderMessage(data.orders.length?'Orders from your shared TRYAMM account.':'You have no orders yet.')}
   }catch(error){if(active)setOrderMessage(error instanceof Error&&error.name!=='AbortError'?error.message:'Order history timed out. Please reload to retry.')}
   finally{clearTimeout(timer)}
  })()
  return()=>{active=false;clearTimeout(timer);controller.abort()}
 },[account,sb])
 async function login(event:React.FormEvent){
  event.preventDefault();if(!sb||busy)return;setBusy(true)
  try{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;setPassword('')}
  catch(error){setMessage(error instanceof Error?error.message:'Unable to sign in.')}
  finally{setBusy(false)}
 }
 async function signup(){
  if(!sb||busy)return
  if(!email.trim()||password.length<8){setMessage('Enter an email and a password of at least 8 characters to create an account.');return}
  setBusy(true)
  try{const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/business-app.html'}});if(error)throw error;setPassword('');setMessage(data.session?'Account created and signed in.':'Check your email to confirm your account. Confirmation links must return to an allowed TRYAMM domain.')}
  catch(error){setMessage(error instanceof Error?error.message:'Account creation is unavailable.')}
  finally{setBusy(false)}
 }
 async function logout(){
  if(!sb)return;setBusy(true)
  try{const {error}=await sb.auth.signOut();if(error)throw error}
  catch{setMessage('Sign-out failed. Please retry.')}
  finally{setBusy(false)}
 }
 return <><a className="skip-link" href="#business-content">Skip to main content</a><header className="app-header"><a className="brand" href="/">TRYAMM <span>APP</span></a><nav aria-label="App navigation"><a href="#funding-hub">Funding & Compliance</a><a href="#business-catalog">Websites</a><a href="#app-tools">Tools</a><a href="#account">Account</a><a className="game-option" aria-label="StreetVerse · optional game ↗" href="/streetverse">Game · optional ↗</a></nav></header>
 <main id="business-content" tabIndex={-1}><div className="app-hero"><p className="eyebrow">WELCOME TO THE TRYAMM APP</p><h1>Build a business.<br/>Prepare to get funded.</h1><p className="intro">Start your business website, develop a funding plan, review registration and licensing requirements, prepare a lender packet, and grow with TRYAMM AI. StreetVerse remains a separate optional game.</p><div className="hero-actions"><a className="studio-jump" href="#funding-hub">Start funding & compliance plan ↓</a><a className="studio-jump secondary-action" href="#business-catalog">Browse 54 complete websites ↓</a><a className="studio-jump secondary-action" href="/create">Open creator tools ↗</a><a className="studio-jump secondary-action" href="#ai-workstation">Try Jarvis & AI ↓</a></div></div>
 <a className="pilot-invite" href="#template-pilot">10 free template gifts · join the honest-feedback pilot ↓</a><BusinessFundingHub/><TemplateGallery/><TemplatePublisher/><PilotProgram/><BusinessAccessibility/><nav id="app-tools" aria-label="Business tools" className="cards">
 {[
 ['/marketplace','Shop','Browse the marketplace'],['/business','Sell & manage','Open business tools'],['/create','Create','Open Reel and creator tools'],['/earnings','Earnings','Review earnings and payout status'],['/beauty-supply','Beautyverse','Open beauty business tools'],['/mobility360.html','Stubbs Mobility','Open mobility services']
 ].map(([href,title,detail])=><a className="card" key={href} href={href}><h2>{title} ↗</h2><p>{detail}</p></a>)}
 </nav><p className="note">These links open the existing TRYAMM tools. Checkout availability is checked by the server; game credits are not cash earnings.</p>
 <section id="account" aria-labelledby="account-title"><h2 id="account-title">Your account</h2><p role="status">{message}</p>
 {account?<><p>{account}</p><button disabled={busy} onClick={()=>void logout()}>Sign out</button></>:<form onSubmit={login}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={!sb||busy}>{busy?'Working…':'Sign in'}</button><button type="button" disabled={!sb||busy} onClick={()=>void signup()}>Create an account</button></form>}
 </section><section aria-labelledby="orders-title"><h2 id="orders-title">My orders</h2><p role="status">{orderMessage}</p>{orders?.map(order=><article className="order" key={order.id}><strong>Order {order.id}</strong><p>{order.status} · {order.currency.toUpperCase()} {(order.subtotalCents/100).toFixed(2)}</p><small>{order.createdAt}</small></article>)}</section>
 <ServiceWorkbench/><BetaTools/><BusinessOnboarding/><SupportOperatorConsole/><TemplateStore/><footer>Shared account and order service. StreetVerse runs in its own page.</footer></main></>
}
// Preserve explicit links used by existing tools while the default home opens the app.
const legacyOpen=new URLSearchParams(window.location.search).has('open')
if(legacyOpen&&(window.location.pathname==='/'||window.location.pathname==='/app')){
 window.location.replace('/legacy-app'+window.location.search+window.location.hash)
}else{
 createRoot(document.getElementById('business-root')!).render(<BusinessBoundary><TemplateCatalogProvider><BusinessApp/></TemplateCatalogProvider></BusinessBoundary>)
}
