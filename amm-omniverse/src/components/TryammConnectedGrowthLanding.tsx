import {lazy,Suspense,useState,type FormEvent} from 'react'
import {submitBusinessOSLead} from '../services/businessOSLeads'
import TryammPlacementBriefBuilder from './TryammPlacementBriefBuilder'
import {placementToInquiryNotes,type PlacementBrief} from '../runtime/TryammPlacementBriefRuntime'
import {TRYAMM_AI_CONNECTIONS,TRYAMM_GROWTH_OFFERS,TRYAMM_GROWTH_STAGES,prepareTryammGrowthInquiry,type TryammGrowthOfferId} from '../runtime/TryammConnectedGrowthWorkflow'

const HoloGPT=lazy(()=>import('./HoloGPTAssistant'))
const page:React.CSSProperties={minHeight:'100vh',background:'radial-gradient(ellipse at 45% -10%,#102e44 0,#040914 56%,#010409 100%)',color:'#f1f7ff',fontFamily:'Inter,system-ui,sans-serif'}
const shell:React.CSSProperties={maxWidth:1120,margin:'0 auto',padding:'18px clamp(14px,3vw,36px) 80px'}
const card:React.CSSProperties={border:'1px solid #294457',borderRadius:17,padding:18,background:'linear-gradient(150deg,#0c1b2c,#07101d)',boxShadow:'0 12px 26px #0004'}
const button:React.CSSProperties={minHeight:45,padding:'11px 16px',border:'1px solid #64c9ef',borderRadius:12,background:'#133d4c',color:'#f6fbff',fontWeight:800,cursor:'pointer',fontSize:13}
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:45,border:'1px solid #426178',background:'#0a1d2d',color:'#fff',padding:'11px 12px',borderRadius:10,fontSize:15}
const label:React.CSSProperties={display:'block',fontSize:12,fontWeight:750,marginBottom:6}
const subtitle:React.CSSProperties={color:'#acc3d3',fontSize:14,lineHeight:1.6}
const capabilities=[
 {label:'Experience the city',title:'StreetVerse Chicago',href:'/streetverse',detail:'Play the developing Circle Park world and test the BJ mission'},
 {label:'Watch and discover',title:'All American Network + Free TV',href:'/free-tv',detail:'Browse original programs, network guides and verified available feeds'},
 {label:'Story and creator tools',title:'OmniBox',href:'/omni-box',detail:'Draft production outlines and rights-cleared Story Studio handoffs'},
 {label:'Network creators',title:'Isaiah AI TV + StarVerse',href:'/isaiah-ai-tv',detail:'Talent shows, original programs and creator showcase channels'}
] as const

