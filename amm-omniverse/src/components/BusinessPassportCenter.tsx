import {useEffect,useMemo,useRef,useState} from 'react'
import {
 type BusinessPassport,type CaptureAsset,type CaptureSurface,type ExtractedFact,
 BUSINESS_PLAN_PRICING_POLICY,ownerApprovedFacts,passportCanPublish,validateCaptureAsset,
} from '../commerce/businessPassport'
import {buildStreetVerseStorefrontDraft,storefrontCanPublish,type StreetVerseStorefrontDraft} from '../commerce/businessPassportStorefront'

const SURFACES:CaptureSurface[]=['front','entrance','interior','signage','counter','menu','product_display','left','right','rear']
type FactField=ExtractedFact['field']
const FACT_FIELDS:FactField[]=['business_name','sign_text','menu_item','product','price','hours','layout_note']

export default function BusinessPassportCenter({onClose}:{onClose:()=>void}){
 const passportId=useRef(`passport-${crypto.randomUUID()}`)
 const consentId=useRef(`consent-${crypto.randomUUID()}`)
 const capturesRef=useRef<CaptureAsset[]>([])
 const [businessName,setBusinessName]=useState('')
 const [authorizedBy,setAuthorizedBy]=useState('')
 const [authorized,setAuthorized]=useState(false)
 const [publishConsent,setPublishConsent]=useState(false)
 const [surface,setSurface]=useState<CaptureSurface>('front')
 const [captures,setCaptures]=useState<CaptureAsset[]>([])
 const [facts,setFacts]=useState<ExtractedFact[]>([])
 const [factField,setFactField]=useState<FactField>('product')
 const [factValue,setFactValue]=useState('')
 const [planId,setPlanId]=useState('')
 const [approved,setApproved]=useState(false)
 const [storefront,setStorefront]=useState<StreetVerseStorefrontDraft|null>(null)
 const [status,setStatus]=useState('Start with owner authorization. Nothing is uploaded from this screen.')

 useEffect(()=>{capturesRef.current=captures},[captures])
 useEffect(()=>()=>capturesRef.current.forEach(asset=>{if(asset.mediaUrl.startsWith('blob:'))URL.revokeObjectURL(asset.mediaUrl)}),[])

 const scope=useMemo(()=>[...new Set(captures.map(asset=>asset.surface))],[captures])
 const consent=useMemo(()=>({
  id:consentId.current,businessId:passportId.current,authorizedBy:authorizedBy.trim(),authorizedAt:new Date().toISOString(),
  scope,permitsAiDraft:authorized,permitsStreetVersePublication:publishConsent,
 }),[authorizedBy,scope,authorized,publishConsent])

 const passport=useMemo<BusinessPassport>(()=>({
  id:passportId.current,ownerAccountId:'session-unverified',businessName:businessName.trim()||'Untitled Business',
  planId:planId.trim()||undefined,billingCadence:'UNSET',status:approved?'approved':facts.length?'owner_review':captures.length?'capturing':'draft',
  consent,captures,extractedFacts:facts,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
 }),[businessName,planId,approved,consent,captures,facts])

 const publicationGate=passportCanPublish(passport)
 const addCapture=(file?:File)=>{
  if(!file||!authorized)return
  const asset:CaptureAsset={id:`capture-${crypto.randomUUID()}`,surface,mediaUrl:URL.createObjectURL(file),capturedAt:new Date().toISOString(),consentId:consentId.current,approvedForAi:true}
  setCaptures(current=>[...current,asset]);setApproved(false);setStorefront(null);setStatus(`${file.name} added to the session draft. It has not been uploaded.`)
 }
 const removeCapture=(id:string)=>setCaptures(current=>current.filter(asset=>{if(asset.id===id&&asset.mediaUrl.startsWith('blob:'))URL.revokeObjectURL(asset.mediaUrl);return asset.id!==id}))
 const addFact=()=>{
  const value=factValue.trim();if(!value)return
  const fact:ExtractedFact={field:factField,value,confidence:1,sourceAssetId:captures[0]?.id||'owner-manual',ownerDecision:'accepted'}
  setFacts(current=>[...current,fact]);setFactValue('');setApproved(false);setStorefront(null);setStatus('Owner-entered fact added. AI extraction is not being claimed on this session-only screen.')
 }
 const approve=()=>{
  if(!businessName.trim()||!authorizedBy.trim()||!authorized){setStatus('Business name and authorized owner/representative consent are required before owner approval.');return}
  setApproved(true);setStorefront(null);setStatus('Owner review marked approved. Publication and merchant-verification gates still apply.')
 }
 const buildDraft=()=>{
  const next=buildStreetVerseStorefrontDraft({...passport,status:approved?'approved':passport.status})
  setStorefront(next)
  const gate=storefrontCanPublish({...passport,status:approved?'approved':passport.status},next)
  setStatus(`Storefront draft created • publication gate: ${gate.reason}`)
  window.dispatchEvent(new CustomEvent('tryamm:business-passport-storefront-draft',{detail:{passportId:passport.id,storeId:next.storeId,publicationState:next.publicationState,publishEligible:gate.ok,reason:gate.reason}}))
 }

 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Business Passport Scan to Twin" style={{position:'fixed',inset:0,zIndex:16050,background:'#02050bf4',color:'#fff',overflow:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:900,margin:'0 auto',padding:18}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#59e7ff',fontWeight:950,letterSpacing:2}}>TRYAMM BUSINESS PASSPORT</div><h1 style={{margin:'4px 0'}}>Scan-to-Twin Owner Review</h1><div style={{fontSize:11,color:'#9fb2c8'}}>Session-local draft • no silent upload • no automatic merchant verification • no hardcoded checkout price</div></div><button onClick={onClose} style={btn}>✕</button></header>

   <section style={card}><h3>1. Authorized capture</h3><div style={grid}><input value={businessName} onChange={e=>{setBusinessName(e.target.value);setApproved(false)}} placeholder="Business name" style={input}/><input value={authorizedBy} onChange={e=>{setAuthorizedBy(e.target.value);setApproved(false)}} placeholder="Authorized owner / representative" style={input}/><input value={planId} onChange={e=>setPlanId(e.target.value)} placeholder="Plan / offer ID (optional)" style={input}/></div>
    <label style={check}><input type="checkbox" checked={authorized} onChange={e=>{setAuthorized(e.target.checked);setApproved(false)}}/> I am authorized to add the business photos I choose in this session for draft preparation.</label>
    <label style={check}><input type="checkbox" checked={publishConsent} onChange={e=>{setPublishConsent(e.target.checked);setApproved(false)}}/> Owner permits a later StreetVerse publication review. This does not publish anything now.</label>
    <div style={{fontSize:10,color:'#e8b944',marginTop:8}}>Pricing policy: {BUSINESS_PLAN_PRICING_POLICY.sourceOfTruth}. Passport pricing is not hardcoded.</div>
   </section>

   <section style={{...card,marginTop:12}}><h3>2. Capture selected surfaces</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select value={surface} onChange={e=>setSurface(e.target.value as CaptureSurface)} style={input}>{SURFACES.map(x=><option key={x} value={x}>{x.replaceAll('_',' ').toUpperCase()}</option>)}</select><label style={{...btn,opacity:authorized?1:.5}}>📷 CAPTURE / CHOOSE PHOTO<input disabled={!authorized} type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{addCapture(e.target.files?.[0]);e.currentTarget.value='' }}/></label></div>
    <div style={{display:'grid',gap:6,marginTop:10}}>{captures.map(asset=>{const gate=validateCaptureAsset(asset,consent);return <div key={asset.id} style={row}><span>{asset.surface.toUpperCase()} • {gate.ok?'AUTHORIZED':'BLOCKED'}</span><button onClick={()=>removeCapture(asset.id)} style={small}>REMOVE</button></div>})}{!captures.length&&<div style={muted}>No capture selected. Files remain local to this browser session in this first visible Passport build.</div>}</div>
   </section>

   <section style={{...card,marginTop:12}}><h3>3. Owner-reviewed facts</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select value={factField} onChange={e=>setFactField(e.target.value as FactField)} style={input}>{FACT_FIELDS.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select><input value={factValue} onChange={e=>setFactValue(e.target.value)} placeholder="Owner-entered fact" style={{...input,flex:1,minWidth:180}}/><button onClick={addFact} style={btn}>ADD FACT</button></div>
    <div style={{display:'grid',gap:6,marginTop:10}}>{ownerApprovedFacts(passport).map((fact,i)=><div key={`${fact.field}-${i}`} style={row}><span><b>{fact.field}</b> • {fact.value}</span><button onClick={()=>{setFacts(current=>current.filter((_,index)=>index!==i));setApproved(false);setStorefront(null)}} style={small}>REMOVE</button></div>)}{!facts.length&&<div style={muted}>No facts yet. This screen does not pretend that AI extraction ran; owner-entered facts are labeled as such.</div>}</div>
   </section>

   <section style={{...card,marginTop:12}}><h3>4. Owner approval → storefront draft</h3><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={approve} style={primary}>OWNER APPROVE DRAFT</button><button onClick={buildDraft} disabled={!approved} style={{...btn,opacity:approved?1:.5}}>BUILD STREETVERSE STOREFRONT DRAFT</button></div>
    <div role="status" aria-live="polite" style={{marginTop:10,padding:10,borderRadius:10,background:'#030914',color:'#bfefff',fontSize:12}}>{status}</div>
    <div style={{marginTop:8,fontSize:11,color:publicationGate.ok?'#8effb7':'#e8b944'}}>Passport publication gate: {publicationGate.reason}</div>
    {storefront&&<div style={{marginTop:10,...row,alignItems:'flex-start'}}><div><b>{storefront.storeId}</b><div style={muted}>{storefront.listings.length} draft listings • merchant verification: {storefront.merchant.verification} • state: {storefront.publicationState}</div></div><span style={{fontSize:10,color:'#e8b944'}}>NOT LIVE</span></div>}
   </section>
  </div>
 </div>
}

const card:React.CSSProperties={background:'#07111c',border:'1px solid #29465c',borderRadius:16,padding:14}
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:8}
const input:React.CSSProperties={minHeight:44,boxSizing:'border-box',background:'#0b1724',border:'1px solid #36536a',borderRadius:10,padding:'0 11px',color:'#fff'}
const btn:React.CSSProperties={minHeight:44,border:'1px solid #4fe3ff77',borderRadius:10,background:'#0b2430',color:'#fff',fontWeight:900,padding:'0 12px',cursor:'pointer'}
const primary:React.CSSProperties={...btn,background:'linear-gradient(135deg,#4fe3ff,#78ffb4)',color:'#04111a',border:0}
const small:React.CSSProperties={...btn,minHeight:34,fontSize:9,padding:'0 8px'}
const row:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',padding:9,border:'1px solid #20384a',borderRadius:10,background:'#06101a',fontSize:11}
const muted:React.CSSProperties={fontSize:10,color:'#8ea4b8',lineHeight:1.5}
const check:React.CSSProperties={display:'block',marginTop:10,fontSize:11,color:'#c7d4df'}
