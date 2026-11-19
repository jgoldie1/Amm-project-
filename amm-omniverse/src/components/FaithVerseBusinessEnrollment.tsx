import {useEffect,useState,type CSSProperties} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type Offer={id:string;title:string;kind:'course'|'publication';mode:'payment'|'subscription';description:string;refundPolicyUrl:string}
type Status={ok:boolean;crmEnabled:boolean;checkoutEnabled:boolean;marketingDoubleOptIn:boolean;offers:Offer[]}
const btn:CSSProperties={minHeight:56,padding:'12px 16px',fontSize:16,fontWeight:800,borderRadius:14,border:'1px solid #afcaa5',background:'#193a40',color:'#fff',cursor:'pointer'}
function apiBase(){
 const value=String(import.meta.env.VITE_TRYAMM_API_BASE||'').trim().replace(/\/$/,'')
 if(!value)return ''
 try{const u=new URL(value);if(u.protocol==='https:'||u.hostname==='localhost'&&u.protocol==='http:')return u.origin}catch{}
 return ''
}
async function request(path:string,options:RequestInit={}){
 const res=await fetch(apiBase()+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})},credentials:'same-origin',cache:'no-store'})
 const data=await res.json().catch(()=>({code:'INVALID_API_RESPONSE'}))
 if(!res.ok)throw new Error(String(data.code||data.error||'API request failed'))
 return data
}
export default function FaithVerseBusinessEnrollment({interest}:{interest:string}){
 const [ready,setReady]=useState<Status|null>(null)
 const [loading,setLoading]=useState(true)
 const [pending,setPending]=useState(false)
 const [consent,setConsent]=useState(false)
 const [notice,setNotice]=useState('Checking connected CRM and payment readiness.')
 const [offers,setOffers]=useState<Offer[]>([])
 const [verification,setVerification]=useState(()=>new URLSearchParams(window.location.search).get('verify')||'')
 const [selected,setSelected]=useState('')
 useEffect(()=>{
  let cancelled=false
  request('/api/faithverse/readiness').then(data=>{if(cancelled)return;setReady(data);setOffers(data.offers||[]);setLoading(false);setNotice(data.crmEnabled?'Optional verified email enrollment can be requested.':'CRM remains disabled pending secure storage, compliance and email provider approvals.')})
  .catch(()=>{if(!cancelled){setLoading(false);setNotice('TRYAMM business API is not connected to this frontend. The free study experience is still available.')}})
  return()=>{cancelled=true}
 },[])
 const authorized=async()=>{const token=await getAccessToken();if(!token)throw Error('Please sign in to your existing TRYAMM Supabase account to use verified enrollment or checkout.');return token}
 const enroll=async()=>{
  if(!consent||pending)return
  setPending(true)
  try{const token=await authorized();const res=await request('/api/faithverse/enroll',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({interest,consent:true,policyVersion:'faithverse-marketing-v1'})});setNotice(res.message||'Check your email to complete optional enrollment.')}
  catch(e){setNotice(e instanceof Error?e.message:'Enrollment is not available.')}
  finally{setPending(false)}
 }
 const confirm=async()=>{
  if(pending||!verification)return
  setPending(true)
  try{const res=await request('/api/faithverse/confirm',{method:'POST',body:JSON.stringify({token:verification})});setNotice(res.ok?'Email confirmed for optional FaithVerse study updates.':'Confirmation failed.');setVerification('');const url=new URL(window.location.href);url.searchParams.delete('verify');window.history.replaceState({},'',url.pathname+url.search+url.hash)}
  catch(e){setNotice(e instanceof Error?e.message:'Unable to confirm email.')}
  finally{setPending(false)}
 }
 const checkout=async()=>{
  if(!selected||pending)return
  setPending(true)
  try{
   const token=await authorized()
   const res=await request('/api/faithverse/checkout',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({offerId:selected})})
   const u=new URL(res.checkoutUrl);if(u.protocol!=='https:'||u.hostname!=='checkout.stripe.com'&&!u.hostname.endsWith('.checkout.stripe.com'))throw Error('Untrusted checkout destination')
   window.location.assign(u.href)
  }catch(e){setNotice(e instanceof Error?e.message:'Approved checkout is unavailable.');setPending(false)}
 }
 return <section aria-label="FaithVerse secure enrollment and approved offers" style={{background:'#102f39',border:'1px solid #688c8c',padding:16,borderRadius:16,display:'grid',gap:13}}>
  <h3 style={{fontSize:21,margin:0}}>TRYAMM Business Enrollment & Offers</h3>
  <p style={{lineHeight:1.6,margin:0}}>Choose only services approved through Kingdoms Press. A registration request is not an enrollment until the confirmation email is approved. A checkout return is not evidence of payment; only a signed processor webhook can verify it.</p>
  {loading&&<p role="status">Checking service readiness…</p>}
  {verification&&<article style={{display:'grid',gap:9,border:'1px solid #bca76b',padding:12,borderRadius:12}}><strong>Email verification pending</strong><p style={{margin:0}}>Confirm only if you requested these optional FaithVerse updates.</p><button style={btn} disabled={pending} onClick={()=>void confirm()}>Confirm my email enrollment</button></article>}
  <label style={{display:'flex',gap:12,alignItems:'start',fontSize:14,lineHeight:1.6}}><input style={{width:22,height:22,flexShrink:0}} type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>I opt in to receive optional FaithVerse study announcements at my existing verified account email. I understand this is separate from my use of the Bible reader and I can unsubscribe.</label>
  <button style={{...btn,opacity:ready?.crmEnabled&&consent&&!pending?1:.5}} disabled={!ready?.crmEnabled||!consent||pending} onClick={()=>void enroll()}>Request email confirmation</button>
  {!ready?.crmEnabled&&<p style={{fontSize:13,color:'#edcf9a',margin:0}}>Email enrollment is disabled until the authorized CRM, email domain, durable store and compliance configuration are verified.</p>}
  <h4 style={{margin:'8px 0 0',fontSize:19}}>Approved courses & publications</h4>
  {ready?.checkoutEnabled&&offers.length>0?<><label htmlFor="faith-purchase-offer">Select an approved offer</label><select id="faith-purchase-offer" value={selected} onChange={e=>setSelected(e.target.value)} style={btn}><option value="">Select published offer</option>{offers.map(o=><option key={o.id} value={o.id}>{o.title} · {o.mode}</option>)}</select>{offers.filter(o=>o.id===selected).map(o=><article key={o.id}><p>{o.description}</p><a href={o.refundPolicyUrl} target="_blank" rel="noopener noreferrer" style={{color:'#bfe9f9'}}>Read approved refund and cancellation policy</a></article>)}<button style={btn} disabled={!selected||pending} onClick={()=>void checkout()}>Continue to secure Stripe checkout</button></>:<p style={{color:'#edcf9a',fontSize:14,lineHeight:1.6}}>No approved course or publication is currently available for paid checkout. Offer publication requires owner review, verified rights, a public refund policy, price configuration and payment infrastructure.</p>}
  <p role="status" aria-live="polite" style={{fontSize:13,lineHeight:1.5}}>{notice}</p>
 </section>
}