export default function TryammConnectedGrowthLanding(){
 const [offerId,setOfferId]=useState<TryammGrowthOfferId>('website-preview')
 const [name,setName]=useState('')
 const [email,setEmail]=useState('')
 const [businessName,setBusinessName]=useState('')
 const [notes,setNotes]=useState('')
 const [consent,setConsent]=useState(false)
 const [submitting,setSubmitting]=useState(false)
 const [status,setStatus]=useState('')
 const [successRef,setSuccessRef]=useState('')
 const [assistantOpen,setAssistantOpen]=useState(false)
 const [adDraftStatus,setAdDraftStatus]=useState('')
 const [receiptNotice,setReceiptNotice]=useState('')
 const chosen=TRYAMM_GROWTH_OFFERS.find(o=>o.id===offerId)??TRYAMM_GROWTH_OFFERS[0]
 const begin=(id:TryammGrowthOfferId)=>{setOfferId(id);setStatus('');document.getElementById('tryamm-connected-inquiry')?.scrollIntoView({behavior:'smooth',block:'start'})}
 const acceptPlacementQuote=(brief:PlacementBrief)=>{
  setOfferId('product-placement')
  setNotes(placementToInquiryNotes(brief))
  setBusinessName(previous=>previous.trim()?previous:brief.brand)
  setStatus('Product-placement proposal added below. Complete your contact details and submit; no order or advertisement is active.')
  setSuccessRef('')
  document.getElementById('tryamm-connected-inquiry')?.scrollIntoView({behavior:'smooth',block:'start'})
 }
 const openStudio=()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'tryamm-growth',title:'TRYAMM Holo Reel Business Showcase',caption:'TRYAMM • StreetVerse • Creator Spotlight'}}))
 const openHoloGPT=()=>setAssistantOpen(true)
 const openJarvis=()=>{setAssistantOpen(true);window.dispatchEvent(new CustomEvent('tryamm:jarvis-command',{detail:{action:'open-hologpt'}}))}
 const createAdDraft=async()=>{
  setAdDraftStatus('Preparing a Holo Ads preview. Nothing will be saved, published or billed.')
  try{
   // The global installer loads asynchronously; ensure the existing runtime
   // is active before sending an event from a first-time website visitor.
   const {installHoloAdsRevenueRuntime}=await import('../runtime/HoloAdsRevenueRuntime')
   installHoloAdsRevenueRuntime()
   const onDraft=(event:Event)=>{
    const d=(event as CustomEvent<{status?:string;persisted?:boolean;product?:{name?:string}}>)?.detail
    setAdDraftStatus(d?.status==='draft'&&d.persisted===false?'Temporary ad proposal prepared: '+(d.product?.name||'campaign')+'. Request a quote below to continue; no campaign was saved or billed.':'The ad proposal could not be verified.')
   }
   window.addEventListener('tryamm:holo-ads-campaign-draft',onDraft,{once:true})
   window.dispatchEvent(new CustomEvent('tryamm:holo-ads-create-campaign',{detail:{productId:offerId==='product-placement'?'xr':'boost',market:'Chicago',objective:'approved-product-discovery'}}))
  }catch{
   setAdDraftStatus('Holo Ads draft tools are unavailable. You can still submit a service inquiry; nothing was charged.')
  }
 }
 const saveInquiryReceipt=()=>{
  if(!successRef)return
  const summary=[
   'TRYAMM LLC — CUSTOMER SERVICE INQUIRY RECEIPT',
   'Reference: '+successRef,
   'Service: '+chosen.title,
   'Name: '+name.trim(),
   'Business or creator: '+businessName.trim(),
   'Contact email: '+email.trim(),
   'Saved: '+new Date().toISOString(),
   'Status: INQUIRY RECEIVED — scope, rights, approval and payment remain pending.',
   '',
   'Your request is not a purchase, paid advertising contract or authorization to publish.',
   'Keep this receipt for your follow-up with TRYAMM.'
  ].join(String.fromCharCode(10))
  const blob=new Blob([summary],{type:'text/plain;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const link=document.createElement('a')
  link.href=url;link.download='tryamm-inquiry-'+successRef.replace(/[^a-z0-9-]/gi,'').slice(0,60)+'.txt'
  document.body.appendChild(link);link.click();link.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  setReceiptNotice('A local text receipt was prepared. Check your browser downloads.')
 }
 const copyInquiryReference=async()=>{
  if(!successRef)return
  try{
   if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable')
   await navigator.clipboard.writeText(successRef)
   setReceiptNotice('The inquiry reference was copied.')
  }catch{setReceiptNotice('Clipboard access is unavailable. Use SAVE REQUEST RECEIPT instead.')}
 }
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(submitting)return
  setSubmitting(true);setStatus('');setSuccessRef('');setReceiptNotice('')
  try{
   const payload=prepareTryammGrowthInquiry({name,email,businessName,offerId,notes,consent})
   const reference=await submitBusinessOSLead(payload)
   if(!reference)throw new Error('Inquiry service did not return a confirmation.')
   setSuccessRef(reference);setStatus('Inquiry accepted. TRYAMM will need to confirm scope, delivery schedule, and any payment separately.')
  }catch(error){setStatus(error instanceof Error?error.message:'Inquiry could not be sent. No order or payment was placed.')}
  finally{setSubmitting(false)}
 }
 return <main aria-label="TRYAMM growth, StreetVerse and creator services" style={page}>
  <div style={shell}>
   <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginBottom:30}}>
    <a href="/" style={{fontSize:20,fontWeight:950,color:'#f4e0a0',letterSpacing:1,textDecoration:'none'}}>TRYAMM <span style={{color:'#76e1f9'}}>LLC</span></a>
    <nav aria-label="Customer journey sections" style={{display:'flex',flexWrap:'wrap',gap:10,fontSize:12}}>
     <a style={{color:'#e0eaf5'}} href="#tryamm-offers">Services</a><a style={{color:'#e0eaf5'}} href="#tryamm-connected-workflow">How it works</a><a style={{color:'#e0eaf5'}} href="#tryamm-connected-inquiry">Request a quote</a><a style={{color:'#e0eaf5'}} href="/streetverse">Play StreetVerse</a>
    </nav>
   </header>
   <section style={{...card,padding:'clamp(20px,5vw,50px)',background:'radial-gradient(ellipse at right top,#154b5b,#10182c 60%,#080f20)',borderColor:'#417486'}}>
    <div style={{color:'#80f0db',fontSize:12,fontWeight:900,letterSpacing:3}}>STREETVERSE • HOLO REELS • HOLO ADS • COMMERCE</div>
    <h1 style={{fontSize:'clamp(30px,5.4vw,56px)',lineHeight:1.06,margin:'12px 0'}}>Your business deserves a place in the digital world.</h1>
    <p style={{...subtitle,maxWidth:730,fontSize:17}}>Websites, creator media, approved product placement, interactive StreetVerse previews, TRYAMM broadcasting and AI-assisted navigation—organized around one real customer inquiry.</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:22}}>
     <button style={{...button,background:'#34d5d7',color:'#06121a'}} onClick={()=>begin('website-preview')}>START WITH A $499 WEBSITE PREVIEW</button>
     <button style={button} onClick={()=>begin('product-placement')}>REQUEST A PRODUCT PLACEMENT</button>
     <a href="/streetverse" style={{...button,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>ENTER STREETVERSE</a>
    </div>
    <p style={{fontSize:11,color:'#b7bdc7',margin:'16px 0 0'}}>Early-stage service inquiries only. No automatic checkout, ad billing, published product placement, or autonomous AI agent is promised.</p>
   </section>
   <section aria-labelledby="connected-experience" style={{marginTop:32}}>
    <h2 id="connected-experience" style={{fontSize:26,marginBottom:10}}>Explore what we've built</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
     {capabilities.map(c=><a href={c.href} key={c.href} style={{...card,color:'#fff',textDecoration:'none',display:'block'}}>
      <div style={{color:'#7ee5e9',fontSize:10,letterSpacing:1.2,fontWeight:900}}>{c.label.toUpperCase()}</div><h3 style={{fontSize:18,margin:'8px 0'}}>{c.title}</h3><p style={{...subtitle,fontSize:12,margin:0}}>{c.detail}</p>
      <div style={{marginTop:12,color:'#f2d991',fontSize:12,fontWeight:800}}>OPEN EXISTING EXPERIENCE →</div>
     </a>)}
    </div>
   </section>
   <section id="tryamm-offers" aria-labelledby="tryamm-offers-title" style={{marginTop:36,scrollMarginTop:20}}>
    <h2 id="tryamm-offers-title" style={{fontSize:26,marginBottom:5}}>Choose a service</h2>
    <p style={subtitle}>Start with something deliverable and grow into StreetVerse, LIVE, Holo Ads and product placements as the required assets are approved.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(265px,1fr))',gap:12}}>
     {TRYAMM_GROWTH_OFFERS.map(o=><article key={o.id} style={{...card,borderColor:offerId===o.id?'#8fe2df':'#294457'}}>
      <div style={{fontSize:11,color:'#99e6f5'}}>{o.priceUsd===null?'CUSTOM QUOTE':'STARTING OFFER $'+o.priceUsd.toLocaleString()}</div>
      <h3 style={{fontSize:19,margin:'6px 0'}}>{o.title}</h3><p style={{...subtitle,fontSize:13}}>{o.summary}</p>
      <p style={{fontSize:11,color:'#a9bbca'}}>{o.includes.join(' • ')}</p>
      <p style={{fontSize:11,color:'#f1d598'}}>{o.delivery}</p>
      <button type="button" style={{...button,width:'100%'}} onClick={()=>begin(o.id)}>REQUEST {o.priceUsd===null?'A QUOTE':'THIS PACKAGE'}</button>
     </article>)}
    </div>
   </section>
   <TryammPlacementBriefBuilder onQuote={acceptPlacementQuote}/>
   <section aria-label="Studio, Holo Ads and intelligent assistants" style={{...card,marginTop:30}}>
    <h2 style={{fontSize:23,margin:'0 0 9px'}}>Creator and business control desk</h2>
    <p style={subtitle}>Each button opens or requests an existing TRYAMM capability. It does not bypass consent, creator rights, provider activation or verified settlement.</p>
    <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
     <button type="button" style={button} onClick={openStudio}>🎬 CREATE HOLO REEL</button>
     <a href="/omni-box" style={{...button,textDecoration:'none',display:'inline-flex',alignItems:'center'}}>OMNIBOX STORY STUDIO</a>
     <button type="button" style={button} onClick={openHoloGPT}>ASK HOLOGPT</button>
     <button type="button" style={button} onClick={openJarvis}>JARVIS ASSISTANT</button>
     <button type="button" style={button} onClick={createAdDraft}>DRAFT HOLO AD</button>
    </div>
    {adDraftStatus&&<p role="status" style={{fontSize:12,color:'#e6d796'}}>{adDraftStatus}</p>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8,marginTop:15}}>
     {TRYAMM_AI_CONNECTIONS.map(a=><div key={a.id} style={{padding:10,border:'1px solid #2e4858',borderRadius:10}}>
      <div style={{fontWeight:800,fontSize:13}}>{a.name}</div><div style={{color:'#a0e5d7',fontSize:10,margin:'4px 0'}}>{a.status.replaceAll('-',' ').toUpperCase()}</div><div style={{fontSize:11,color:'#aabccc',lineHeight:1.5}}>{a.role}</div>
     </div>)}
    </div>
   </section>
   <section id="tryamm-connected-workflow" aria-labelledby="tryamm-connected-workflow-title" style={{marginTop:34}}>
    <h2 id="tryamm-connected-workflow-title" style={{fontSize:26}}>One organized workflow</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
     {TRYAMM_GROWTH_STAGES.map((stage,index)=><div key={stage.id} style={{...card,padding:13}}>
      <div style={{fontSize:11,color:'#8ef0e6'}}>STEP {index+1}</div><strong>{stage.label}</strong><div style={{fontSize:12,color:'#b2c0d0',marginTop:5}}>{stage.gate}</div>
     </div>)}
    </div>
   </section>
   <section id="tryamm-connected-inquiry" aria-labelledby="tryamm-inquiry-title" style={{...card,marginTop:36,maxWidth:770,scrollMarginTop:26}}>
    <h2 id="tryamm-inquiry-title" style={{fontSize:26,margin:'0 0 5px'}}>Start your TRYAMM project</h2>
    <p style={subtitle}>Request a scope review for <strong>{chosen.title}</strong>. This is an inquiry, not a purchase. The confirmation must come from the connected lead service.</p>
    <form onSubmit={submit} style={{display:'grid',gap:13}}>
     <div><label htmlFor="growth-name" style={label}>Your name</label><input id="growth-name" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} style={field}/></div>
     <div><label htmlFor="growth-email" style={label}>Contact email</label><input id="growth-email" type="email" required maxLength={180} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={field}/></div>
     <div><label htmlFor="growth-business" style={label}>Business or creator name</label><input id="growth-business" required minLength={2} maxLength={150} value={businessName} onChange={e=>setBusinessName(e.target.value)} style={field}/></div>
     <div><label htmlFor="growth-offer" style={label}>Requested service</label><select id="growth-offer" style={field} value={offerId} onChange={e=>setOfferId(e.target.value as TryammGrowthOfferId)}>{TRYAMM_GROWTH_OFFERS.map(o=><option key={o.id} value={o.id}>{o.title}{o.priceUsd===null?' — quote':' — $'+o.priceUsd}</option>)}</select></div>
     <div><label htmlFor="growth-notes" style={label}>Describe the campaign, product, website or Reel</label><textarea id="growth-notes" rows={4} maxLength={900} value={notes} onChange={e=>setNotes(e.target.value)} style={{...field,minHeight:100}}/></div>
     <label style={{fontSize:12,display:'flex',gap:9,alignItems:'start',lineHeight:1.5}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/> I authorize TRYAMM to contact me about this specific request. This does not authorize payment or marketing subscriptions.</label>
     <button type="submit" disabled={submitting||!consent} style={{...button,background:'#34d5d7',color:'#04141c',opacity:submitting||!consent?.5:1}}>{submitting?'SUBMITTING…':'SEND SERVICE INQUIRY'}</button>
     {status&&<p role="status" style={{fontSize:13,color:successRef?'#91f5bb':'#ffd39a',margin:0}}>{status}{successRef?' Reference: '+successRef:''}</p>}
     {successRef&&<section aria-label="Verified customer inquiry receipt" style={{border:'1px solid #407b70',borderRadius:12,padding:12,background:'#0a2824'}}>
      <strong>REQUEST RECEIVED — NOT A PURCHASE</strong>
      <div style={{fontSize:12,margin:'7px 0',overflowWrap:'anywhere'}}>Reference: {successRef}</div>
      <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
       <button type="button" style={button} onClick={copyInquiryReference}>COPY REQUEST REFERENCE</button>
       <button type="button" style={button} onClick={saveInquiryReceipt}>SAVE REQUEST RECEIPT</button>
      </div>
      <p style={{fontSize:11,color:'#b8c9d8',lineHeight:1.5}}>Save your reference. TRYAMM must review scope, artwork, rights and pricing before discussing a payment or publication. No automatic email reply is promised.</p>
      {receiptNotice&&<p role="status" style={{fontSize:12,color:'#91dfc3'}}>{receiptNotice}</p>}
     </section>
     <p style={{fontSize:11,color:'#a8b6c8',margin:0}}>If the lead service is not configured, the form will report the error and no order will be claimed. Do not enter payment details or private identity documents.</p>
    </form>
   </section>
   <footer style={{fontSize:12,color:'#8d9fb3',marginTop:35,textAlign:'center',lineHeight:1.6}}>TRYAMM LLC • All American Marketplace • StreetVerse • Accessible digital services<br/>Prototypes are labeled. AI, XR, media distribution and payments require verified providers and rights before customer delivery.</footer>
  </div>
  {assistantOpen&&<Suspense fallback={<div role="status" style={{position:'fixed',bottom:20,right:20,background:'#071a25',padding:12}}>Opening HoloGPT…</div>}><HoloGPT showLauncher={false} openOnMount/></Suspense>}
 </main>
}
