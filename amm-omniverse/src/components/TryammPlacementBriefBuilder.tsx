import {useState} from 'react'
import {
 createPlacementBrief,placementToStudioHandoff,TRYAMM_PLACEMENT_STUDIO_HANDOFF_KEY,
 TRYAMM_PLACEMENT_SURFACES,type PlacementBrief,type PlacementSurface
} from '../runtime/TryammPlacementBriefRuntime'

const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,padding:10,borderRadius:10,border:'1px solid #557385',background:'#0b2231',color:'#f4fcff',fontSize:15}
const btn:React.CSSProperties={minHeight:46,borderRadius:11,border:'1px solid #7acbc6',background:'#124451',padding:'10px 14px',color:'#f4ffff',fontWeight:800,fontSize:12,cursor:'pointer'}
const lbl:React.CSSProperties={fontSize:12,fontWeight:750,display:'block',marginBottom:6}
type Props={onQuote:(brief:PlacementBrief)=>void}
export default function TryammPlacementBriefBuilder({onQuote}:Props){
 const [brand,setBrand]=useState('')
 const [product,setProduct]=useState('')
 const [description,setDescription]=useState('')
 const [productUrl,setProductUrl]=useState('')
 const [surfaces,setSurfaces]=useState<PlacementSurface[]>(['holo-reel','streetverse-world'])
 const [ctaText,setCtaText]=useState('Learn more')
 const [creativeNotes,setCreativeNotes]=useState('')
 const [rightsReview,setRightsReview]=useState(false)
 const [brief,setBrief]=useState<PlacementBrief|null>(null)
 const [error,setError]=useState('')
 const [status,setStatus]=useState('')
 const toggle=(id:PlacementSurface)=>{setSurfaces(list=>list.includes(id)?list.filter(x=>x!==id):[...list,id]);setBrief(null)}
 const prepare=()=>{
  try{
   const proposed=createPlacementBrief({brand,product,description,productUrl,surfaces,ctaText,creativeNotes,advertiserAcknowledgesRightsReview:rightsReview})
   setBrief(proposed);setError('');setStatus('Review the proposed placement before sending it to a creator tool or requesting a quote.')
  }catch(e){setBrief(null);setError(e instanceof Error?e.message:'Complete the placement brief before continuing.')}
 }
 const sendReel=()=>{
  if(!brief)return
  window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:placementToStudioHandoff(brief)}))
  setStatus('Holo Reel Studio opened with the draft concept. Add your own rights-cleared media; publishing is not authorized by this brief.')
 }
 const sendOmniBox=()=>{
  if(!brief)return
  try{localStorage.setItem(TRYAMM_PLACEMENT_STUDIO_HANDOFF_KEY,JSON.stringify(brief))}
  catch{setStatus('This browser cannot save the proposal handoff; use Request a Quote instead.');return}
  window.location.href='/omni-box?from=tryamm-placement'
 }
 const sendAdDraft=async()=>{
  if(!brief)return
  setStatus('Preparing a Holo Ads concept preview. This does not reserve inventory, charge or publish.')
  try{
   // The installer is optional and might not yet be ready on the initial visit.
   const {installHoloAdsRevenueRuntime}=await import('../runtime/HoloAdsRevenueRuntime')
   installHoloAdsRevenueRuntime()
   const onDraft=(event:Event)=>{
    const proposal=(event as CustomEvent<{status?:string;persisted?:boolean}>)?.detail
    setStatus(proposal?.status==='draft'&&proposal.persisted===false
     ?'Temporary Holo Ads concept prepared. No campaign was saved or billed; submit your quote request for review.'
     :'The Holo Ads preview could not be confirmed. You can still request a quote.')
   }
   window.addEventListener('tryamm:holo-ads-campaign-draft',onDraft,{once:true})
   window.dispatchEvent(new CustomEvent('tryamm:holo-ads-create-campaign',{detail:{
    productId:brief.surfaces.includes('streetverse-world')?'xr':'boost',
    market:'Chicago',objective:'review-product-placement',concept:brief.product
   }}))
  }catch{
   setStatus('The Holo Ads preview tool is unavailable. You can still request a quote. No campaign was saved or billed.')
  }
 }
 const quote=()=>{if(brief){onQuote(brief);setStatus('Placement proposal added to the inquiry form. Submit the request to contact TRYAMM; no placement is ordered yet.')}}
 const download=()=>{
  if(!brief)return
  const blob=new Blob([JSON.stringify(brief,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob);const a=document.createElement('a')
  a.href=url;a.download='tryamm-product-placement-proposal.json';document.body.appendChild(a);a.click();a.remove()
  window.setTimeout(()=>URL.revokeObjectURL(url),1000)
 }
 return <section aria-label="Holo product placement campaign builder" style={{marginTop:28,border:'1px solid #438b96',borderRadius:18,padding:'clamp(14px,3vw,23px)',background:'linear-gradient(145deg,#102335,#091824)'}}>
  <div style={{color:'#7ce8e1',fontSize:11,fontWeight:900,letterSpacing:1.8}}>PRODUCT → STORY → HOLO REEL → STREETVERSE</div>
  <h2 style={{margin:'9px 0 6px',fontSize:24}}>Build your holographic product-placement brief</h2>
  <p style={{fontSize:13,lineHeight:1.6,color:'#b8c9d8'}}>Describe the real product and select where you'd like it to appear. We create a proposal for review—not a fake 3D rendering, published ad or completed sale.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:13,marginTop:14}}>
   <div><label htmlFor="placement-brand" style={lbl}>Brand or business *</label><input id="placement-brand" style={input} maxLength={90} value={brand} onChange={e=>{setBrand(e.target.value);setBrief(null)}} placeholder="Example: All American Marketplace"/></div>
   <div><label htmlFor="placement-product" style={lbl}>Product or service *</label><input id="placement-product" style={input} maxLength={100} value={product} onChange={e=>{setProduct(e.target.value);setBrief(null)}} placeholder="What should viewers discover?"/></div>
   <div><label htmlFor="placement-url" style={lbl}>Public product page URL (optional)</label><input id="placement-url" style={input} type="url" maxLength={500} value={productUrl} onChange={e=>{setProductUrl(e.target.value);setBrief(null)}} placeholder="https://example.com/product"/></div>
   <div><label htmlFor="placement-cta" style={lbl}>Call-to-action</label><input id="placement-cta" style={input} maxLength={50} value={ctaText} onChange={e=>{setCtaText(e.target.value);setBrief(null)}} placeholder="Visit our store"/></div>
  </div>
  <div style={{marginTop:12}}><label htmlFor="placement-description" style={lbl}>What makes your product valuable? *</label><textarea id="placement-description" style={{...input,minHeight:80}} maxLength={350} value={description} onChange={e=>{setDescription(e.target.value);setBrief(null)}} placeholder="What is it, who benefits, and what is accurate to show?"/></div>
  <fieldset style={{border:'1px solid #385a6c',borderRadius:12,padding:12,marginTop:12}}>
   <legend style={{fontSize:12,fontWeight:900,padding:'0 6px'}}>Where should the placement appear?</legend>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(225px,1fr))',gap:9}}>
    {TRYAMM_PLACEMENT_SURFACES.map(s=><label key={s.id} style={{display:'flex',alignItems:'start',gap:9,fontSize:12,lineHeight:1.5}}>
      <input type="checkbox" checked={surfaces.includes(s.id)} onChange={()=>toggle(s.id)} style={{width:20,height:20,flexShrink:0}}/>
      <span><strong>{s.label}</strong><span style={{display:'block',color:'#a7bed2',fontSize:11}}>{s.approval}</span></span>
    </label>)}
   </div>
  </fieldset>
  <div style={{marginTop:12}}><label htmlFor="placement-story" style={lbl}>Story idea, scene, talent or creative direction (optional)</label><textarea id="placement-story" style={{...input,minHeight:65}} maxLength={450} value={creativeNotes} onChange={e=>{setCreativeNotes(e.target.value);setBrief(null)}} placeholder="Example: BJ sees this product in a Chicago storefront during a mission."/></div>
  <label style={{display:'flex',gap:10,alignItems:'start',fontSize:12,lineHeight:1.5,margin:'14px 0'}}>
   <input type="checkbox" checked={rightsReview} onChange={e=>{setRightsReview(e.target.checked);setBrief(null)}} style={{width:21,height:21,flexShrink:0}}/>
   I understand product, trademark, likeness, music, media and advertising rights still require review and approval. This checkbox does not grant those rights.
  </label>
  <button type="button" style={{...btn,background:'#39d3cd',color:'#051923'}} onClick={prepare}>PREPARE PLACEMENT PROPOSAL</button>
  {error&&<p role="alert" style={{color:'#ffcbac',fontSize:12}}>{error}</p>}
  {brief&&<div style={{border:'1px solid #5a9290',background:'#0b2831',borderRadius:12,padding:14,marginTop:14}} aria-label="Placement proposal preview">
   <div style={{fontSize:10,color:'#a1e6ee',fontWeight:900}}>PROPOSAL ONLY • RIGHTS UNVERIFIED • NOT PUBLISHED</div>
   <h3 style={{margin:'7px 0'}}>{brief.brand} — {brief.product}</h3>
   <p style={{fontSize:13,lineHeight:1.5}}>{brief.description}</p>
   <p style={{fontSize:12,color:'#bfd5dc'}}>Requested placements: {brief.surfaces.map(id=>TRYAMM_PLACEMENT_SURFACES.find(x=>x.id===id)?.label).join(' • ')}</p>
   <p style={{fontSize:12,color:'#a8cad6'}}>CTA: {brief.ctaText}{brief.productUrl?' • '+brief.productUrl:''}</p>
   <p style={{fontSize:11,color:'#ffe5a1'}}>Disclosure for approved creative: Sponsored Product Placement. No ad spend, ownership, scene placement or publication is confirmed.</p>
   <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
    <button type="button" style={btn} onClick={sendReel}>SEND TO HOLO REEL STUDIO</button>
    <button type="button" style={btn} onClick={sendOmniBox}>PREPARE OMNIBOX STORY</button>
    <button type="button" style={btn} onClick={sendAdDraft}>DRAFT HOLO AD</button>
    <button type="button" style={{...btn,background:'#35bba9',color:'#061923'}} onClick={quote}>REQUEST PLACEMENT QUOTE</button>
    <button type="button" style={btn} onClick={download}>SAVE PROPOSAL JSON</button>
   </div>
  </div>}
  {status&&<p role="status" style={{fontSize:12,color:'#b6f0db'}}>{status}</p>}
 </section>
}
