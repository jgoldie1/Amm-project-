import {useState} from 'react'
import {TRYAMM_PLACEMENT_SURFACES,briefToMediaStudio,prepareTryammCreativeBrief,saveTryammCreativeHandoff,type TryammCreativeBrief,type TryammPlacementSurface} from '../runtime/TryammCreativePlacementBrief'

type Props={
 onInquiry:(brief:TryammCreativeBrief)=>void
 onAdDraft:(brief:TryammCreativeBrief)=>void
}
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:44,border:'1px solid #42647b',background:'#0c2537',color:'#fff',padding:11,borderRadius:10}
const button:React.CSSProperties={minHeight:44,border:'1px solid #67adbf',borderRadius:10,padding:'9px 12px',background:'#124052',color:'#fff',fontWeight:800,cursor:'pointer'}
const label:React.CSSProperties={display:'block',fontSize:12,fontWeight:800,margin:'10px 0 5px'}
export default function TryammCreativePlacementComposer({onInquiry,onAdDraft}:Props){
 const [brand,setBrand]=useState('')
 const [product,setProduct]=useState('')
 const [message,setMessage]=useState('')
 const [merchantUrl,setMerchantUrl]=useState('')
 const [surface,setSurface]=useState<TryammPlacementSurface>('streetverse')
 const [rightsConfirmed,setRightsConfirmed]=useState(false)
 const [status,setStatus]=useState('')
 const make=()=>{
  try{const draft=prepareTryammCreativeBrief({brand,product,message,merchantUrl,surface,rightsConfirmed});setStatus('Creative concept prepared. This is only a preview—not a published ad.');return draft}
  catch(e){setStatus(e instanceof Error?e.message:'Complete the creative brief.');return null}
 }
 const toReel=()=>{
  const draft=make();if(!draft)return
  saveTryammCreativeHandoff(draft)
  window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:briefToMediaStudio(draft)}))
  setStatus('Holo Reel studio opened with sponsor title and ADVERTISEMENT caption. Upload or capture approved media before publishing.')
 }
 const toOmniBox=()=>{
  const draft=make();if(!draft)return
  if(!saveTryammCreativeHandoff(draft)){setStatus('Browser session storage is unavailable. Prepare the concept manually in OmniBox.');return}
  window.location.href='/omni-box?from=discover'
 }
 const requestInquiry=()=>{const draft=make();if(draft)onInquiry(draft)}
 const requestAd=()=>{const draft=make();if(draft)onAdDraft(draft)}
 const destination=TRYAMM_PLACEMENT_SURFACES.find(x=>x.id===surface)
 return <section id="tryamm-placement-composer" aria-labelledby="tryamm-placement-title" style={{borderRadius:20,border:'1px solid #39788c',padding:'clamp(14px,3vw,24px)',background:'linear-gradient(140deg,#0a1f30,#0b1226)',marginTop:28}}>
  <div style={{color:'#89f4e3',letterSpacing:2,fontSize:11,fontWeight:900}}>HOLO ADS • HOLO REELS • PRODUCT PLACEMENT</div>
  <h2 id="tryamm-placement-title" style={{fontSize:26,margin:'8px 0'}}>Create a holographic product-placement concept</h2>
  <p style={{fontSize:13,color:'#adc9d8',lineHeight:1.5}}>Make one advertising concept, preview how it could appear, and route it to the existing Holo Reel, OmniBox, Holo Ads or inquiry tools. A preview never counts as a live ad or an approved product placement.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:15}}>
   <div>
    <label style={label} htmlFor="holo-brand">Business / brand</label>
    <input id="holo-brand" placeholder="Your business name" value={brand} onChange={e=>setBrand(e.target.value.slice(0,80))} maxLength={80} style={field}/>
    <label style={label} htmlFor="holo-product">Product or service</label>
    <input id="holo-product" placeholder="Product name" value={product} onChange={e=>setProduct(e.target.value.slice(0,90))} maxLength={90} style={field}/>
    <label style={label} htmlFor="holo-message">Advertising message</label>
    <textarea id="holo-message" rows={3} placeholder="Short original message or promotion" value={message} onChange={e=>setMessage(e.target.value.slice(0,150))} maxLength={150} style={{...field,minHeight:84}}/>
    <label style={label} htmlFor="holo-placement-surface">Where should it appear?</label>
    <select id="holo-placement-surface" style={field} value={surface} onChange={e=>setSurface(e.target.value as TryammPlacementSurface)}>
      {TRYAMM_PLACEMENT_SURFACES.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}
    </select>
    <label style={label} htmlFor="holo-merchant">Merchant URL (optional; HTTPS only)</label>
    <input id="holo-merchant" type="url" placeholder="https://yourstore.example" value={merchantUrl} onChange={e=>setMerchantUrl(e.target.value.slice(0,400))} style={field}/>
    <label style={{display:'flex',gap:9,alignItems:'flex-start',fontSize:12,lineHeight:1.5,marginTop:12}}>
     <input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)} style={{width:20,height:20,flexShrink:0}}/>
     I have or will secure permission to use the brand, product, images, people and music. TRYAMM must still verify permissions before any publication.
    </label>
   </div>
   <div aria-label="Advertising concept visual preview" style={{border:'1px solid #366b8d',borderRadius:16,minHeight:300,overflow:'hidden',background:'radial-gradient(ellipse at 80% 18%,#205f7b,#131638 42%,#07101d 82%)',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:15}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'flex-start'}}>
     <div style={{fontSize:10,letterSpacing:1.2,color:'#9ce6e9',fontWeight:850}}>TRYAMM • {surface.toUpperCase().replaceAll('-',' ')}</div>
     <div style={{fontSize:10,color:'#ffdf96',border:'1px solid #e2b659',padding:'5px 7px',borderRadius:5,background:'#332a13'}}>ADVERTISEMENT • DEMO</div>
    </div>
    <div style={{padding:'30px 4px 35px',textAlign:'center'}}>
     <div aria-hidden="true" style={{fontSize:57,textShadow:'0 0 20px #6fe7fb, 0 0 42px #479bd4',lineHeight:1.2}}>◈</div>
     <div style={{fontSize:13,letterSpacing:3,color:'#9ae7eb',marginTop:8}}>{brand||'YOUR BRAND'}</div>
     <div style={{fontWeight:950,fontSize:'clamp(21px,3vw,29px)',overflowWrap:'anywhere',marginTop:10}}>{product||'YOUR PRODUCT HERE'}</div>
     <p style={{color:'#e2e6fa',fontSize:14,lineHeight:1.5,overflowWrap:'anywhere'}}>{message||'An interactive product reveal in the StreetVerse world.'}</p>
    </div>
    <div style={{borderTop:'1px solid #548095',paddingTop:12,fontSize:11,color:'#bad3e2'}}>
     <strong>PLACEHOLDER — NO AD SERVED</strong>
     <div style={{marginTop:5}}>{destination?.approval}</div>
     <div style={{marginTop:5}}>{merchantUrl?'Merchant URL proposal provided; no purchase checkout connected':'Merchant link will be confirmed before release'}</div>
    </div>
   </div>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:9,marginTop:15}}>
   <button type="button" onClick={toReel} style={button}>CREATE SPONSORED HOLO REEL</button>
   <button type="button" onClick={toOmniBox} style={button}>SEND TO OMNIBOX STORYBOARD</button>
   <button type="button" onClick={requestAd} style={button}>DRAFT HOLO AD CAMPAIGN</button>
   <button type="button" onClick={requestInquiry} style={{...button,background:'#46d7db',color:'#071821'}}>REQUEST PRODUCT PLACEMENT QUOTE</button>
  </div>
  {status&&<p role="status" style={{fontSize:12,color:'#ffdd9f',margin:'12px 0 0'}}>{status}</p>}
 </section>
}
