import { useEffect,useState } from 'react'
import { FAMILY_BUSINESS_REGISTRY } from '../data/familyBusinessRegistry'
import {DOMAIN_AUTOMATION_FLOW} from '../services/domainProvisioning'
import {getAccessToken} from '../services/supabaseClient'

type Site={id:string;name:string;industry:string;city:string;status:string;ownership:'subscription'|'buyout'|'exported';domain?:string}
export default function AIWebsiteBusinessBuilder(){
 const [open,setOpen]=useState(false),[sites,setSites]=useState<Site[]>([]),[name,setName]=useState(''),[industry,setIndustry]=useState('general'),[city,setCity]=useState('Chicago'),[familyId,setFamilyId]=useState(''),[domain,setDomain]=useState(''),[domainStatus,setDomainStatus]=useState('Choose a domain, provide registrant information and complete payment. TRYAMM can automate DNS, SSL and verification after a registrar provider is connected.')
 useEffect(()=>{const h=(e:Event)=>setSites(((e as CustomEvent<any>).detail?.sites||[]) as Site[]);window.addEventListener('tryamm:ai-site-builder-state',h);window.dispatchEvent(new CustomEvent('tryamm:ai-site-builder-request'));return()=>window.removeEventListener('tryamm:ai-site-builder-state',h)},[])
 const [resellerStatus,setResellerStatus]=useState('Registrar connection not yet verified. No domain charges are enabled.')
 const checkResellerStatus=async()=>{
  setResellerStatus('Checking the secure domain reseller endpoint…')
  try{
   const token=await getAccessToken()
   if(!token){setResellerStatus('Sign in to check domain reseller readiness. No payment is required.');return}
   const response=await fetch('/api/domains/status',{headers:{Authorization:'Bearer '+token},cache:'no-store'})
   if(!response.ok){setResellerStatus('Reseller status unavailable. Domain purchases stay disabled.');return}
   const data=await response.json()
   setResellerStatus(data?.canRegisterDomains?'Provider connected; request an approved checkout quote before paying.':'Preparation only: '+String(data?.checks?.registrarAccount||'NOT_CONNECTED')+'. No live registration or DNS change.')
  }catch{setResellerStatus('Reseller status unavailable. No domain purchase or DNS change occurred.')}
 }
 const testOpenSrsHorizon=async()=>{
  if(!domain.trim()){setDomainStatus('Enter a domain name for the OpenSRS sandbox test.');return}
  setDomainStatus('Checking OpenSRS Horizon test system only; no domain will be purchased…')
  try{
   const token=await getAccessToken()
   if(!token){setDomainStatus('Sign in to test. No payment or registration took place.');return}
   const response=await fetch('/api/domains/horizon-check',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    body:JSON.stringify({domain:domain.trim()}),cache:'no-store'
   })
   const data=await response.json()
   if(!response.ok){setDomainStatus('Sandbox unavailable: '+String(data?.state||'TEST_UNAVAILABLE')+'. No domain purchased.');return}
   const cost=Number.isSafeInteger(data?.wholesaleTestCents)?' • test wholesale $'+(data.wholesaleTestCents/100).toFixed(2):''
   setDomainStatus('HORIZON TEST ONLY: '+String(data?.availability||'UNKNOWN')+cost+'. Not a real availability/price quote; no charge, registration, or DNS change.')
  }catch{setDomainStatus('OpenSRS Horizon test unavailable. No domain purchased or changed.')}
 }
 const create=()=>{window.dispatchEvent(new CustomEvent('tryamm:ai-site-create',{detail:{name:name||'My Business',industry,city}}));setName('')}
 const loadFamily=(id:string)=>{setFamilyId(id);const p=FAMILY_BUSINESS_REGISTRY.find(x=>x.id===id);if(!p)return;setName(`${p.owner} — ${p.ventures[0]}`);setIndustry(p.ventures.join(' / '));setCity(p.region);window.dispatchEvent(new CustomEvent('tryamm:family-business-selected',{detail:p}))}
 if(!open)return <button onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:356,zIndex:8995,border:'1px solid #4FE3FF88',borderRadius:999,padding:'10px 14px',background:'#07131e',color:'#4FE3FF',fontWeight:900,fontSize:10,cursor:'pointer'}}>🌐 BUILD & OWN WEBSITE</button>
 return <div style={{position:'fixed',inset:0,zIndex:15180,background:'#02050bf4',color:'#fff',overflow:'auto'}}><div style={{maxWidth:980,margin:'0 auto',padding:20}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,letterSpacing:2,color:'#4FE3FF',fontWeight:900}}>TRYAMM AI BUSINESS LAUNCHER</div><h1 style={{margin:'6px 0'}}>Build, Launch & Own Your Website</h1><p style={{color:'#9fb2c8',fontSize:12}}>Create the business site, publish it, choose ownership, then launch the same business into Marketplace, Quantum Sourcing and StreetVerse.</p></div><button onClick={()=>setOpen(false)} style={btn}>✕</button></div>
  <section style={card}><h3>Friends & family site factory</h3><p style={{fontSize:11,color:'#9fb2c8'}}>Load a recovered business profile, then use the existing AI builder. Registry status does not mean the site/domain is live yet.</p><select value={familyId} onChange={e=>loadFamily(e.target.value)} style={{...input,width:'100%'}}><option value="">Choose a registered business</option>{FAMILY_BUSINESS_REGISTRY.map(p=><option key={p.id} value={p.id}>{p.owner} — {p.ventures[0]}</option>)}</select></section>
  <section style={{...card,marginTop:12}}><h3>Create business</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Business name" style={input}/><input value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="Industry" style={input}/><input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" style={input}/><button onClick={create} style={primary}>AI BUILD SITE</button></div></section>
  <section style={{display:'grid',gap:10,marginTop:12}}>{sites.map(s=><article key={s.id} style={card}><div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><div><strong>{s.name}</strong><div style={{fontSize:10,color:'#8ea4ba',marginTop:4}}>{s.industry} • {s.city} • {s.status}</div></div><span style={{fontSize:9,color:'#e8b944'}}>{s.ownership.toUpperCase()}</span></div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:10}}><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-publish',{detail:{id:s.id,domain:s.domain}}))}>PUBLISH</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-ownership',{detail:{id:s.id,ownership:'subscription'}}))}>SUBSCRIPTION</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-ownership',{detail:{id:s.id,ownership:'buyout'}}))}>BUY & OWN</button><button style={btn} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:ai-site-export',{detail:{id:s.id}}))}>EXPORT PROJECT</button><button style={primary} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:business-launch-from-site',{detail:{id:s.id}}))}>LAUNCH BUSINESS</button></div></article>)}</section>
  <section style={{...card,marginTop:12}}>
   <h3>DOMAIN + GO LIVE</h3>
   <p style={{fontSize:11,color:'#aebed0',lineHeight:1.6}}>Domain reseller preparation only. After we connect a licensed registrar partner and verify a live quote, registrant consent and server-side checkout, TRYAMM can request registration. DNS, SSL and public-site verification are separate steps. No domain charge or purchase is available from this screen today.</p>
   <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8}}>
    <input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="yourbusiness.com" style={input}/>
    <button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:domain-provision-request',{detail:{domain,source:'ai-website-builder'}}));setDomainStatus(domain?`Draft domain request prepared for ${domain}. No availability, ownership or price is confirmed; no charge was made.`:'Enter a domain first.')}} style={primary}>PREPARE DOMAIN (NO CHARGE)</button>
   </div>
   <div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}><button style={btn} onClick={checkResellerStatus}>CHECK RESELLER CONNECTION</button><button style={btn} onClick={testOpenSrsHorizon}>TEST DOMAIN IN OPENSRS HORIZON (NO CHARGE)</button><span role="status" style={{fontSize:10,color:'#ffd98a'}}>{resellerStatus}</span></div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{DOMAIN_AUTOMATION_FLOW.map((x,i)=><span key={x} style={{fontSize:9,padding:'5px 7px',borderRadius:999,border:'1px solid #2b4558',background:'#091721'}}>{i+1}. {x}</span>)}</div>
   <div role="status" style={{fontSize:10,color:'#ffd98a',marginTop:10}}>{domainStatus}</div>
  </section>
  <section style={{...card,marginTop:12}}><strong>Revenue model</strong><p style={{fontSize:11,color:'#aebed0',lineHeight:1.6}}>Hosted plans • one-time site buyouts • domain/hosting management • premium templates • commerce services • AI business copilot • marketing/SEO • Creator/Broadcast packages • maintenance and support.</p></section>
 </div></div>
}
const card:React.CSSProperties={background:'#08111c',border:'1px solid #294058',borderRadius:16,padding:14}
const input:React.CSSProperties={background:'#0b1724',border:'1px solid #294058',borderRadius:10,padding:'11px 12px',color:'#fff'}
const btn:React.CSSProperties={background:'#101a25',border:'1px solid #3b536b',borderRadius:10,padding:'9px 11px',color:'#fff',fontWeight:850,fontSize:10,cursor:'pointer'}
const primary:React.CSSProperties={...btn,background:'linear-gradient(135deg,#4FE3FF,#78ffb4)',color:'#04111a',border:0}
